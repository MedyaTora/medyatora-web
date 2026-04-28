import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";

const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeContactType(value: unknown): ContactType | "" {
  const raw = normalizeString(value);
  const normalized = raw.toLowerCase().replace(/\s+/g, "");

  if (normalized === "telegram") return "Telegram";
  if (normalized === "whatsapp" || normalized === "wa") return "WhatsApp";
  if (normalized === "instagram" || normalized === "ig") return "Instagram";
  if (
    normalized === "e-posta" ||
    normalized === "eposta" ||
    normalized === "email" ||
    normalized === "e-mail" ||
    normalized === "mail"
  ) {
    return "E-posta";
  }

  return "";
}

function normalizeDailyPostCount(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function normalizeCoupon(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram token veya chat id eksik.");
  }

  const body = JSON.stringify({
    chat_id: chatId,
    text,
  });

  return await new Promise<string>((resolve, reject) => {
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
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = normalizeString(body?.full_name);
    const username = normalizeString(body?.username);
    const accountLink = normalizeString(body?.account_link);
    const accountType = normalizeString(body?.account_type);
    const contentType = normalizeString(body?.content_type);
    const dailyPostCount = normalizeDailyPostCount(body?.daily_post_count);
    const couponCode = normalizeCoupon(body?.coupon_code);
    const mainProblem = normalizeString(body?.main_problem);
    const mainMissing = normalizeString(body?.main_missing);
    const contactType = normalizeContactType(body?.contact_type);
    const contactValue = normalizeString(body?.contact_value);

    if (!isNonEmptyString(fullName)) {
      return NextResponse.json(
        { error: "Ad soyad boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(username) && !isNonEmptyString(accountLink)) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya hesap linki gerekli." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(accountType)) {
      return NextResponse.json(
        { error: "Hesap türü boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(contentType)) {
      return NextResponse.json(
        { error: "İçerik türü boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(mainProblem)) {
      return NextResponse.json(
        { error: "Genel sorun alanı boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(mainMissing)) {
      return NextResponse.json(
        { error: "En büyük eksik alanı boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!contactType || !ALLOWED_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        { error: "Geçerli bir iletişim türü seçiniz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(contactValue)) {
      return NextResponse.json(
        { error: "İletişim bilgisi boş bırakılamaz." },
        { status: 400 }
      );
    }

    const packagePrice = couponCode === "ANALIZ100" ? 0 : 5;

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [customerResult] = await connection.execute(
        `
        INSERT INTO customers (
          full_name,
          username,
          account_link,
          account_type,
          content_type,
          daily_post_count,
          main_problem,
          main_missing,
          contact_type,
          contact_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          fullName,
          username || null,
          accountLink || null,
          accountType,
          contentType,
          dailyPostCount,
          mainProblem,
          mainMissing,
          contactType,
          contactValue,
        ]
      );

      const insertId = (customerResult as { insertId?: number }).insertId;

      if (!insertId) {
        throw new Error("Müşteri ID alınamadı.");
      }

      await connection.execute(
        `
        INSERT INTO analysis_requests (
          customer_id,
          coupon_code,
          package_type,
          package_price,
          currency,
          status
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          insertId,
          couponCode || null,
          "analysis",
          packagePrice,
          "USD",
          "pending",
        ]
      );

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("MySQL analysis insert error:", dbError);

      return NextResponse.json(
        { error: "Analiz başvurusu kaydedilemedi." },
        { status: 400 }
      );
    } finally {
      connection.release();
    }

    const telegramMessage =
      `📥 Yeni analiz başvurusu alındı\n\n` +
      `👤 Ad Soyad: ${fullName}\n` +
      `📷 Kullanıcı Adı: ${username || "-"}\n` +
      `🔗 Hesap Linki: ${accountLink || "-"}\n` +
      `🏷️ Hesap Türü: ${accountType}\n` +
      `🎬 İçerik Türü: ${contentType}\n` +
      `📆 Günlük Paylaşım: ${dailyPostCount}\n` +
      `🎟️ Kupon: ${couponCode || "-"}\n` +
      `💵 Analiz Fiyatı: ${packagePrice} USD\n` +
      `📞 İletişim Türü: ${contactType}\n` +
      `📩 İletişim: ${contactValue}\n\n` +
      `⚠️ Genel Sorun: ${mainProblem}\n` +
      `❗ En Büyük Eksik: ${mainMissing}`;

    let telegramWarning: string | null = null;

    try {
      const telegramText = await sendTelegramMessage(telegramMessage);

      try {
        const telegramJson = JSON.parse(telegramText);

        if (!telegramJson.ok) {
          telegramWarning = "Telegram API analiz bildirimini kabul etmedi.";
          console.error("Telegram API error response:", telegramText);
        }
      } catch {
        telegramWarning = "Telegram cevabı beklenen formatta alınamadı.";
        console.error("Telegram parse error:", telegramText);
      }
    } catch (telegramError) {
      telegramWarning =
        telegramError instanceof Error
          ? `Telegram gönderim hatası: ${telegramError.message}`
          : "Telegram gönderiminde bilinmeyen hata oluştu";

      console.error(telegramWarning);
    }

    return NextResponse.json(
      {
        success: true,
        telegramWarning,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}
