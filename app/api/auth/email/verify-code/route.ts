import { NextResponse } from "next/server";
import crypto from "crypto";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TokenRow = RowDataPacket & {
  id: number;
  user_id: number;
  email: string;
  token: string;
  expires_at: Date | string;
  used_at: Date | string | null;
};

type UserBonusRow = RowDataPacket & {
  email_verified: number;
  free_analysis_used: number;
  free_analysis_granted_at: Date | string | null;
};

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function cleanCode(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Giriş yapmalısın." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const code = cleanCode(body?.code);

    if (code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "6 haneli doğrulama kodunu yazmalısın." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();
    const codeHash = hashCode(code);

    const [tokenRows] = await pool.query<TokenRow[]>(
      `
      SELECT id, user_id, email, token, expires_at, used_at
      FROM email_verification_tokens
      WHERE user_id = ?
        AND email = ?
        AND token = ?
        AND used_at IS NULL
      ORDER BY id DESC
      LIMIT 1
      `,
      [user.id, user.email, codeHash]
    );

    const token = tokenRows[0];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Kod hatalı veya kullanılmış." },
        { status: 400 }
      );
    }

    const expiresAt = new Date(token.expires_at);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: "Kodun süresi dolmuş. Yeni kod iste." },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [userRows] = await connection.query<UserBonusRow[]>(
        `
        SELECT email_verified, free_analysis_used, free_analysis_granted_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [user.id]
      );

      const dbUser = userRows[0];

      await connection.query(
        `
        UPDATE email_verification_tokens
        SET used_at = NOW()
        WHERE id = ?
        `,
        [token.id]
      );

      await connection.query(
        `
        UPDATE users
        SET
          email_verified = 1,
          email_verified_at = COALESCE(email_verified_at, NOW()),
          free_analysis_granted_at = COALESCE(free_analysis_granted_at, NOW())
        WHERE id = ?
        `,
        [user.id]
      );

      const shouldCreateBonusTransaction =
        dbUser && !dbUser.free_analysis_granted_at;

      if (shouldCreateBonusTransaction) {
        await connection.query(
          `
          INSERT INTO balance_transactions
            (
              user_id,
              transaction_type,
              currency,
              amount,
              balance_before,
              balance_after,
              description,
              related_order_id,
              created_at
            )
          VALUES
            (?, 'email_verification_bonus', 'USD', 0, 0, 0, ?, NULL, NOW())
          `,
          [
            user.id,
            "E-posta doğrulaması tamamlandı. 1 ücretsiz analiz hakkı tanımlandı.",
          ]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "E-posta doğrulandı. Ücretsiz analiz hakkın aktif edildi.",
        freeAnalysisGranted: true,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "E-posta doğrulaması sırasında hata oluştu.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}