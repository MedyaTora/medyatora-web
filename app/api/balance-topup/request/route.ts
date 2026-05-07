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

function normalizePaymentMethod(value: unknown) {
  const method = String(value || "").trim().toLowerCase();

  if (method === "support") return "support";
  if (method === "turkey_bank") return "turkey_bank";

  return "turkey_bank";
}

function getPaymentMethodLabel(method: string) {
  if (method === "support") return "Destek ile ödeme";
  return "Türkiye Banka Havalesi / EFT";
}

function createTopupRequestNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MT-TOPUP-${datePart}-${random}`;
}

function safeText(value: unknown, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeTelegramHtml(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

  if (!token || !chatId) return;

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
          ok: false,
          error: "Para yükleme talebi oluşturmak için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const currency = normalizeCurrency(body?.currency);
    const amount = Number(body?.amount || 0);

    const fullName =
      safeText(body?.full_name, 255) || safeText(user.full_name, 255) || null;

    const email =
      safeText(body?.email, 255) || safeText(user.email, 255) || null;

    const userNote = safeText(body?.user_note, 2000);
    const supportChannel = safeText(
      body?.support_channel || "whatsapp_telegram",
      50
    );

    const paymentMethod = normalizePaymentMethod(body?.payment_method);

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Ad soyad alanı zorunludur.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "E-posta alanı zorunludur.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Geçerli bir yükleme tutarı girin.",
        },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Minimum yükleme tutarı 1 olmalıdır.",
        },
        { status: 400 }
      );
    }

    const requestNumber = createTopupRequestNumber();
    const pool = getMysqlPool();

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, NULL)
      `,
      [
        user.id,
        requestNumber,
        fullName,
        email,
        null,
        currency,
        amount,
        paymentMethod,
        supportChannel,
        userNote || null,
      ]
    );

    const insertId = Number((result as { insertId?: number }).insertId || 0);

    await sendTelegramMessage(
      [
        "💰 <b>Yeni Yatırım Talebi</b>",
        "",
        `<b>Yatırım No:</b> ${escapeTelegramHtml(requestNumber)}`,
        `<b>Kullanıcı ID:</b> ${escapeTelegramHtml(user.id)}`,
        `<b>Ad Soyad:</b> ${escapeTelegramHtml(fullName)}`,
        `<b>E-posta:</b> ${escapeTelegramHtml(email)}`,
        `<b>Tutar:</b> ${escapeTelegramHtml(formatAmount(amount, currency))}`,
        `<b>Ödeme Yöntemi:</b> ${escapeTelegramHtml(
          getPaymentMethodLabel(paymentMethod)
        )}`,
        `<b>Destek Kanalı:</b> ${escapeTelegramHtml(supportChannel || "-")}`,
        userNote
          ? `<b>Kullanıcı Notu:</b> ${escapeTelegramHtml(userNote)}`
          : "",
        "",
        "Yeni bakiye yükleme bildirimi oluşturuldu. Kullanıcı dekont ilettiğinde admin panelinden kontrol edip talebi onaylayın.",
      ]
        .filter(Boolean)
        .join("\n")
    );

    return NextResponse.json({
      success: true,
      ok: true,
      requestId: insertId,
      request_id: insertId,
      requestNumber,
      request_number: requestNumber,
      amount,
      currency,
      message:
        "Yatırım talebiniz oluşturuldu. Dekont kontrolünden sonra bakiyeniz hesabınıza yansıtılacaktır.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Para yükleme talebi oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}