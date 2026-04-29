import https from "https";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import {
  createPhoneVerificationCode,
  getPhoneVerificationExpiryDate,
  hashPhoneVerificationCode,
  isValidNormalizedPhone,
  maskPhoneNumber,
  normalizePhoneNumber,
  PHONE_BONUS_TYPE,
} from "@/lib/auth/phone";

type Channel = "telegram" | "whatsapp";

type ExistingPhoneRow = RowDataPacket & {
  id: number;
  email: string;
};

type ExistingBonusRow = RowDataPacket & {
  id: number;
};

type RecentCodeRow = RowDataPacket & {
  id: number;
};

type HourlyCountRow = RowDataPacket & {
  total: number;
};

const ALLOWED_CHANNELS: Channel[] = ["telegram", "whatsapp"];

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

function getChannelLabel(channel: Channel) {
  if (channel === "whatsapp") return "WhatsApp";
  return "Telegram";
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      ok: false,
      warning: "Telegram token veya chat id eksik.",
    };
  }

  const body = JSON.stringify({
    chat_id: chatId,
    text,
  });

  try {
    const responseText = await new Promise<string>((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.telegram.org",
          path: `/bot${token}/sendMessage`,
          method: "POST",
          family: 4,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`Telegram HTTP ${res.statusCode}: ${data}`));
              return;
            }

            resolve(data);
          });
        }
      );

      req.on("error", (err) => {
        reject(err);
      });

      req.write(body);
      req.end();
    });

    try {
      const json = JSON.parse(responseText);

      if (!json.ok) {
        return {
          ok: false,
          warning: "Telegram API doğrulama bildirimini kabul etmedi.",
        };
      }
    } catch {
      return {
        ok: false,
        warning: "Telegram cevabı beklenen formatta alınamadı.",
      };
    }

    return {
      ok: true,
      warning: null,
    };
  } catch (error) {
    return {
      ok: false,
      warning:
        error instanceof Error
          ? `Telegram gönderim hatası: ${error.message}`
          : "Telegram gönderiminde bilinmeyen hata oluştu.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, error: "Telefon doğrulamak için giriş yapmalısın." },
        { status: 401 }
      );
    }

    if (currentUser.phone_verified && currentUser.phone_number) {
      return NextResponse.json(
        {
          ok: false,
          error: "Telefon numaran zaten doğrulanmış.",
          phoneNumber: currentUser.phone_number,
          maskedPhoneNumber: maskPhoneNumber(currentUser.phone_number),
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const phoneNumber = normalizePhoneNumber(body.phone_number);
    const channel = String(body.channel || "telegram").toLowerCase() as Channel;

    if (!isValidNormalizedPhone(phoneNumber)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Geçerli bir telefon numarası gir. Örnek: 05530739292 veya +905530739292",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir doğrulama yöntemi seç." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();
    const ipAddress = getClientIp(request);

    const [existingPhoneRows] = await pool.query<ExistingPhoneRow[]>(
      `
      SELECT id, email
      FROM users
      WHERE phone_number = ?
        AND id <> ?
      LIMIT 1
      `,
      [phoneNumber, currentUser.id]
    );

    if (existingPhoneRows.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bu telefon numarası daha önce başka bir hesapta doğrulanmış. Lütfen mevcut hesabınla giriş yap.",
        },
        { status: 409 }
      );
    }

    const [existingBonusRows] = await pool.query<ExistingBonusRow[]>(
      `
      SELECT id
      FROM user_bonus_claims
      WHERE phone_number = ?
        AND bonus_type = ?
      LIMIT 1
      `,
      [phoneNumber, PHONE_BONUS_TYPE]
    );

    if (existingBonusRows.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bu telefon numarası daha önce başlangıç bonusu için kullanılmış. Aynı numara ile tekrar bonus alınamaz.",
        },
        { status: 409 }
      );
    }

    const [recentCodeRows] = await pool.query<RecentCodeRow[]>(
      `
      SELECT id
      FROM phone_verification_codes
      WHERE user_id = ?
        AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
      LIMIT 1
      `,
      [currentUser.id]
    );

    if (recentCodeRows.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Yeni kod istemeden önce lütfen 60 saniye bekle.",
        },
        { status: 429 }
      );
    }

    const [hourlyCountRows] = await pool.query<HourlyCountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM phone_verification_codes
      WHERE user_id = ?
        AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `,
      [currentUser.id]
    );

    const hourlyTotal = Number(hourlyCountRows[0]?.total || 0);

    if (hourlyTotal >= 5) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Çok fazla doğrulama kodu istedin. Lütfen bir süre sonra tekrar dene.",
        },
        { status: 429 }
      );
    }

    const code = createPhoneVerificationCode();
    const codeHash = hashPhoneVerificationCode({
      userId: currentUser.id,
      phoneNumber,
      code,
    });
    const expiresAt = getPhoneVerificationExpiryDate();

    await pool.query(
      `
      UPDATE phone_verification_codes
      SET used_at = NOW()
      WHERE user_id = ?
        AND phone_number = ?
        AND used_at IS NULL
      `,
      [currentUser.id, phoneNumber]
    );

    await pool.query(
      `
      INSERT INTO phone_verification_codes (
        user_id,
        phone_number,
        code_hash,
        expires_at,
        ip_address
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [currentUser.id, phoneNumber, codeHash, expiresAt, ipAddress]
    );

    const maskedPhone = maskPhoneNumber(phoneNumber);
    const channelLabel = getChannelLabel(channel);

    const telegramMessage =
      `📲 MedyaTora telefon doğrulama kodu\n\n` +
      `👤 Kullanıcı: #${currentUser.id} | ${currentUser.email}\n` +
      `📞 Telefon: ${phoneNumber}\n` +
      `🔒 Maskeli: ${maskedPhone}\n` +
      `📨 Seçilen yöntem: ${channelLabel}\n` +
      `🔢 Doğrulama kodu: ${code}\n` +
      `⏱️ Geçerlilik: 10 dakika\n\n` +
      `Mesaj metni:\n` +
      `MedyaTora'ya hoş geldin. Kayıt işlemini tamamlamak için doğrulama kodun: ${code}`;

    const telegramResult = await sendTelegramMessage(telegramMessage);

    return NextResponse.json({
      ok: true,
      message:
        channel === "whatsapp"
          ? "Doğrulama kodu oluşturuldu. Kod WhatsApp üzerinden iletilecek."
          : "Doğrulama kodu oluşturuldu. Kod Telegram üzerinden iletilecek.",
      phoneNumber,
      maskedPhoneNumber: maskedPhone,
      channel,
      telegramWarning: telegramResult.warning,
    });
  } catch (error) {
    console.error("PHONE_START_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Telefon doğrulama başlatılamadı.",
      },
      { status: 500 }
    );
  }
}