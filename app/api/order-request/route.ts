import https from "https";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  mapDbServiceToOrderItem,
  type DbServiceRow,
  type OrderServiceItem,
} from "@/lib/services";

type CurrencyCode = "TL" | "USD" | "RUB";
type BalanceColumn = "balance_usd" | "balance_tl" | "balance_rub";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type PaymentMethod = "turkey_bank" | "support" | "balance";

type OrderItemPayload = {
  service_id: number;
  site_code: number;
  service_title?: string;
  platform?: string;
  category?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  unit_cost_price?: number;
  total_cost_price?: number;
  guarantee_label?: string;
  speed?: string;
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

type OrderRowForInsert = {
  user_id: number | null;
  batch_code: string;
  order_number: string;
  full_name: string;
  phone_number: string;
  contact_type: ContactType;
  contact_value: string;
  platform: string;
  category: string;
  service_id: number;
  site_code: number;
  service_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost_price: number;
  total_cost_price: number;
  guarantee_label: string;
  speed: string;
  currency: CurrencyCode;
  payment_method: PaymentMethod;
  target_username: string;
  target_link: string | null;
  order_note: string | null;
  status: string;
};

type BalanceUserRow = RowDataPacket & {
  id: number;
  balance_usd: string | number;
  balance_tl: string | number;
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

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  if (method === "balance") return "MedyaTora Bakiyesi";
  return "Destek ile İletişime Geçilecek";
}

function getBalanceColumn(currency: CurrencyCode): BalanceColumn {
  if (currency === "USD") return "balance_usd";
  if (currency === "RUB") return "balance_rub";
  return "balance_tl";
}

function formatMoney(value: number, currency: CurrencyCode) {
  return `${value.toFixed(2)} ${currency}`;
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

function isPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
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

function toNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function toBoolean(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function getUnitSalePrice(service: OrderServiceItem, currency: CurrencyCode) {
  if (currency === "USD") return service.salePriceUsd;
  if (currency === "RUB") return service.salePriceRub;
  return service.salePriceTl;
}

function getUnitCostPrice(service: OrderServiceItem, currency: CurrencyCode) {
  if (currency === "USD") return service.costPriceUsd;
  if (currency === "RUB") return service.costPriceRub;
  return service.costPriceTl;
}

function validateItemBasic(item: unknown): item is OrderItemPayload {
  if (!item || typeof item !== "object") return false;

  const x = item as Record<string, unknown>;

  return (
    isPositiveNumber(x.service_id) &&
    isPositiveNumber(x.site_code) &&
    isPositiveNumber(x.quantity)
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

async function getVerifiedServiceForOrder(params: {
  serviceId: number;
  siteCode: number;
}) {
  const pool = getMysqlPool();

  const [rows] = await pool.query(
    `
    SELECT
      id,
      panel_service_id,
      site_code,
      platform,
      category,
      original_name,
      clean_title,
      subtitle,
      guarantee,
      guarantee_label,
      min,
      max,
      speed,
      level,
      description,
      tl_cost_price,
      usd_cost_price,
      tl_sale_price,
      usd_sale_price,
      rub_sale_price,
      manual_title,
      manual_description,
      manual_sale_price_tl
    FROM services
    WHERE is_active = 1
      AND public_visible = 1
      AND review_status = 'approved'
      AND product_type = 'single'
      AND public_page = 'paketler'
      AND panel_service_id = ?
      AND site_code = ?
      AND tl_sale_price > 0
      AND usd_sale_price > 0
      AND rub_sale_price > 0
      AND min > 0
      AND max > 0
    LIMIT 1
    `,
    [params.serviceId, params.siteCode]
  );

  const row = (rows as any[])[0];

  if (!row) {
    return null;
  }

  const dbRow: DbServiceRow = {
    id: Number(row.id),
    panel_service_id: Number(row.panel_service_id),
    site_code: Number(row.site_code),
    platform: row.platform || "",
    category: row.category || "",
    original_name: row.original_name || "",
    clean_title: row.clean_title || "",
    subtitle: row.subtitle || "",
    guarantee: toBoolean(row.guarantee),
    guarantee_label: row.guarantee_label || "",
    min: toNumber(row.min),
    max: toNumber(row.max),
    speed: row.speed || "",
    level: row.level || "",
    description: row.description || "",
    tl_cost_price: toNumber(row.tl_cost_price),
    usd_cost_price: toNumber(row.usd_cost_price),
    tl_sale_price: toNumber(row.tl_sale_price),
    usd_sale_price: toNumber(row.usd_sale_price),
    rub_sale_price: toNumber(row.rub_sale_price),
    manual_title: row.manual_title || null,
    manual_description: row.manual_description || null,
    manual_sale_price_tl:
      row.manual_sale_price_tl === null
        ? null
        : toNumber(row.manual_sale_price_tl),
  };

  return mapDbServiceToOrderItem(dbRow);
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

    if (items.some((item) => !validateItemBasic(item))) {
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

    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || null;

    if (paymentMethod === "balance" && !currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Bakiye ile ödeme yapmak için giriş yapmalısın.",
        },
        { status: 401 }
      );
    }

    const batchCode = createBatchCode();
    const rows: OrderRowForInsert[] = [];

    for (const item of items as OrderItemPayload[]) {
      const quantity = Number(item.quantity);
      const serviceId = Number(item.service_id);
      const siteCode = Number(item.site_code);

      const verifiedService = await getVerifiedServiceForOrder({
        serviceId,
        siteCode,
      });

      if (!verifiedService) {
        return NextResponse.json(
          {
            success: false,
            error: `Ürün doğrulanamadı. Ürün kodu: ${siteCode}`,
          },
          { status: 400 }
        );
      }

      if (quantity < verifiedService.min || quantity > verifiedService.max) {
        return NextResponse.json(
          {
            success: false,
            error: `${verifiedService.siteCode} kodlu ürün için miktar ${verifiedService.min} - ${verifiedService.max} aralığında olmalıdır.`,
          },
          { status: 400 }
        );
      }

      const unitPrice = roundMoney(getUnitSalePrice(verifiedService, currency));
      const unitCostPrice = roundMoney(getUnitCostPrice(verifiedService, currency));
      const totalPrice = roundMoney((quantity / 1000) * unitPrice);
      const totalCostPrice = roundMoney((quantity / 1000) * unitCostPrice);

      rows.push({
        user_id: userId,
        batch_code: batchCode,
        order_number: createOrderNumber(),
        full_name: fullName,
        phone_number: phoneNumber,
        contact_type: contactType,
        contact_value: contactValue,
        platform: verifiedService.platform,
        category: verifiedService.category,
        service_id: verifiedService.id,
        site_code: verifiedService.siteCode,
        service_title: verifiedService.title,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        unit_cost_price: unitCostPrice,
        total_cost_price: totalCostPrice,
        guarantee_label: verifiedService.guaranteeLabel,
        speed: verifiedService.speed,
        currency,
        payment_method: paymentMethod,
        target_username: normalizeString(item.target_username),
        target_link: normalizeString(item.target_link) || null,
        order_note: normalizeString(item.order_note) || null,
        status: paymentMethod === "turkey_bank" ? "pending_payment" : "pending",
      });
    }

    const totalSaleForBalance = roundMoney(
      rows.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    );

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let balanceBefore = 0;
      let balanceAfter = 0;

      let balanceBeforeUsd = 0;
      let balanceAfterUsd = 0;

      let firstInsertedOrderId: number | null = null;

      if (paymentMethod === "balance") {
        if (!currentUser) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: "Bakiye ile ödeme yapmak için giriş yapmalısın.",
            },
            { status: 401 }
          );
        }

        const balanceUserId = currentUser.id;
        const balanceColumn = getBalanceColumn(currency);

        const [userRows] = await connection.query<BalanceUserRow[]>(
          `
          SELECT id, balance_usd, balance_tl, balance_rub
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
          `,
          [balanceUserId]
        );

        const userRow = userRows[0];

        if (!userRow) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: "Kullanıcı hesabı bulunamadı.",
            },
            { status: 401 }
          );
        }

        balanceBefore = roundMoney(Number(userRow[balanceColumn] || 0));
        balanceAfter = roundMoney(balanceBefore - totalSaleForBalance);

        balanceBeforeUsd = roundMoney(Number(userRow.balance_usd || 0));
        balanceAfterUsd =
          currency === "USD" ? balanceAfter : balanceBeforeUsd;

          if (balanceBefore < totalSaleForBalance) {
            await connection.rollback();
          
            const tlBalance = roundMoney(Number(userRow.balance_tl || 0));
            const usdBalance = roundMoney(Number(userRow.balance_usd || 0));
            const rubBalance = roundMoney(Number(userRow.balance_rub || 0));
          
            const otherBalanceHint =
              currency === "USD" && tlBalance > 0
                ? " TL bakiyeniz var; TL ile ödeme yapmak için para birimini TL seçebilirsiniz."
                : currency === "USD" && rubBalance > 0
                  ? " RUB bakiyeniz var; RUB ile ödeme yapmak için para birimini RUB seçebilirsiniz."
                  : currency === "TL" && usdBalance > 0
                    ? " USD bakiyeniz var; USD ile ödeme yapmak için para birimini USD seçebilirsiniz."
                    : currency === "TL" && rubBalance > 0
                      ? " RUB bakiyeniz var; RUB ile ödeme yapmak için para birimini RUB seçebilirsiniz."
                      : currency === "RUB" && tlBalance > 0
                        ? " TL bakiyeniz var; TL ile ödeme yapmak için para birimini TL seçebilirsiniz."
                        : currency === "RUB" && usdBalance > 0
                          ? " USD bakiyeniz var; USD ile ödeme yapmak için para birimini USD seçebilirsiniz."
                          : "";
          
            return NextResponse.json(
              {
                success: false,
                error:
                  `${currency} bakiyeniz yetersiz. ` +
                  `Sipariş tutarı: ${formatMoney(totalSaleForBalance, currency)}. ` +
                  `Mevcut bakiyeleriniz: TL ${tlBalance.toFixed(2)}, USD ${usdBalance.toFixed(
                    2
                  )}, RUB ${rubBalance.toFixed(2)}.` +
                  otherBalanceHint,
              },
              { status: 400 }
            );
          }

        await connection.execute(
          `
          UPDATE users
          SET ${balanceColumn} = ?
          WHERE id = ?
          LIMIT 1
          `,
          [balanceAfter, balanceUserId]
        );
      }

      for (const row of rows) {
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
            row.user_id,
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

        const insertedId = Number(insertResult.insertId || 0);

        if (!firstInsertedOrderId && insertedId) {
          firstInsertedOrderId = insertedId;
        }
      }

      if (paymentMethod === "balance") {
        if (!currentUser) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: "Bakiye ile ödeme yapmak için giriş yapmalısın.",
            },
            { status: 401 }
          );
        }

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
            -totalSaleForBalance,
            balanceBefore,
            balanceAfter,
            currency === "USD" ? -totalSaleForBalance : 0,
            balanceBeforeUsd,
            balanceAfterUsd,
            `MedyaTora siparis odemesi - ${batchCode} - ${currency}`,
            firstInsertedOrderId,
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
      `🆔 Kullanıcı Hesabı: ${
        currentUser ? `#${currentUser.id} | ${currentUser.email}` : "Üyeliksiz sipariş"
      }\n` +
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
            : paymentMethod === "balance"
              ? `Siparişiniz ${currency} bakiyenizden ödenerek alındı.`
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