import crypto from "crypto";
import { cookies } from "next/headers";
import type { ResultSetHeader } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";

export const AUTH_COOKIE_NAME = "medyatora_session";

const SESSION_DAYS = 30;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getSessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export function hashSessionToken(token: string) {
  return sha256(token);
}

export async function createUserSession({
  userId,
  ipAddress,
  userAgent,
}: {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const pool = getMysqlPool();

  const rawToken = createSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = getSessionExpiryDate();

  await pool.query<ResultSetHeader>(
    `
    INSERT INTO user_sessions (
      user_id,
      session_token_hash,
      ip_address,
      user_agent,
      expires_at,
      last_seen_at
    )
    VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [
      userId,
      tokenHash,
      ipAddress || null,
      userAgent ? userAgent.slice(0, 500) : null,
      expiresAt,
    ]
  );

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return {
    token: rawToken,
    tokenHash,
    expiresAt,
  };
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    const pool = getMysqlPool();

    await pool.query(
      `
      UPDATE user_sessions
      SET revoked_at = NOW()
      WHERE session_token_hash = ?
      LIMIT 1
      `,
      [tokenHash]
    );
  }

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}