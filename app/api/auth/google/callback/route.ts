import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import { createUserSession } from "@/lib/auth/session";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_OAUTH_STATE_COOKIE = "medyatora_google_oauth_state";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  google_id: string | null;
  is_active: number | boolean;
};

function getRedirectUrl(request: Request) {
  const envRedirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL;

  if (envRedirectUrl) {
    return envRedirectUrl;
  }

  return `${new URL(request.url).origin}/api/auth/google/callback`;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim().slice(0, 80) || null;
  }

  return (
    request.headers.get("x-real-ip")?.slice(0, 80) ||
    request.headers.get("cf-connecting-ip")?.slice(0, 80) ||
    null
  );
}

function createGooglePasswordPlaceholder() {
  return `google_oauth_${crypto.randomBytes(32).toString("hex")}`;
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value: unknown) {
  const name = String(value || "").trim();

  if (!name) return null;

  return name.slice(0, 120);
}

function redirectWithError(request: Request, message: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("auth_error", message);

  return NextResponse.redirect(url);
}

async function getGoogleTokens({
  code,
  request,
}: {
  code: string;
  request: Request;
}) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getRedirectUrl(request);

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth env bilgileri eksik.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | GoogleTokenResponse
    | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        "Google token alınamadı."
    );
  }

  return data;
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | GoogleUserInfo
    | null;

  if (!response.ok || !data?.sub || !data?.email) {
    throw new Error("Google kullanıcı bilgisi alınamadı.");
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    if (!hasMysqlConfig()) {
      return redirectWithError(request, "MySQL bağlantısı bulunamadı.");
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return redirectWithError(request, "Google girişi iptal edildi.");
    }

    if (!code || !state) {
      return redirectWithError(request, "Google giriş bilgisi eksik.");
    }

    const cookieState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

    if (!cookieState || cookieState !== state) {
      return redirectWithError(request, "Google güvenlik doğrulaması başarısız.");
    }

    const tokenData = await getGoogleTokens({ code, request });
    const googleUser = await getGoogleUserInfo(tokenData.access_token!);

    const googleId = String(googleUser.sub || "").trim();
    const email = normalizeEmail(googleUser.email);
    const fullName = normalizeName(googleUser.name);

    if (!googleId || !email) {
      return redirectWithError(request, "Google hesabı doğrulanamadı.");
    }

    if (googleUser.email_verified === false) {
      return redirectWithError(
        request,
        "Google e-posta adresi doğrulanmamış görünüyor."
      );
    }

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    let userId: number | null = null;

    try {
      await connection.beginTransaction();

      const [googleRows] = await connection.query<UserRow[]>(
        `
        SELECT id, email, google_id, is_active
        FROM users
        WHERE google_id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [googleId]
      );

      const googleLinkedUser = googleRows[0];

      if (googleLinkedUser) {
        if (!Boolean(googleLinkedUser.is_active)) {
          await connection.rollback();
          return redirectWithError(request, "Bu kullanıcı hesabı aktif değil.");
        }

        userId = Number(googleLinkedUser.id);
      } else {
        const [emailRows] = await connection.query<UserRow[]>(
          `
          SELECT id, email, google_id, is_active
          FROM users
          WHERE email = ?
          LIMIT 1
          FOR UPDATE
          `,
          [email]
        );

        const existingEmailUser = emailRows[0];

        if (existingEmailUser) {
          if (!Boolean(existingEmailUser.is_active)) {
            await connection.rollback();
            return redirectWithError(request, "Bu kullanıcı hesabı aktif değil.");
          }

          if (
            existingEmailUser.google_id &&
            existingEmailUser.google_id !== googleId
          ) {
            await connection.rollback();
            return redirectWithError(
              request,
              "Bu e-posta farklı bir Google hesabına bağlı."
            );
          }

          await connection.execute(
            `
            UPDATE users
            SET
              google_id = ?,
              email_verified = 1,
              full_name = COALESCE(full_name, ?),
              last_login_at = NOW()
            WHERE id = ?
            LIMIT 1
            `,
            [googleId, fullName, existingEmailUser.id]
          );

          userId = Number(existingEmailUser.id);
        } else {
          const [insertResult] = await connection.execute<ResultSetHeader>(
            `
            INSERT INTO users (
              email,
              google_id,
              password_hash,
              full_name,
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
              created_ip,
              last_ip,
              last_login_at
            )
            VALUES (?, ?, ?, ?, 1, 0, 0, 0, 0, 'TL', 0, 0, 1, 0, ?, ?, NOW())
            `,
            [
              email,
              googleId,
              createGooglePasswordPlaceholder(),
              fullName,
              getClientIp(request),
              getClientIp(request),
            ]
          );

          userId = Number(insertResult.insertId || 0);
        }
      }

      if (!userId) {
        throw new Error("Google kullanıcı hesabı oluşturulamadı.");
      }

      await connection.execute(
        `
        UPDATE users
        SET
          email_verified = 1,
          last_ip = ?,
          last_login_at = NOW()
        WHERE id = ?
        LIMIT 1
        `,
        [getClientIp(request), userId]
      );

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();
      console.error("GOOGLE_AUTH_DB_ERROR", dbError);

      return redirectWithError(
        request,
        "Google girişi veritabanına kaydedilemedi."
      );
    } finally {
      connection.release();
    }

    await createUserSession({
      userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    const response = NextResponse.redirect(new URL("/hesabim", request.url));

    response.cookies.set({
      name: GOOGLE_OAUTH_STATE_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("GOOGLE_AUTH_CALLBACK_ERROR", error);

    return redirectWithError(
      request,
      error instanceof Error
        ? error.message
        : "Google ile giriş sırasında hata oluştu."
    );
  }
}