import https from "https";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      full_name,
      phone_number,
      contact_type,
      contact_value,
      currency,
      items,
    } = body;

    if (
      !full_name ||
      !phone_number ||
      !contact_type ||
      !contact_value ||
      !currency ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Eksik sipariş bilgisi var." },
        { status: 400 }
      );
    }

    const batchCode = createBatchCode();

    const rows = items.map((item: any) => ({
      batch_code: batchCode,
      order_number: createOrderNumber(),
      full_name,
      phone_number,
      contact_type,
      contact_value,
      platform: item.platform,
      category: item.category,
      service_id: Number(item.service_id),
      site_code: Number(item.site_code),
      service_title: item.service_title,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
      unit_cost_price: Number(item.unit_cost_price),
      total_cost_price: Number(item.total_cost_price),
      guarantee_label: item.guarantee_label,
      speed: item.speed,
      currency,
      target_username: item.target_username || null,
      target_link: item.target_link || null,
      order_note: item.order_note || null,
      status: "pending",
    }));

    const { data: insertedRows, error: orderError } = await supabase
      .from("order_requests")
      .insert(rows)
      .select("order_number, service_title, quantity, total_price, currency");

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    const lines = rows
      .map(
        (item: any, index: number) =>
          `${index + 1}. ${item.service_title}\n` +
          `   Miktar: ${item.quantity}\n` +
          `   Toplam Satış: ${item.total_price} ${currency}\n` +
          `   Hedef: ${item.target_username || "-"}`
      )
      .join("\n\n");

    const orderNumberLines = (insertedRows || [])
      .map((row: any) => `• ${row.order_number}`)
      .join("\n");

    const totalSale = rows.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    const totalCost = rows.reduce((sum, item) => sum + Number(item.total_cost_price || 0), 0);

    const telegramMessage =
      `🛒 Yeni sipariş alındı\n\n` +
      `🧾 Batch Kodu: ${batchCode}\n` +
      `👤 Ad Soyad: ${full_name}\n` +
      `📞 Telefon: ${phone_number}\n` +
      `📩 İletişim Türü: ${contact_type}\n` +
      `📨 İletişim Bilgisi: ${contact_value}\n` +
      `💱 Para Birimi: ${currency}\n` +
      `📦 Ürün Sayısı: ${rows.length}\n` +
      `💰 Toplam Alış: ${totalCost} ${currency}\n` +
      `🏷️ Toplam Satış: ${totalSale} ${currency}\n\n` +
      `🔢 Sipariş Numaraları:\n${orderNumberLines}\n\n` +
      `${lines}`;

    let telegramWarning: string | null = null;

    try {
      const telegramText = await sendTelegramMessage(telegramMessage);
      console.error("TELEGRAM RAW RESPONSE:", telegramText);

      try {
        const telegramJson = JSON.parse(telegramText);
        if (!telegramJson.ok) {
          telegramWarning = `Telegram API hata döndü: ${telegramText}`;
          console.error(telegramWarning);
        }
      } catch {
        telegramWarning = `Telegram cevabı JSON parse edilemedi: ${telegramText}`;
        console.error(telegramWarning);
      }
    } catch (telegramError) {
      telegramWarning =
        telegramError instanceof Error
          ? `Telegram gönderim hatası: ${telegramError.message}`
          : "Telegram gönderiminde bilinmeyen hata oluştu";
      console.error(telegramWarning);
    }

    return NextResponse.json({
      success: true,
      batchCode,
      orderNumbers: insertedRows?.map((row: any) => row.order_number) || [],
      telegramWarning,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu",
      },
      { status: 500 }
    );
  }
}