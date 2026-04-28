import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

type CurrencyCode = "TL" | "USD" | "RUB";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type PaymentMethod = "turkey_bank" | "support";

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
  payment_method: PaymentMethod;
  items: OrderItemPayload[];
};

const ALLOWED_CURRENCIES: CurrencyCode[] = ["TL", "USD", "RUB"];

const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const ALLOWED_PAYMENT_METHODS: PaymentMethod[] = ["turkey_bank", "support"];

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  return "Destek ile İletişime Geçilecek";
}

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
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isZeroOrPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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
    isZeroOrPositiveNumber(x.unit_price) &&
    isZeroOrPositiveNumber(x.total_price) &&
    isZeroOrPositiveNumber(x.unit_cost_price) &&
    isZeroOrPositiveNumber(x.total_cost_price) &&
    isNonEmptyString(x.guarantee_label) &&
    isNonEmptyString(x.speed)
  );
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("tr-TR") : String(value);
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
          warning: "Telegram API sipariş bildirimini kabul etmedi.",
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
    const rawBody = await req.json();

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Geçersiz istek gövdesi." },
        { status: 400 }
      );
    }

    const body = rawBody as Partial<OrderRequestPayload>;

    const fullName = normalizeString(body.full_name);

    const phoneNumber =
      typeof body.phone_number === "string"
        ? normalizePhoneNumber(body.phone_number)
        : "";

    const contactType = body.contact_type;

    const contactValue = normalizeString(body.contact_value);

    const currency = body.currency;
    const paymentMethod = body.payment_method;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir ad soyad giriniz." },
        { status: 400 }
      );
    }

    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir telefon numarası giriniz." },
        { status: 400 }
      );
    }

    if (!contactType || !ALLOWED_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir iletişim türü seçiniz." },
        { status: 400 }
      );
    }

    if (!contactValue) {
      return NextResponse.json(
        { success: false, error: "İletişim bilgisi boş bırakılamaz." },
        { status: 400 }
      );
    }

    if (!currency || !ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir para birimi seçiniz." },
        { status: 400 }
      );
    }

    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir ödeme yöntemi seçiniz." },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { success: false, error: "En az bir hizmet seçmelisiniz." },
        { status: 400 }
      );
    }

    const hasInvalidItem = items.some((item) => !validateItem(item));

    if (hasInvalidItem) {
      return NextResponse.json(
        { success: false, error: "Sipariş hizmetlerinden biri geçersiz." },
        { status: 400 }
      );
    }

    if (!hasMysqlConfig()) {
      console.warn("[MedyaTora] Sipariş alınamadı: MySQL env eksik.");

      return NextResponse.json(
        {
          success: false,
          error:
            "Geliştirme ortamında MySQL bağlantısı yok. Canlı ortamda sipariş sistemi çalışır.",
        },
        { status: 503 }
      );
    }

    const safeItems = items as OrderItemPayload[];
    const batchCode = createBatchCode();

    const rows = safeItems.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = roundMoney(Number(item.unit_price));
      const totalPrice = roundMoney(Number(item.total_price));
      const unitCostPrice = roundMoney(Number(item.unit_cost_price));
      const totalCostPrice = roundMoney(Number(item.total_cost_price));

      return {
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
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        unit_cost_price: unitCostPrice,
        total_cost_price: totalCostPrice,
        guarantee_label: item.guarantee_label.trim(),
        speed: item.speed.trim(),
        currency,
        payment_method: paymentMethod,
        target_username: item.target_username?.trim() || null,
        target_link: item.target_link?.trim() || null,
        order_note: item.order_note?.trim() || null,
        status: paymentMethod === "turkey_bank" ? "pending_payment" : "pending",
      };
    });

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const row of rows) {
        await connection.execute(
          `
          INSERT INTO order_requests (
            batch_code,
            order_number,
            full_name,
            phone_number,
            contact_type,
            contact_value,
            platform,
            category,
            service_id,
            site_code,
            service_title,
            quantity,
            unit_price,
            total_price,
            unit_cost_price,
            total_cost_price,
            guarantee_label,
            speed,
            currency,
            payment_method,
            target_username,
            target_link,
            order_note,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            row.batch_code,
            row.order_number,
            row.full_name,
            row.phone_number,
            row.contact_type,
            row.contact_value,
            row.platform,
            row.category,
            row.service_id,
            row.site_code,
            row.service_title,
            row.quantity,
            row.unit_price,
            row.total_price,
            row.unit_cost_price,
            row.total_cost_price,
            row.guarantee_label,
            row.speed,
            row.currency,
            row.payment_method,
            row.target_username,
            row.target_link,
            row.order_note,
            row.status,
          ]
        );
      }

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("MySQL order insert error:", dbError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Sipariş kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

    const lines = rows
      .map(
        (item, index) =>
          `${index + 1}. ${item.service_title}\n` +
          `   Panel Servis ID: ${item.service_id}\n` +
          `   Müşteri Ürün Kodu: ${item.site_code}\n` +
          `   Platform: ${item.platform}\n` +
          `   Kategori: ${item.category}\n` +
          `   Garanti: ${item.guarantee_label}\n` +
          `   Hız: ${item.speed}\n` +
          `   Miktar: ${formatNumber(item.quantity)}\n` +
          `   Birim Satış: ${item.unit_price} ${currency} / 1000\n` +
          `   Toplam Satış: ${item.total_price} ${currency}\n` +
          `   Toplam Alış: ${item.total_cost_price} ${currency}\n` +
          `   Hedef Kullanıcı: ${item.target_username || "-"}\n` +
          `   Hedef Link: ${item.target_link || "-"}\n` +
          `   Not: ${item.order_note || "-"}`
      )
      .join("\n\n");

    const orderNumberLines = rows
      .map(
        (row) =>
          `• ${row.order_number} | Panel ID: ${row.service_id} | Ürün Kodu: ${row.site_code}`
      )
      .join("\n");

    const totalSale = roundMoney(
      rows.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    );

    const totalCost = roundMoney(
      rows.reduce((sum, item) => sum + Number(item.total_cost_price || 0), 0)
    );

    const totalProfit = roundMoney(totalSale - totalCost);

    const telegramMessage =
      `🛒 Yeni sipariş alındı\n\n` +
      `🧾 Batch Kodu: ${batchCode}\n` +
      `👤 Ad Soyad: ${fullName}\n` +
      `📞 Telefon: ${phoneNumber}\n` +
      `📩 İletişim Türü: ${contactType}\n` +
      `📨 İletişim Bilgisi: ${contactValue}\n` +
      `💱 Para Birimi: ${currency}\n` +
      `💳 Ödeme Yöntemi: ${getPaymentMethodLabel(paymentMethod)}\n` +
      `📌 Sipariş Durumu: ${rows[0]?.status || "pending"}\n` +
      `📦 Hizmet Sayısı: ${rows.length}\n` +
      `💰 Toplam Alış: ${totalCost} ${currency}\n` +
      `🏷️ Toplam Satış: ${totalSale} ${currency}\n` +
      `📈 Tahmini Kâr: ${totalProfit} ${currency}\n\n` +
      `🔢 Sipariş Numaraları:\n${orderNumberLines}\n\n` +
      `📌 Sipariş Detayları:\n\n${lines}`;

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          paymentMethod === "turkey_bank"
            ? "Siparişiniz alındı. Ödeme kontrolünden sonra işleme alınacaktır."
            : "Siparişiniz alındı. Ekibimiz sizinle iletişime geçecektir.",
        batchCode,
        orderNumbers: rows.map((row) => row.order_number),
        telegramWarning: telegramResult.warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order request server error:", error);

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