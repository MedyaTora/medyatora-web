import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";
import {
  formatOrderDate,
  formatOrderMoney,
  getOrderStatusClass,
} from "@/lib/order-status";
import type { Locale } from "@/lib/i18n";

type OrderDetailRow = RowDataPacket & {
  id: number;
  order_number: string;
  batch_code: string;
  service_title: string;
  platform: string;
  category: string;
  service_id: number;
  site_code: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  unit_cost_price: string | number;
  total_cost_price: string | number;
  guarantee_label: string;
  speed: string;
  currency: string;
  payment_method: string;
  target_username: string | null;
  target_link: string | null;
  order_note: string | null;
  status: string;
  start_count: number | null;
  end_count: number | null;
  completion_note: string | null;
  admin_note: string | null;
  created_at: string;
};

type RefundSummaryRow = RowDataPacket & {
  refunded_total: string | number | null;
  latest_refund_amount: string | number | null;
  latest_refund_currency: string | null;
  latest_refund_note: string | null;
  latest_refund_created_at: string | null;
};

type OrderDetailText = {
  brandSubtitle: string;
  account: string;
  myOrders: string;
  orderCenter: string;
  orderDetail: string;
  orderNo: string;
  totalAmount: string;
  paymentMethod: string;
  partialCompleted: string;
  partialRefundTitle: string;
  partialRefundDesc: string;
  orderQuantity: string;
  delivered: string;
  missing: string;
  refundedAmount: string;
  refundNote: string;
  refundNoteFallback: string;
  refundInfo: string;
  refundInfoDesc: string;
  partialRefundExtra: string;
  orderAmount: string;
  refunded: string;
  remainingRefund: string;
  platform: string;
  category: string;
  productCode: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  guarantee: string;
  deliverySpeed: string;
  targetInfo: string;
  targetUser: string;
  targetLink: string;
  orderNote: string;
  noNote: string;
  supportTitle: string;
  supportDesc: string;
  telegramSupport: string;
  whatsappSupport: string;
  readyMessage: string;
  supportMessage: (orderNumber: string) => string;
  statuses: Record<string, string>;
  statusDescriptions: Record<string, string>;
  deliverySpeedFallbacks: Record<string, string>;
  refundBox: {
    none: string;
    full: string;
    partial: string;
    exists: string;
  };
  paymentMethods: Record<string, string>;
};

const orderDetailTexts: Record<Locale, OrderDetailText> = {
  tr: {
    brandSubtitle: "Sipariş detayı",
    account: "Hesabım",
    myOrders: "Siparişlerim",
    orderCenter: "Sipariş Merkezi",
    orderDetail: "Sipariş Detayı",
    orderNo: "Sipariş No",
    totalAmount: "Toplam Tutar",
    paymentMethod: "Ödeme yöntemi",
    partialCompleted: "Kısmi Tamamlandı",
    partialRefundTitle:
      "Siparişinizin teslim edilemeyen kısmı için iade yapıldı.",
    partialRefundDesc:
      "Siparişinizin büyük kısmı tamamlandı. Eksik kalan bölüm için ilgili tutar aynı para birimindeki bakiyenize geri yansıtıldı.",
    partialRefundExtra:
      "İade bakiyenize yansıtıldı; görünmesi birkaç dakika sürebilir.",
    orderQuantity: "Sipariş Miktarı",
    delivered: "Teslim Edilen",
    missing: "Eksik Kalan",
    refundedAmount: "İade Edilen Tutar",
    refundNote: "İade Açıklaması",
    refundNoteFallback:
      "Teslim edilemeyen kısım için ilgili tutar bakiyenize geri yansıtılmıştır.",
    refundInfo: "İade Bilgisi",
    refundInfoDesc:
      "İade varsa, iade edilen tutar siparişin para birimiyle gösterilir. TL, USD ve RUB bakiyeleri ayrı ayrı tutulur.",
    orderAmount: "Sipariş Tutarı",
    refunded: "İade Edilen",
    remainingRefund: "Kalan İade",
    platform: "Platform",
    category: "Kategori",
    productCode: "Ürün Kodu",
    quantity: "Miktar",
    unitPrice: "Birim Fiyat",
    totalPrice: "Toplam Fiyat",
    guarantee: "Garanti",
    deliverySpeed: "Gönderim Hızı",
    targetInfo: "Hedef Bilgileri",
    targetUser: "Hedef Kullanıcı",
    targetLink: "Hedef Link",
    orderNote: "Sipariş Notu",
    noNote: "Not eklenmemiş.",
    supportTitle: "Desteğe Ulaş",
    supportDesc:
      "Bu siparişle ilgili destek almak istersen aşağıdaki butonlardan bize ulaşabilirsin.",
    telegramSupport: "Telegram ile Destek Al",
    whatsappSupport: "WhatsApp ile Destek Al",
    readyMessage: "Hazır mesaj",
    supportMessage: (orderNumber) =>
      `Merhaba, MedyaTora siparişim hakkında destek almak istiyorum. Sipariş No: ${orderNumber}`,
    statuses: {
      pending_payment: "Ödeme Bekliyor",
      pending: "Sipariş Alındı",
      processing: "İşleniyor",
      in_progress: "Devam Ediyor",
      completed: "Tamamlandı",
      cancelled: "İptal Edildi",
      refunded: "İade Edildi",
      partial_refunded: "Kısmi Tamamlandı",
      failed: "Başarısız",
    },
    statusDescriptions: {
      pending_payment: "Siparişiniz oluşturuldu, ödeme onayı bekleniyor.",
      pending: "Siparişiniz alındı ve sıraya eklendi.",
      processing: "Siparişiniz işleme hazırlanıyor.",
      in_progress: "Siparişiniz aktif olarak gönderiliyor.",
      completed: "Siparişiniz başarıyla tamamlandı.",
      cancelled: "Siparişiniz iptal edildi.",
      refunded: "Sipariş tutarı iade edildi.",
      partial_refunded:
        "Siparişinizin büyük kısmı tamamlandı. Teslim edilemeyen kısım için bakiye iadesi yapılmıştır.",
      failed: "Sipariş tamamlanamadı.",
    },
    deliverySpeedFallbacks: {
      pending_payment: "Ödeme onayı bekleniyor",
      pending: "Sipariş sıraya alındı",
      processing: "Gönderim hazırlanıyor",
      in_progress: "Gönderim devam ediyor",
      completed: "Gönderim tamamlandı",
      refunded: "Sipariş tutarı iade edildi",
      partial_refunded: "Sipariş kısmi olarak tamamlandı",
      cancelled: "Sipariş iptal edildi",
      failed: "İşlem başarısız oldu",
    },
    refundBox: {
      none: "Bu sipariş için henüz iade kaydı bulunmuyor.",
      full: "Bu sipariş için tam iade kaydı oluşturulmuş.",
      partial: "Sipariş kısmi olarak tamamlandı ve eksik kalan kısım için iade yapıldı.",
      exists: "Bu sipariş için iade kaydı bulunuyor.",
    },
    paymentMethods: {
      turkey_bank: "Havale / EFT",
      balance: "MedyaTora Bakiyesi",
      support: "Destek ile ödeme",
    },
  },

  en: {
    brandSubtitle: "Order detail",
    account: "Account",
    myOrders: "My Orders",
    orderCenter: "Order Center",
    orderDetail: "Order Detail",
    orderNo: "Order No",
    totalAmount: "Total Amount",
    paymentMethod: "Payment method",
    partialCompleted: "Partially Completed",
    partialRefundTitle:
      "A refund has been issued for the undelivered part of your order.",
    partialRefundDesc:
      "Most of your order has been completed. The amount for the missing part has been returned to your balance in the same currency.",
    partialRefundExtra:
      "The refund has been credited to your balance; it may take a few minutes to appear.",
    orderQuantity: "Order Quantity",
    delivered: "Delivered",
    missing: "Missing",
    refundedAmount: "Refunded Amount",
    refundNote: "Refund Note",
    refundNoteFallback:
      "The amount for the undelivered part has been returned to your balance.",
    refundInfo: "Refund Information",
    refundInfoDesc:
      "If there is a refund, the refunded amount is shown in the order currency. TL, USD, and RUB balances are kept separately.",
    orderAmount: "Order Amount",
    refunded: "Refunded",
    remainingRefund: "Remaining Refund",
    platform: "Platform",
    category: "Category",
    productCode: "Product Code",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    totalPrice: "Total Price",
    guarantee: "Guarantee",
    deliverySpeed: "Delivery Speed",
    targetInfo: "Target Information",
    targetUser: "Target User",
    targetLink: "Target Link",
    orderNote: "Order Note",
    noNote: "No note added.",
    supportTitle: "Contact Support",
    supportDesc:
      "If you need help with this order, you can contact us using the buttons below.",
    telegramSupport: "Get Support on Telegram",
    whatsappSupport: "Get Support on WhatsApp",
    readyMessage: "Ready message",
    supportMessage: (orderNumber) =>
      `Hello, I would like to get support about my MedyaTora order. Order No: ${orderNumber}`,
    statuses: {
      pending_payment: "Payment Pending",
      pending: "Order Received",
      processing: "Processing",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      partial_refunded: "Partially Completed",
      failed: "Failed",
    },
    statusDescriptions: {
      pending_payment: "Your order has been created and is waiting for payment confirmation.",
      pending: "Your order has been received and added to the queue.",
      processing: "Your order is being prepared for processing.",
      in_progress: "Your order is currently being delivered.",
      completed: "Your order has been completed successfully.",
      cancelled: "Your order has been cancelled.",
      refunded: "The order amount has been refunded.",
      partial_refunded:
        "Most of your order has been completed. A balance refund has been issued for the undelivered part.",
      failed: "The order could not be completed.",
    },
    deliverySpeedFallbacks: {
      pending_payment: "Waiting for payment confirmation",
      pending: "Order queued",
      processing: "Delivery is being prepared",
      in_progress: "Delivery in progress",
      completed: "Delivery completed",
      refunded: "Order amount refunded",
      partial_refunded: "Order partially completed",
      cancelled: "Order cancelled",
      failed: "Process failed",
    },
    refundBox: {
      none: "There is no refund record for this order yet.",
      full: "A full refund record has been created for this order.",
      partial:
        "The order was partially completed and the missing part has been refunded.",
      exists: "There is a refund record for this order.",
    },
    paymentMethods: {
      turkey_bank: "Bank Transfer / EFT",
      balance: "MedyaTora Balance",
      support: "Support payment",
    },
  },

  ru: {
    brandSubtitle: "Детали заказа",
    account: "Аккаунт",
    myOrders: "Мои заказы",
    orderCenter: "Центр заказов",
    orderDetail: "Детали заказа",
    orderNo: "Номер заказа",
    totalAmount: "Итоговая сумма",
    paymentMethod: "Способ оплаты",
    partialCompleted: "Частично завершено",
    partialRefundTitle:
      "За недоставленную часть заказа был выполнен возврат.",
    partialRefundDesc:
      "Большая часть заказа выполнена. Сумма за недостающую часть возвращена на ваш баланс в той же валюте.",
    partialRefundExtra:
      "Возврат зачислен на ваш баланс; это может занять несколько минут.",
    orderQuantity: "Количество в заказе",
    delivered: "Доставлено",
    missing: "Недостает",
    refundedAmount: "Сумма возврата",
    refundNote: "Комментарий к возврату",
    refundNoteFallback:
      "Сумма за недоставленную часть была возвращена на ваш баланс.",
    refundInfo: "Информация о возврате",
    refundInfoDesc:
      "Если есть возврат, сумма возврата отображается в валюте заказа. Балансы TL, USD и RUB хранятся отдельно.",
    orderAmount: "Сумма заказа",
    refunded: "Возвращено",
    remainingRefund: "Остаток возврата",
    platform: "Платформа",
    category: "Категория",
    productCode: "Код услуги",
    quantity: "Количество",
    unitPrice: "Цена за единицу",
    totalPrice: "Итоговая цена",
    guarantee: "Гарантия",
    deliverySpeed: "Скорость выполнения",
    targetInfo: "Информация о цели",
    targetUser: "Целевой пользователь",
    targetLink: "Целевая ссылка",
    orderNote: "Примечание к заказу",
    noNote: "Примечание не добавлено.",
    supportTitle: "Связаться с поддержкой",
    supportDesc:
      "Если вам нужна помощь по этому заказу, свяжитесь с нами через кнопки ниже.",
    telegramSupport: "Поддержка в Telegram",
    whatsappSupport: "Поддержка в WhatsApp",
    readyMessage: "Готовое сообщение",
    supportMessage: (orderNumber) =>
      `Здравствуйте, хочу получить поддержку по заказу MedyaTora. Номер заказа: ${orderNumber}`,
    statuses: {
      pending_payment: "Ожидает оплаты",
      pending: "Заказ принят",
      processing: "В обработке",
      in_progress: "Выполняется",
      completed: "Завершено",
      cancelled: "Отменено",
      refunded: "Возврат выполнен",
      partial_refunded: "Частично завершено",
      failed: "Ошибка",
    },
    statusDescriptions: {
      pending_payment: "Ваш заказ создан и ожидает подтверждения оплаты.",
      pending: "Ваш заказ принят и добавлен в очередь.",
      processing: "Ваш заказ готовится к обработке.",
      in_progress: "Ваш заказ сейчас выполняется.",
      completed: "Ваш заказ успешно завершен.",
      cancelled: "Ваш заказ отменен.",
      refunded: "Сумма заказа была возвращена.",
      partial_refunded:
        "Большая часть заказа выполнена. За недоставленную часть выполнен возврат на баланс.",
      failed: "Заказ не удалось завершить.",
    },
    deliverySpeedFallbacks: {
      pending_payment: "Ожидает подтверждения оплаты",
      pending: "Заказ добавлен в очередь",
      processing: "Доставка готовится",
      in_progress: "Доставка выполняется",
      completed: "Доставка завершена",
      refunded: "Сумма заказа возвращена",
      partial_refunded: "Заказ частично завершен",
      cancelled: "Заказ отменен",
      failed: "Операция завершилась ошибкой",
    },
    refundBox: {
      none: "Для этого заказа пока нет записи о возврате.",
      full: "Для этого заказа создана запись о полном возврате.",
      partial:
        "Заказ был частично выполнен, а за недостающую часть был сделан возврат.",
      exists: "Для этого заказа есть запись о возврате.",
    },
    paymentMethods: {
      turkey_bank: "Банковский перевод / EFT",
      balance: "Баланс MedyaTora",
      support: "Оплата через поддержку",
    },
  },
};

function normalizeLocale(value: unknown): Locale {
  const locale = String(value || "").trim().toLowerCase();

  if (locale === "tr" || locale === "en" || locale === "ru") {
    return locale;
  }

  return "tr";
}

function localizeCommonText(value: string | null | undefined, locale: Locale) {
  if (!value || locale === "tr") return value || "";

  const enMap: Record<string, string> = {
    Takipçi: "Followers",
    Beğeni: "Likes",
    Yorum: "Comments",
    İzlenme: "Views",
    Kaydetme: "Saves",
    Paylaşım: "Shares",
    Abone: "Subscribers",
    Üye: "Members",
    Reaksiyon: "Reactions",
    Kalite: "Quality",
    Garantisiz: "No Guarantee",
    Garantili: "Guaranteed",
    Gün: "Days",
    Hızlı: "Fast",
    Yavaş: "Slow",
    Türk: "Turkish",
    Rus: "Russian",
    Yabancı: "Global",
  };

  const ruMap: Record<string, string> = {
    Takipçi: "Подписчики",
    Beğeni: "Лайки",
    Yorum: "Комментарии",
    İzlenme: "Просмотры",
    Kaydetme: "Сохранения",
    Paylaşım: "Репосты",
    Abone: "Подписчики",
    Üye: "Участники",
    Reaksiyon: "Реакции",
    Kalite: "Качество",
    Garantisiz: "Без гарантии",
    Garantili: "С гарантией",
    Gün: "дней",
    Hızlı: "Быстро",
    Yavaş: "Медленно",
    Türk: "Турция",
    Rus: "Россия",
    Yabancı: "Глобальный",
  };

  const map = locale === "en" ? enMap : ruMap;

  return Object.entries(map).reduce((text, [from, to]) => {
    return text.replaceAll(from, to);
  }, value);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toLocaleString("tr-TR");
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-white">{value || "-"}</div>
    </div>
  );
}

function getCustomerStatusLabel(status: string, text: OrderDetailText) {
  return text.statuses[status] || status;
}

function getCustomerStatusDescription(status: string, text: OrderDetailText) {
  return text.statusDescriptions[status] || "-";
}

function getPaymentMethodText(method: string | null | undefined, text: OrderDetailText) {
  const safeMethod = String(method || "").trim();

  return text.paymentMethods[safeMethod] || safeMethod || "-";
}

function getDeliverySpeedText(
  status: string,
  speed: string | null | undefined,
  locale: Locale,
  text: OrderDetailText
) {
  if (speed && speed.trim()) {
    return localizeCommonText(speed, locale);
  }

  return text.deliverySpeedFallbacks[status] || "-";
}

function getRefundBoxText(
  status: string,
  refundedTotal: number,
  text: OrderDetailText
) {
  if (refundedTotal <= 0) {
    return text.refundBox.none;
  }

  if (status === "refunded") {
    return text.refundBox.full;
  }

  if (status === "partial_refunded") {
    return text.refundBox.partial;
  }

  return text.refundBox.exists;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const selectedLocale = normalizeLocale(
    cookieStore.get("medyatora_locale")?.value
  );
  const text = orderDetailTexts[selectedLocale];

  const resolvedParams = await params;
  const orderNumber = decodeURIComponent(resolvedParams.id || "").trim();

  if (!orderNumber) {
    notFound();
  }

  const pool = getMysqlPool();

  const [rows] = await pool.query<OrderDetailRow[]>(
    `
    SELECT
      id,
      order_number,
      batch_code,
      service_title,
      platform,
      category,
      service_id,
      site_code,
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
      status,
      start_count,
      end_count,
      completion_note,
      admin_note,
      created_at
    FROM order_requests
    WHERE order_number = ?
      AND user_id = ?
    LIMIT 1
    `,
    [orderNumber, user.id]
  );

  const order = rows[0];

  if (!order) {
    notFound();
  }

  const [refundRows] = await pool.query<RefundSummaryRow[]>(
    `
    SELECT
      totals.refunded_total,
      latest.amount AS latest_refund_amount,
      latest.currency AS latest_refund_currency,
      latest.note AS latest_refund_note,
      latest.created_at AS latest_refund_created_at
    FROM (
      SELECT COALESCE(SUM(amount), 0) AS refunded_total
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
    ) totals
    LEFT JOIN (
      SELECT amount, currency, note, created_at
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    ) latest ON 1 = 1
    `,
    [order.id, order.currency, order.id, order.currency]
  );

  const refundSummary = refundRows[0];

  const orderTotal = roundMoney(Number(order.total_price || 0));
  const refundedTotal = roundMoney(Number(refundSummary?.refunded_total || 0));
  const remainingRefundable = roundMoney(Math.max(orderTotal - refundedTotal, 0));

  const startCount =
    order.start_count === null || order.start_count === undefined
      ? null
      : Number(order.start_count);

  const endCount =
    order.end_count === null || order.end_count === undefined
      ? null
      : Number(order.end_count);

  const deliveredQuantity =
    startCount !== null && endCount !== null && endCount >= startCount
      ? Math.max(endCount - startCount, 0)
      : null;

  const missingQuantity =
    deliveredQuantity !== null
      ? Math.max(Number(order.quantity || 0) - deliveredQuantity, 0)
      : null;

  const isPartialRefunded = order.status === "partial_refunded";
  const hasRefundNote =
    refundSummary?.latest_refund_note &&
    refundSummary.latest_refund_note.trim().length > 0;

  const supportMessage = text.supportMessage(order.order_number);
  const encodedSupportMessage = encodeURIComponent(supportMessage);

  const telegramUrl = `https://t.me/medyatora?text=${encodedSupportMessage}`;
  const whatsappUrl = `https://wa.me/905530739292?text=${encodedSupportMessage}`;

  return (
    <main className="mt-premium-page px-4 py-6 text-white sm:px-6">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <div className="mt-premium-inner mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.025] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] font-black text-white">
              MT
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-white">
                MedyaTora
              </div>
              <div className="text-xs text-white/45">{text.brandSubtitle}</div>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
              <Link
                href="/hesabim"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {text.account}
              </Link>

              <Link
                href="/hesabim/siparisler"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {text.myOrders}
              </Link>

              <Link
                href="/smmtora"
                className="rounded-full border border-white/12 bg-white px-3 py-2 font-black text-black transition hover:bg-white/90"
              >
                SMMTora
              </Link>
            </nav>

            <UserMenu />
          </div>
        </header>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#080a0d]/92 shadow-[0_24px_100px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.03] backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  {text.orderCenter}
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  {text.orderDetail}
                </h1>

                <p className="mt-4 text-sm text-white/55">
                  {text.orderNo}:{" "}
                  <span className="font-bold text-white">
                    {order.order_number}
                  </span>
                </p>

                <p className="mt-1 text-sm text-white/45">
                  {formatOrderDate(order.created_at)}
                </p>

                <div className="mt-5">
                  <span
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${getOrderStatusClass(
                      order.status
                    )}`}
                  >
                    {getCustomerStatusLabel(order.status, text)}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                  {text.totalAmount}
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {formatOrderMoney(order.total_price, order.currency)}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  {text.paymentMethod}:{" "}
                  {getPaymentMethodText(order.payment_method, text)}
                </p>
              </div>
            </div>

            <div className="relative mt-6 max-w-3xl">
              <h2 className="text-2xl font-black text-white">
                {localizeCommonText(order.service_title, selectedLocale)}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                {getCustomerStatusDescription(order.status, text)}
              </p>
            </div>
          </div>
        </section>

        {isPartialRefunded && (
          <section className="rounded-[32px] border border-[#6b5b2a]/60 bg-[#211d11]/70 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.25)] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e7d9a4]">
                  {text.partialCompleted}
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  {text.partialRefundTitle}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  {text.partialRefundDesc}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                  {text.partialRefundExtra}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:min-w-[520px]">
                <InfoCard
                  label={text.orderQuantity}
                  value={formatQuantity(order.quantity)}
                />
                <InfoCard
                  label={text.delivered}
                  value={formatQuantity(deliveredQuantity)}
                />
                <InfoCard
                  label={text.missing}
                  value={formatQuantity(missingQuantity)}
                />
                <InfoCard
                  label={text.refundedAmount}
                  value={formatOrderMoney(refundedTotal, order.currency)}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {text.refundNote}
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                {hasRefundNote
                  ? refundSummary.latest_refund_note
                  : text.refundNoteFallback}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                {text.refundInfo}
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                {getRefundBoxText(order.status, refundedTotal, text)}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {text.refundInfoDesc}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:min-w-[520px]">
              <InfoCard
                label={text.orderAmount}
                value={formatOrderMoney(orderTotal, order.currency)}
              />
              <InfoCard
                label={text.refunded}
                value={formatOrderMoney(refundedTotal, order.currency)}
              />
              <InfoCard
                label={text.remainingRefund}
                value={formatOrderMoney(remainingRefundable, order.currency)}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            label={text.platform}
            value={localizeCommonText(order.platform, selectedLocale)}
          />
          <InfoCard
            label={text.category}
            value={localizeCommonText(order.category, selectedLocale)}
          />
          <InfoCard label={text.productCode} value={order.site_code} />
          <InfoCard
            label={text.quantity}
            value={Number(order.quantity).toLocaleString("tr-TR")}
          />
          <InfoCard
            label={text.unitPrice}
            value={`${Number(order.unit_price || 0).toFixed(2)} ${
              order.currency
            } / 1000`}
          />
          <InfoCard
            label={text.totalPrice}
            value={formatOrderMoney(order.total_price, order.currency)}
          />
          <InfoCard
            label={text.guarantee}
            value={localizeCommonText(order.guarantee_label, selectedLocale) || "-"}
          />
          <InfoCard
            label={text.deliverySpeed}
            value={getDeliverySpeedText(
              order.status,
              order.speed,
              selectedLocale,
              text
            )}
          />
          <InfoCard
            label={text.paymentMethod}
            value={getPaymentMethodText(order.payment_method, text)}
          />
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <h2 className="text-xl font-black text-white">{text.targetInfo}</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoCard
              label={text.targetUser}
              value={order.target_username || "-"}
            />

            <InfoCard
              label={text.targetLink}
              value={
                order.target_link ? (
                  <a
                    href={order.target_link}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-white underline underline-offset-4"
                  >
                    {order.target_link}
                  </a>
                ) : (
                  "-"
                )
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              {text.orderNote}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {order.order_note || text.noNote}
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <h2 className="text-xl font-black text-white">{text.supportTitle}</h2>

          <p className="mt-2 text-sm leading-6 text-white/65">
            {text.supportDesc}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/[0.09]"
            >
              {text.telegramSupport}
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
            >
              {text.whatsappSupport}
            </a>
          </div>

          <p className="mt-3 text-xs text-white/40">
            {text.readyMessage}: {supportMessage}
          </p>
        </section>
      </div>
    </main>
  );
}