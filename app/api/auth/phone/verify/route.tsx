import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import {
  hashPhoneVerificationCode,
  isValidNormalizedPhone,
  maskPhoneNumber,
  normalizePhoneNumber,
  PHONE_BONUS_TYPE,
  PHONE_VERIFICATION_MAX_ATTEMPTS,
} from "@/lib/auth/phone";

type ActiveCodeRow = RowDataPacket & {
  id: number;
  attempts: number;
  code_hash: string;
};

type UserForUpdateRow = RowDataPacket & {
  id: number;
  email: string;
  phone_number: string | null;
  phone_verified: number;
  balance_usd: string | number;
  welcome_bonus_claimed: number;
};

type OtherPhoneUserRow = RowDataPacket & {
  id: number;
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

function normalizeCode(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "Telefon doğrulamak için giriş yapmalısın." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const phoneNumber = normalizePhoneNumber(body.phone_number);
    const code = normalizeCode(body.code);

    if (!isValidNormalizedPhone(phoneNumber)) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir telefon numarası gir." },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { ok: false, error: "6 haneli doğrulama kodunu gir." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [activeCodeRows] = await pool.query<ActiveCodeRow[]>(
      `
      SELECT id, attempts, code_hash
      FROM phone_verification_codes
      WHERE user_id = ?
        AND phone_number = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
      `,
      [currentUser.id, phoneNumber]
    );

    const activeCode = activeCodeRows[0];

    if (!activeCode) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Aktif doğrulama kodu bulunamadı veya kodun süresi doldu. Lütfen yeni kod iste.",
        },
        { status: 400 }
      );
    }

    if (Number(activeCode.attempts || 0) >= PHONE_VERIFICATION_MAX_ATTEMPTS) {
      await pool.query(
        `
        UPDATE phone_verification_codes
        SET used_at = NOW()
        WHERE id = ?
        LIMIT 1
        `,
        [activeCode.id]
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Çok fazla hatalı deneme yapıldı. Lütfen yeni kod iste.",
        },
        { status: 429 }
      );
    }

    const expectedHash = hashPhoneVerificationCode({
      userId: currentUser.id,
      phoneNumber,
      code,
    });

    if (expectedHash !== activeCode.code_hash) {
      const nextAttempts = Number(activeCode.attempts || 0) + 1;

      await pool.query(
        `
        UPDATE phone_verification_codes
        SET
          attempts = attempts + 1,
          used_at = CASE
            WHEN attempts + 1 >= ? THEN NOW()
            ELSE used_at
          END
        WHERE id = ?
        LIMIT 1
        `,
        [PHONE_VERIFICATION_MAX_ATTEMPTS, activeCode.id]
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            nextAttempts >= PHONE_VERIFICATION_MAX_ATTEMPTS
              ? "Kod çok fazla hatalı girildi. Lütfen yeni kod iste."
              : `Doğrulama kodu hatalı. Kalan deneme hakkı: ${
                  PHONE_VERIFICATION_MAX_ATTEMPTS - nextAttempts
                }`,
        },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    const ipAddress = getClientIp(request);

    try {
      await connection.beginTransaction();

      const [userRows] = await connection.query<UserForUpdateRow[]>(
        `
        SELECT
          id,
          email,
          phone_number,
          phone_verified,
          balance_usd,
          welcome_bonus_claimed
        FROM users
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [currentUser.id]
      );

      const user = userRows[0];

      if (!user) {
        throw new Error("Kullanıcı bulunamadı.");
      }

      const [otherPhoneRows] = await connection.query<OtherPhoneUserRow[]>(
        `
        SELECT id
        FROM users
        WHERE phone_number = ?
          AND id <> ?
        LIMIT 1
        FOR UPDATE
        `,
        [phoneNumber, currentUser.id]
      );

      if (otherPhoneRows.length > 0) {
        await connection.rollback();

        return NextResponse.json(
          {
            ok: false,
            error:
              "Bu telefon numarası daha önce başka bir hesapta doğrulanmış. Lütfen mevcut hesabınla giriş yap.",
          },
          { status: 409 }
        );
      }

      await connection.execute(
        `
        UPDATE phone_verification_codes
        SET used_at = NOW()
        WHERE id = ?
        LIMIT 1
        `,
        [activeCode.id]
      );

      await connection.execute(
        `
        UPDATE users
        SET
          phone_number = ?,
          phone_verified = 1
        WHERE id = ?
        LIMIT 1
        `,
        [phoneNumber, currentUser.id]
      );

      let bonusGranted = false;
      let bonusAmountUsd = 0;
      const balanceBefore = Number(user.balance_usd || 0);

      if (!Boolean(user.welcome_bonus_claimed)) {
        const [bonusInsertResult] = await connection.execute<ResultSetHeader>(
          `
          INSERT IGNORE INTO user_bonus_claims (
            user_id,
            bonus_type,
            amount_usd,
            email,
            phone_number,
            ip_address
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            currentUser.id,
            PHONE_BONUS_TYPE,
            1.0,
            user.email,
            phoneNumber,
            ipAddress,
          ]
        );

        if (bonusInsertResult.affectedRows === 1) {
          bonusGranted = true;
          bonusAmountUsd = 1;

          const balanceAfter = balanceBefore + bonusAmountUsd;

          await connection.execute(
            `
            UPDATE users
            SET
              balance_usd = ?,
              welcome_bonus_claimed = 1
            WHERE id = ?
            LIMIT 1
            `,
            [balanceAfter, currentUser.id]
          );

          await connection.execute(
            `
            INSERT INTO balance_transactions (
              user_id,
              transaction_type,
              amount_usd,
              balance_before_usd,
              balance_after_usd,
              description
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              currentUser.id,
              "bonus",
              bonusAmountUsd,
              balanceBefore,
              balanceAfter,
              "Telefon doğrulama başlangıç bonusu",
            ]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({
        ok: true,
        message: bonusGranted
          ? "Telefon numaran doğrulandı ve 1 USD başlangıç bonusu tanımlandı."
          : "Telefon numaran doğrulandı.",
        phoneNumber,
        maskedPhoneNumber: maskPhoneNumber(phoneNumber),
        phoneVerified: true,
        bonusGranted,
        bonusAmountUsd,
        balanceUsd: bonusGranted ? balanceBefore + bonusAmountUsd : balanceBefore,
      });
    } catch (dbError) {
      await connection.rollback();

      if (isDuplicateKeyError(dbError)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Bu telefon numarası veya bonus hakkı daha önce kullanılmış. Tekrar bonus alınamaz.",
          },
          { status: 409 }
        );
      }

      console.error("PHONE_VERIFY_DB_ERROR", dbError);

      return NextResponse.json(
        {
          ok: false,
          error: "Telefon doğrulama kaydedilemedi.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("PHONE_VERIFY_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Telefon doğrulanamadı.",
      },
      { status: 500 }
    );
  }
}