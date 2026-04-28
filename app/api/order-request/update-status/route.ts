import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const;

type OrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

type ExistingOrder = {
  id: number;
  order_number: string | null;
  full_name: string | null;
  contact_value: string | null;
  platform: string | null;
  category: string | null;
  service_id: number | null;
  site_code: number | null;
  service_title: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  unit_cost_price: number | null;
  total_cost_price: number | null;
  guarantee_label: string | null;
  speed: string | null;
  currency: string | null;
  status: string | null;
};

function isValidOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ALLOWED_ORDER_STATUSES.includes(value as OrderStatus)
  );
}

function normalizeOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  return Math.floor(num);
}

function normalizeMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  return num;
}

function formatMoney(value: number | null | undefined, currency?: string | null) {
  const safeValue = typeof value === "number" ? value : 0;
  return `${safeValue} ${currency || ""}`.trim();
}

function getStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: "Bekliyor",
    processing: "İşlemde",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
  };

  return map[status];
}

function getStatusTelegramTitle(status: OrderStatus) {
  if (status === "completed") return "✅ Sipariş tamamlandı";
  if (status === "cancelled") return "❌ Sipariş iptal edildi";
  if (status === "refunded") return "↩️ Sipariş iade edildi";
  if (status === "processing") return "🔄 Sipariş işleme alındı";
  return "🕒 Sipariş beklemeye alındı";
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

function buildStatusTelegramMessage({
  order,
  nextStatus,
  startCount,
  endCount,
  completionNote,
}: {
  order: ExistingOrder;
  nextStatus: OrderStatus;
  startCount: number | null;
  endCount: number | null;
  completionNote: string | null;
}) {
  const profit = (order.total_price || 0) - (order.total_cost_price || 0);

  const base =
    `${getStatusTelegramTitle(nextStatus)}\n\n` +
    `🔢 Sipariş No: ${order.order_number || "-"}\n` +
    `👤 Ad Soyad: ${order.full_name || "-"}\n` +
    `📩 İletişim: ${order.contact_value || "-"}\n` +
    `📱 Platform: ${order.platform || "-"}\n` +
    `🗂️ Kategori: ${order.category || "-"}\n` +
    `🆔 Panel Servis ID: ${order.service_id || "-"}\n` +
    `🔢 Müşteri Ürün Kodu: ${order.site_code || "-"}\n` +
    `📦 Hizmet: ${order.service_title || "-"}\n` +
    `📊 Miktar: ${order.quantity || 0}\n` +
    `🛡️ Garanti: ${order.guarantee_label || "-"}\n` +
    `⚡ Hız: ${order.speed || "-"}\n` +
    `💸 1000 Adet Alış: ${formatMoney(order.unit_cost_price, order.currency)}\n` +
    `💵 1000 Adet Satış: ${formatMoney(order.unit_price, order.currency)}\n` +
    `💰 Toplam Alış: ${formatMoney(order.total_cost_price, order.currency)}\n` +
    `🏷️ Toplam Satış: ${formatMoney(order.total_price, order.currency)}\n`;

  if (nextStatus === "completed") {
    return (
      base +
      `📈 Tahmini Kâr: ${formatMoney(profit, order.currency)}\n` +
      `🔢 Başlangıç Miktarı: ${startCount ?? "-"}\n` +
      `🏁 Bitiş Miktarı: ${endCount ?? "-"}\n` +
      `📝 Not: ${completionNote || "-"}`
    );
  }

  if (nextStatus === "cancelled") {
    return (
      base +
      `🚫 Durum: ${getStatusLabel(nextStatus)}\n` +
      `📝 İptal Notu: ${completionNote || "-"}`
    );
  }

  if (nextStatus === "refunded") {
    return (
      base +
      `↩️ Durum: ${getStatusLabel(nextStatus)}\n` +
      `💳 İade Tutarı: ${formatMoney(order.total_price, order.currency)}\n` +
      `📝 İade Notu: ${completionNote || "-"}`
    );
  }

  return (
    base +
    `🔄 Yeni Durum: ${getStatusLabel(nextStatus)}\n` +
    `📝 Not: ${completionNote || "-"}`
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = Number(body?.id);
    const status = body?.status;
    const startCount = normalizeOptionalNumber(body?.start_count);
    const endCount = normalizeOptionalNumber(body?.end_count);

    const completionNote =
      typeof body?.completion_note === "string"
        ? body.completion_note.trim() || null
        : null;

    if (!Number.isInteger(id) || id <= 0 || !status) {
      return NextResponse.json(
        { error: "Sipariş id ve status gerekli." },
        { status: 400 }
      );
    }

    if (!isValidOrderStatus(status)) {
      return NextResponse.json(
        { error: "Geçersiz sipariş durumu." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [existingRows] = await pool.query(
      `
      SELECT
        id,
        order_number,
        full_name,
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
        status
      FROM order_requests
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    const row = (existingRows as any[])[0];

    if (!row) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const existingOrder: ExistingOrder = {
      id: Number(row.id),
      order_number: row.order_number,
      full_name: row.full_name,
      contact_value: row.contact_value,
      platform: row.platform,
      category: row.category,
      service_id: row.service_id === null ? null : Number(row.service_id),
      site_code: row.site_code === null ? null : Number(row.site_code),
      service_title: row.service_title,
      quantity: row.quantity === null ? null : Number(row.quantity),
      unit_price: normalizeMoney(row.unit_price),
      total_price: normalizeMoney(row.total_price),
      unit_cost_price: normalizeMoney(row.unit_cost_price),
      total_cost_price: normalizeMoney(row.total_cost_price),
      guarantee_label: row.guarantee_label,
      speed: row.speed,
      currency: row.currency,
      status: row.status,
    };

    await pool.execute(
      `
      UPDATE order_requests
      SET
        status = ?,
        start_count = ?,
        end_count = ?,
        completion_note = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, startCount, endCount, completionNote, id]
    );

    try {
      const telegramMessage = buildStatusTelegramMessage({
        order: existingOrder,
        nextStatus: status,
        startCount,
        endCount,
        completionNote,
      });

      await sendTelegramMessage(telegramMessage);
    } catch (telegramError) {
      console.error("Telegram sipariş status bildirimi gönderilemedi:", telegramError);
    }

    return NextResponse.json(
      {
        success: true,
        id,
        previousStatus: existingOrder.status,
        nextStatus: status,
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
