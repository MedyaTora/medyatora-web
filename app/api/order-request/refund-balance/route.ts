import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";

type OrderRow = RowDataPacket & {
  id: number;
  user_id: number | null;
  order_number: string | null;
  total_price: string | number | null;
  currency: string | null;
  payment_method: string | null;
  status: string | null;
};

type UserRow = RowDataPacket & {
  id: number;
  balance_usd: string | number;
};

type RefundSumRow = RowDataPacket & {
  refunded_total: string | number | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeCurrency(currency: string | null | undefined) {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return "TL";
}

function normalizeRefundAmount(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return roundMoney(amount);
}

function normalizeNote(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  return trimmed.slice(0, 240);
}

async function ensureRefundTable(connection: any) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS order_refund_transactions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NULL,
      refund_type VARCHAR(40) NOT NULL,
      payment_method VARCHAR(40) NULL,
      amount DECIMAL(12,2) NOT NULL,
      currency VARCHAR(10) NOT NULL,
      note VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_order_refund_transactions_order_id (order_id),
      INDEX idx_order_refund_transactions_currency (currency)
    )
  `);
}

export async function POST(request: NextRequest) {
  const pool = getMysqlPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const orderId = Number(body?.order_id);
    const refundAmount = normalizeRefundAmount(
      body?.refund_amount ?? body?.refund_amount_usd
    );
    const refundNote = normalizeNote(body?.refund_note);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { success: false, error: "Geçerli sipariş id gerekli." },
        { status: 400 }
      );
    }

    if (!refundAmount) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir iade tutarı gir." },
        { status: 400 }
      );
    }

    await connection.beginTransaction();
    await ensureRefundTable(connection);

    const [orderRows] = await connection.query<OrderRow[]>(
      `
      SELECT
        id,
        user_id,
        order_number,
        total_price,
        currency,
        payment_method,
        status
      FROM order_requests
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [orderId]
    );

    const order = orderRows[0];

    if (!order) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const currency = normalizeCurrency(order.currency);
    const orderTotal = roundMoney(Number(order.total_price || 0));

    if (orderTotal <= 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Sipariş tutarı geçersiz." },
        { status: 400 }
      );
    }

    const [refundRows] = await connection.query<RefundSumRow[]>(
      `
      SELECT COALESCE(SUM(amount), 0) AS refunded_total
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
      `,
      [orderId, currency]
    );

    const alreadyRefunded = roundMoney(Number(refundRows[0]?.refunded_total || 0));
    const remainingRefundable = roundMoney(orderTotal - alreadyRefunded);

    if (remainingRefundable <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bu sipariş için iade edilebilir tutar kalmamış.",
        },
        { status: 400 }
      );
    }

    if (refundAmount > remainingRefundable) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: `Fazla iade yapılamaz. Kalan iade edilebilir tutar: ${remainingRefundable.toFixed(
            2
          )} ${currency}.`,
        },
        { status: 400 }
      );
    }

    const refundedAfterThis = roundMoney(alreadyRefunded + refundAmount);
    const isFullRefund = refundedAfterThis >= orderTotal;
    const nextStatus = isFullRefund ? "refunded" : "partial_refunded";
    const transactionType = isFullRefund ? "order_refund" : "order_partial_refund";

    const isAutomaticBalanceRefund =
      order.payment_method === "balance" && currency === "USD";

    let balanceBeforeUsd: number | null = null;
    let balanceAfterUsd: number | null = null;

    if (isAutomaticBalanceRefund) {
      if (!order.user_id) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            error:
              "Bu sipariş bir kullanıcı hesabına bağlı değil. Bakiyeye otomatik iade yapılamaz.",
          },
          { status: 400 }
        );
      }

      const [userRows] = await connection.query<UserRow[]>(
        `
        SELECT id, balance_usd
        FROM users
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [order.user_id]
      );

      const user = userRows[0];

      if (!user) {
        await connection.rollback();

        return NextResponse.json(
          { success: false, error: "Kullanıcı bulunamadı." },
          { status: 404 }
        );
      }

      balanceBeforeUsd = roundMoney(Number(user.balance_usd || 0));
      balanceAfterUsd = roundMoney(balanceBeforeUsd + refundAmount);

      await connection.execute(
        `
        UPDATE users
        SET balance_usd = ?
        WHERE id = ?
        LIMIT 1
        `,
        [balanceAfterUsd, order.user_id]
      );

      await connection.execute(
        `
        INSERT INTO balance_transactions (
          user_id,
          transaction_type,
          amount_usd,
          balance_before_usd,
          balance_after_usd,
          description,
          related_order_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          order.user_id,
          transactionType,
          refundAmount,
          balanceBeforeUsd,
          balanceAfterUsd,
          refundNote
            ? `Siparis iadesi - ${order.order_number || order.id} - ${refundNote}`
            : `Siparis iadesi - ${order.order_number || order.id}`,
          order.id,
        ]
      );
    }

    await connection.execute(
      `
      INSERT INTO order_refund_transactions (
        order_id,
        user_id,
        refund_type,
        payment_method,
        amount,
        currency,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        order.id,
        order.user_id,
        isAutomaticBalanceRefund ? "balance_refund" : "manual_refund",
        order.payment_method,
        refundAmount,
        currency,
        refundNote,
      ]
    );

    await connection.execute(
      `
      UPDATE order_requests
      SET
        status = ?,
        completion_note = ?,
        updated_at = NOW()
      WHERE id = ?
      LIMIT 1
      `,
      [
        nextStatus,
        refundNote
          ? `Iade kaydi: ${refundAmount.toFixed(2)} ${currency} - ${refundNote}`
          : `Iade kaydi: ${refundAmount.toFixed(2)} ${currency}`,
        order.id,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      refundAmount,
      currency,
      alreadyRefunded,
      totalRefunded: refundedAfterThis,
      remainingRefundable: roundMoney(orderTotal - refundedAfterThis),
      balanceBeforeUsd,
      balanceAfterUsd,
      nextStatus,
      automaticBalanceRefund: isAutomaticBalanceRefund,
      message: isAutomaticBalanceRefund
        ? isFullRefund
          ? "Tam iade yapıldı. Tutar müşterinin USD bakiyesine eklendi."
          : "Kısmi iade yapıldı. Tutar müşterinin USD bakiyesine eklendi."
        : isFullRefund
          ? `Tam iade kaydı oluşturuldu. Tutar: ${refundAmount.toFixed(2)} ${currency}.`
          : `Kısmi iade kaydı oluşturuldu. Tutar: ${refundAmount.toFixed(2)} ${currency}.`,
    });
  } catch (error) {
    await connection.rollback();

    console.error("REFUND_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "İade işlemi yapılamadı.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}