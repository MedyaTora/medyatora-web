import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";
import { AUTH_COOKIE_NAME, hashSessionToken } from "./session";

export type CurrentUser = {
  id: number;
  email: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  balance_usd: number;
  free_analysis_used: boolean;
  welcome_bonus_claimed: boolean;
  is_active: boolean;
  is_admin: boolean;
};

type CurrentUserRow = RowDataPacket & {
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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const pool = getMysqlPool();

  const [rows] = await pool.query<CurrentUserRow[]>(
    `
    SELECT
      users.id,
      users.email,
      users.full_name,
      users.username,
      users.phone_number,
      users.email_verified,
      users.phone_verified,
      users.balance_usd,
      users.free_analysis_used,
      users.welcome_bonus_claimed,
      users.is_active,
      users.is_admin
    FROM user_sessions
    INNER JOIN users ON users.id = user_sessions.user_id
    WHERE user_sessions.session_token_hash = ?
      AND user_sessions.revoked_at IS NULL
      AND user_sessions.expires_at > NOW()
      AND users.is_active = 1
    LIMIT 1
    `,
    [tokenHash]
  );

  const user = rows[0];

  if (!user) {
    return null;
  }

  await pool.query(
    `
    UPDATE user_sessions
    SET last_seen_at = NOW()
    WHERE session_token_hash = ?
    LIMIT 1
    `,
    [tokenHash]
  );

  return {
    id: Number(user.id),
    email: user.email,
    full_name: user.full_name,
    username: user.username,
    phone_number: user.phone_number,
    email_verified: Boolean(user.email_verified),
    phone_verified: Boolean(user.phone_verified),
    balance_usd: Number(user.balance_usd || 0),
    free_analysis_used: Boolean(user.free_analysis_used),
    welcome_bonus_claimed: Boolean(user.welcome_bonus_claimed),
    is_active: Boolean(user.is_active),
    is_admin: Boolean(user.is_admin),
  };
}

export function getPublicUser(user: CurrentUser | null) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    username: user.username,
    phone_number: user.phone_number,
    email_verified: user.email_verified,
    phone_verified: user.phone_verified,
    balance_usd: user.balance_usd,
    free_analysis_used: user.free_analysis_used,
    welcome_bonus_claimed: user.welcome_bonus_claimed,
  };
}