import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import {
  hashPhoneVerificationCode,
  maskPhoneNumber,
} from "@/lib/auth/phone";

type Channel = "whatsapp" | "telegram";
type CountryCode = "TR" | "RU";

type ExistingUserRow = RowDataPacket & {
  id: number;
  phone_number: string | null;
  phone_verified: number | boolean;
};

type LatestCodeRow = RowDataPacket & {
  id: number;
  phone_number: string;
  channel: Channel;
  country_code: CountryCode;
  status: "pending" | "verified" | "expired" | "blocked";
  attempts: number;
  request_count: number;
  last_sent_at: Date | string | null;
  expires_at: Date | string;
  created_at: Date | string;
};

type CountRow = RowDataPacket & {
  total: number;
};

const CODE_EXPIRE_MINUTES = 10;
const RESEND_COOLDOWN_MINUTES = 10;
const MAX_CODE_REQUESTS = 3;

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

function normalizeChannel(value: unknown): Channel | null {
  const channel = normalizeString(value).toLowerCase();

  if (channel === "whatsapp") return "whatsapp";
  if (channel === "telegram") return "telegram";

  return null;
}

function normalizeCountryCode(value: unknown): CountryCode | null {
  const country = normalizeString(value).toUpperCase();

  if (country === "TR") return "TR";
  if (country === "RU") return "RU";

  return null;
}

function onlyDigits(value: unknown) {
  return normalizeString(value).replace(/\D/g, "");
}

function normalizePhoneNumber({
  countryCode,
  phoneInput,
}: {
  countryCode: CountryCode;
  phoneInput: unknown;
}) {
  let digits = onlyDigits(phoneInput);

  if (countryCode === "TR") {
    if (digits.startsWith("90")) {
      digits = digits.slice(2);
    }

    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    if (digits.length !== 10) {
      return null;
    }

    return `+90${digits}`;
  }

  if (countryCode === "RU") {
    if (digits.startsWith("7")) {
      digits = digits.slice(1);
    }

    if (digits.startsWith("8") && digits.length === 11) {
      digits = digits.slice(1);
    }

    if (digits.length !== 10) {
      return null;
    }

    return `+7${digits}`;
  }

  return null;
}

function createPlainCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getIpAddress(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim().slice(0, 80) || null;
  }

  if (realIp) {
    return realIp.trim().slice(0, 80);
  }

  return null;
}

function minutesBetweenNow(value: Date | string | null) {
  if (!value) return Number.POSITIVE_INFINITY;

  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return Number.POSITIVE_INFINITY;

  return (Date.now() - time) / 1000 / 60;
}

function getCooldownRemainingSeconds(value: Date | string | null) {
  const minutesPassed = minutesBetweenNow(value);
  const remainingMinutes = RESEND_COOLDOWN_MINUTES - minutesPassed;

  return Math.max(0, Math.ceil(remainingMinutes * 60));
}

async function sendVerificationCode({
  channel,
  phoneNumber,
  code,
}: {
  channel: Channel;
  phoneNumber: string;
  code: string;
}) {
  const message = `MedyaTora doğrulama kodunuz: ${code}. Kod 10 dakika geçerlidir.`;

  /*
    Şimdilik güvenli geçiş:
    Kod DB'ye hashli yazılır, gerçek WhatsApp / Telegram API bağlanana kadar server loguna düşer.

    Sonraki aşama:
    - WhatsApp Cloud API veya sağlayıcı API bağlanacak.
    - Telegram tarafında numaraya otomatik mesaj için bot tek başına yeterli değildir.
      Kullanıcının botu başlatması veya farklı sağlayıcı/Telegram akışı gerekir.
  */

  console.log("[MedyaTora Phone Verification]", {
    channel,
    phoneNumber,
    maskedPhoneNumber: maskPhoneNumber(phoneNumber),
    code,
    message,
  });

  return {
    ok: true,
    provider: "debug",
  };
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Telefon doğrulaması için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    if (!hasMysqlConfig()) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "MySQL bağlantısı bulunamadı.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);

    const channel = normalizeChannel(body?.channel);
    const countryCode = normalizeCountryCode(body?.country_code);

    const phoneNumber = countryCode
      ? normalizePhoneNumber({
          countryCode,
          phoneInput: body?.phone_number,
        })
      : null;

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Geçerli bir doğrulama kanalı seçin.",
        },
        { status: 400 }
      );
    }

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Lütfen TR veya RU ülke seçimini yapın.",
        },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error:
            countryCode === "TR"
              ? "Geçerli bir Türkiye numarası girin. Örnek: 5XXXXXXXXX"
              : "Geçerli bir Rusya numarası girin. Örnek: 9XXXXXXXXX",
        },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    const plainCode = createPlainCode();

    const codeHash = hashPhoneVerificationCode({
      userId: user.id,
      phoneNumber,
      code: plainCode,
    });

    const ipAddress = getIpAddress(req);

    try {
      await connection.beginTransaction();

      await connection.execute(
        `
        UPDATE phone_verification_codes
        SET status = 'expired'
        WHERE user_id = ?
          AND status = 'pending'
          AND expires_at < NOW()
        `,
        [user.id]
      );

      const [samePhoneUsers] = await connection.query<ExistingUserRow[]>(
        `
        SELECT id, phone_number, phone_verified
        FROM users
        WHERE phone_number = ?
          AND id <> ?
        LIMIT 1
        `,
        [phoneNumber, user.id]
      );

      if (samePhoneUsers[0]) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            ok: false,
            error:
              "Bu telefon numarası başka bir hesapta kayıtlı. Tek numara ile birden fazla hesap açılamaz.",
          },
          { status: 409 }
        );
      }

      const [currentUserRows] = await connection.query<ExistingUserRow[]>(
        `
        SELECT id, phone_number, phone_verified
        FROM users
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [user.id]
      );

      const currentUser = currentUserRows[0];

      if (!currentUser) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            ok: false,
            error: "Kullanıcı hesabı bulunamadı.",
          },
          { status: 401 }
        );
      }

      if (
        currentUser.phone_number === phoneNumber &&
        Boolean(currentUser.phone_verified)
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: true,
            ok: true,
            alreadyVerified: true,
            message: "Bu telefon numarası zaten doğrulanmış.",
            phone_number: phoneNumber,
            masked_phone_number: maskPhoneNumber(phoneNumber),
          },
          { status: 200 }
        );
      }

      const [countRows] = await connection.query<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM phone_verification_codes
        WHERE user_id = ?
          AND phone_number = ?
          AND status IN ('pending', 'expired', 'blocked')
        `,
        [user.id, phoneNumber]
      );

      const requestTotal = Number(countRows[0]?.total || 0);

      if (requestTotal >= MAX_CODE_REQUESTS) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            ok: false,
            error:
              "Bu telefon numarası için kod alma hakkınız doldu. Destek ile iletişime geçin.",
          },
          { status: 429 }
        );
      }

      const [latestRows] = await connection.query<LatestCodeRow[]>(
        `
        SELECT
          id,
          phone_number,
          channel,
          country_code,
          status,
          attempts,
          request_count,
          last_sent_at,
          expires_at,
          created_at
        FROM phone_verification_codes
        WHERE user_id = ?
          AND phone_number = ?
          AND status = 'pending'
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        FOR UPDATE
        `,
        [user.id, phoneNumber]
      );

      const latest = latestRows[0];

      if (latest) {
        const remainingSeconds = getCooldownRemainingSeconds(
          latest.last_sent_at || latest.created_at
        );

        if (remainingSeconds > 0) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              ok: false,
              error: `Yeni kod almak için ${remainingSeconds} saniye beklemelisiniz.`,
              cooldown_seconds: remainingSeconds,
            },
            { status: 429 }
          );
        }

        await connection.execute(
          `
          UPDATE phone_verification_codes
          SET status = 'expired'
          WHERE id = ?
          LIMIT 1
          `,
          [latest.id]
        );
      }

      const [insertResult] = await connection.execute<ResultSetHeader>(
        `
        INSERT INTO phone_verification_codes (
          user_id,
          phone_number,
          channel,
          country_code,
          code_hash,
          expires_at,
          attempts,
          request_count,
          ip_address,
          last_sent_at,
          status
        )
        VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, ?, ?, NOW(), 'pending')
        `,
        [
          user.id,
          phoneNumber,
          channel,
          countryCode,
          codeHash,
          CODE_EXPIRE_MINUTES,
          requestTotal + 1,
          ipAddress,
        ]
      );

      await connection.commit();

      const sendResult = await sendVerificationCode({
        channel,
        phoneNumber,
        code: plainCode,
      });

      return NextResponse.json(
        {
          success: true,
          ok: true,
          message:
            channel === "whatsapp"
              ? "Doğrulama kodu WhatsApp için oluşturuldu."
              : "Doğrulama kodu Telegram için oluşturuldu.",
          verification_id: Number(insertResult.insertId || 0),
          channel,
          country_code: countryCode,
          phone_number: phoneNumber,
          masked_phone_number: maskPhoneNumber(phoneNumber),
          expires_in_seconds: CODE_EXPIRE_MINUTES * 60,
          remaining_code_requests: Math.max(
            0,
            MAX_CODE_REQUESTS - (requestTotal + 1)
          ),
          provider: sendResult.provider,
          debug_code:
            process.env.NODE_ENV === "production" ? undefined : plainCode,
        },
        { status: 200 }
      );
    } catch (dbError) {
      await connection.rollback();

      console.error("PHONE_VERIFICATION_START_DB_ERROR", dbError);

      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Telefon doğrulama kodu oluşturulamadı.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("PHONE_VERIFICATION_START_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Telefon doğrulama işlemi başlatılamadı.",
      },
      { status: 500 }
    );
  }
}