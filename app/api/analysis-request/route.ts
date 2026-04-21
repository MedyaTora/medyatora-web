import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabase = createClient(
      'https://flmtpjfnmjgvyzgolmug.supabase.co',
      'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
    )

    const {
      full_name,
      username,
      account_link,
      account_type,
      content_type,
      daily_post_count,
      coupon_code,
      main_problem,
      main_missing,
      contact_type,
      contact_value,
    } = body

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          full_name,
          username,
          account_link,
          account_type,
          content_type,
          daily_post_count: Number(daily_post_count) || 0,
          main_problem,
          main_missing,
          contact_type,
          contact_value,
        },
      ])
      .select()
      .single()

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 400 })
    }

    const { error: analysisError } = await supabase
      .from('analysis_requests')
      .insert([
        {
          customer_id: customer.id,
          coupon_code,
          package_type: 'analysis',
          package_price: coupon_code === 'ANALIZ100' ? 0 : 5,
          currency: 'USD',
          status: 'pending',
        },
      ])

    if (analysisError) {
      return NextResponse.json({ error: analysisError.message }, { status: 400 })
    }

    const telegramMessage =
      `📥 Yeni analiz başvurusu alındı\n\n` +
      `👤 Ad Soyad: ${full_name}\n` +
      `📷 Kullanıcı Adı: ${username}\n` +
      `🔗 Hesap Linki: ${account_link}\n` +
      `🏷️ Hesap Türü: ${account_type}\n` +
      `🎬 İçerik Türü: ${content_type}\n` +
      `📆 Günlük Video: ${daily_post_count}\n` +
      `🎟️ Kupon: ${coupon_code}\n` +
      `📞 İletişim Türü: ${contact_type}\n` +
      `📩 İletişim: ${contact_value}\n\n` +
      `⚠️ Genel Sorun: ${main_problem}\n` +
      `❗ En Büyük Eksik: ${main_missing}`

    const tgRes = await fetch(
      'https://api.telegram.org/bot7939742915:AAEB-uZUCOYOkQELLUCj365-CBD3a63Rj1I/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '1978934719',
          text: telegramMessage,
        }),
      }
    )

    const tgData = await tgRes.json()
    console.log('TELEGRAM RESPONSE:', tgData)

    return NextResponse.json({ success: true, telegram: tgData })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sunucu hatasi olustu',
      },
      { status: 500 }
    )
  }
}