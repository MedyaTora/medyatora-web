import https from "https";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CurrencyCode = "TL" | "USD" | "RUB";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";

type OrderItemPayload = {
  service_id: number;
  site_code: number;
  service_title: string;
  platform: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost_price: number;
  total_cost_price: number;
  guarantee_label: string;
  speed: string;
  target_username?: string;
  target_link?: string;
  order_note?: string;
};

type OrderRequestPayload = {
  full_name: string;
  phone_number: string;
  contact_type: ContactType;
  contact_value: string;
  currency: CurrencyCode;
  items: OrderItemPayload[];
};

const ALLOWED_CURRENCIES: CurrencyCode[] = ["TL", "USD", "RUB"];
const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

function createBatchCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return `MT-BATCH-${datePart}-${random}`;
}

function createOrderNumber() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return `MT-ORD-${datePart}-${random}`;
}

function isPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function validateItem(item: unknown): item is OrderItemPayload {
  if (!item || typeof item !== "object") return false;

  const x = item as Record<string, unknown>;

  return (
    isPositiveNumber(x.service_id) &&
    isPositiveNumber(x.site_code) &&
    isNonEmptyString(x.service_title) &&
    isNonEmptyString(x.platform) &&
    isNonEmptyString(x.category) &&
    isPositiveNumber(x.quantity) &&
    isPositiveNumber(x.unit_price) &&
    isPositiveNumber(x.total_price) &&
    isPositiveNumber(x.unit_cost_price) &&
    isPositiveNumber(x.total_cost_price) &&
    isNonEmptyString(x.guarantee_label) &&
    isNonEmptyString(x.speed)
  );
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Supabase environment variables eksik." },
        { status: 500 }
      );
    }

    const rawBody = await req.json();

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Geçersiz istek gövdesi." },
        { status: 400 }
      );
    }

    const body = rawBody as Partial<OrderRequestPayload>;

    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const phoneNumber =
      typeof body.phone_number === "string"
        ? normalizePhoneNumber(body.phone_number)
        : "";
    const contactType = body.contact_type;
    const contactValue =
      typeof body.contact_value === "string" ? body.contact_value.trim() : "";
    const currency = body.currency;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: "Geçerli bir ad soyad giriniz." },
        { status: 400 }
      );
    }

    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json(
        { error: "Geçerli bir telefon numarası giriniz." },
        { status: 400 }
      );
    }

    if (!contactType || !ALLOWED_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        { error: "Geçerli bir iletişim türü seçiniz." },
        { status: 400 }
      );
    }

    if (!contactValue) {
      return NextResponse.json(
        { error: "İletişim bilgisi boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!currency || !ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { error: "Geçerli bir para birimi seçiniz." },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "En az bir ürün seçmelisiniz." },
        { status: 400 }
      );
    }

    const hasInvalidItem = items.some((item) => !validateItem(item));
    if (hasInvalidItem) {
      return NextResponse.json(
        { error: "Sipariş ürünlerinden biri geçersiz." },
        { status: 400 }
      );
    }

    const safeItems = items as OrderItemPayload[];

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const batchCode = createBatchCode();

    const rows = safeItems.map((item) => ({
      batch_code: batchCode,
      order_number: createOrderNumber(),
      full_name: fullName,
      phone_number: phoneNumber,
      contact_type: contactType,
      contact_value: contactValue,
      platform: item.platform.trim(),
      category: item.category.trim(),
      service_id: Number(item.service_id),
      site_code: Number(item.site_code),
      service_title: item.service_title.trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
      unit_cost_price: Number(item.unit_cost_price),
      total_cost_price: Number(item.total_cost_price),
      guarantee_label: item.guarantee_label.trim(),
      speed: item.speed.trim(),
      currency,
      target_username: item.target_username?.trim() || null,
      target_link: item.target_link?.trim() || null,
      order_note: item.order_note?.trim() || null,
      status: "pending",
    }));

    const { data: insertedRows, error: orderError } = await supabase
      .from("order_requests")
      .insert(rows)
      .select("order_number, service_title, quantity, total_price, total_cost_price, currency");

    if (orderError) {
      return NextResponse.json(
        { error: "Sipariş kaydedilemedi." },
        { status: 400 }
      );
    }

    const lines = rows
      .map(
        (item, index) =>
          `${index + 1}. ${item.service_title}\n` +
          `   Miktar: ${item.quantity}\n` +
          `   Toplam Satış: ${item.total_price} ${currency}\n` +
          `   Hedef: ${item.target_username || "-"}`
      )
      .join("\n\n");

    const orderNumberLines = (insertedRows || [])
      .map((row) => `• ${row.order_number}`)
      .join("\n");

    const totalSale = rows.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const totalCost = rows.reduce((sum, item) => sum + Number(item.total_cost_price || 0), 0);

    const telegramMessage =
      `🛒 Yeni sipariş alındı\n\n` +
      `🧾 Batch Kodu: ${batchCode}\n` +
      `👤 Ad Soyad: ${fullName}\n` +
      `📞 Telefon: ${phoneNumber}\n` +
      `📩 İletişim Türü: ${contactType}\n` +
      `📨 İletişim Bilgisi: ${contactValue}\n` +
      `💱 Para Birimi: ${currency}\n` +
      `📦 Ürün Sayısı: ${rows.length}\n` +
      `💰 Toplam Alış: ${totalCost} ${currency}\n` +
      `🏷️ Toplam Satış: ${totalSale} ${currency}\n\n` +
      `🔢 Sipariş Numaraları:\n${orderNumberLines}\n\n` +
      `${lines}`;

    let telegramWarning: string | null = null;

    try {
      const telegramText = await sendTelegramMessage(telegramMessage);

      try {
        const telegramJson = JSON.parse(telegramText);
        if (!telegramJson.ok) {
          telegramWarning = "Telegram API sipariş bildirimini kabul etmedi.";
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
        batchCode,
        orderNumbers: insertedRows?.map((row) => row.order_number) || [],
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