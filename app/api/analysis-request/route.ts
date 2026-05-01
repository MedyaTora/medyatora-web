import https from "https";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import { getCurrentUser } from "@/lib/auth/current-user";

type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type CurrencyCode = "TL" | "USD" | "RUB";

type CurrentUserDbRow = RowDataPacket & {
  id: number;
  email: string;
  email_verified: number | boolean;
  free_analysis_used: number | boolean;
};

const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const ALLOWED_CURRENCIES: CurrencyCode[] = ["TL", "USD", "RUB"];

const ANALYSIS_PRICES: Record<CurrencyCode, number> = {
  TL: 1000,
  USD: 15,
  RUB: 1800,
};

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

function normalizeCurrency(value: unknown): CurrencyCode {
  const raw = normalizeString(value).toUpperCase();

  if (raw === "USD") return "USD";
  if (raw === "RUB") return "RUB";
  return "TL";
}

function boolValue(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function formatMoney(value: number, currency: CurrencyCode) {
  if (currency === "TL" || currency === "RUB") {
    return `${Math.round(value).toLocaleString("tr-TR")} ${currency}`;
  }

  return `${value.toFixed(2)} ${currency}`;
}

function getPaymentMethodLabel({
  paymentMethod,
  isFree,
}: {
  paymentMethod: string;
  isFree: boolean;
}) {
  if (isFree || paymentMethod === "free_analysis_right") {
    return "Ücretsiz analiz hakkı";
  }

  if (paymentMethod === "turkey_bank") return "Havale / EFT";
  if (paymentMethod === "support") return "Destek ile ödeme";

  return "Belirtilmedi";
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

    const dailyPostCountRaw = normalizeString(body?.daily_post_count);
    const dailyPostCount = 0;

    const mainProblem = normalizeString(body?.main_problem);
    const mainMissing = normalizeString(body?.main_missing);
    const contactType = normalizeContactType(body?.contact_type);
    const contactValue = normalizeString(body?.contact_value);

    const currency = normalizeCurrency(body?.analysis_currency ?? body?.currency);
    const analysisPlatform = normalizeString(body?.analysis_platform);
    const paymentMethod = normalizeString(body?.payment_method);

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

    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir para birimi seçiniz." },
        { status: 400 }
      );
    }

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

    const currentUser = await getCurrentUser();

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    let customerId: number | null = null;
    let analysisRequestId: number | null = null;

    let verifiedFreeRight = false;
    let packagePrice = ANALYSIS_PRICES[currency];

    try {
      await connection.beginTransaction();

      let lockedUser: CurrentUserDbRow | null = null;

      if (currentUser?.id) {
        const [userRows] = await connection.query<CurrentUserDbRow[]>(
          `
          SELECT id, email, email_verified, free_analysis_used
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
          `,
          [currentUser.id]
        );

        lockedUser = userRows[0] || null;
      }

      verifiedFreeRight = Boolean(
        lockedUser &&
          boolValue(lockedUser.email_verified) &&
          !boolValue(lockedUser.free_analysis_used)
      );

      packagePrice = verifiedFreeRight ? 0 : ANALYSIS_PRICES[currency];

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
          user_id,
          customer_id,
          coupon_code,
          package_type,
          analysis_platform,
          package_price,
          currency,
          payment_method,
          status,
          is_free_analysis,
          analysis_price_usd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          currentUser?.id || null,
          customerId,
          null,
          "professional_analysis",
          analysisPlatform || accountType || null,
          packagePrice,
          currency,
          paymentMethod || null,
          "pending",
          verifiedFreeRight ? 1 : 0,
          currency === "USD" ? packagePrice : 15,
        ]
      );

      analysisRequestId =
        (analysisResult as { insertId?: number }).insertId || null;

      if (verifiedFreeRight && currentUser?.id) {
        await connection.execute(
          `
          UPDATE users
          SET free_analysis_used = 1
          WHERE id = ?
          LIMIT 1
          `,
          [currentUser.id]
        );
      }

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

    const paymentMethodLabel = getPaymentMethodLabel({
      paymentMethod,
      isFree: verifiedFreeRight,
    });

    const telegramMessage =
      `📥 Yeni analiz başvurusu alındı\n\n` +
      `🆔 Başvuru ID: ${analysisRequestId || "-"}\n` +
      `👤 Müşteri ID: ${customerId || "-"}\n` +
      `🧑‍💻 Kullanıcı Hesabı: ${
        currentUser ? `#${currentUser.id} | ${currentUser.email}` : "Üyeliksiz başvuru"
      }\n` +
      `📱 Analiz Platformu: ${analysisPlatform || accountType || "-"}\n` +
      `🎁 Ücretsiz Analiz: ${verifiedFreeRight ? "Evet" : "Hayır"}\n` +
      `💳 Ödeme Yöntemi: ${paymentMethodLabel}\n` +
      `💵 Analiz Fiyatı: ${formatMoney(packagePrice, currency)}\n` +
      `👤 Ad Soyad: ${fullName}\n` +
      `📷 Kullanıcı Adı: ${username || "-"}\n` +
      `🔗 Hesap Linki: ${accountLink || "-"}\n` +
      `🏷️ Hesap Türü: ${accountType}\n` +
      `🎬 İçerik Türü: ${contentType}\n` +
      `📆 Paylaşım Sıklığı: ${dailyPostCountRaw || "-"}\n` +
      `📞 İletişim Türü: ${contactType}\n` +
      `📩 İletişim: ${contactValue}\n\n` +
      `⚠️ Genel Sorun:\n${mainProblem}\n\n` +
      `❗ En Büyük Eksik / Beklenen Cevap:\n${mainMissing}`;

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        message: verifiedFreeRight
          ? "Analiz başvurunuz oluşturuldu. 24 saat içerisinde ekibimiz sizinle iletişime geçecektir."
          : `Analiz başvurunuz oluşturuldu. Analiz ücreti ${formatMoney(
              packagePrice,
              currency
            )}. 24 saat içerisinde ekibimiz sizinle iletişime geçecektir.`,
        customerId,
        analysisRequestId,
        isFreeAnalysis: verifiedFreeRight,
        freeAnalysisUsed: verifiedFreeRight,
        packagePrice,
        currency,
        paymentMethod: paymentMethodLabel,
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