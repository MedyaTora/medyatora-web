import https from "https";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

type OrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

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

  return num;
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

    const id = Number(body?.id);
    const status = body?.status;
    const startCount = normalizeOptionalNumber(body?.start_count);
    const endCount = normalizeOptionalNumber(body?.end_count);
    const completionNote =
      typeof body?.completion_note === "string"
        ? body.completion_note.trim() || null
        : null;

    if (!Number.isFinite(id) || !status) {
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

    const supabase = createAdminSupabaseClient();

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("order_requests")
      .select(`
        id,
        order_number,
        full_name,
        contact_value,
        platform,
        category,
        service_title,
        site_code,
        quantity,
        unit_price,
        total_price,
        unit_cost_price,
        total_cost_price,
        guarantee_label,
        speed,
        currency,
        status
      `)
      .eq("id", id)
      .single();

    if (existingOrderError || !existingOrder) {
      return NextResponse.json(
        { error: existingOrderError?.message || "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("order_requests")
      .update({
        status,
        start_count: startCount,
        end_count: endCount,
        completion_note: completionNote,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Sipariş güncellenemedi." },
        { status: 400 }
      );
    }

    let telegramWarning: string | null = null;

    if (status === "completed") {
      const telegramMessage =
        `✅ Sipariş tamamlandı\n\n` +
        `🔢 Sipariş No: ${existingOrder.order_number || "-"}\n` +
        `👤 Ad Soyad: ${existingOrder.full_name || "-"}\n` +
        `📩 İletişim: ${existingOrder.contact_value || "-"}\n` +
        `📱 Platform: ${existingOrder.platform || "-"}\n` +
        `🗂️ Kategori: ${existingOrder.category || "-"}\n` +
        `📦 Ürün: ${existingOrder.service_title || "-"}\n` +
        `🔢 Servis No: ${existingOrder.site_code || "-"}\n` +
        `📊 Miktar: ${existingOrder.quantity || 0}\n` +
        `💸 1000 Adet Alış: ${existingOrder.unit_cost_price || 0} ${existingOrder.currency || ""}\n` +
        `💵 1000 Adet Satış: ${existingOrder.unit_price || 0} ${existingOrder.currency || ""}\n` +
        `💰 Toplam Alış: ${existingOrder.total_cost_price || 0} ${existingOrder.currency || ""}\n` +
        `🏷️ Toplam Satış: ${existingOrder.total_price || 0} ${existingOrder.currency || ""}\n` +
        `🛡️ Garanti: ${existingOrder.guarantee_label || "-"}\n` +
        `⚡ Hız: ${existingOrder.speed || "-"}\n` +
        `🔢 Başlangıç Miktarı: ${startCount ?? "-"}\n` +
        `🏁 Bitiş Miktarı: ${endCount ?? "-"}\n` +
        `📝 Not: ${completionNote || "-"}`;

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