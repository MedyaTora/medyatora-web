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

export async function POST(request: NextRequest) {
  const pool = getMysqlPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const orderId = Number(body?.order_id);
    const refundAmount = normalizeRefundAmount(body?.refund_amount_usd);
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

    if (!order.user_id) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bu sipariş bir kullanıcı hesabına bağlı değil. Bakiyeye iade yapılamaz.",
        },
        { status: 400 }
      );
    }

    if (order.payment_method !== "balance") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Sadece MedyaTora bakiyesi ile ödenen siparişlerde bakiyeye iade yapılabilir.",
        },
        { status: 400 }
      );
    }

    if (order.currency !== "USD") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bakiye iadesi sadece USD siparişlerde yapılabilir.",
        },
        { status: 400 }
      );
    }

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
      SELECT COALESCE(SUM(amount_usd), 0) AS refunded_total
      FROM balance_transactions
      WHERE related_order_id = ?
        AND transaction_type IN ('order_refund', 'order_partial_refund')
      `,
      [orderId]
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
          )} USD.`,
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

    const balanceBefore = roundMoney(Number(user.balance_usd || 0));
    const balanceAfter = roundMoney(balanceBefore + refundAmount);
    const refundedAfterThis = roundMoney(alreadyRefunded + refundAmount);

    const isFullRefund = refundedAfterThis >= orderTotal;
    const nextStatus = isFullRefund ? "refunded" : "partial_refunded";
    const transactionType = isFullRefund ? "order_refund" : "order_partial_refund";

    await connection.execute(
      `
      UPDATE users
      SET balance_usd = ?
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
        balanceBefore,
        balanceAfter,
        refundNote
          ? `Siparis iadesi - ${order.order_number || order.id} - ${refundNote}`
          : `Siparis iadesi - ${order.order_number || order.id}`,
        order.id,
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
          ? `Bakiye iadesi yapildi: ${refundAmount.toFixed(2)} USD - ${refundNote}`
          : `Bakiye iadesi yapildi: ${refundAmount.toFixed(2)} USD`,
        order.id,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      refundAmountUsd: refundAmount,
      alreadyRefundedUsd: alreadyRefunded,
      totalRefundedUsd: refundedAfterThis,
      remainingRefundableUsd: roundMoney(orderTotal - refundedAfterThis),
      balanceBeforeUsd: balanceBefore,
      balanceAfterUsd: balanceAfter,
      nextStatus,
      message: isFullRefund
        ? "Tam iade yapıldı. Tutar kullanıcının bakiyesine eklendi."
        : "Kısmi iade yapıldı. Tutar kullanıcının bakiyesine eklendi.",
    });
  } catch (error) {
    await connection.rollback();

    console.error("BALANCE_REFUND_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Bakiye iadesi yapılamadı.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}