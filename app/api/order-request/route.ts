import https from "https";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

type CurrencyCode = "TL" | "USD" | "RUB";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type PaymentMethod = "turkey_bank" | "support" | "balance";

type BalanceColumn = "balance_tl" | "balance_usd" | "balance_rub";

type OrderItemPayload = {
  cartId?: string;
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
  target_username: string;
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

type BalanceUserRow = RowDataPacket & {
  id: number;
  email: string;
  balance_tl: string | number;
  balance_usd: string | number;
  balance_rub: string | number;
};

const ALLOWED_CURRENCIES: CurrencyCode[] = ["TL", "USD", "RUB"];

const ALLOWED_CONTACT_TYPES: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const ALLOWED_PAYMENT_METHODS: PaymentMethod[] = [
  "turkey_bank",
  "support",
  "balance",
];

const MAX_ITEMS_PER_ORDER = 50;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10_000_000;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneNumber(value: unknown) {
  return String(value || "")
    .replace(/[^\d+]/g, "")
    .trim()
    .slice(0, 40);
}

function normalizeCurrency(value: unknown): CurrencyCode | null {
  const currency = normalizeString(value).toUpperCase();

  if (currency === "TL") return "TL";
  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return null;
}

function normalizeContactType(value: unknown): ContactType | null {
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

  return null;
}

function normalizePaymentMethod(value: unknown): PaymentMethod | null {
  const method = normalizeString(value);

  if (method === "turkey_bank") return "turkey_bank";
  if (method === "support") return "support";
  if (method === "balance") return "balance";

  return null;
}

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);

  if (currency === "TL") {
    return `${safeValue.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TL`;
  }

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("tr-TR");
}

function getBalanceColumn(currency: CurrencyCode): BalanceColumn {
  if (currency === "USD") return "balance_usd";
  if (currency === "RUB") return "balance_rub";
  return "balance_tl";
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  if (method === "balance") return "MedyaTora Bakiyesi";
  return "Destek ile Ödeme";
}

function getInitialOrderStatus(method: PaymentMethod) {
  if (method === "balance") return "pending";
  return "pending_payment";
}

function createBatchCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;

  return `MT-BATCH-${datePart}-${random}`;
}

function createOrderNumber() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;

  return `MT-ORD-${datePart}-${random}`;
}

function sanitizeItem(item: unknown): OrderItemPayload | null {
  if (!item || typeof item !== "object") return null;

  const raw = item as Partial<OrderItemPayload>;

  const serviceId = Number(raw.service_id || 0);
  const siteCode = Number(raw.site_code || 0);
  const quantity = Number(raw.quantity || 0);

  const unitPrice = roundMoney(Number(raw.unit_price || 0));
  const totalPrice = roundMoney(Number(raw.total_price || 0));
  const unitCostPrice = roundMoney(Number(raw.unit_cost_price || 0));
  const totalCostPrice = roundMoney(Number(raw.total_cost_price || 0));

  const serviceTitle = normalizeString(raw.service_title).slice(0, 500);
  const platform = normalizeString(raw.platform).toLowerCase().slice(0, 80);
  const category = normalizeString(raw.category).toLowerCase().slice(0, 80);
  const guaranteeLabel = normalizeString(raw.guarantee_label).slice(0, 120);
  const speed = normalizeString(raw.speed).slice(0, 120);
  const targetUsername = normalizeString(raw.target_username).slice(0, 255);
  const targetLink = normalizeString(raw.target_link).slice(0, 500);
  const orderNote = normalizeString(raw.order_note).slice(0, 1000);

  if (!Number.isFinite(serviceId) || serviceId <= 0) return null;
  if (!Number.isFinite(siteCode) || siteCode <= 0) return null;
  if (!serviceTitle) return null;
  if (!platform) return null;
  if (!category) return null;

  if (
    !Number.isFinite(quantity) ||
    quantity < MIN_QUANTITY ||
    quantity > MAX_QUANTITY
  ) {
    return null;
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return null;

  if (!targetUsername || targetUsername.length < 2) return null;

  return {
    service_id: serviceId,
    site_code: siteCode,
    service_title: serviceTitle,
    platform,
    category,
    quantity,
    unit_price: unitPrice,
    total_price: totalPrice,
    unit_cost_price: Number.isFinite(unitCostPrice) ? unitCostPrice : 0,
    total_cost_price: Number.isFinite(totalCostPrice) ? totalCostPrice : 0,
    guarantee_label: guaranteeLabel || "-",
    speed: speed || "-",
    target_username: targetUsername,
    target_link: targetLink || "",
    order_note: orderNote || "",
  };
}

function validateCalculatedTotal(item: OrderItemPayload) {
  const expectedTotal = roundMoney((item.quantity / 1000) * item.unit_price);
  const difference = Math.abs(expectedTotal - item.total_price);

  return difference <= 1;
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

      req.on("error", (err) => reject(err));
      req.write(body);
      req.end();
    });

    const json = JSON.parse(responseText);

    return {
      ok: Boolean(json.ok),
      warning: json.ok ? null : "Telegram API bildirimi kabul etmedi.",
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
    if (!hasMysqlConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: "MySQL bağlantısı bulunamadı.",
        },
        { status: 503 }
      );
    }

    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz istek gövdesi.",
        },
        { status: 400 }
      );
    }

    const body = rawBody as Partial<OrderRequestPayload>;

    const fullName = normalizeString(body.full_name).slice(0, 191);
    const phoneNumber = normalizePhoneNumber(body.phone_number);
    const contactType = normalizeContactType(body.contact_type);
    const contactValue = normalizeString(body.contact_value).slice(0, 191);
    const currency = normalizeCurrency(body.currency);
    const paymentMethod = normalizePaymentMethod(body.payment_method);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir ad soyad giriniz.",
        },
        { status: 400 }
      );
    }

    if (!phoneNumber || phoneNumber.length < 7) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir telefon numarası giriniz.",
        },
        { status: 400 }
      );
    }

    if (!contactType || !ALLOWED_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir iletişim türü seçiniz.",
        },
        { status: 400 }
      );
    }

    if (!contactValue) {
      return NextResponse.json(
        {
          success: false,
          error: "İletişim bilgisi boş bırakılamaz.",
        },
        { status: 400 }
      );
    }

    if (!currency || !ALLOWED_CURRENCIES.includes(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir para birimi seçiniz.",
        },
        { status: 400 }
      );
    }

    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir ödeme yöntemi seçiniz.",
        },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sipariş oluşturmak için en az 1 hizmet seçmelisiniz.",
        },
        { status: 400 }
      );
    }

    if (rawItems.length > MAX_ITEMS_PER_ORDER) {
      return NextResponse.json(
        {
          success: false,
          error: `Tek seferde en fazla ${MAX_ITEMS_PER_ORDER} hizmet gönderilebilir.`,
        },
        { status: 400 }
      );
    }

    const items = rawItems.map(sanitizeItem);

    if (items.some((item) => item === null)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sepette geçersiz hizmet bilgisi var. Lütfen sepeti kontrol edip tekrar deneyin.",
        },
        { status: 400 }
      );
    }

    const orderItems = items as OrderItemPayload[];

    const invalidTotalItem = orderItems.find(
      (item) => !validateCalculatedTotal(item)
    );

    if (invalidTotalItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sipariş tutarı doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.",
        },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    if (paymentMethod === "balance" && !currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Bakiye ile ödeme yapmak için giriş yapmalısınız.",
        },
        { status: 401 }
      );
    }

    const totalPrice = roundMoney(
      orderItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    );

    const totalCostPrice = roundMoney(
      orderItems.reduce(
        (sum, item) => sum + Number(item.total_cost_price || 0),
        0
      )
    );

    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sipariş toplam tutarı geçersiz.",
        },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    const batchCode = createBatchCode();
    const status = getInitialOrderStatus(paymentMethod);
    const orderNumbers: string[] = [];
    const insertedOrderIds: number[] = [];

    let balanceBefore = 0;
    let balanceAfter = 0;

    try {
      await connection.beginTransaction();

      if (paymentMethod === "balance") {
        if (!currentUser?.id) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: "Bakiye ile ödeme yapmak için giriş yapmalısınız.",
            },
            { status: 401 }
          );
        }

        const balanceColumn = getBalanceColumn(currency);

        const [userRows] = await connection.query<BalanceUserRow[]>(
          `
          SELECT
            id,
            email,
            balance_tl,
            balance_usd,
            balance_rub
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
          `,
          [currentUser.id]
        );

        const lockedUser = userRows[0];

        if (!lockedUser) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: "Kullanıcı hesabı bulunamadı.",
            },
            { status: 401 }
          );
        }

        balanceBefore = roundMoney(Number(lockedUser[balanceColumn] || 0));

        if (balanceBefore < totalPrice) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: `${currency} bakiyeniz yetersiz. Sipariş tutarı: ${formatMoney(
                totalPrice,
                currency
              )}. Mevcut bakiyeniz: ${formatMoney(balanceBefore, currency)}.`,
            },
            { status: 400 }
          );
        }

        balanceAfter = roundMoney(balanceBefore - totalPrice);

        await connection.execute(
          `
          UPDATE users
          SET ${balanceColumn} = ?
          WHERE id = ?
          LIMIT 1
          `,
          [balanceAfter, currentUser.id]
        );
      }

      for (const item of orderItems) {
        const orderNumber = createOrderNumber();

        const [insertResult] = await connection.execute<ResultSetHeader>(
          `
          INSERT INTO order_requests (
            user_id,
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            userId,
            batchCode,
            orderNumber,
            fullName,
            phoneNumber,
            contactType,
            contactValue,
            item.platform,
            item.category,
            Number(item.service_id),
            Number(item.site_code),
            item.service_title,
            Number(item.quantity),
            roundMoney(Number(item.unit_price)),
            roundMoney(Number(item.total_price)),
            roundMoney(Number(item.unit_cost_price || 0)),
            roundMoney(Number(item.total_cost_price || 0)),
            item.guarantee_label || "-",
            item.speed || "-",
            currency,
            paymentMethod,
            item.target_username,
            item.target_link || null,
            item.order_note || null,
            status,
          ]
        );

        const insertedOrderId = Number(insertResult.insertId || 0);

        if (insertedOrderId) {
          insertedOrderIds.push(insertedOrderId);
        }

        orderNumbers.push(orderNumber);
      }

      if (paymentMethod === "balance" && currentUser?.id) {
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
            description,
            related_order_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            currentUser.id,
            "order_payment",
            currency,
            -totalPrice,
            balanceBefore,
            balanceAfter,
            currency === "USD" ? -totalPrice : 0,
            Number(currentUser.balance_usd || 0),
            currency === "USD"
              ? balanceAfter
              : Number(currentUser.balance_usd || 0),
            `MedyaTora sipariş ödemesi - ${batchCode} - ${orderNumbers.join(
              ", "
            )} - ${currency}`,
            insertedOrderIds[0] || null,
          ]
        );
      }

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("ORDER_REQUEST_DB_ERROR", dbError);

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

    const profit = roundMoney(totalPrice - totalCostPrice);

    const itemSummary = orderItems
      .map((item, index) => {
        return (
          `${index + 1}) ${item.service_title}\n` +
          `   Ürün Kodu: ${item.site_code}\n` +
          `   Panel Servis ID: ${item.service_id}\n` +
          `   Platform/Kategori: ${item.platform} / ${item.category}\n` +
          `   Miktar: ${formatNumber(item.quantity)}\n` +
          `   Hedef: ${item.target_username}\n` +
          `   Link: ${item.target_link || "-"}\n` +
          `   Tutar: ${formatMoney(item.total_price, currency)}\n` +
          `   Not: ${item.order_note || "-"}`
        );
      })
      .join("\n\n");

    const telegramMessage =
      `📦 Yeni SMMTora siparişi alındı\n\n` +
      `🧾 Batch Kodu: ${batchCode}\n` +
      `🔢 Sipariş Numaraları:\n${orderNumbers.join("\n")}\n\n` +
      `👤 Ad Soyad: ${fullName}\n` +
      `🆔 Kullanıcı Hesabı: ${
        currentUser
          ? `#${currentUser.id} | ${currentUser.email}`
          : "Üyeliksiz sipariş"
      }\n` +
      `📞 Telefon: ${phoneNumber}\n` +
      `📩 İletişim Türü: ${contactType}\n` +
      `📨 İletişim Bilgisi: ${contactValue}\n` +
      `💳 Ödeme Yöntemi: ${getPaymentMethodLabel(paymentMethod)}\n` +
      `📌 Sipariş Durumu: ${status}\n` +
      `💱 Para Birimi: ${currency}\n\n` +
      `🧮 Hizmet Sayısı: ${orderItems.length}\n` +
      `🏷️ Toplam Satış: ${formatMoney(totalPrice, currency)}\n` +
      `💰 Toplam Alış: ${formatMoney(totalCostPrice, currency)}\n` +
      `📈 Tahmini Kâr: ${formatMoney(profit, currency)}\n\n` +
      `🧩 Sipariş Detayları:\n${itemSummary}`;

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        ok: true,
        message:
          paymentMethod === "balance"
            ? "Siparişiniz bakiyenizden ödenerek oluşturuldu."
            : paymentMethod === "turkey_bank"
              ? "Siparişiniz oluşturuldu. Ödeme kontrolünden sonra işleme alınacaktır."
              : "Siparişiniz oluşturuldu. Ödeme ve işlem adımları için ekibimiz sizinle iletişime geçecektir.",
        batchCode,
        orderNumbers,
        orderNumber: orderNumbers[0] || null,
        orderIds: insertedOrderIds,
        totalPrice,
        totalCostPrice,
        currency,
        paymentMethod,
        status,
        telegramWarning: telegramResult.warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ORDER_REQUEST_SERVER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}