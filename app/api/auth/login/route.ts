import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { getPublicUser } from "@/lib/auth/current-user";

type LoginUserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email_verified: number;
  phone_verified: number;
  balance_usd: string | number;
  balance_tl: string | number;
  balance_rub: string | number;
  preferred_currency: string | null;
  free_analysis_used: number;
  welcome_bonus_claimed: number;
  is_active: number;
  is_admin: number;
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

function normalizePreferredCurrency(value: string | null | undefined) {
  const currency = value?.trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";
  return "TL";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "E-posta ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [rows] = await pool.query<LoginUserRow[]>(
      `
      SELECT
        id,
        email,
        password_hash,
        full_name,
        username,
        phone_number,
        email_verified,
        phone_verified,
        balance_usd,
        balance_tl,
        balance_rub,
        preferred_currency,
        free_analysis_used,
        welcome_bonus_claimed,
        is_active,
        is_admin
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    const user = rows[0];

    if (!user || !user.is_active) {
      return NextResponse.json(
        { ok: false, error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { ok: false, error: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent");

    await pool.query(
      `
      UPDATE users
      SET
        last_ip = ?,
        last_login_at = NOW()
      WHERE id = ?
      LIMIT 1
      `,
      [ipAddress, user.id]
    );

    await createUserSession({
      userId: Number(user.id),
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      user: getPublicUser({
        id: Number(user.id),
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        phone_number: user.phone_number,
        email_verified: Boolean(user.email_verified),
        phone_verified: Boolean(user.phone_verified),
        balance_usd: Number(user.balance_usd || 0),
        balance_tl: Number(user.balance_tl || 0),
        balance_rub: Number(user.balance_rub || 0),
        preferred_currency: normalizePreferredCurrency(user.preferred_currency),
        free_analysis_used: Boolean(user.free_analysis_used),
        welcome_bonus_claimed: Boolean(user.welcome_bonus_claimed),
        is_active: Boolean(user.is_active),
        is_admin: Boolean(user.is_admin),
        whatsapp_verified_at: null,
        telegram_verified_at: null,
        contact_bonus_granted_at: null,
      }),
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Giriş yapılırken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}