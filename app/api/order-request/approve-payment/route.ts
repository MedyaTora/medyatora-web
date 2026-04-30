import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

type OrderRow = {
  id: number;
  order_number: string | null;
  full_name: string | null;
  phone_number: string | null;
  contact_type: string | null;
  contact_value: string | null;
  platform: string | null;
  category: string | null;
  service_title: string | null;
  total_price: number | null;
  currency: string | null;
  payment_method: string | null;
  status: string | null;
};

function normalizeCurrency(currency: string | null | undefined) {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return "TL";
}

function formatMoney(value: number | null | undefined, currency?: string | null) {
  const safeValue = typeof value === "number" ? value : 0;
  return `${safeValue} ${normalizeCurrency(currency)}`.trim();
}

function getPaymentMethodLabel(method: string | null | undefined) {
  const map: Record<string, string> = {
    turkey_bank: "Türkiye Banka Havalesi / EFT",
    support: "Destek ile İletişime Geçilecek",
    balance: "MedyaTora Bakiyesi",
  };

  return map[method || ""] || method || "-";
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
      const request = https.request(
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
        (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            if (
              !response.statusCode ||
              response.statusCode < 200 ||
              response.statusCode >= 300
            ) {
              reject(new Error(`Telegram HTTP ${response.statusCode}: ${data}`));
              return;
            }

            resolve(data);
          });
        }
      );

      request.on("error", (error) => {
        reject(error);
      });

      request.write(body);
      request.end();
    });

    try {
      const json = JSON.parse(responseText);

      if (!json.ok) {
        return {
          ok: false,
          warning: "Telegram API ödeme onay bildirimini kabul etmedi.",
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

function buildPaymentApprovedTelegramMessage(order: OrderRow) {
  return (
    `✅ Sipariş ödemesi onaylandı\n\n` +
    `🔢 Sipariş No: ${order.order_number || "-"}\n` +
    `👤 Ad Soyad: ${order.full_name || "-"}\n` +
    `📞 Telefon: ${order.phone_number || "-"}\n` +
    `📩 İletişim: ${order.contact_type || "-"} / ${order.contact_value || "-"}\n` +
    `📱 Platform: ${order.platform || "-"}\n` +
    `🗂️ Kategori: ${order.category || "-"}\n` +
    `📦 Hizmet: ${order.service_title || "-"}\n` +
    `💳 Ödeme Yöntemi: ${getPaymentMethodLabel(order.payment_method)}\n` +
    `💰 Tutar: ${formatMoney(order.total_price, order.currency)}\n\n` +
    `📌 Yeni Durum: Bekliyor\n` +
    `📝 Not: Ödeme admin tarafından onaylandı. Sipariş işleme alınabilir.`
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = Number(body?.order_id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { success: false, error: "Geçerli sipariş id gerekli." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        order_number,
        full_name,
        phone_number,
        contact_type,
        contact_value,
        platform,
        category,
        service_title,
        total_price,
        currency,
        payment_method,
        status
      FROM order_requests
      WHERE id = ?
      LIMIT 1
      `,
      [orderId]
    );

    const row = (rows as any[])[0];

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const order: OrderRow = {
      id: Number(row.id),
      order_number: row.order_number,
      full_name: row.full_name,
      phone_number: row.phone_number,
      contact_type: row.contact_type,
      contact_value: row.contact_value,
      platform: row.platform,
      category: row.category,
      service_title: row.service_title,
      total_price: row.total_price === null ? null : Number(row.total_price),
      currency: normalizeCurrency(row.currency),
      payment_method: row.payment_method,
      status: row.status,
    };

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        {
          success: false,
          error: "Bu sipariş ödeme bekliyor durumunda değil.",
        },
        { status: 400 }
      );
    }

    if (order.payment_method !== "turkey_bank" && order.payment_method !== "support") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu buton sadece havale/EFT veya destek ile ödeme siparişlerinde kullanılabilir.",
        },
        { status: 400 }
      );
    }

    await pool.execute(
      `
      UPDATE order_requests
      SET
        status = 'pending',
        completion_note = ?,
        updated_at = NOW()
      WHERE id = ?
      LIMIT 1
      `,
      ["Ödeme admin tarafından onaylandı. Sipariş işleme alınabilir.", order.id]
    );

    const telegramResult = await sendTelegramMessage(
      buildPaymentApprovedTelegramMessage(order)
    );

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    return NextResponse.json(
      {
        success: true,
        id: order.id,
        previousStatus: order.status,
        nextStatus: "pending",
        telegramWarning: telegramResult.warning,
        message: "Ödeme onaylandı. Sipariş bekliyor durumuna alındı.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PAYMENT_APPROVE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ödeme onaylanırken sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}