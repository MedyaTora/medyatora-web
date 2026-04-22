import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (!telegramBotToken || !telegramChatId) {
      return NextResponse.json(
        { error: "Telegram ayarları eksik." },
        { status: 500 }
      );
    }

    const text = `
🆕 Yeni Sipariş

👤 Ad Soyad: ${body.customerName}
📩 Kullanıcı Adı: ${body.username}

🔢 Ürün Kodu: ${body.siteCode}
🧾 Orijinal Kod: ${body.providerServiceId}
📦 Ürün: ${body.productTitle}

📊 Miktar: ${body.quantity}
💸 Alış Fiyatımız: ${body.costPrice} TL
💰 Satış Fiyatımız: ${body.salePrice} TL
    `.trim();

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
        }),
      }
    );

    if (!telegramResponse.ok) {
      const detail = await telegramResponse.text();
      return NextResponse.json(
        { error: "Telegram mesajı gönderilemedi.", detail },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Sipariş işlenemedi.", detail: String(error) },
      { status: 500 }
    );
  }
}