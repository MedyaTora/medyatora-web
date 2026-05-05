import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";
import {
  getPublicUser,
  normalizeDateValue,
  type PreferredCurrency,
} from "@/lib/auth/current-user";
import { createUserSession } from "@/lib/auth/session";

type RegisterBody = {
  email?: string;
  password?: string;
  full_name?: string;
  username?: string;
  phone_number?: string;
  preferred_currency?: string;
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
  balance_tl: string | number;
  balance_rub: string | number;
  preferred_currency: string | null;
  free_analysis_used: number;
  welcome_bonus_claimed: number;
  is_active: number;
  is_admin: number;
  whatsapp_verified_at: Date | string | null;
  telegram_verified_at: Date | string | null;
  contact_bonus_granted_at: Date | string | null;
};

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizeOptionalText(value: unknown) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : null;
}

function normalizePreferredCurrency(value: unknown): PreferredCurrency {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "TL";
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cloudflareIp = req.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return realIp || cloudflareIp || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody;

    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const fullName = normalizeOptionalText(body.full_name);
    const username = normalizeOptionalText(body.username);
    const phoneNumber = normalizeOptionalText(body.phone_number);
    const preferredCurrency = normalizePreferredCurrency(body.preferred_currency);
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir e-posta adresi gir." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Şifre en az 8 karakter olmalı." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [existingUsers] = await pool.query<RowDataPacket[]>(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { ok: false, error: "Bu e-posta ile kayıtlı bir hesap var." },
        { status: 409 }
      );
    }

    if (username) {
      const [existingUsernames] = await pool.query<RowDataPacket[]>(
        `
        SELECT id
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username]
      );

      if (existingUsernames.length > 0) {
        return NextResponse.json(
          { ok: false, error: "Bu kullanıcı adı zaten kullanılıyor." },
          { status: 409 }
        );
      }
    }

    if (phoneNumber) {
      const [existingPhones] = await pool.query<RowDataPacket[]>(
        `
        SELECT id
        FROM users
        WHERE phone_number = ?
        LIMIT 1
        `,
        [phoneNumber]
      );

      if (existingPhones.length > 0) {
        return NextResponse.json(
          { ok: false, error: "Bu telefon numarası zaten kullanılıyor." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [insertResult] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        username,
        phone_number,
        preferred_currency,
        created_ip,
        last_ip
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        email,
        passwordHash,
        fullName,
        username,
        phoneNumber,
        preferredCurrency,
        clientIp,
        clientIp,
      ]
    );

    const userId = insertResult.insertId;

    const [createdUserRows] = await pool.query<CreatedUserRow[]>(
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
        balance_tl,
        balance_rub,
        preferred_currency,
        free_analysis_used,
        welcome_bonus_claimed,
        is_active,
        is_admin,
        whatsapp_verified_at,
        telegram_verified_at,
        contact_bonus_granted_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    const createdUser = createdUserRows[0];

    if (!createdUser) {
      return NextResponse.json(
        { ok: false, error: "Kullanıcı oluşturuldu ama tekrar okunamadı." },
        { status: 500 }
      );
    }

    await createUserSession({
      userId: Number(createdUser.id),
      ipAddress: clientIp,
      userAgent,
    });

    await pool.query(
      `
      UPDATE users
      SET
        last_login_at = NOW(),
        last_ip = ?
      WHERE id = ?
      LIMIT 1
      `,
      [clientIp, createdUser.id]
    );

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
        balance_tl: Number(createdUser.balance_tl || 0),
        balance_rub: Number(createdUser.balance_rub || 0),
        preferred_currency: normalizePreferredCurrency(
          createdUser.preferred_currency
        ),
        free_analysis_used: Boolean(createdUser.free_analysis_used),
        welcome_bonus_claimed: Boolean(createdUser.welcome_bonus_claimed),
        is_active: Boolean(createdUser.is_active),
        is_admin: Boolean(createdUser.is_admin),
        whatsapp_verified_at: normalizeDateValue(
          createdUser.whatsapp_verified_at
        ),
        telegram_verified_at: normalizeDateValue(
          createdUser.telegram_verified_at
        ),
        contact_bonus_granted_at: normalizeDateValue(
          createdUser.contact_bonus_granted_at
        ),
      }),
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Kayıt sırasında sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}