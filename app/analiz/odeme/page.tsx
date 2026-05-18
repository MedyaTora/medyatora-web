import Link from "next/link";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import {
  FaArrowLeft,
  FaBuildingColumns,
  FaCheck,
  FaCircleInfo,
  FaCreditCard,
  FaHeadset,
  FaPaperPlane,
  FaReceipt,
  FaShieldHalved,
  FaWhatsapp,
} from "react-icons/fa6";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LocaleCode = "tr" | "en" | "ru";
type CurrencyCode = "TL" | "USD" | "RUB";

type PageProps = {
  searchParams?: Promise<{
    source?: string;
    currency?: string;
    price?: string;
    platform?: string;
    request_id?: string;
  }>;
};

type PaymentText = {
  backToAnalysis: string;
  badge: string;
  title: string;
  description: string;

  requestNumber: string;
  amountToPay: string;
  platform: string;

  paymentControlTitle: string;
  paymentControlDesc: string;
  selectedCurrency: string;

  paymentLabels: Record<CurrencyCode, string>;
  fallbackPrices: Record<CurrencyCode, string>;
  paymentNotes: Record<CurrencyCode, string[]>;

  socialMediaFallback: string;
  requestNotCreated: string;

  paymentInfoTitle: string;
  paymentInfoDesc: string;
  receiver: string;
  paymentReference: string;
  amount: string;
  receiverName: string;
  paymentDescriptionValue: string;

  channelTitle: string;
  channelDesc: Record<CurrencyCode, string>;
  channelBadge: Record<CurrencyCode, string>;

  step1Title: string;
  step1Desc: (requestId: string) => string;
  step2Title: string;
  step2Desc: (price: string) => string;
  step3Title: string;
  step3Desc: string;

  importantNotes: string;
  whatsappSupport: string;
  goAccountPanel: string;

  footerPoint1: string;
  footerPoint2: string;
  footerPoint3: string;
  missingRequestNotice: string;
  missingCurrencyNotice: string;
};

const WHATSAPP_NUMBER = "905530739292";

const texts: Record<LocaleCode, PaymentText> = {
  tr: {
    backToAnalysis: "Analiz sayfasına dön",
    badge: "Analiz ödeme ekranı",
    title: "Analiz talebiniz oluşturuldu",
    description:
      "Ödeme referansınızı koruyarak seçtiğiniz para birimine uygun ödeme kanalından işlemi tamamlayın. Dekont veya ödeme ekran görüntüsü destek hattına ulaştıktan sonra talebiniz manuel olarak kontrol edilir ve analiz süreci başlatılır.",

    requestNumber: "Talep numarası",
    amountToPay: "Ödenecek tutar",
    platform: "Platform",

    paymentControlTitle: "Güvenli ödeme kontrolü",
    paymentControlDesc:
      "Analiz ödemeleri manuel doğrulanır. Bu nedenle ödeme açıklaması / not alanında talep numarasının bulunması önemlidir.",
    selectedCurrency: "Seçili para birimi",

    paymentLabels: {
      TL: "Türkiye ödeme akışı",
      USD: "USD ödeme akışı",
      RUB: "RUB ödeme akışı",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Ödeme açıklamasına analiz talep numaranızı yazın.",
        "Dekont veya ödeme ekran görüntüsünü WhatsApp destek hattına gönderin.",
        "Kontrol tamamlandıktan sonra analiz talebiniz işleme alınır.",
      ],
      USD: [
        "USD ödeme kanalı için destek hattı üzerinden güncel yönlendirme alın.",
        "Ödeme notuna analiz talep numaranızı ekleyin.",
        "Ödeme görüntüsünü destek hattına ilettikten sonra talebiniz kontrol edilir.",
      ],
      RUB: [
        "RUB ödeme kanalı için destek hattı üzerinden güncel yönlendirme alın.",
        "Ödeme notuna analiz talep numaranızı ekleyin.",
        "Ödeme görüntüsünü destek hattına ilettikten sonra talebiniz kontrol edilir.",
      ],
    },

    socialMediaFallback: "Sosyal medya",
    requestNotCreated: "Talep numarası bekleniyor",

    paymentInfoTitle: "Ödeme referansı",
    paymentInfoDesc:
      "Aşağıdaki referans bilgisini ödeme açıklaması, açıklama notu veya destek mesajınızda aynen kullanın. Bu bilgi ödeme ile analiz talebinizi eşleştirmek için kullanılır.",
    receiver: "Alıcı / hizmet sağlayıcı",
    paymentReference: "Ödeme referansı",
    amount: "Tutar",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Analiz Talebi",

    channelTitle: "Ödeme kanalı",
    channelDesc: {
      TL: "TL ödemelerde banka transferi / EFT yönlendirmesi destek hattı üzerinden teyit edilir.",
      USD: "USD ödemelerde güncel ödeme kanalı destek hattı üzerinden paylaşılır.",
      RUB: "RUB ödemelerde güncel ödeme kanalı destek hattı üzerinden paylaşılır.",
    },
    channelBadge: {
      TL: "TL ödeme",
      USD: "USD ödeme",
      RUB: "RUB ödeme",
    },

    step1Title: "Referansı kopyalayın",
    step1Desc: (requestId) =>
      `Ödeme açıklaması veya destek mesajında “Analiz Talebi - ${requestId}” bilgisini kullanın.`,
    step2Title: "Ödemeyi tamamlayın",
    step2Desc: (price) =>
      `${price} tutarındaki analiz ödemesini seçtiğiniz para birimine uygun kanaldan tamamlayın.`,
    step3Title: "Dekontu destek hattına gönderin",
    step3Desc:
      "Dekont veya ekran görüntüsü geldikten sonra ödeme kontrolü yapılır ve analiz talebiniz ekip tarafından işleme alınır.",

    importantNotes: "Önemli notlar",
    whatsappSupport: "WhatsApp destek",
    goAccountPanel: "Hesabım paneline git",

    missingRequestNotice:
      "Talep numarası eksik görünüyor. Ödeme sayfasına yönlenmeden önce analiz talebinizin oluşturulduğundan emin olun.",
    missingCurrencyNotice:
      "Para birimi bilgisi eksik. Lütfen tekrar deneyin veya analiz sayfasına geri dönün.",

    footerPoint1: "Talep numarası korunur",
    footerPoint2: "Ödeme sonrası manuel kontrol yapılır",
    footerPoint3: "Analiz sonucu iletişim kanalınızdan paylaşılır",
  },

  en: {
    backToAnalysis: "Back to analysis page",
    badge: "Analysis payment screen",
    title: "Your analysis request has been created",
    description:
      "Complete the payment through the correct channel for your selected currency while keeping your payment reference. After the receipt or screenshot reaches support, your request is manually verified and the analysis process begins.",

    requestNumber: "Request number",
    amountToPay: "Amount to pay",
    platform: "Platform",

    paymentControlTitle: "Secure payment verification",
    paymentControlDesc:
      "Analysis payments are verified manually. For this reason, the request number should be included in the payment description or note field.",
    selectedCurrency: "Selected currency",

    paymentLabels: {
      TL: "Turkey payment flow",
      USD: "USD payment flow",
      RUB: "RUB payment flow",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Write your analysis request number in the payment description.",
        "Send the receipt or payment screenshot to WhatsApp support.",
        "After verification, your analysis request will be processed.",
      ],
      USD: [
        "Ask support for the current USD payment channel.",
        "Add your analysis request number to the payment note.",
        "After sending the payment screenshot to support, your request will be verified.",
      ],
      RUB: [
        "Ask support for the current RUB payment channel.",
        "Add your analysis request number to the payment note.",
        "After sending the payment screenshot to support, your request will be verified.",
      ],
    },

    socialMediaFallback: "Social media",
    requestNotCreated: "Request number pending",

    paymentInfoTitle: "Payment reference",
    paymentInfoDesc:
      "Use the reference below exactly in the payment description, payment note, or support message. This information is used to match your payment with your analysis request.",
    receiver: "Receiver / service provider",
    paymentReference: "Payment reference",
    amount: "Amount",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Analysis Request",

    channelTitle: "Payment channel",
    channelDesc: {
      TL: "For TL payments, bank transfer / EFT instructions are confirmed through support.",
      USD: "For USD payments, the current payment channel is shared through support.",
      RUB: "For RUB payments, the current payment channel is shared through support.",
    },
    channelBadge: {
      TL: "TL payment",
      USD: "USD payment",
      RUB: "RUB payment",
    },

    step1Title: "Copy the reference",
    step1Desc: (requestId) =>
      `Use “Analysis Request - ${requestId}” in the payment description or support message.`,
    step2Title: "Complete the payment",
    step2Desc: (price) =>
      `Complete the analysis payment of ${price} through the correct channel for your selected currency.`,
    step3Title: "Send the receipt to support",
    step3Desc:
      "After the receipt or screenshot is received, the payment is verified and your analysis request is processed by the team.",

    importantNotes: "Important notes",
    whatsappSupport: "WhatsApp support",
    goAccountPanel: "Go to account panel",

    missingRequestNotice:
      "The request number appears to be missing. Make sure the analysis request was created before proceeding to payment.",
    missingCurrencyNotice:
      "Currency information is missing. Please retry or return to the analysis page.",

    

    footerPoint1: "Request number is preserved",
    footerPoint2: "Manual verification is done after payment",
    footerPoint3: "The analysis result is shared through your contact channel",
  },

  ru: {
    backToAnalysis: "Вернуться к странице анализа",
    badge: "Экран оплаты анализа",
    title: "Ваша заявка на анализ создана",
    description:
      "Завершите оплату через подходящий канал для выбранной валюты, сохранив платёжную ссылку. После получения чека или скриншота поддержкой заявка будет вручную проверена, и процесс анализа начнётся.",

    requestNumber: "Номер заявки",
    amountToPay: "Сумма к оплате",
    platform: "Платформа",

    paymentControlTitle: "Безопасная проверка оплаты",
    paymentControlDesc:
      "Оплаты анализа проверяются вручную. Поэтому номер заявки должен быть указан в описании или примечании к платежу.",
    selectedCurrency: "Выбранная валюта",

    paymentLabels: {
      TL: "Платёжный поток для Турции",
      USD: "Платёжный поток USD",
      RUB: "Платёжный поток RUB",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Укажите номер заявки на анализ в описании платежа.",
        "Отправьте чек или скриншот оплаты в поддержку WhatsApp.",
        "После проверки заявка на анализ будет обработана.",
      ],
      USD: [
        "Запросите актуальный платёжный канал USD у поддержки.",
        "Добавьте номер заявки на анализ в примечание к оплате.",
        "После отправки скриншота оплаты заявка будет проверена.",
      ],
      RUB: [
        "Запросите актуальный платёжный канал RUB у поддержки.",
        "Добавьте номер заявки на анализ в примечание к оплате.",
        "После отправки скриншота оплаты заявка будет проверена.",
      ],
    },

    socialMediaFallback: "Социальные сети",
    requestNotCreated: "Номер заявки ожидается",

    paymentInfoTitle: "Платёжная ссылка",
    paymentInfoDesc:
      "Используйте указанную ниже ссылку в описании платежа, примечании или сообщении в поддержку. Эта информация помогает сопоставить оплату с заявкой на анализ.",
    receiver: "Получатель / поставщик услуги",
    paymentReference: "Платёжная ссылка",
    amount: "Сумма",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Заявка на анализ",

    channelTitle: "Платёжный канал",
    channelDesc: {
      TL: "Для оплаты в TL инструкции по банковскому переводу подтверждаются через поддержку.",
      USD: "Для оплаты в USD актуальный платёжный канал передаётся через поддержку.",
      RUB: "Для оплаты в RUB актуальный платёжный канал передаётся через поддержку.",
    },
    channelBadge: {
      TL: "Оплата TL",
      USD: "Оплата USD",
      RUB: "Оплата RUB",
    },

    step1Title: "Скопируйте ссылку",
    step1Desc: (requestId) =>
      `Используйте “Заявка на анализ - ${requestId}” в описании платежа или сообщении в поддержку.`,
    step2Title: "Завершите оплату",
    step2Desc: (price) =>
      `Завершите оплату анализа на сумму ${price} через подходящий канал для выбранной валюты.`,
    step3Title: "Отправьте чек в поддержку",
    step3Desc:
      "После получения чека или скриншота оплата проверяется, и заявка на анализ передаётся команде.",

    importantNotes: "Важные заметки",
    whatsappSupport: "Поддержка WhatsApp",
    goAccountPanel: "Перейти в аккаунт",

    missingRequestNotice:
      "Похоже, отсутствует номер заявки. Убедитесь, что заявка создана перед оплатой.",
    missingCurrencyNotice:
      "Отсутствует информация о валюте. Пожалуйста, повторите попытку или вернитесь на страницу анализа.",

    footerPoint1: "Номер заявки сохраняется",
    footerPoint2: "После оплаты проводится ручная проверка",
    footerPoint3: "Результат анализа отправляется через выбранный канал связи",
  },
};

function normalizeCurrency(value?: string): CurrencyCode {
  const upperValue = String(value || "").toUpperCase();

  if (upperValue === "USD") return "USD";
  if (upperValue === "RUB") return "RUB";

  return "TL";
}

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

function getSafeText(value: string | undefined, fallback: string) {
  const cleanValue = String(value || "").trim();
  return cleanValue || fallback;
}

function buildWhatsappSupportLink({
  requestId,
  price,
  currency,
  platform,
  locale,
}: {
  requestId: string;
  price: string;
  currency: CurrencyCode;
  platform: string;
  locale: LocaleCode;
}) {
  const messages: Record<LocaleCode, string> = {
    tr: `Merhaba, analiz ödemesi için dekont iletmek istiyorum.

Talep numarası: ${requestId}
Platform: ${platform}
Tutar: ${price}
Para birimi: ${currency}
Ödeme referansı: Analiz Talebi - ${requestId}`,

    en: `Hello, I would like to send the receipt for my analysis payment.

Request number: ${requestId}
Platform: ${platform}
Amount: ${price}
Currency: ${currency}
Payment reference: Analysis Request - ${requestId}`,

    ru: `Здравствуйте, хочу отправить чек по оплате анализа.

Номер заявки: ${requestId}
Платформа: ${platform}
Сумма: ${price}
Валюта: ${currency}
Платёжная ссылка: Заявка на анализ - ${requestId}`,
  };

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    messages[locale]
  )}`;
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
        {icon}
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-black leading-7 text-white">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black leading-6 text-white">
        {value}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-sm font-black text-white">
        {number}
      </div>

      <h3 className="text-lg font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
    </div>
  );
}

export default async function AnalysisPaymentPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};

  const locale = await getServerLocale();
  const t = texts[locale] || texts.tr;

  const currency = normalizeCurrency(params.currency);
  const price = getSafeText(params.price, t.fallbackPrices[currency]);
  const platform = getSafeText(params.platform, t.socialMediaFallback);
  const requestId = getSafeText(params.request_id, t.requestNotCreated);
  const referenceText = `${t.paymentDescriptionValue} - ${requestId}`;

  const missingRequest = !params.request_id;
  const missingCurrency = !params.currency;

  const whatsappSupportLink = buildWhatsappSupportLink({
    requestId,
    price,
    currency,
    platform,
    locale,
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050608] px-4 py-8 text-white md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.045),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:58px_58px] opacity-[0.13]" />

      <section className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/analiz"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/78 transition hover:bg-white/[0.075] hover:text-white"
          >
            <FaArrowLeft />
            {t.backToAnalysis}
          </Link>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
            MedyaTora
          </div>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#080a0d]/95 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.025] md:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_0.82fr]">
            <div>
              {(missingRequest || missingCurrency) && (
                <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/8 p-4 text-sm text-yellow-200">
                  {missingRequest && <div>{t.missingRequestNotice}</div>}
                  {missingCurrency && <div className="mt-1">{t.missingCurrencyNotice}</div>}
                  <div className="mt-2">
                    <Link href="/analiz" className="font-black underline">
                      {t.backToAnalysis}
                    </Link>
                  </div>
                </div>
              )}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/72">
                <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
                {t.badge}
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                {t.title}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/62 md:text-base">
                {t.description}
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <InfoCard
                  icon={<FaReceipt />}
                  label={t.requestNumber}
                  value={requestId}
                />

                <InfoCard
                  icon={<FaCreditCard />}
                  label={t.amountToPay}
                  value={price}
                />

                <InfoCard
                  icon={<FaPaperPlane />}
                  label={t.platform}
                  value={platform}
                />
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
                <FaShieldHalved />
              </div>

              <h2 className="text-2xl font-black text-white">
                {t.paymentControlTitle}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                {t.paymentControlDesc}
              </p>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/38">
                  {t.selectedCurrency}
                </p>

                <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {currency}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/56">
                  {t.paymentLabels[currency]}
                </p>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/38">
                  {t.channelTitle}
                </p>

                <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-white">
                  {t.channelBadge[currency]}
                </div>

                <p className="mt-3 text-sm leading-6 text-white/58">
                  {t.channelDesc[currency]}
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
                <FaBuildingColumns />
              </div>

              <h2 className="text-2xl font-black text-white">
                {t.paymentInfoTitle}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                {t.paymentInfoDesc}
              </p>

              <div className="mt-5 space-y-3">
                <DetailRow label={t.receiver} value={t.receiverName} />
                <DetailRow label={t.paymentReference} value={referenceText} />
                <DetailRow label={t.amount} value={price} />
              </div>
            </div>

            <div className="grid gap-4">
              <StepCard
                number="1"
                title={t.step1Title}
                description={t.step1Desc(requestId)}
              />

              <StepCard
                number="2"
                title={t.step2Title}
                description={t.step2Desc(price)}
              />

              <StepCard
                number="3"
                title={t.step3Title}
                description={t.step3Desc}
              />
            </div>
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/25 p-5">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/70">
                  <FaCircleInfo />
                  {t.importantNotes}
                </div>

                <ul className="space-y-3 text-sm leading-6 text-white/62">
                  {t.paymentNotes[currency].map((note) => (
                    <li key={note} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={whatsappSupportLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-5 py-3 text-sm font-black text-black transition hover:bg-white"
                >
                  <FaWhatsapp />
                  {t.whatsappSupport}
                </a>

                <Link
                  href="/hesabim"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  <FaHeadset />
                  {t.goAccountPanel}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/48">
            <span className="inline-flex items-center gap-2">
              <FaCheck className="text-white/70" />
              {t.footerPoint1}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/24 sm:block" />
            <span>{t.footerPoint2}</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/24 sm:block" />
            <span>{t.footerPoint3}</span>
          </div>
        </div>
      </section>
    </main>
  );
}