import https from "https";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

type CurrencyCode = "TL";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type PaymentMethod = "turkey_bank" | "support" | "balance";
type BalanceColumn = "balance_tl";

type PackageType =
  | "ekonomik"
  | "global"
  | "turk"
  | "garantili"
  | "hizli";

type PackageOrderPayload = {
  platform: string;
  category: string;
  package_type: PackageType;
  quantity: number;
  target_username: string;
  target_link?: string;
  order_note?: string;

  full_name: string;
  phone_number: string;
  contact_type: ContactType;
  contact_value: string;
  payment_method: PaymentMethod;
};

type ServiceRow = RowDataPacket & {
  panel_service_id: number;
  site_code: number;
  platform: string;
  category: string;
  original_name: string;
  clean_title: string;
  subtitle: string;
  guarantee_label: string;
  guarantee: number;
  min: number;
  max: number;
  speed: string;
  level: string;
  tl_cost_price: string | number;
};

type BalanceUserRow = RowDataPacket & {
  id: number;
  balance_tl: string | number;
  balance_usd: string | number;
  balance_rub: string | number;
};

const MIN_QUANTITY = 100;
const MAX_DAILY_QUANTITY = 5_000_000;

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

const PACKAGE_TYPES: PackageType[] = [
  "ekonomik",
  "global",
  "turk",
  "garantili",
  "hizli",
];

const PACKAGE_PRICE_MATRIX: Record<
  string,
  Record<string, Record<PackageType, number>>
> = {
  instagram: {
    takipci: {
      ekonomik: 119,
      global: 149,
      turk: 249,
      garantili: 249,
      hizli: 299,
    },
    begeni: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
    reels_izlenme: {
      ekonomik: 29,
      global: 39,
      turk: 59,
      garantili: 59,
      hizli: 79,
    },
    reels_begeni: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
    reels_yorum: {
      ekonomik: 199,
      global: 249,
      turk: 399,
      garantili: 399,
      hizli: 449,
    },
    yorum: {
      ekonomik: 199,
      global: 249,
      turk: 399,
      garantili: 399,
      hizli: 449,
    },
    kaydetme: {
      ekonomik: 69,
      global: 89,
      turk: 139,
      garantili: 139,
      hizli: 169,
    },
    story_izlenme: {
      ekonomik: 39,
      global: 49,
      turk: 79,
      garantili: 79,
      hizli: 99,
    },
    profil_ziyareti: {
      ekonomik: 49,
      global: 69,
      turk: 99,
      garantili: 99,
      hizli: 129,
    },
  },

  tiktok: {
    takipci: {
      ekonomik: 109,
      global: 139,
      turk: 229,
      garantili: 229,
      hizli: 279,
    },
    begeni: {
      ekonomik: 49,
      global: 69,
      turk: 109,
      garantili: 109,
      hizli: 139,
    },
    izlenme: {
      ekonomik: 19,
      global: 29,
      turk: 49,
      garantili: 49,
      hizli: 69,
    },
    yorum: {
      ekonomik: 179,
      global: 229,
      turk: 379,
      garantili: 379,
      hizli: 429,
    },
    kaydetme: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
    paylasim: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
    favori: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
  },

  youtube: {
    abone: {
      ekonomik: 299,
      global: 399,
      turk: 599,
      garantili: 599,
      hizli: 699,
    },
    izlenme: {
      ekonomik: 69,
      global: 89,
      turk: 149,
      garantili: 149,
      hizli: 179,
    },
    shorts_izlenme: {
      ekonomik: 39,
      global: 59,
      turk: 89,
      garantili: 89,
      hizli: 119,
    },
    begeni: {
      ekonomik: 89,
      global: 119,
      turk: 179,
      garantili: 179,
      hizli: 219,
    },
    yorum: {
      ekonomik: 249,
      global: 329,
      turk: 499,
      garantili: 499,
      hizli: 599,
    },
    canli_yayin: {
      ekonomik: 99,
      global: 129,
      turk: 199,
      garantili: 199,
      hizli: 249,
    },
  },

  x: {
    takipci: {
      ekonomik: 149,
      global: 199,
      turk: 299,
      garantili: 299,
      hizli: 349,
    },
    begeni: {
      ekonomik: 69,
      global: 89,
      turk: 139,
      garantili: 139,
      hizli: 169,
    },
    izlenme: {
      ekonomik: 29,
      global: 39,
      turk: 69,
      garantili: 69,
      hizli: 89,
    },
    retweet: {
      ekonomik: 89,
      global: 119,
      turk: 179,
      garantili: 179,
      hizli: 219,
    },
    yorum: {
      ekonomik: 199,
      global: 249,
      turk: 399,
      garantili: 399,
      hizli: 449,
    },
    bookmark: {
      ekonomik: 69,
      global: 89,
      turk: 139,
      garantili: 139,
      hizli: 169,
    },
  },

  telegram: {
    uye: {
      ekonomik: 129,
      global: 169,
      turk: 249,
      garantili: 249,
      hizli: 299,
    },
    izlenme: {
      ekonomik: 19,
      global: 29,
      turk: 49,
      garantili: 49,
      hizli: 69,
    },
    reaksiyon: {
      ekonomik: 49,
      global: 69,
      turk: 99,
      garantili: 99,
      hizli: 129,
    },
    paylasim: {
      ekonomik: 59,
      global: 79,
      turk: 119,
      garantili: 119,
      hizli: 149,
    },
    oylama: {
      ekonomik: 79,
      global: 99,
      turk: 149,
      garantili: 149,
      hizli: 179,
    },
  },
};

function getPackagePricePer1000(
  platform: string,
  category: string,
  packageType: PackageType
) {
  const platformPrices = PACKAGE_PRICE_MATRIX[platform];
  const categoryPrices = platformPrices?.[category];

  if (categoryPrices?.[packageType]) {
    return categoryPrices[packageType];
  }

  const firstCategoryKey = Object.keys(platformPrices || {})[0];
  const fallbackPrice = platformPrices?.[firstCategoryKey]?.[packageType];

  return fallbackPrice || 149;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} TL`;
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("tr-TR") : String(value);
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  if (method === "balance") return "MedyaTora Bakiyesi";
  return "Destek ile Ödeme";
}

function getPackageTypeLabel(type: PackageType) {
  const map: Record<PackageType, string> = {
    ekonomik: "Ekonomik",
    global: "Global",
    turk: "Türk Kitle",
    garantili: "Garantili / Düşmeyen",
    hizli: "Hızlı Teslimat",
  };

  return map[type] || type;
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

function buildPackageSearchCondition(packageType: PackageType) {
  if (packageType === "turk") {
    return `
      AND (
        LOWER(original_name) LIKE '%turk%'
        OR LOWER(original_name) LIKE '%türk%'
        OR LOWER(original_name) LIKE '%turkey%'
        OR LOWER(original_name) LIKE '%tr%'
        OR LOWER(clean_title) LIKE '%turk%'
        OR LOWER(clean_title) LIKE '%türk%'
        OR LOWER(clean_title) LIKE '%tr%'
      )
    `;
  }

  if (packageType === "garantili") {
    return `
      AND (
        guarantee = 1
        OR LOWER(original_name) LIKE '%guarantee%'
        OR LOWER(original_name) LIKE '%refill%'
        OR LOWER(original_name) LIKE '%non drop%'
        OR LOWER(original_name) LIKE '%nodrop%'
        OR LOWER(original_name) LIKE '%düşmeyen%'
        OR LOWER(original_name) LIKE '%dusmeyen%'
        OR LOWER(clean_title) LIKE '%garantili%'
      )
    `;
  }

  if (packageType === "hizli") {
    return `
      AND (
        LOWER(original_name) LIKE '%fast%'
        OR LOWER(original_name) LIKE '%instant%'
        OR LOWER(original_name) LIKE '%quick%'
        OR LOWER(original_name) LIKE '%hızlı%'
        OR LOWER(original_name) LIKE '%hizli%'
        OR LOWER(speed) LIKE '%hızlı%'
        OR LOWER(speed) LIKE '%hizli%'
        OR LOWER(speed) LIKE '%fast%'
      )
    `;
  }

  if (packageType === "global") {
    return `
      AND (
        LOWER(original_name) LIKE '%global%'
        OR LOWER(original_name) LIKE '%world%'
        OR LOWER(original_name) LIKE '%worldwide%'
        OR LOWER(original_name) LIKE '%foreign%'
        OR LOWER(original_name) LIKE '%mixed%'
        OR LOWER(clean_title) LIKE '%global%'
        OR LOWER(clean_title) LIKE '%yabancı%'
        OR LOWER(clean_title) LIKE '%yabanci%'
      )
    `;
  }

  return "";
}

async function findPackageService(params: {
  platform: string;
  category: string;
  packageType: PackageType;
  quantity: number;
}) {
  const pool = getMysqlPool();

  const packageCondition = buildPackageSearchCondition(params.packageType);

  const [rows] = await pool.query<ServiceRow[]>(
    `
    SELECT
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
      tl_cost_price
    FROM services
    WHERE is_active = 1
      AND public_visible = 1
      AND review_status = 'approved'
      AND product_type = 'single'
      AND platform = ?
      AND category = ?
      AND tl_cost_price > 0
      AND min > 0
      AND max > 0
      AND min <= ?
      ${packageCondition}
    ORDER BY
      CASE
        WHEN max >= ? THEN 0
        WHEN max >= 100000 THEN 1
        WHEN max >= 10000 THEN 2
        ELSE 3
      END ASC,
      tl_cost_price ASC,
      max DESC
    LIMIT 1
    `,
    [params.platform, params.category, params.quantity, params.quantity]
  );

  if (rows[0]) return rows[0];

  const [fallbackRows] = await pool.query<ServiceRow[]>(
    `
    SELECT
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
      tl_cost_price
    FROM services
    WHERE is_active = 1
      AND public_visible = 1
      AND review_status = 'approved'
      AND product_type = 'single'
      AND platform = ?
      AND category = ?
      AND tl_cost_price > 0
      AND min > 0
      AND max > 0
      AND min <= ?
    ORDER BY
      CASE
        WHEN max >= ? THEN 0
        WHEN max >= 100000 THEN 1
        WHEN max >= 10000 THEN 2
        ELSE 3
      END ASC,
      tl_cost_price ASC,
      max DESC
    LIMIT 1
    `,
    [params.platform, params.category, params.quantity, params.quantity]
  );

  return fallbackRows[0] || null;
}

function createQuantityChunks({
  quantity,
  min,
  max,
}: {
  quantity: number;
  min: number;
  max: number;
}) {
  const safeMin = Math.max(1, Number(min || 1));
  const safeMax = Math.max(safeMin, Number(max || safeMin));

  if (quantity < safeMin) {
    throw new Error(
      `Bu servis için minimum miktar ${formatNumber(
        safeMin
      )}. Lütfen miktarı artırın veya farklı paket seçin.`
    );
  }

  const chunks: number[] = [];
  let remaining = quantity;

  while (remaining > 0) {
    if (remaining <= safeMax) {
      if (remaining < safeMin) {
        const lastIndex = chunks.length - 1;

        if (lastIndex >= 0 && chunks[lastIndex] + remaining <= safeMax) {
          chunks[lastIndex] += remaining;
          remaining = 0;
          break;
        }

        throw new Error(
          `Kalan miktar servis minimumunun altında kaldı. Lütfen miktarı ${formatNumber(
            safeMin
          )} ve katlarına daha uygun seçin.`
        );
      }

      chunks.push(remaining);
      remaining = 0;
      break;
    }

    const nextRemaining = remaining - safeMax;

    if (nextRemaining > 0 && nextRemaining < safeMin) {
      const adjustedChunk = remaining - safeMin;

      if (adjustedChunk >= safeMin && adjustedChunk <= safeMax) {
        chunks.push(adjustedChunk);
        remaining -= adjustedChunk;
        continue;
      }
    }

    chunks.push(safeMax);
    remaining -= safeMax;
  }

  return chunks;
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

    const rawBody = await req.json();

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { success: false, error: "Geçersiz istek gövdesi." },
        { status: 400 }
      );
    }

    const body = rawBody as Partial<PackageOrderPayload>;

    const platform = normalizeSlug(body.platform);
    const category = normalizeSlug(body.category);
    const packageType = body.package_type;
    const quantity = Number(body.quantity || 0);

    const targetUsername = normalizeString(body.target_username);
    const targetLink = normalizeString(body.target_link);
    const orderNote = normalizeString(body.order_note);

    const fullName = normalizeString(body.full_name);
    const phoneNumber =
      typeof body.phone_number === "string"
        ? normalizePhoneNumber(body.phone_number)
        : "";

    const contactType = body.contact_type;
    const contactValue = normalizeString(body.contact_value);
    const paymentMethod = body.payment_method;

    if (!platform || !category) {
      return NextResponse.json(
        { success: false, error: "Platform ve kategori seçimi gerekli." },
        { status: 400 }
      );
    }

    if (!packageType || !PACKAGE_TYPES.includes(packageType)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir paket türü seçiniz." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(quantity) ||
      quantity < MIN_QUANTITY ||
      quantity > MAX_DAILY_QUANTITY
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Miktar ${formatNumber(MIN_QUANTITY)} - ${formatNumber(
            MAX_DAILY_QUANTITY
          )} aralığında olmalıdır.`,
        },
        { status: 400 }
      );
    }

    if (!targetUsername || targetUsername.length < 2) {
      return NextResponse.json(
        { success: false, error: "Hedef kullanıcı adı gerekli." },
        { status: 400 }
      );
    }

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

    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir ödeme yöntemi seçiniz." },
        { status: 400 }
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

    const service = await findPackageService({
      platform,
      category,
      packageType,
      quantity,
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu paket için uygun aktif servis bulunamadı. Lütfen farklı paket türü seçin veya destekle iletişime geçin.",
        },
        { status: 404 }
      );
    }

    const quantityChunks = createQuantityChunks({
      quantity,
      min: Number(service.min || 1),
      max: Number(service.max || quantity),
    });

    const unitSalePrice = getPackagePricePer1000(
      platform,
      category,
      packageType
    );

    const unitCostPrice = roundMoney(Number(service.tl_cost_price || 0));
    const totalPrice = roundMoney((quantity / 1000) * unitSalePrice);
    const totalCostPrice = roundMoney((quantity / 1000) * unitCostPrice);

    const batchCode = createBatchCode();
    const currency: CurrencyCode = "TL";
    const status = paymentMethod === "balance" ? "pending" : "pending_payment";

    const packageLabel = getPackageTypeLabel(packageType);
    const serviceTitle = `${service.platform.toUpperCase()} ${
      service.category
    } Paketi • ${packageLabel}`;

    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    let balanceBefore = 0;
    let balanceAfter = 0;
    let firstInsertedOrderId: number | null = null;
    const orderNumbers: string[] = [];

    try {
      await connection.beginTransaction();

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

        const balanceColumn: BalanceColumn = "balance_tl";

        const [userRows] = await connection.query<BalanceUserRow[]>(
          `
          SELECT id, balance_tl, balance_usd, balance_rub
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
          `,
          [currentUser.id]
        );

        const userRow = userRows[0];

        if (!userRow) {
          await connection.rollback();

          return NextResponse.json(
            { success: false, error: "Kullanıcı hesabı bulunamadı." },
            { status: 401 }
          );
        }

        balanceBefore = roundMoney(Number(userRow[balanceColumn] || 0));

        if (balanceBefore < totalPrice) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              error: `TL bakiyeniz yetersiz. Sipariş tutarı: ${formatMoney(
                totalPrice
              )}. Mevcut TL bakiyeniz: ${formatMoney(balanceBefore)}.`,
            },
            { status: 400 }
          );
        }

        balanceAfter = roundMoney(balanceBefore - totalPrice);

        await connection.execute(
          `
          UPDATE users
          SET balance_tl = ?
          WHERE id = ?
          LIMIT 1
          `,
          [balanceAfter, currentUser.id]
        );
      }

      for (let index = 0; index < quantityChunks.length; index += 1) {
        const chunkQuantity = quantityChunks[index];
        const orderNumber = createOrderNumber();

        const chunkTotalPrice = roundMoney(
          (chunkQuantity / 1000) * unitSalePrice
        );

        const chunkTotalCostPrice = roundMoney(
          (chunkQuantity / 1000) * unitCostPrice
        );

        const chunkNoteParts = [
          orderNote || "",
          `Paketler sayfasından oluşturuldu.`,
          `Paket türü: ${packageLabel}.`,
          `Kaynak servis: ${service.clean_title || service.original_name}.`,
        ];

        if (quantityChunks.length > 1) {
          chunkNoteParts.push(
            `Parça: ${index + 1}/${quantityChunks.length}. Toplam istenen miktar: ${formatNumber(
              quantity
            )}.`
          );
        }

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
            service.platform,
            service.category,
            Number(service.panel_service_id),
            Number(service.site_code),
            serviceTitle,
            chunkQuantity,
            unitSalePrice,
            chunkTotalPrice,
            unitCostPrice,
            chunkTotalCostPrice,
            service.guarantee_label || packageLabel,
            service.speed || packageLabel,
            currency,
            paymentMethod,
            targetUsername,
            targetLink || null,
            chunkNoteParts.filter(Boolean).join(" "),
            status,
          ]
        );

        const insertedOrderId = Number(insertResult.insertId || 0);

        if (!firstInsertedOrderId) {
          firstInsertedOrderId = insertedOrderId;
        }

        orderNumbers.push(orderNumber);
      }

      if (paymentMethod === "balance" && currentUser) {
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
            0,
            Number(currentUser.balance_usd || 0),
            Number(currentUser.balance_usd || 0),
            `MedyaTora paket sipariş ödemesi - ${batchCode} - ${orderNumbers.join(
              ", "
            )} - TL`,
            firstInsertedOrderId,
          ]
        );
      }

      await connection.commit();
    } catch (dbError) {
      await connection.rollback();

      console.error("PACKAGE_ORDER_DB_ERROR", dbError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Paket siparişi kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

    const profit = roundMoney(totalPrice - totalCostPrice);

    const chunkSummary =
      quantityChunks.length > 1
        ? quantityChunks
            .map(
              (chunk, index) =>
                `${index + 1}. parça: ${formatNumber(chunk)} adet`
            )
            .join("\n")
        : "Tek parça sipariş";

    const telegramMessage =
      `📦 Yeni paket siparişi alındı\n\n` +
      `🧾 Batch Kodu: ${batchCode}\n` +
      `🔢 Sipariş No:\n${orderNumbers.join("\n")}\n` +
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
      `📌 Sipariş Durumu: ${status}\n\n` +
      `📱 Platform: ${service.platform}\n` +
      `📂 Kategori: ${service.category}\n` +
      `🏷️ Paket Türü: ${packageLabel}\n` +
      `📦 Toplam Miktar: ${formatNumber(quantity)}\n` +
      `🧩 Parçalama:\n${chunkSummary}\n` +
      `🎯 Hedef Kullanıcı: ${targetUsername}\n` +
      `🔗 Hedef Link: ${targetLink || "-"}\n\n` +
      `🧩 Kaynak Panel Servis ID: ${service.panel_service_id}\n` +
      `🧩 Müşteri Ürün Kodu: ${service.site_code}\n` +
      `🧩 Kaynak Servis: ${service.clean_title || service.original_name}\n` +
      `📉 Servis Limitleri: Min ${formatNumber(
        Number(service.min || 0)
      )} / Max ${formatNumber(Number(service.max || 0))}\n\n` +
      `💰 Birim Alış: ${unitCostPrice} TL / 1000\n` +
      `🏷️ Birim Satış: ${unitSalePrice} TL / 1000\n` +
      `💰 Toplam Alış: ${totalCostPrice} TL\n` +
      `🏷️ Toplam Satış: ${totalPrice} TL\n` +
      `📈 Tahmini Kâr: ${profit} TL\n` +
      `📝 Not: ${orderNote || "-"}`;

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          paymentMethod === "turkey_bank"
            ? "Paket siparişiniz alındı. Ödeme kontrolünden sonra işleme alınacaktır."
            : paymentMethod === "balance"
              ? "Paket siparişiniz TL bakiyenizden ödenerek alındı."
              : "Paket siparişiniz alındı. Ödeme ve işlem adımları için ekibimiz sizinle iletişime geçecektir.",
        batchCode,
        orderNumbers,
        orderNumber: orderNumbers[0] || null,
        totalPrice,
        currency,
        splitCount: orderNumbers.length,
        telegramWarning: telegramResult.warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PACKAGE_ORDER_SERVER_ERROR", error);

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