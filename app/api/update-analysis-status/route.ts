import https from "https";
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

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Bekliyor",
    in_review: "İnceleniyor",
    contacted: "İletişime Geçildi",
    completed: "Tamamlandı",
  };

  return map[status] || status;
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const body = JSON.stringify({
    chat_id: chatId,
    text,
  });

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        res.resume();
        res.on("end", resolve);
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const idRaw = typeof body?.id === "string" ? body.id.trim() : "";
    const id = Number(idRaw);
    const status = body?.status;

    if (!idRaw || !Number.isInteger(id) || id <= 0 || !status) {
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
      `
      SELECT
        a.id,
        a.status,
        a.created_at,
        c.full_name,
        c.username,
        c.contact_type,
        c.contact_value
      FROM analysis_requests a
      LEFT JOIN customers c ON c.id = a.customer_id
      WHERE a.id = ?
      LIMIT 1
      `,
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

    try {
      const telegramMessage = [
        "📌 Analiz Durumu Güncellendi",
        "",
        `Başvuru ID: ${id}`,
        `Müşteri: ${existingItem.full_name || "-"}`,
        `Kullanıcı adı: ${existingItem.username || "-"}`,
        `İletişim: ${existingItem.contact_type || "-"} / ${existingItem.contact_value || "-"}`,
        "",
        `Eski Durum: ${getStatusLabel(existingItem.status)}`,
        `Yeni Durum: ${getStatusLabel(status)}`,
      ].join("\n");

      await sendTelegramMessage(telegramMessage);
    } catch (telegramError) {
      console.error("Telegram analiz status bildirimi gönderilemedi:", telegramError);
    }

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
