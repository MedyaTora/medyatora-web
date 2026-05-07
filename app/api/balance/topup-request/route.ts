import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

type CurrencyCode = "TL" | "USD" | "RUB";

function normalizeCurrency(value: unknown): CurrencyCode {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "TL";
}

function normalizeAmount(value: unknown) {
  const raw = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(raw);

  if (!Number.isFinite(amount)) return 0;

  return Math.round((amount + Number.EPSILON) * 100) / 100;
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

async function sendTelegramTopupNotification({
  requestNumber,
  userId,
  fullName,
  email,
  phoneNumber,
  amount,
  currency,
  supportChannel,
  userNote,
}: {
  requestNumber: string;
  userId: number;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  amount: number;
  currency: CurrencyCode;
  supportChannel: string | null;
  userNote: string | null;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  const message = [
    "💰 Yeni Bakiye Yükleme Talebi",
    "",
    `Talep No: ${requestNumber}`,
    `Kullanıcı ID: ${userId}`,
    `Ad Soyad: ${fullName || "-"}`,
    `E-posta: ${email}`,
    `Telefon: ${phoneNumber || "-"}`,
    `Tutar: ${formatAmount(amount, currency)}`,
    `Para Birimi: ${currency}`,
    `Destek Kanalı: ${supportChannel || "-"}`,
    "",
    "Durum: Dekont gönderildi / admin onayı bekliyor",
    userNote ? `Not: ${userNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch {
    // Telegram bildirimi başarısız olsa bile yatırım talebi oluşturulmaya devam eder.
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Bakiye yükleme talebi için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const amount = normalizeAmount(body?.amount);
    const currency = normalizeCurrency(body?.currency);
    const phoneNumber = String(body?.phone_number || body?.phoneNumber || "")
      .trim()
      .slice(0, 50);
    const supportChannel = String(
      body?.support_channel || body?.supportChannel || "WhatsApp"
    )
      .trim()
      .slice(0, 50);
    const userNote = String(body?.user_note || body?.userNote || "")
      .trim()
      .slice(0, 2000);

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Lütfen geçerli bir yükleme tutarı girin.",
        },
        { status: 400 }
      );
    }

    if (!["TL", "USD", "RUB"].includes(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz para birimi.",
        },
        { status: 400 }
      );
    }

    const requestNumber = createTopupRequestNumber();
    const pool = getMysqlPool();

    await pool.query(
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
        user.full_name || null,
        user.email,
        phoneNumber || user.phone_number || null,
        currency,
        amount,
        supportChannel || null,
        userNote || null,
      ]
    );

    await sendTelegramTopupNotification({
      requestNumber,
      userId: Number(user.id),
      fullName: user.full_name || null,
      email: user.email,
      phoneNumber: phoneNumber || user.phone_number || null,
      amount,
      currency,
      supportChannel: supportChannel || null,
      userNote: userNote || null,
    });

    return NextResponse.json({
      success: true,
      requestNumber,
      message:
        "Bakiye yükleme talebiniz alındı. Dekont kontrolünden sonra bakiyeniz hesabınıza yansıtılacaktır.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Bakiye yükleme talebi oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}