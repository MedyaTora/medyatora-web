import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

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

function isFreeAnalysisCoupon(couponCode: string) {
  return couponCode === "ANALIZ100";
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
          warning: "Telegram API bildirimi kabul etmedi.",
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
        { success: false, error: "Ad soyad boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(username) && !isNonEmptyString(accountLink)) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı adı veya hesap linki gerekli." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(accountType)) {
      return NextResponse.json(
        { success: false, error: "Hesap türü boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(contentType)) {
      return NextResponse.json(
        { success: false, error: "İçerik türü boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(mainProblem)) {
      return NextResponse.json(
        { success: false, error: "Genel sorun alanı boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(mainMissing)) {
      return NextResponse.json(
        { success: false, error: "En büyük eksik alanı boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!contactType || !ALLOWED_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir iletişim türü seçiniz." },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(contactValue)) {
      return NextResponse.json(
        { success: false, error: "İletişim bilgisi boş bırakılamaz." },
        { status: 400 }
      );
    }

    const packagePrice = isFreeAnalysisCoupon(couponCode) ? 0 : 5;

    if (!hasMysqlConfig()) {
      console.warn("[MedyaTora] Analiz başvurusu alınamadı: MySQL env eksik.");

      return NextResponse.json(
        {
          success: false,
          error:
            "Geliştirme ortamında MySQL bağlantısı yok. Canlı ortamda başvuru sistemi çalışır.",
        },
        { status: 503 }
      );
    }

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    let customerId: number | null = null;
    let analysisRequestId: number | null = null;

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

      customerId = (customerResult as { insertId?: number }).insertId || null;

      if (!customerId) {
        throw new Error("Müşteri ID alınamadı.");
      }

      const [analysisResult] = await connection.execute(
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
          customerId,
          couponCode || null,
          "analysis",
          packagePrice,
          "USD",
          "pending",
        ]
      );

      analysisRequestId =
        (analysisResult as { insertId?: number }).insertId || null;

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("MySQL analysis insert error:", dbError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Analiz başvurusu kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

    const telegramMessage =
      `📥 Yeni analiz başvurusu alındı\n\n` +
      `🆔 Başvuru ID: ${analysisRequestId || "-"}\n` +
      `👤 Müşteri ID: ${customerId || "-"}\n` +
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

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Analiz başvurunuz alındı. Ekibimiz bilgilerinizi inceleyip sizinle iletişime geçecek.",
        customerId,
        analysisRequestId,
        telegramWarning: telegramResult.warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analysis request server error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}