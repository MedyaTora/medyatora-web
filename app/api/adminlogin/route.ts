import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";

type Channel = "whatsapp" | "telegram";

type VerificationRequestRow = RowDataPacket & {
  id: number;
  user_id: number;
  channel: Channel;
  contact_value: string;
  verification_code: string;
  status: "pending" | "approved" | "rejected";
};

type UserRow = RowDataPacket & {
  id: number;
  balance_usd: string | number;
  contact_bonus_granted_at: Date | string | null;
  whatsapp_verified_at: Date | string | null;
  telegram_verified_at: Date | string | null;
};

function isAdminCookieValid(adminCookie: string | undefined) {
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) {
    return false;
  }

  return adminCookie === expectedSecret;
}

function normalizeAction(value: unknown) {
  const action = String(value || "").trim().toLowerCase();

  if (action === "approve") return "approve";
  if (action === "reject") return "reject";

  return null;
}

function normalizeAdminNote(value: unknown) {
  return String(value || "").trim().slice(0, 2000);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("medyatora_admin")?.value;

  if (!isAdminCookieValid(adminCookie)) {
    return NextResponse.json(
      {
        success: false,
        error: "Admin yetkisi gerekli.",
      },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  const requestId = Number(body?.request_id || 0);
  const action = normalizeAction(body?.action);
  const adminNote = normalizeAdminNote(body?.admin_note);

  if (!requestId || !Number.isFinite(requestId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Geçerli doğrulama talebi bulunamadı.",
      },
      { status: 400 }
    );
  }

  if (!action) {
    return NextResponse.json(
      {
        success: false,
        error: "İşlem tipi geçersiz.",
      },
      { status: 400 }
    );
  }

  const pool = getMysqlPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [requestRows] = await connection.query<VerificationRequestRow[]>(
      `
      SELECT
        id,
        user_id,
        channel,
        contact_value,
        verification_code,
        status
      FROM contact_verification_requests
      WHERE id = ?
      FOR UPDATE
      `,
      [requestId]
    );

    const verificationRequest = requestRows[0];

    if (!verificationRequest) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Doğrulama talebi bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (verificationRequest.status !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bu doğrulama talebi daha önce sonuçlandırılmış.",
        },
        { status: 400 }
      );
    }

    if (action === "reject") {
      await connection.query(
        `
        UPDATE contact_verification_requests
        SET
          status = 'rejected',
          admin_note = ?,
          rejected_at = NOW()
        WHERE id = ?
        LIMIT 1
        `,
        [adminNote || null, verificationRequest.id]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Doğrulama talebi reddedildi.",
      });
    }

    const [userRows] = await connection.query<UserRow[]>(
      `
      SELECT
        id,
        balance_usd,
        contact_bonus_granted_at,
        whatsapp_verified_at,
        telegram_verified_at
      FROM users
      WHERE id = ?
      FOR UPDATE
      `,
      [verificationRequest.user_id]
    );

    const user = userRows[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı bulunamadı.",
        },
        { status: 404 }
      );
    }

    const currentBalanceUsd = Number(user.balance_usd || 0);
    const shouldGrantBonus = !user.contact_bonus_granted_at;
    const nextBalanceUsd = shouldGrantBonus
      ? Math.round((currentBalanceUsd + 1 + Number.EPSILON) * 100) / 100
      : currentBalanceUsd;

    if (verificationRequest.channel === "whatsapp") {
      await connection.query(
        `
        UPDATE users
        SET
          whatsapp_verified_at = COALESCE(whatsapp_verified_at, NOW()),
          phone_verified = 1,
          phone_number = COALESCE(NULLIF(phone_number, ''), ?),
          balance_usd = ?,
          contact_bonus_granted_at = CASE
            WHEN contact_bonus_granted_at IS NULL THEN NOW()
            ELSE contact_bonus_granted_at
          END
        WHERE id = ?
        LIMIT 1
        `,
        [verificationRequest.contact_value, nextBalanceUsd, user.id]
      );
    } else {
      await connection.query(
        `
        UPDATE users
        SET
          telegram_verified_at = COALESCE(telegram_verified_at, NOW()),
          balance_usd = ?,
          contact_bonus_granted_at = CASE
            WHEN contact_bonus_granted_at IS NULL THEN NOW()
            ELSE contact_bonus_granted_at
          END
        WHERE id = ?
        LIMIT 1
        `,
        [nextBalanceUsd, user.id]
      );
    }

    if (shouldGrantBonus) {
      await connection.query(
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
          description
        )
        VALUES (?, 'welcome_bonus', 'USD', ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          1,
          currentBalanceUsd,
          nextBalanceUsd,
          1,
          currentBalanceUsd,
          nextBalanceUsd,
          `${verificationRequest.channel === "whatsapp" ? "WhatsApp" : "Telegram"} doğrulama bonusu`,
        ]
      );
    }

    await connection.query(
      `
      UPDATE contact_verification_requests
      SET
        status = 'approved',
        admin_note = ?,
        approved_at = NOW()
      WHERE id = ?
      LIMIT 1
      `,
      [adminNote || null, verificationRequest.id]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: shouldGrantBonus
        ? "Doğrulama onaylandı ve kullanıcıya 1 USD bonus tanımlandı."
        : "Doğrulama onaylandı. Bonus daha önce tanımlandığı için tekrar verilmedi.",
      bonus_granted: shouldGrantBonus,
      balance_usd: nextBalanceUsd,
    });
  } catch (error) {
    await connection.rollback();

    console.error("admin contact verification approve error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Doğrulama talebi işlenirken hata oluştu.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}