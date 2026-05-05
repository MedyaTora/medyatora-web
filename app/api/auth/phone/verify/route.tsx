import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import {
  hashPhoneVerificationCode,
  isValidNormalizedPhone,
  maskPhoneNumber,
  normalizePhoneNumber,
  PHONE_BONUS_TYPE,
  PHONE_VERIFICATION_MAX_ATTEMPTS,
} from "@/lib/auth/phone";

type Channel = "whatsapp" | "telegram";
type CountryCode = "TR" | "RU";

type ActiveCodeRow = RowDataPacket & {
  id: number;
  user_id: number;
  phone_number: string;
  channel: Channel;
  country_code: CountryCode;
  attempts: number;
  request_count: number;
  code_hash: string;
  expires_at: Date | string;
  used_at: Date | string | null;
  blocked_at: Date | string | null;
  verified_at: Date | string | null;
  status: "pending" | "verified" | "expired" | "blocked";
};

type UserForUpdateRow = RowDataPacket & {
  id: number;
  email: string;
  phone_number: string | null;
  phone_verified: number | boolean;
  balance_usd: string | number;
  whatsapp_verified_at: Date | string | null;
  telegram_verified_at: Date | string | null;
  contact_bonus_granted_at: Date | string | null;
};

type OtherPhoneUserRow = RowDataPacket & {
  id: number;
};

const WRONG_CODE_BLOCK_LIMIT = Math.min(3, PHONE_VERIFICATION_MAX_ATTEMPTS);

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim().slice(0, 80) || null;
  }

  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null;

  return realIp ? realIp.trim().slice(0, 80) : null;
}

function normalizeCode(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function normalizeChannel(value: unknown): Channel | null {
  const channel = String(value || "").trim().toLowerCase();

  if (channel === "whatsapp") return "whatsapp";
  if (channel === "telegram") return "telegram";

  return null;
}

function normalizeCountryCode(value: unknown): CountryCode | null {
  const country = String(value || "").trim().toUpperCase();

  if (country === "TR") return "TR";
  if (country === "RU") return "RU";

  return null;
}

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

function getChannelVerifiedColumn(channel: Channel) {
  if (channel === "telegram") return "telegram_verified_at";
  return "whatsapp_verified_at";
}

function getChannelLabel(channel: Channel) {
  if (channel === "telegram") return "Telegram";
  return "WhatsApp";
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: "Telefon doğrulamak için giriş yapmalısın.",
      },
      { status: 401 }
    );
  }

  if (!hasMysqlConfig()) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: "MySQL bağlantısı bulunamadı.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    const phoneNumber = normalizePhoneNumber(body?.phone_number);
    const code = normalizeCode(body?.code);
    const channel = normalizeChannel(body?.channel) || "whatsapp";
    const countryCode = normalizeCountryCode(body?.country_code);

    if (!isValidNormalizedPhone(phoneNumber)) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Geçerli bir telefon numarası gir.",
        },
        { status: 400 }
      );
    }

    if (!countryCode) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Geçerli ülke seçimi gerekli. TR veya RU seçilmelidir.",
        },
        { status: 400 }
      );
    }

    if (countryCode === "TR" && !phoneNumber.startsWith("+90")) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "TR için telefon numarası +90 ile başlamalıdır.",
        },
        { status: 400 }
      );
    }

    if (countryCode === "RU" && !phoneNumber.startsWith("+7")) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "RU için telefon numarası +7 ile başlamalıdır.",
        },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "6 haneli doğrulama kodunu gir.",
        },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [activeCodeRows] = await pool.query<ActiveCodeRow[]>(
      `
      SELECT
        id,
        user_id,
        phone_number,
        channel,
        country_code,
        attempts,
        request_count,
        code_hash,
        expires_at,
        used_at,
        blocked_at,
        verified_at,
        status
      FROM phone_verification_codes
      WHERE user_id = ?
        AND phone_number = ?
        AND channel = ?
        AND country_code = ?
        AND used_at IS NULL
        AND blocked_at IS NULL
        AND status = 'pending'
      ORDER BY id DESC
      LIMIT 1
      `,
      [currentUser.id, phoneNumber, channel, countryCode]
    );

    const activeCode = activeCodeRows[0];

    if (!activeCode) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Aktif doğrulama kodu bulunamadı. Lütfen yeni kod iste.",
        },
        { status: 400 }
      );
    }

    const expiresAt = new Date(activeCode.expires_at).getTime();

    if (!expiresAt || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      await pool.query(
        `
        UPDATE phone_verification_codes
        SET status = 'expired'
        WHERE id = ?
        LIMIT 1
        `,
        [activeCode.id]
      );

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Doğrulama kodunun süresi doldu. Lütfen yeni kod iste.",
        },
        { status: 400 }
      );
    }

    if (Number(activeCode.attempts || 0) >= WRONG_CODE_BLOCK_LIMIT) {
      await pool.query(
        `
        UPDATE phone_verification_codes
        SET
          status = 'blocked',
          blocked_at = COALESCE(blocked_at, NOW()),
          used_at = COALESCE(used_at, NOW())
        WHERE id = ?
        LIMIT 1
        `,
        [activeCode.id]
      );

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error:
            "Bu kod için hatalı deneme hakkın doldu. Lütfen yeni doğrulama kodu iste.",
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
      const shouldBlock = nextAttempts >= WRONG_CODE_BLOCK_LIMIT;

      await pool.query(
        `
        UPDATE phone_verification_codes
        SET
          attempts = attempts + 1,
          status = CASE
            WHEN attempts + 1 >= ? THEN 'blocked'
            ELSE status
          END,
          blocked_at = CASE
            WHEN attempts + 1 >= ? THEN NOW()
            ELSE blocked_at
          END,
          used_at = CASE
            WHEN attempts + 1 >= ? THEN NOW()
            ELSE used_at
          END
        WHERE id = ?
        LIMIT 1
        `,
        [
          WRONG_CODE_BLOCK_LIMIT,
          WRONG_CODE_BLOCK_LIMIT,
          WRONG_CODE_BLOCK_LIMIT,
          activeCode.id,
        ]
      );

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: shouldBlock
            ? "Kod 3 kez hatalı girildi. Bu kod artık kullanılamaz."
            : `Doğrulama kodu hatalı. Kalan deneme hakkı: ${
                WRONG_CODE_BLOCK_LIMIT - nextAttempts
              }`,
          attempts: nextAttempts,
          remainingAttempts: Math.max(WRONG_CODE_BLOCK_LIMIT - nextAttempts, 0),
          blocked: shouldBlock,
        },
        { status: shouldBlock ? 429 : 400 }
      );
    }

    const connection = await pool.getConnection();
    const ipAddress = getClientIp(request);
    const verifiedColumn = getChannelVerifiedColumn(channel);

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
          whatsapp_verified_at,
          telegram_verified_at,
          contact_bonus_granted_at
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
            success: false,
            error:
              "Bu telefon numarası daha önce başka bir hesapta doğrulanmış. Lütfen mevcut hesabınla giriş yap.",
          },
          { status: 409 }
        );
      }

      await connection.execute(
        `
        UPDATE phone_verification_codes
        SET
          used_at = NOW(),
          verified_at = NOW(),
          status = 'verified'
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
          phone_verified = 1,
          ${verifiedColumn} = COALESCE(${verifiedColumn}, NOW())
        WHERE id = ?
        LIMIT 1
        `,
        [phoneNumber, currentUser.id]
      );

      let bonusGranted = false;
      let bonusAmountUsd = 0;

      const balanceBefore = roundMoney(Number(user.balance_usd || 0));
      let balanceAfter = balanceBefore;

      const alreadyHasContactBonus = Boolean(user.contact_bonus_granted_at);

      if (!alreadyHasContactBonus) {
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
          balanceAfter = roundMoney(balanceBefore + bonusAmountUsd);

          await connection.execute(
            `
            UPDATE users
            SET
              balance_usd = ?,
              contact_bonus_granted_at = NOW()
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
              currency,
              amount,
              balance_before,
              balance_after,
              amount_usd,
              balance_before_usd,
              balance_after_usd,
              description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              currentUser.id,
              "contact_verification_bonus",
              "USD",
              bonusAmountUsd,
              balanceBefore,
              balanceAfter,
              bonusAmountUsd,
              balanceBefore,
              balanceAfter,
              `${getChannelLabel(channel)} telefon doğrulama bonusu`,
            ]
          );
        }
      }

      await connection.commit();

      return NextResponse.json({
        ok: true,
        success: true,
        message: bonusGranted
          ? `${getChannelLabel(
              channel
            )} telefon doğrulaman tamamlandı ve 1 USD bonus tanımlandı.`
          : `${getChannelLabel(channel)} telefon doğrulaman tamamlandı.`,
        phoneNumber,
        maskedPhoneNumber: maskPhoneNumber(phoneNumber),
        phoneVerified: true,
        channel,
        channelLabel: getChannelLabel(channel),
        countryCode,
        bonusGranted,
        bonusAmountUsd,
        balanceUsd: bonusGranted ? balanceAfter : balanceBefore,
        contactBonusGranted: bonusGranted || alreadyHasContactBonus,
        whatsappVerified:
          channel === "whatsapp" || Boolean(user.whatsapp_verified_at),
        telegramVerified:
          channel === "telegram" || Boolean(user.telegram_verified_at),
      });
    } catch (dbError) {
      await connection.rollback();

      if (isDuplicateKeyError(dbError)) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
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
          success: false,
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
        success: false,
        error: "Telefon doğrulanamadı.",
      },
      { status: 500 }
    );
  }
}