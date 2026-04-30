import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

function normalizeOrderNumbers(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderNumbers = normalizeOrderNumbers(body?.order_numbers);

    if (!orderNumbers.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Sipariş numarası gerekli.",
        },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const placeholders = orderNumbers.map(() => "?").join(", ");

    const [rows] = await pool.query(
      `
      SELECT id, order_number, status
      FROM order_requests
      WHERE order_number IN (${placeholders})
      `,
      orderNumbers
    );

    const foundRows = rows as {
      id: number;
      order_number: string;
      status: string | null;
    }[];

    if (!foundRows.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Sipariş bulunamadı.",
        },
        { status: 404 }
      );
    }

    const updatableOrderNumbers = foundRows
      .filter((row) => row.status === "pending_payment")
      .map((row) => row.order_number);

    if (!updatableOrderNumbers.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu sipariş ödeme kontrolüne alınamaz. Sipariş zaten farklı bir durumda olabilir.",
        },
        { status: 400 }
      );
    }

    const updatePlaceholders = updatableOrderNumbers.map(() => "?").join(", ");

    await pool.execute(
      `
      UPDATE order_requests
      SET
        status = 'payment_review',
        completion_note = 'Müşteri ödemeyi tamamladığını bildirdi. Dekont / ödeme kontrolü bekleniyor.',
        updated_at = NOW()
      WHERE order_number IN (${updatePlaceholders})
        AND status = 'pending_payment'
      `,
      updatableOrderNumbers
    );

    return NextResponse.json(
      {
        success: true,
        updatedOrderNumbers: updatableOrderNumbers,
        message: "Ödeme bildirimi alındı. Sipariş ödeme kontrolüne alındı.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PAYMENT_REVIEW_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ödeme bildirimi alınamadı.",
      },
      { status: 500 }
    );
  }
}