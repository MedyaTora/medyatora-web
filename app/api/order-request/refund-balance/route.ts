import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";

type CurrencyCode = "USD" | "TL" | "RUB";

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
  balance_tl: string | number;
  balance_rub: string | number;
};

type RefundSumRow = RowDataPacket & {
  refunded_total: string | number | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeCurrency(currency: string | null | undefined): CurrencyCode {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return "TL";
}

function getBalanceColumn(currency: CurrencyCode) {
  if (currency === "USD") return "balance_usd";
  if (currency === "RUB") return "balance_rub";
  return "balance_tl";
}

function getUserBalanceByCurrency(user: UserRow, currency: CurrencyCode) {
  if (currency === "USD") return Number(user.balance_usd || 0);
  if (currency === "RUB") return Number(user.balance_rub || 0);
  return Number(user.balance_tl || 0);
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

function buildRefundDescription({
  orderNumber,
  orderId,
  refundNote,
  currency,
}: {
  orderNumber: string | null;
  orderId: number;
  refundNote: string | null;
  currency: CurrencyCode;
}) {
  const base = `Siparis iadesi - ${orderNumber || orderId} - ${currency}`;

  if (!refundNote) return base;

  return `${base} - ${refundNote}`;
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
    const balanceColumn = getBalanceColumn(currency);
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

    const alreadyRefunded = roundMoney(
      Number(refundRows[0]?.refunded_total || 0)
    );

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
    const transactionType = isFullRefund
      ? "order_refund"
      : "order_partial_refund";

    const shouldRefundToBalance = Boolean(order.user_id);

    let balanceBefore: number | null = null;
    let balanceAfter: number | null = null;

    let balanceBeforeUsd = 0;
    let balanceAfterUsd = 0;

    if (shouldRefundToBalance) {
      const [userRows] = await connection.query<UserRow[]>(
        `
        SELECT id, balance_usd, balance_tl, balance_rub
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

      balanceBefore = roundMoney(getUserBalanceByCurrency(user, currency));
      balanceAfter = roundMoney(balanceBefore + refundAmount);

      balanceBeforeUsd = roundMoney(Number(user.balance_usd || 0));
      balanceAfterUsd =
        currency === "USD"
          ? roundMoney(balanceBeforeUsd + refundAmount)
          : balanceBeforeUsd;

      await connection.execute(
        `
        UPDATE users
        SET ${balanceColumn} = ?
        WHERE id = ?
        LIMIT 1
        `,
        [balanceAfter, order.user_id]
      );

      await connection.execute(
        `
        INSERT INTO balance_transactions (
          user_id,
          transaction_type,
          currency,
          amount,
          balance_before,
          balance_after,
          amount_usd,
          balance_before_usd,
          balance_after_usd,
          description,
          related_order_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          order.user_id,
          transactionType,
          currency,
          refundAmount,
          balanceBefore,
          balanceAfter,
          currency === "USD" ? refundAmount : 0,
          balanceBeforeUsd,
          balanceAfterUsd,
          buildRefundDescription({
            orderNumber: order.order_number,
            orderId: order.id,
            refundNote,
            currency,
          }),
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
        shouldRefundToBalance ? "balance_refund" : "manual_refund",
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
      balanceBefore,
      balanceAfter,
      balanceBeforeUsd,
      balanceAfterUsd,
      nextStatus,
      automaticBalanceRefund: shouldRefundToBalance,
      message: shouldRefundToBalance
        ? isFullRefund
          ? `Tam iade yapıldı. Tutar müşterinin ${currency} bakiyesine eklendi.`
          : `Kısmi iade yapıldı. Tutar müşterinin ${currency} bakiyesine eklendi.`
        : isFullRefund
          ? `Tam iade kaydı oluşturuldu. Tutar: ${refundAmount.toFixed(
              2
            )} ${currency}.`
          : `Kısmi iade kaydı oluşturuldu. Tutar: ${refundAmount.toFixed(
              2
            )} ${currency}.`,
    });
  } catch (error) {
    await connection.rollback();

    console.error("REFUND_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "İade işlemi yapılamadı.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}