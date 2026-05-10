import https from "https";
import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";
import {
  buildMedyatoraMailHtml,
  buildMedyatoraMailText,
  sendMail,
} from "@/lib/mail";

const ALLOWED_ORDER_STATUSES = [
  "pending_payment",
  "payment_review",
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
  "partial_refunded",
  "failed",
] as const;

type OrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

type ExistingOrder = {
  id: number;
  user_id: number | null;
  user_email: string | null;
  order_number: string | null;
  full_name: string | null;
  contact_type: string | null;
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

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || ""}`.trim();
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return Number(value || 0).toLocaleString("tr-TR");
}

function getStatusLabel(status: OrderStatus | string | null | undefined) {
  const map: Record<string, string> = {
    pending_payment: "Ödeme Bekliyor",
    payment_review: "Ödeme Kontrolünde",
    pending: "Beklemede",
    processing: "İşleniyor",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
    partial_refunded: "Kısmi Tamamlandı",
    failed: "Başarısız",
  };

  return map[status || ""] || status || "-";
}

function getStatusTelegramTitle(status: OrderStatus) {
  if (status === "pending_payment") return "🟠 Sipariş ödeme bekliyor";
  if (status === "payment_review") return "🧾 Sipariş ödeme kontrolüne alındı";
  if (status === "pending") return "🕒 Sipariş beklemeye alındı";
  if (status === "processing") return "🔄 Sipariş işleme alındı";
  if (status === "completed") return "✅ Sipariş tamamlandı";
  if (status === "cancelled") return "❌ Sipariş iptal edildi";
  if (status === "refunded") return "↩️ Sipariş iade edildi";
  if (status === "partial_refunded") return "↩️ Sipariş kısmi tamamlandı";
  return "⚠️ Sipariş başarısız olarak işaretlendi";
}

function getCustomerEmail(order: ExistingOrder) {
  if (order.user_email && order.user_email.includes("@")) {
    return order.user_email;
  }

  if (
    order.contact_type === "E-posta" &&
    order.contact_value &&
    order.contact_value.includes("@")
  ) {
    return order.contact_value;
  }

  return null;
}

function getCustomerStatusMessage({
  status,
  order,
  startCount,
  endCount,
  completionNote,
}: {
  status: OrderStatus;
  order: ExistingOrder;
  startCount: number | null;
  endCount: number | null;
  completionNote: string | null;
}) {
  const orderNumber = order.order_number || "-";
  const serviceTitle = order.service_title || "MedyaTora hizmeti";
  const quantity = formatNumber(order.quantity);
  const totalPrice = formatMoney(order.total_price, order.currency);

  if (status === "pending_payment") {
    return {
      subject: "Siparişiniz Ödeme Bekliyor | MedyaTora",
      title: "Siparişiniz Ödeme Bekliyor",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz oluşturuldu ve ödeme bekliyor.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        `Tutar: ${totalPrice}`,
        "Ödemenizi tamamladıktan sonra dekontu destek hattımıza iletebilirsiniz.",
        completionNote ? `Not: ${completionNote}` : "",
      ],
    };
  }

  if (status === "payment_review") {
    return {
      subject: "Ödemeniz Kontrol Ediliyor | MedyaTora",
      title: "Ödemeniz Kontrol Ediliyor",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz ödeme kontrolüne alınmıştır.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        "Dekont / ödeme bilgisi kontrol edildikten sonra siparişiniz işleme alınacaktır.",
        completionNote ? `Not: ${completionNote}` : "",
      ],
    };
  }

  if (status === "pending") {
    return {
      subject: "Siparişiniz Sıraya Alındı | MedyaTora",
      title: "Siparişiniz Sıraya Alındı",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz sıraya alınmıştır.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        "Siparişiniz kısa süre içinde işleme alınacaktır.",
        completionNote ? `Not: ${completionNote}` : "",
      ],
    };
  }

  if (status === "processing") {
    return {
      subject: "Siparişiniz İşleme Alındı | MedyaTora",
      title: "Siparişiniz İşleme Alındı",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz işleme alınmıştır.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        startCount !== null ? `Başlangıç miktarı: ${formatNumber(startCount)}` : "",
        "Sipariş süreci devam etmektedir. Tamamlandığında tekrar bilgilendirme yapılacaktır.",
        completionNote ? `Not: ${completionNote}` : "",
      ],
    };
  }

  if (status === "completed") {
    return {
      subject: "Siparişiniz Tamamlandı | MedyaTora",
      title: "Siparişiniz Tamamlandı",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz tamamlanmıştır.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        startCount !== null ? `Başlangıç miktarı: ${formatNumber(startCount)}` : "",
        endCount !== null ? `Bitiş miktarı: ${formatNumber(endCount)}` : "",
        "Sipariş durumunuzu Hesabım alanından takip edebilirsiniz.",
        completionNote ? `Not: ${completionNote}` : "",
      ],
    };
  }

  if (status === "cancelled") {
    return {
      subject: "Siparişiniz İptal Edildi | MedyaTora",
      title: "Siparişiniz İptal Edildi",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz iptal edilmiştir.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        completionNote
          ? `İptal notu: ${completionNote}`
          : "İptal nedeni için destek ekibimizle iletişime geçebilirsiniz.",
      ],
    };
  }

  if (status === "refunded") {
    return {
      subject: "Siparişiniz İade Edildi | MedyaTora",
      title: "Siparişiniz İade Edildi",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz için iade işlemi oluşturulmuştur.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Miktar: ${quantity}`,
        `İade tutarı: ${totalPrice}`,
        "İade işlemi ödeme yönteminize veya hesap durumunuza göre tamamlanır.",
        completionNote ? `İade notu: ${completionNote}` : "",
      ],
    };
  }

  if (status === "partial_refunded") {
    return {
      subject: "Siparişiniz Kısmi Tamamlandı | MedyaTora",
      title: "Siparişiniz Kısmi Tamamlandı",
      intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz kısmi tamamlandı olarak güncellenmiştir.`,
      bodyLines: [
        `Sipariş: ${serviceTitle}`,
        `Sipariş miktarı: ${quantity}`,
        startCount !== null ? `Başlangıç miktarı: ${formatNumber(startCount)}` : "",
        endCount !== null ? `Bitiş miktarı: ${formatNumber(endCount)}` : "",
        "Tamamlanamayan kısım için gerekli iade / bakiye işlemi destek ekibimiz tarafından kontrol edilir.",
        completionNote
          ? `Kısmi tamamlanma notu: ${completionNote}`
          : "Detaylar için destek ekibimizle iletişime geçebilirsiniz.",
      ],
    };
  }

  return {
    subject: "Siparişiniz Başarısız Olarak Güncellendi | MedyaTora",
    title: "Siparişiniz Başarısız Olarak Güncellendi",
    intro: `Merhaba ${order.full_name || ""}, ${orderNumber} numaralı siparişiniz başarısız olarak güncellenmiştir.`,
    bodyLines: [
      `Sipariş: ${serviceTitle}`,
      `Miktar: ${quantity}`,
      completionNote
        ? `Hata notu: ${completionNote}`
        : "Detaylar için destek ekibimizle iletişime geçebilirsiniz.",
    ],
  };
}

async function sendOrderStatusMail({
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
  const to = getCustomerEmail(order);

  if (!to) return;

  const mail = getCustomerStatusMessage({
    status: nextStatus,
    order,
    startCount,
    endCount,
    completionNote,
  });

  const orderNumber = order.order_number || `#${order.id}`;

  try {
    await sendMail({
      to,
      subject: mail.subject,
      text: buildMedyatoraMailText({
        title: mail.title,
        intro: mail.intro,
        highlightLabel: "Sipariş Numaranız",
        highlightValue: orderNumber,
        bodyLines: [
          `Yeni Durum: ${getStatusLabel(nextStatus)}`,
          `Önceki Durum: ${getStatusLabel(order.status)}`,
          ...mail.bodyLines,
        ].filter(Boolean),
        footerNote:
          "Sipariş durumunuzu Hesabım alanından takip edebilirsiniz. İyi günler dileriz. MedyaTora Ekibi",
      }),
      html: buildMedyatoraMailHtml({
        title: mail.title,
        intro: mail.intro,
        highlightLabel: "Sipariş Numaranız",
        highlightValue: orderNumber,
        bodyLines: [
          `Yeni Durum: ${getStatusLabel(nextStatus)}`,
          `Önceki Durum: ${getStatusLabel(order.status)}`,
          ...mail.bodyLines,
        ].filter(Boolean),
        footerNote:
          "Sipariş durumunuzu Hesabım alanından takip edebilirsiniz. İyi günler dileriz. MedyaTora Ekibi",
      }),
    });
  } catch (mailError) {
    console.error("ORDER_STATUS_MAIL_ERROR", mailError);
  }
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
          warning: "Telegram API status bildirimini kabul etmedi.",
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
    `📩 İletişim: ${order.contact_type || "-"} / ${
      order.contact_value || "-"
    }\n` +
    `📱 Platform: ${order.platform || "-"}\n` +
    `🗂️ Kategori: ${order.category || "-"}\n` +
    `🆔 Panel Servis ID: ${order.service_id || "-"}\n` +
    `🔢 Müşteri Ürün Kodu: ${order.site_code || "-"}\n` +
    `📦 Hizmet: ${order.service_title || "-"}\n` +
    `📊 Miktar: ${order.quantity || 0}\n` +
    `🛡️ Garanti: ${order.guarantee_label || "-"}\n` +
    `⚡ Hız: ${order.speed || "-"}\n` +
    `💸 1000 Adet Alış: ${formatMoney(
      order.unit_cost_price,
      order.currency
    )}\n` +
    `💵 1000 Adet Satış: ${formatMoney(order.unit_price, order.currency)}\n` +
    `💰 Toplam Alış: ${formatMoney(
      order.total_cost_price,
      order.currency
    )}\n` +
    `🏷️ Toplam Satış: ${formatMoney(order.total_price, order.currency)}\n`;

  if (nextStatus === "payment_review") {
    return (
      base +
      `🧾 Durum: ${getStatusLabel(nextStatus)}\n` +
      `📌 Açıklama: Müşteri ödeme yaptığını bildirdi. Dekont / ödeme kontrolü gerekli.\n` +
      `📝 Not: ${completionNote || "-"}`
    );
  }

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

  if (nextStatus === "partial_refunded") {
    return (
      base +
      `↩️ Durum: ${getStatusLabel(nextStatus)}\n` +
      `📝 Kısmi Tamamlanma / İade Notu: ${completionNote || "-"}`
    );
  }

  if (nextStatus === "failed") {
    return (
      base +
      `⚠️ Durum: ${getStatusLabel(nextStatus)}\n` +
      `📝 Hata Notu: ${completionNote || "-"}`
    );
  }

  return (
    base +
    `🔄 Yeni Durum: ${getStatusLabel(nextStatus)}\n` +
    `🔢 Başlangıç Miktarı: ${startCount ?? "-"}\n` +
    `🏁 Bitiş Miktarı: ${endCount ?? "-"}\n` +
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
        { success: false, error: "Sipariş id ve status gerekli." },
        { status: 400 }
      );
    }

    if (!isValidOrderStatus(status)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz sipariş durumu." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const [existingRows] = await pool.query(
      `
      SELECT
        o.id,
        o.user_id,
        u.email AS user_email,
        o.order_number,
        o.full_name,
        o.contact_type,
        o.contact_value,
        o.platform,
        o.category,
        o.service_id,
        o.site_code,
        o.service_title,
        o.quantity,
        o.unit_price,
        o.total_price,
        o.unit_cost_price,
        o.total_cost_price,
        o.guarantee_label,
        o.speed,
        o.currency,
        o.status
      FROM order_requests o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
      LIMIT 1
      `,
      [id]
    );

    const row = (existingRows as any[])[0];

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const existingOrder: ExistingOrder = {
      id: Number(row.id),
      user_id: row.user_id === null ? null : Number(row.user_id),
      user_email: row.user_email || null,
      order_number: row.order_number,
      full_name: row.full_name,
      contact_type: row.contact_type,
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

    const telegramMessage = buildStatusTelegramMessage({
      order: existingOrder,
      nextStatus: status,
      startCount,
      endCount,
      completionNote,
    });

    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (!telegramResult.ok && telegramResult.warning) {
      console.error(telegramResult.warning);
    }

    await sendOrderStatusMail({
      order: existingOrder,
      nextStatus: status,
      startCount,
      endCount,
      completionNote,
    });

    return NextResponse.json(
      {
        success: true,
        id,
        previousStatus: existingOrder.status,
        nextStatus: status,
        telegramWarning: telegramResult.warning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order status update error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}