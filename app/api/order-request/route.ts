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
          `   Platform: ${item.platform}\n` +
          `   Kategori: ${item.category}\n` +
          `   Servis No: ${item.site_code}\n` +
          `   Hedef Kullanıcı: ${item.target_username || "-"}\n` +
          `   Hedef Link: ${item.target_link || "-"}\n` +
          `   Not: ${item.order_note || "-"}\n` +
          `   Miktar: ${item.quantity}\n` +
          `   1000 Adet Alış: ${item.unit_cost_price} ${currency}\n` +
          `   1000 Adet Satış: ${item.unit_price} ${currency}\n` +
          `   Toplam Alış: ${item.total_cost_price} ${currency}\n` +
          `   Toplam Satış: ${item.total_price} ${currency}\n` +
          `   Garanti: ${item.guarantee_label}\n` +
          `   Hız: ${item.speed}`
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

    return NextResponse.json({
      success: true,
      batchCode,
      orderNumbers: insertedRows?.map((row: any) => row.order_number) || [],
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