import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

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

function getChannelLabel(channel: Channel) {
  if (channel === "telegram") return "Telegram";
  return "WhatsApp";
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

    if (!hasMysqlConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: "MySQL bağlantısı bulunamadı.",
        },
        { status: 503 }
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
    const connection = await pool.getConnection();

    const verificationCode = createVerificationCode();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `
        UPDATE contact_verification_requests
        SET status = 'cancelled'
        WHERE user_id = ?
          AND channel = ?
          AND status = 'pending'
        `,
        [user.id, channel]
      );

      await connection.execute(
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

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("CONTACT_VERIFICATION_DB_ERROR", dbError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Doğrulama talebi kaydedilemedi. Lütfen tekrar deneyin.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

    return NextResponse.json({
      success: true,
      code: verificationCode,
      channel,
      channel_label: getChannelLabel(channel),
      contact_value: contactValue,
      message: getSupportInstruction(channel, verificationCode),
    });
  } catch (error) {
    console.error("CONTACT_VERIFICATION_REQUEST_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Doğrulama talebi oluşturulurken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}