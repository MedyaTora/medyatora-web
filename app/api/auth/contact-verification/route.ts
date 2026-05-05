import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

type Channel = "whatsapp" | "telegram";

function normalizeChannel(value: unknown): Channel | null {
  const channel = String(value || "").trim().toLowerCase();

  if (channel === "whatsapp") return "whatsapp";
  if (channel === "telegram") return "telegram";

  return null;
}

function createVerificationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MT-${random}`;
}

function normalizeContactValue(value: unknown) {
  return String(value || "").trim().slice(0, 191);
}

function getSupportInstruction(channel: Channel, code: string) {
  if (channel === "telegram") {
    return `Telegram destek hesabımıza "${code}" kodunu gönder. Admin onayından sonra hesabına 1 USD bonus tanımlanır.`;
  }

  return `WhatsApp destek hattımıza "${code}" kodunu gönder. Admin onayından sonra hesabına 1 USD bonus tanımlanır.`;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu işlem için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const channel = normalizeChannel(body?.channel);
    const contactValue = normalizeContactValue(body?.contact_value);

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          error: "Doğrulama kanalı geçersiz.",
        },
        { status: 400 }
      );
    }

    if (!contactValue) {
      return NextResponse.json(
        {
          success: false,
          error: "İletişim bilgisi boş bırakılamaz.",
        },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const verificationCode = createVerificationCode();

    await pool.query(
      `
      INSERT INTO contact_verification_requests (
        user_id,
        channel,
        contact_value,
        verification_code,
        status
      )
      VALUES (?, ?, ?, ?, 'pending')
      `,
      [user.id, channel, contactValue, verificationCode]
    );

    return NextResponse.json({
      success: true,
      code: verificationCode,
      channel,
      contact_value: contactValue,
      message: getSupportInstruction(channel, verificationCode),
    });
  } catch (error) {
    console.error("contact verification request error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Doğrulama talebi oluşturulurken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}