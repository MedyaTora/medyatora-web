import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { getPublicUser } from "@/lib/auth/current-user";

type ExistingUserRow = RowDataPacket & {
  id: number;
};

type CreatedUserRow = RowDataPacket & {
  id: number;
  email: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email_verified: number;
  phone_verified: number;
  balance_usd: string | number;
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

function cleanFullName(value: unknown) {
  return String(value || "").trim().slice(0, 120);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const fullName = cleanFullName(body.full_name);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir e-posta adresi gir." },
        { status: 400 }
      );
    }

    const passwordCheck = validatePassword(password);

    if (!passwordCheck.valid) {
      return NextResponse.json(
        { ok: false, error: passwordCheck.errors[0] || "Şifre geçersiz." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { ok: false, error: "Ad soyad alanı zorunludur." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [existingRows] = await pool.query<ExistingUserRow[]>(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Bu e-posta adresiyle zaten hesap var." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent");

    const [insertResult] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        created_ip,
        last_ip,
        last_login_at
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [email, passwordHash, fullName, ipAddress, ipAddress]
    );

    const userId = Number(insertResult.insertId);

    await createUserSession({
      userId,
      ipAddress,
      userAgent,
    });

    const [createdRows] = await pool.query<CreatedUserRow[]>(
      `
      SELECT
        id,
        email,
        full_name,
        username,
        phone_number,
        email_verified,
        phone_verified,
        balance_usd,
        free_analysis_used,
        welcome_bonus_claimed,
        is_active,
        is_admin
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    const createdUser = createdRows[0];

    return NextResponse.json({
      ok: true,
      user: getPublicUser({
        id: Number(createdUser.id),
        email: createdUser.email,
        full_name: createdUser.full_name,
        username: createdUser.username,
        phone_number: createdUser.phone_number,
        email_verified: Boolean(createdUser.email_verified),
        phone_verified: Boolean(createdUser.phone_verified),
        balance_usd: Number(createdUser.balance_usd || 0),
        free_analysis_used: Boolean(createdUser.free_analysis_used),
        welcome_bonus_claimed: Boolean(createdUser.welcome_bonus_claimed),
        is_active: Boolean(createdUser.is_active),
        is_admin: Boolean(createdUser.is_admin),
      }),
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Kayıt oluşturulamadı." },
      { status: 500 }
    );
  }
}