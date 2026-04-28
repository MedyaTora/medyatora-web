import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

const ALLOWED_ANALYSIS_STATUSES = [
  "pending",
  "in_review",
  "contacted",
  "completed",
] as const;

type AnalysisStatus = (typeof ALLOWED_ANALYSIS_STATUSES)[number];

function isValidAnalysisStatus(value: unknown): value is AnalysisStatus {
  return (
    typeof value === "string" &&
    ALLOWED_ANALYSIS_STATUSES.includes(value as AnalysisStatus)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = Number(body?.id);
    const status = body?.status;

    if (!Number.isInteger(id) || id <= 0 || !status) {
      return NextResponse.json(
        { error: "Geçerli başvuru id ve status gerekli." },
        { status: 400 }
      );
    }

    if (!isValidAnalysisStatus(status)) {
      return NextResponse.json(
        { error: "Geçersiz başvuru durumu." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [existingRows] = await pool.query(
      "SELECT id, status FROM analysis_requests WHERE id = ? LIMIT 1",
      [id]
    );

    const existingItem = (existingRows as any[])[0];

    if (!existingItem) {
      return NextResponse.json(
        { error: "Başvuru bulunamadı." },
        { status: 404 }
      );
    }

    await pool.execute(
      "UPDATE analysis_requests SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    return NextResponse.json(
      {
        success: true,
        id,
        previousStatus: existingItem.status,
        nextStatus: status,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}
