import https from "https";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";

const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
    const contactType = normalizeString(body?.contact_type) as ContactType;
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

    if (!ALLOWED_CONTACT_TYPES.includes(contactType)) {
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

    const supabase = createAdminSupabaseClient();

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          full_name: fullName,
          username,
          account_link: accountLink,
          account_type: accountType,
          content_type: contentType,
          daily_post_count: dailyPostCount,
          main_problem: mainProblem,
          main_missing: mainMissing,
          contact_type: contactType,
          contact_value: contactValue,
        },
      ])
      .select("id")
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: customerError?.message || "Müşteri kaydı oluşturulamadı." },
        { status: 400 }
      );
    }

    const packagePrice = couponCode === "ANALIZ100" ? 0 : 5;

    const { error: analysisError } = await supabase
      .from("analysis_requests")
      .insert([
        {
          customer_id: customer.id,
          coupon_code: couponCode || null,
          package_type: "analysis",
          package_price: packagePrice,
          currency: "USD",
          status: "pending",
        },
      ]);

    if (analysisError) {
      return NextResponse.json(
        { error: analysisError.message || "Analiz başvurusu oluşturulamadı." },
        { status: 400 }
      );
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
      `💵 Paket Fiyatı: ${packagePrice} USD\n` +
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