import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";
import ContactVerificationCard from "@/app/components/auth/ContactVerificationCard";
import EmailVerificationCard from "@/app/components/auth/EmailVerificationCard";


type LocaleCode = "tr" | "en" | "ru";

type OrderRow = RowDataPacket & {
  id: number;
  order_number: string;
  batch_code: string | null;
  service_title: string;
  platform: string;
  category: string;
  quantity: number;
  total_price: string | number;
  currency: string;
  status: string;
  payment_method: string | null;
  target_username: string | null;
  created_at: Date | string;
};

type AnalysisRow = RowDataPacket & {
  id: number;
  coupon_code: string | null;
  package_price: string | number;
  currency: string;
  status: string;
  is_free_analysis: number;
  analysis_price_usd: string | number;
  created_at: Date | string;
  customer_full_name: string | null;
  username: string | null;
  account_link: string | null;
  account_type: string | null;
  content_type: string | null;
};

type BalanceTransactionRow = RowDataPacket & {
  id: number;
  transaction_type: string;
  currency: string;
  amount: string | number;
  balance_before: string | number;
  balance_after: string | number;
  description: string | null;
  related_order_id: number | null;
  created_at: Date | string;
};

type OrderStatsRow = RowDataPacket & {
  total_orders: string | number;
  completed_orders: string | number;
  active_orders: string | number;
};

type AnalysisStatsRow = RowDataPacket & {
  total_analysis_requests: string | number;
  pending_analysis_requests: string | number;
};

type AccountText = {
  accountSubtitle: string;
  home: string;
  analysis: string;
  packages: string;
  myAccount: string;
  welcomePrefix: string;
  intro: string;
  createNewOrder: string;
  leaveAnalysisRequest: string;
  walletBalances: string;
  walletDesc: string;
  shopWithBalance: string;
  tlWallet: string;
  usdWallet: string;
  rubWallet: string;
  tlWalletDesc: string;
  usdWalletDesc: string;
  rubWalletDesc: string;
  freeAnalysisRight: string;
  active: string;
  used: string;
  waiting: string;
  freeAnalysisDesc: string;
  contactBonus: string;
  granted: string;
  contactBonusDesc: string;
  totalOrders: string;
  totalOrdersDesc: string;
  activeProcess: string;
  completedOrders: string;
  analysisRequest: string;
  pendingCount: string;
  balanceMovements: string;
  latestBalanceTransactions: string;
  latestFiveBalanceDesc: string;
  noBalanceTransaction: string;
  noBalanceTransactionDesc: string;
  noDescription: string;
  amount: string;
  finalBalance: string;
  analysisHistory: string;
  yourAnalysisRequests: string;
  latestFiveAnalysisDesc: string;
  newAnalysisRequest: string;
  noAnalysisRequest: string;
  noAnalysisRequestDesc: string;
  analysisRequestButton: string;
  free: string;
  userLabel: string;
  accountType: string;
  content: string;
  date: string;
  analysisPrice: string;
  orderHistory: string;
  latestOrders: string;
  latestOrdersDesc: string;
  viewAllOrders: string;
  noOrder: string;
  noOrderDesc: string;
  firstOrderButton: string;
  order: string;
  service: string;
  total: string;
  status: string;
  detail: string;
  orderNo: string;
  target: string;
  statusLabels: Record<string, string>;
  transactionTypeLabels: Record<string, string>;
};

const texts: Record<LocaleCode, AccountText> = {
  tr: {
    accountSubtitle: "Kullanıcı hesabı",
    home: "Ana Sayfa",
    analysis: "Analiz",
    packages: "Paketler",
    myAccount: "Hesabım",
    welcomePrefix: "Hoş geldin",
    intro:
      "Bu alanda bakiyelerini, ücretsiz analiz hakkını, doğrulama durumunu, siparişlerini, analiz taleplerini ve son bakiye hareketlerini takip edebilirsin.",
    createNewOrder: "Yeni Sipariş Oluştur",
    leaveAnalysisRequest: "Analiz Talebi Bırak",
    walletBalances: "Cüzdan Bakiyeleri",
    walletDesc:
      "TL, USD ve RUB bakiyeleri ayrı tutulur. Sipariş hangi para birimiyle oluşturulursa ödeme o cüzdandan düşer.",
    shopWithBalance: "Bakiye ile alışveriş",
    tlWallet: "TL Cüzdanı",
    usdWallet: "USD Cüzdanı",
    rubWallet: "RUB Cüzdanı",
    tlWalletDesc: "TL ile verilen siparişlerde kullanılır.",
    usdWalletDesc: "USD ile verilen siparişlerde kullanılır.",
    rubWalletDesc: "RUB ile verilen siparişlerde kullanılır.",
    freeAnalysisRight: "Ücretsiz analiz hakkı",
    active: "Aktif",
    used: "Kullanıldı",
    waiting: "Bekliyor",
    freeAnalysisDesc:
      "E-posta doğrulaması tamamlanınca 1 ücretsiz analiz hakkı tanımlanır.",
    contactBonus: "İletişim bonusu",
    granted: "Tanımlandı",
    contactBonusDesc:
      "WhatsApp veya Telegram doğrulamasından biri yeterlidir. Bonus yalnızca 1 kez verilir.",
    totalOrders: "Toplam sipariş",
    totalOrdersDesc: "Ana ekranda son 5 sipariş görünür.",
    activeProcess: "Aktif işlem",
    completedOrders: "Tamamlanan",
    analysisRequest: "Analiz talebi",
    pendingCount: "Bekleyen",
    balanceMovements: "Bakiye hareketleri",
    latestBalanceTransactions: "Son bakiye işlemleri",
    latestFiveBalanceDesc: "Bu alanda sadece son 5 bakiye hareketi gösterilir.",
    noBalanceTransaction: "Henüz bakiye hareketi yok.",
    noBalanceTransactionDesc:
      "Bakiye yükleme, sipariş ödemesi veya iade işlemleri olduğunda burada görünecek.",
    noDescription: "Açıklama yok.",
    amount: "Tutar",
    finalBalance: "Son bakiye",
    analysisHistory: "Analiz geçmişi",
    yourAnalysisRequests: "Analiz taleplerin",
    latestFiveAnalysisDesc: "Bu alanda son 5 analiz talebi gösterilir.",
    newAnalysisRequest: "Yeni Analiz Talebi",
    noAnalysisRequest: "Henüz hesabına bağlı analiz talebi yok.",
    noAnalysisRequestDesc:
      "Giriş yapmış halde analiz talebi bıraktığında burada görünecek.",
    analysisRequestButton: "Analiz Talebi Bırak",
    free: "Ücretsiz",
    userLabel: "Kullanıcı",
    accountType: "Hesap türü",
    content: "İçerik",
    date: "Tarih",
    analysisPrice: "Analiz fiyatı",
    orderHistory: "Sipariş geçmişi",
    latestOrders: "Son siparişlerin",
    latestOrdersDesc:
      "Bu alanda son 5 sipariş görünür. Eski siparişlerini tüm siparişler sayfasından görebilirsin.",
    viewAllOrders: "Tüm Siparişleri Gör",
    noOrder: "Henüz hesabına bağlı sipariş yok.",
    noOrderDesc: "Giriş yapmış halde sipariş oluşturduğunda burada görünecek.",
    firstOrderButton: "İlk Siparişi Oluştur",
    order: "Sipariş",
    service: "Hizmet",
    total: "Tutar",
    status: "Durum",
    detail: "Detay",
    orderNo: "Sipariş No",
    target: "Hedef",
    statusLabels: {
      pending_payment: "Ödeme Onaylanıyor",
      pending: "Sipariş Alındı",
      processing: "İşleme Alındı",
      in_progress: "Devam Ediyor",
      completed: "Tamamlandı",
      cancelled: "İptal Edildi",
      refunded: "İade Edildi",
      partial_refunded: "Kısmi Tamamlandı",
      failed: "Başarısız",
    },
    transactionTypeLabels: {
      topup: "Bakiye Yükleme",
      balance_topup: "Bakiye Yükleme",
      order_payment: "Sipariş Ödemesi",
      order_refund: "Sipariş İadesi",
      order_partial_refund: "Kısmi İade",
      welcome_bonus: "Hoş Geldin Bonusu",
      welcome_google_bonus: "Google Kayıt Bonusu",
      contact_verification_bonus: "İletişim Doğrulama Bonusu",
      email_verification_bonus: "E-posta Doğrulama Bonusu",
    },
  },

  en: {
    accountSubtitle: "User account",
    home: "Home",
    analysis: "Analysis",
    packages: "Packages",
    myAccount: "My Account",
    welcomePrefix: "Welcome",
    intro:
      "Here you can track your balances, free analysis right, verification status, orders, analysis requests, and latest balance activity.",
    createNewOrder: "Create New Order",
    leaveAnalysisRequest: "Submit Analysis Request",
    walletBalances: "Wallet Balances",
    walletDesc:
      "TL, USD, and RUB balances are kept separately. The order is paid from the wallet matching the currency used.",
    shopWithBalance: "Shop with balance",
    tlWallet: "TL Wallet",
    usdWallet: "USD Wallet",
    rubWallet: "RUB Wallet",
    tlWalletDesc: "Used for orders created in TL.",
    usdWalletDesc: "Used for orders created in USD.",
    rubWalletDesc: "Used for orders created in RUB.",
    freeAnalysisRight: "Free analysis right",
    active: "Active",
    used: "Used",
    waiting: "Waiting",
    freeAnalysisDesc:
      "When email verification is completed, 1 free analysis right is assigned.",
    contactBonus: "Contact bonus",
    granted: "Granted",
    contactBonusDesc:
      "One WhatsApp or Telegram verification is enough. The bonus is given only once.",
    totalOrders: "Total orders",
    totalOrdersDesc: "The latest 5 orders appear on the main account screen.",
    activeProcess: "Active process",
    completedOrders: "Completed",
    analysisRequest: "Analysis request",
    pendingCount: "Pending",
    balanceMovements: "Balance activity",
    latestBalanceTransactions: "Latest balance transactions",
    latestFiveBalanceDesc: "Only the latest 5 balance transactions are shown here.",
    noBalanceTransaction: "No balance activity yet.",
    noBalanceTransactionDesc:
      "Top-ups, order payments, or refunds will appear here when they happen.",
    noDescription: "No description.",
    amount: "Amount",
    finalBalance: "Final balance",
    analysisHistory: "Analysis history",
    yourAnalysisRequests: "Your analysis requests",
    latestFiveAnalysisDesc: "The latest 5 analysis requests are shown here.",
    newAnalysisRequest: "New Analysis Request",
    noAnalysisRequest: "No analysis request is linked to your account yet.",
    noAnalysisRequestDesc:
      "When you submit an analysis request while logged in, it will appear here.",
    analysisRequestButton: "Submit Analysis Request",
    free: "Free",
    userLabel: "User",
    accountType: "Account type",
    content: "Content",
    date: "Date",
    analysisPrice: "Analysis price",
    orderHistory: "Order history",
    latestOrders: "Your latest orders",
    latestOrdersDesc:
      "The latest 5 orders appear here. You can view older orders from the all orders page.",
    viewAllOrders: "View All Orders",
    noOrder: "No order is linked to your account yet.",
    noOrderDesc: "When you create an order while logged in, it will appear here.",
    firstOrderButton: "Create First Order",
    order: "Order",
    service: "Service",
    total: "Total",
    status: "Status",
    detail: "Detail",
    orderNo: "Order No",
    target: "Target",
    statusLabels: {
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
    transactionTypeLabels: {
      topup: "Balance Top-up",
      balance_topup: "Balance Top-up",
      order_payment: "Order Payment",
      order_refund: "Order Refund",
      order_partial_refund: "Partial Refund",
      welcome_bonus: "Welcome Bonus",
      welcome_google_bonus: "Google Signup Bonus",
      contact_verification_bonus: "Contact Verification Bonus",
      email_verification_bonus: "Email Verification Bonus",
    },
  },

  ru: {
    accountSubtitle: "Аккаунт пользователя",
    home: "Главная",
    analysis: "Анализ",
    packages: "Пакеты",
    myAccount: "Мой аккаунт",
    welcomePrefix: "Добро пожаловать",
    intro:
      "Здесь вы можете отслеживать балансы, право на бесплатный анализ, статус верификации, заказы, заявки на анализ и последние операции по балансу.",
    createNewOrder: "Создать новый заказ",
    leaveAnalysisRequest: "Оставить заявку на анализ",
    walletBalances: "Балансы кошельков",
    walletDesc:
      "Балансы TL, USD и RUB хранятся отдельно. Заказ оплачивается из кошелька той валюты, в которой он создан.",
    shopWithBalance: "Покупка с баланса",
    tlWallet: "Кошелёк TL",
    usdWallet: "Кошелёк USD",
    rubWallet: "Кошелёк RUB",
    tlWalletDesc: "Используется для заказов в TL.",
    usdWalletDesc: "Используется для заказов в USD.",
    rubWalletDesc: "Используется для заказов в RUB.",
    freeAnalysisRight: "Право на бесплатный анализ",
    active: "Активно",
    used: "Использовано",
    waiting: "Ожидает",
    freeAnalysisDesc:
      "После подтверждения e-mail назначается 1 право на бесплатный анализ.",
    contactBonus: "Бонус за контакт",
    granted: "Назначен",
    contactBonusDesc:
      "Достаточно одной верификации WhatsApp или Telegram. Бонус выдаётся только один раз.",
    totalOrders: "Всего заказов",
    totalOrdersDesc: "На главном экране аккаунта видны последние 5 заказов.",
    activeProcess: "Активный процесс",
    completedOrders: "Завершено",
    analysisRequest: "Заявка на анализ",
    pendingCount: "Ожидает",
    balanceMovements: "Операции по балансу",
    latestBalanceTransactions: "Последние операции по балансу",
    latestFiveBalanceDesc:
      "Здесь показываются только последние 5 операций по балансу.",
    noBalanceTransaction: "Операций по балансу пока нет.",
    noBalanceTransactionDesc:
      "Пополнения, оплаты заказов или возвраты появятся здесь после выполнения.",
    noDescription: "Нет описания.",
    amount: "Сумма",
    finalBalance: "Итоговый баланс",
    analysisHistory: "История анализа",
    yourAnalysisRequests: "Ваши заявки на анализ",
    latestFiveAnalysisDesc: "Здесь показываются последние 5 заявок на анализ.",
    newAnalysisRequest: "Новая заявка на анализ",
    noAnalysisRequest: "К аккаунту пока не привязана заявка на анализ.",
    noAnalysisRequestDesc:
      "Когда вы оставите заявку на анализ в аккаунте, она появится здесь.",
    analysisRequestButton: "Оставить заявку на анализ",
    free: "Бесплатно",
    userLabel: "Пользователь",
    accountType: "Тип аккаунта",
    content: "Контент",
    date: "Дата",
    analysisPrice: "Цена анализа",
    orderHistory: "История заказов",
    latestOrders: "Ваши последние заказы",
    latestOrdersDesc:
      "Здесь видны последние 5 заказов. Старые заказы можно посмотреть на странице всех заказов.",
    viewAllOrders: "Посмотреть все заказы",
    noOrder: "К аккаунту пока не привязан заказ.",
    noOrderDesc: "Когда вы создадите заказ в аккаунте, он появится здесь.",
    firstOrderButton: "Создать первый заказ",
    order: "Заказ",
    service: "Услуга",
    total: "Сумма",
    status: "Статус",
    detail: "Детали",
    orderNo: "№ заказа",
    target: "Цель",
    statusLabels: {
      pending_payment: "Ожидает оплаты",
      pending: "Заказ получен",
      processing: "В обработке",
      in_progress: "В процессе",
      completed: "Завершено",
      cancelled: "Отменено",
      refunded: "Возврат выполнен",
      partial_refunded: "Частично завершено",
      failed: "Ошибка",
    },
    transactionTypeLabels: {
      topup: "Пополнение баланса",
      balance_topup: "Пополнение баланса",
      order_payment: "Оплата заказа",
      order_refund: "Возврат заказа",
      order_partial_refund: "Частичный возврат",
      welcome_bonus: "Приветственный бонус",
      welcome_google_bonus: "Бонус за регистрацию Google",
      contact_verification_bonus: "Бонус за подтверждение контакта",
      email_verification_bonus: "Бонус за подтверждение e-mail",
    },
  },
};

const statusClasses: Record<string, string> = {
  pending_payment: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  pending: "border-white/12 bg-white/[0.06] text-white/72",
  processing: "border-white/12 bg-white/[0.06] text-white/72",
  in_progress: "border-white/12 bg-white/[0.06] text-white/72",
  completed: "border-white/18 bg-white/[0.08] text-white",
  cancelled: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
  refunded: "border-white/12 bg-white/[0.06] text-white/72",
  partial_refunded: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  failed: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
};

function normalizeLocale(value: unknown): LocaleCode | null {
  const locale = String(value || "").trim().toLowerCase();

  if (locale === "tr" || locale === "en" || locale === "ru") {
    return locale;
  }

  return null;
}

async function getServerLocale(): Promise<LocaleCode> {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(
    cookieStore.get("medyatora_locale")?.value
  );

  if (cookieLocale) return cookieLocale;

  const headersList = await headers();
  const acceptLanguage = String(
    headersList.get("accept-language") || ""
  ).toLowerCase();

  if (acceptLanguage.startsWith("tr")) return "tr";
  if (acceptLanguage.startsWith("ru")) return "ru";

  return "en";
}

function formatMoney(value: string | number, currency: string) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0,00 ${currency}`;
  }

  return `${numberValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatSignedMoney(value: string | number, currency: string) {
  const numberValue = Number(value || 0);
  const sign = numberValue > 0 ? "+" : "";

  return `${sign}${formatMoney(numberValue, currency)}`;
}

function formatDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string, t: AccountText) {
  return t.statusLabels[status] || status;
}

function getStatusClass(status: string) {
  return (
    statusClasses[status] || "border-white/10 bg-white/[0.06] text-white/70"
  );
}

function getTransactionTypeLabel(
  type: string | null | undefined,
  t: AccountText
) {
  if (!type) return "-";
  return t.transactionTypeLabels[type] || type;
}

function getTransactionAmountClass(value: string | number) {
  const numberValue = Number(value || 0);

  if (numberValue > 0) return "text-white";
  if (numberValue < 0) return "text-[#f2c7d1]";

  return "text-white/70";
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const locale = await getServerLocale();
  const t = texts[locale] || texts.tr;

  const pool = getMysqlPool();

  const [orders] = await pool.query<OrderRow[]>(
    `
    SELECT
      id,
      order_number,
      batch_code,
      service_title,
      platform,
      category,
      quantity,
      total_price,
      currency,
      status,
      payment_method,
      target_username,
      created_at
    FROM order_requests
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 5
    `,
    [user.id]
  );

  const [analysisRequests] = await pool.query<AnalysisRow[]>(
    `
    SELECT
      analysis_requests.id,
      analysis_requests.coupon_code,
      analysis_requests.package_price,
      analysis_requests.currency,
      analysis_requests.status,
      analysis_requests.is_free_analysis,
      analysis_requests.analysis_price_usd,
      analysis_requests.created_at,
      customers.full_name AS customer_full_name,
      customers.username,
      customers.account_link,
      customers.account_type,
      customers.content_type
    FROM analysis_requests
    INNER JOIN customers ON customers.id = analysis_requests.customer_id
    WHERE analysis_requests.user_id = ?
    ORDER BY analysis_requests.id DESC
    LIMIT 5
    `,
    [user.id]
  );

  const [balanceTransactions] = await pool.query<BalanceTransactionRow[]>(
    `
    SELECT
      id,
      transaction_type,
      currency,
      amount,
      balance_before,
      balance_after,
      description,
      related_order_id,
      created_at
    FROM balance_transactions
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 5
    `,
    [user.id]
  );

  const [orderStatsRows] = await pool.query<OrderStatsRow[]>(
    `
    SELECT
      COUNT(*) AS total_orders,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
      SUM(
        CASE
          WHEN status IN ('pending_payment', 'pending', 'processing', 'in_progress')
          THEN 1
          ELSE 0
        END
      ) AS active_orders
    FROM order_requests
    WHERE user_id = ?
    `,
    [user.id]
  );

  const [analysisStatsRows] = await pool.query<AnalysisStatsRow[]>(
    `
    SELECT
      COUNT(*) AS total_analysis_requests,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_analysis_requests
    FROM analysis_requests
    WHERE user_id = ?
    `,
    [user.id]
  );

  const orderStats = orderStatsRows[0];
  const analysisStats = analysisStatsRows[0];

  const totalOrders = Number(orderStats?.total_orders || 0);
  const completedOrders = Number(orderStats?.completed_orders || 0);
  const activeOrders = Number(orderStats?.active_orders || 0);

  const totalAnalysisRequests = Number(
    analysisStats?.total_analysis_requests || 0
  );

  const pendingAnalysisRequests = Number(
    analysisStats?.pending_analysis_requests || 0
  );

  const userWithExtraFields = user as typeof user & {
    email_verified?: boolean;
    email_verified_at?: string | null;
    free_analysis_granted_at?: string | null;
    contact_bonus_granted_at?: string | null;
    whatsapp_verified_at?: string | null;
    telegram_verified_at?: string | null;
  };

  const freeAnalysisGranted = Boolean(
    userWithExtraFields.free_analysis_granted_at || !user.free_analysis_used
  );

  const contactBonusGranted = Boolean(
    userWithExtraFields.contact_bonus_granted_at
  );

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
              <div className="text-xs text-white/45">{t.accountSubtitle}</div>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {t.home}
              </Link>

              <Link
                href="/analiz"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {t.analysis}
              </Link>

              <Link
                href="/paketler"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {t.packages}
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

            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  {t.myAccount}
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  {t.welcomePrefix}, {user.full_name || user.email}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                  {t.intro}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/smmtora"
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    {t.createNewOrder}
                  </Link>

                  <Link
                    href="/analiz"
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
                  >
                    {t.leaveAnalysisRequest}
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:col-span-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                        {t.walletBalances}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {t.walletDesc}
                      </p>
                    </div>

                    <Link
                      href="/smmtora"
                      className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                    >
                      {t.shopWithBalance}
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        {t.tlWallet}
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_tl, "TL")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        {t.tlWalletDesc}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        {t.usdWallet}
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_usd, "USD")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        {t.usdWalletDesc}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        {t.rubWallet}
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_rub, "RUB")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        {t.rubWalletDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    {t.freeAnalysisRight}
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {freeAnalysisGranted && !user.free_analysis_used
                      ? t.active
                      : user.free_analysis_used
                        ? t.used
                        : t.waiting}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {t.freeAnalysisDesc}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    {t.contactBonus}
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {contactBonusGranted ? t.granted : t.waiting}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {t.contactBonusDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EmailVerificationCard
  email={user.email}
  initialEmailVerified={Boolean(user.email_verified)}
  initialFreeAnalysisGrantedAt={userWithExtraFields.free_analysis_granted_at}
/>

        <ContactVerificationCard
          initialPhoneNumber={user.phone_number}
          initialWhatsappVerifiedAt={userWithExtraFields.whatsapp_verified_at}
          initialTelegramVerifiedAt={userWithExtraFields.telegram_verified_at}
          initialContactBonusGrantedAt={
            userWithExtraFields.contact_bonus_granted_at
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              {t.totalOrders}
            </p>
            <p className="mt-3 text-3xl font-black text-white">{totalOrders}</p>
            <p className="mt-2 text-sm text-white/45">{t.totalOrdersDesc}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              {t.activeProcess}
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {activeOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              {t.completedOrders}
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              {t.analysisRequest}
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {totalAnalysisRequests}
            </p>
            <p className="mt-2 text-sm text-white/45">
              {t.pendingCount}: {pendingAnalysisRequests}
            </p>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
              {t.balanceMovements}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {t.latestBalanceTransactions}
            </h2>
            <p className="mt-2 text-sm text-white/45">
              {t.latestFiveBalanceDesc}
            </p>
          </div>

          {balanceTransactions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                {t.noBalanceTransaction}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {t.noBalanceTransactionDesc}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {balanceTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-white md:text-base">
                          {getTransactionTypeLabel(
                            transaction.transaction_type,
                            t
                          )}
                        </p>

                        <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/55">
                          {transaction.currency}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {transaction.description || t.noDescription}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <p className="text-xs text-white/40">{t.amount}</p>
                      <p
                        className={`mt-1 text-lg font-black ${getTransactionAmountClass(
                          transaction.amount
                        )}`}
                      >
                        {formatSignedMoney(
                          transaction.amount,
                          transaction.currency
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {t.finalBalance}:{" "}
                        {formatMoney(
                          transaction.balance_after,
                          transaction.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                {t.analysisHistory}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {t.yourAnalysisRequests}
              </h2>
              <p className="mt-2 text-sm text-white/45">
                {t.latestFiveAnalysisDesc}
              </p>
            </div>

            <Link
              href="/analiz"
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            >
              {t.newAnalysisRequest}
            </Link>
          </div>

          {analysisRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                {t.noAnalysisRequest}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {t.noAnalysisRequestDesc}
              </p>
              <Link
                href="/analiz"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                {t.analysisRequestButton}
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {analysisRequests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-white">
                          {t.analysis} #{item.id}
                        </p>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status, t)}
                        </span>

                        {Boolean(item.is_free_analysis) && (
                          <span className="inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/72">
                            {t.free}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-1 text-sm text-white/55">
                        <p>
                          {t.userLabel}:{" "}
                          {item.username || item.account_link || "-"}
                        </p>
                        <p>
                          {t.accountType}: {item.account_type || "-"} ·{" "}
                          {t.content}: {item.content_type || "-"}
                        </p>
                        <p>
                          {t.date}: {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <p className="text-xs text-white/40">{t.analysisPrice}</p>
                      <p className="mt-1 text-lg font-black text-white">
                        {formatMoney(
                          item.package_price,
                          item.currency || "USD"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                {t.orderHistory}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {t.latestOrders}
              </h2>
              <p className="mt-2 text-sm text-white/45">
                {t.latestOrdersDesc}
              </p>
            </div>

            <Link
              href="/hesabim/siparisler"
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            >
              {t.viewAllOrders}
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">{t.noOrder}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {t.noOrderDesc}
              </p>
              <Link
                href="/smmtora"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                {t.firstOrderButton}
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[1.1fr_1.5fr_0.75fr_0.85fr_0.9fr_0.55fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 lg:grid">
                <div>{t.order}</div>
                <div>{t.service}</div>
                <div>{t.total}</div>
                <div>{t.status}</div>
                <div>{t.date}</div>
                <div>{t.detail}</div>
              </div>

              <div className="divide-y divide-white/10">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] lg:grid-cols-[1.1fr_1.5fr_0.75fr_0.85fr_0.9fr_0.55fr] lg:items-center"
                  >
                    <div>
                      <p className="text-xs text-white/40">{t.orderNo}</p>
                      <p className="mt-1 font-bold text-white">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {t.target}: {order.target_username || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="line-clamp-2 text-sm font-bold text-white">
                        {order.service_title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {order.platform} / {order.category} ·{" "}
                        {Number(order.quantity).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">
                        {formatMoney(order.total_price, order.currency)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status, t)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-white/60">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div>
                      <Link
                        href={`/hesabim/siparisler/${order.order_number}`}
                        className="inline-flex rounded-2xl bg-white px-4 py-2 text-center text-xs font-black text-black transition hover:bg-white/90"
                      >
                        {t.detail}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}