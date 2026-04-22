import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      id,
      status,
      start_count,
      end_count,
      completion_note,
    } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Sipariş id ve status gerekli." },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("order_requests")
      .select(`
        id,
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
        start_count: start_count ? Number(start_count) : null,
        end_count: end_count ? Number(end_count) : null,
        completion_note: completion_note || null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (status === "completed") {
      const telegramMessage =
        `✅ Sipariş tamamlandı\n\n` +
        `👤 Ad Soyad: ${existingOrder.full_name}\n` +
        `📩 İletişim: ${existingOrder.contact_value}\n` +
        `📱 Platform: ${existingOrder.platform}\n` +
        `🗂️ Kategori: ${existingOrder.category}\n` +
        `📦 Ürün: ${existingOrder.service_title}\n` +
        `🔢 Servis No: ${existingOrder.site_code}\n` +
        `📊 Miktar: ${existingOrder.quantity}\n` +
        `💸 1000 Adet Alış: ${existingOrder.unit_cost_price || 0} ${existingOrder.currency || ""}\n` +
        `💵 1000 Adet Satış: ${existingOrder.unit_price || 0} ${existingOrder.currency || ""}\n` +
        `💰 Toplam Alış: ${existingOrder.total_cost_price || 0} ${existingOrder.currency || ""}\n` +
        `🏷️ Toplam Satış: ${existingOrder.total_price || 0} ${existingOrder.currency || ""}\n` +
        `🛡️ Garanti: ${existingOrder.guarantee_label || "-"}\n` +
        `⚡ Hız: ${existingOrder.speed || "-"}\n` +
        `🔢 Başlangıç Miktarı: ${start_count || "-"}\n` +
        `🏁 Bitiş Miktarı: ${end_count || "-"}\n` +
        `📝 Not: ${completion_note || "-"}`;

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramMessage,
          }),
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu",
      },
      { status: 500 }
    );
  }
}