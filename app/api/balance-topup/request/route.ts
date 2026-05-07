import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

type CurrencyCode = "TL" | "USD" | "RUB";

const TELEGRAM_API_URL = "https://api.telegram.org";

function normalizeCurrency(value: unknown): CurrencyCode {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "TL";
}

function createTopupRequestNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MT-TOPUP-${datePart}-${random}`;
}

function formatAmount(amount: number, currency: CurrencyCode) {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

async function sendTelegramMessage(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  await fetch(`${TELEGRAM_API_URL}/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  }).catch(() => null);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Para yükleme talebi oluşturmak için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const currency = normalizeCurrency(body?.currency);
    const amount = Number(body?.amount || 0);
    const userNote = String(body?.user_note || "").trim();
    const supportChannel = String(body?.support_channel || "whatsapp").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir yükleme tutarı girin.",
        },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum yükleme tutarı 1 olmalıdır.",
        },
        { status: 400 }
      );
    }

    const requestNumber = createTopupRequestNumber();
    const pool = getMysqlPool();

    const fullName = user.full_name || null;
    const email = user.email || null;
    const phoneNumber = user.phone_number || null;

    const [result] = await pool.query(
      `
      INSERT INTO balance_topup_requests (
        user_id,
        request_number,
        full_name,
        email,
        phone_number,
        currency,
        amount,
        payment_method,
        support_channel,
        status,
        user_note,
        receipt_sent,
        receipt_sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'manual_transfer', ?, 'pending', ?, 1, NOW())
      `,
      [
        user.id,
        requestNumber,
        fullName,
        email,
        phoneNumber,
        currency,
        amount,
        supportChannel,
        userNote || null,
      ]
    );

    const insertId = Number((result as { insertId?: number }).insertId || 0);

    await sendTelegramMessage(
      [
        "💰 <b>Yeni Bakiye Yükleme Bildirimi</b>",
        "",
        `<b>Talep No:</b> ${requestNumber}`,
        `<b>Kullanıcı ID:</b> ${user.id}`,
        `<b>Ad Soyad:</b> ${fullName || "-"}`,
        `<b>E-posta:</b> ${email || "-"}`,
        `<b>Telefon:</b> ${phoneNumber || "-"}`,
        `<b>Tutar:</b> ${formatAmount(amount, currency)}`,
        `<b>Destek Kanalı:</b> ${supportChannel || "-"}`,
        userNote ? `<b>Kullanıcı Notu:</b> ${userNote}` : "",
        "",
        "Admin panelinden dekontu kontrol edip yatırım talebini onaylayın.",
      ]
        .filter(Boolean)
        .join("\n")
    );

    return NextResponse.json({
      success: true,
      requestId: insertId,
      requestNumber,
      amount,
      currency,
      message:
        "Para yükleme bildiriminiz alındı. Dekont kontrolünden sonra bakiyeniz hesabınıza yansıtılacaktır.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Para yükleme talebi oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}