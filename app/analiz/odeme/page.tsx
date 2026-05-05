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
  paymentDescription: string;
  amount: string;
  receiverName: string;
  paymentDescriptionValue: string;

  draftWarning: string;

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
};

const WHATSAPP_NUMBER = "905530739292";

const texts: Record<LocaleCode, PaymentText> = {
  tr: {
    backToAnalysis: "Analiz sayfasına dön",
    badge: "Analiz ödeme ekranı",
    title: "Analiz talebiniz oluşturuldu",
    description:
      "Ödeme işlemini tamamladıktan sonra dekont veya ödeme ekran görüntüsünü destek hattına iletin. Kontrol sonrası analiz talebiniz işleme alınır ve ekip tarafından manuel olarak incelenir.",

    requestNumber: "Talep numarası",
    amountToPay: "Ödenecek tutar",
    platform: "Platform",

    paymentControlTitle: "Ödeme kontrolü",
    paymentControlDesc:
      "Analiz ödemeleri manuel kontrol edilir. Bu yüzden açıklama kısmına talep numaranızı eklemeniz önemlidir.",
    selectedCurrency: "Seçili para birimi",

    paymentLabels: {
      TL: "Türkiye ödeme bilgileri",
      USD: "Dolar ödeme bilgileri",
      RUB: "Ruble ödeme bilgileri",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Ödeme açıklamasına analiz talep numaranızı yazın.",
        "Dekontu WhatsApp veya Telegram destek hattına gönderin.",
        "Ödeme kontrolünden sonra analiz talebiniz işleme alınır.",
      ],
      USD: [
        "USD ödeme için destek hattından güncel ödeme kanalını isteyin.",
        "Ödeme açıklamasına analiz talep numaranızı ekleyin.",
        "Dekont veya ödeme ekran görüntüsünü destek hattına gönderin.",
      ],
      RUB: [
        "RUB ödeme için destek hattından güncel ödeme kanalını isteyin.",
        "Ödeme açıklamasına analiz talep numaranızı ekleyin.",
        "Dekont veya ödeme ekran görüntüsünü destek hattına gönderin.",
      ],
    },

    socialMediaFallback: "Sosyal medya",
    requestNotCreated: "Henüz oluşturulmadı",

    paymentInfoTitle: "Ödeme bilgileri",
    paymentInfoDesc:
      "Buraya banka, IBAN, Papara, ödeme sağlayıcı veya ülkeye göre kullanılacak ödeme bilgileri eklenecek.",
    receiver: "Alıcı",
    paymentDescription: "Ödeme açıklaması",
    amount: "Tutar",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Analiz Talebi",

    draftWarning:
      "Gerçek banka/ödeme bilgilerini eklemeden önce bu alanı canlıda boş bırakma. Şimdilik sayfanın 404 hatasını kapatmak ve ödeme akışını hazırlamak için güvenli taslak olarak duruyor.",

    step1Title: "Ödeme açıklamasını yazın",
    step1Desc: (requestId) =>
      `Açıklama kısmına mutlaka “Analiz Talebi - ${requestId}” yazın.`,
    step2Title: "Ödemeyi tamamlayın",
    step2Desc: (price) =>
      `${price} tutarındaki analiz ödemesini seçtiğiniz para birimine uygun şekilde yapın.`,
    step3Title: "Dekontu destek hattına gönderin",
    step3Desc:
      "Dekont veya ekran görüntüsü geldikten sonra ödeme kontrolü yapılır ve analiz talebiniz işleme alınır.",

    importantNotes: "Önemli notlar",
    whatsappSupport: "WhatsApp destek",
    goAccountPanel: "Hesabım paneline git",

    footerPoint1: "Talep numarası korunur",
    footerPoint2: "Ödeme sonrası manuel kontrol yapılır",
    footerPoint3: "Analiz sonucu iletişim kanalınızdan paylaşılır",
  },

  en: {
    backToAnalysis: "Back to analysis page",
    badge: "Analysis payment screen",
    title: "Your analysis request has been created",
    description:
      "After completing the payment, send the receipt or payment screenshot to the support line. After verification, your analysis request will be processed and reviewed manually by the team.",

    requestNumber: "Request number",
    amountToPay: "Amount to pay",
    platform: "Platform",

    paymentControlTitle: "Payment verification",
    paymentControlDesc:
      "Analysis payments are checked manually. That is why it is important to include your request number in the payment description.",
    selectedCurrency: "Selected currency",

    paymentLabels: {
      TL: "Turkey payment details",
      USD: "Dollar payment details",
      RUB: "Ruble payment details",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Write your analysis request number in the payment description.",
        "Send the receipt to the WhatsApp or Telegram support line.",
        "After payment verification, your analysis request will be processed.",
      ],
      USD: [
        "For USD payment, ask support for the current payment channel.",
        "Add your analysis request number to the payment description.",
        "Send the receipt or payment screenshot to the support line.",
      ],
      RUB: [
        "For RUB payment, ask support for the current payment channel.",
        "Add your analysis request number to the payment description.",
        "Send the receipt or payment screenshot to the support line.",
      ],
    },

    socialMediaFallback: "Social media",
    requestNotCreated: "Not created yet",

    paymentInfoTitle: "Payment details",
    paymentInfoDesc:
      "Bank, IBAN, Papara, payment provider, or country-specific payment information will be added here.",
    receiver: "Receiver",
    paymentDescription: "Payment description",
    amount: "Amount",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Analysis Request",

    draftWarning:
      "Do not leave this area empty on the live site before adding real bank/payment details. For now, it is a safe draft to prevent the 404 error and prepare the payment flow.",

    step1Title: "Write the payment description",
    step1Desc: (requestId) =>
      `Make sure to write “Analysis Request - ${requestId}” in the description field.`,
    step2Title: "Complete the payment",
    step2Desc: (price) =>
      `Pay the analysis amount of ${price} using the correct method for your selected currency.`,
    step3Title: "Send the receipt to support",
    step3Desc:
      "After the receipt or screenshot is received, the payment will be checked and your analysis request will be processed.",

    importantNotes: "Important notes",
    whatsappSupport: "WhatsApp support",
    goAccountPanel: "Go to account panel",

    footerPoint1: "Request number is preserved",
    footerPoint2: "Manual verification is done after payment",
    footerPoint3: "The analysis result is shared through your contact channel",
  },

  ru: {
    backToAnalysis: "Вернуться к странице анализа",
    badge: "Экран оплаты анализа",
    title: "Ваша заявка на анализ создана",
    description:
      "После завершения оплаты отправьте чек или скриншот оплаты в поддержку. После проверки ваша заявка будет обработана и вручную изучена командой.",

    requestNumber: "Номер заявки",
    amountToPay: "Сумма к оплате",
    platform: "Платформа",

    paymentControlTitle: "Проверка оплаты",
    paymentControlDesc:
      "Оплата анализа проверяется вручную. Поэтому важно указать номер заявки в описании платежа.",
    selectedCurrency: "Выбранная валюта",

    paymentLabels: {
      TL: "Платёжные данные для Турции",
      USD: "Платёжные данные в долларах",
      RUB: "Платёжные данные в рублях",
    },

    fallbackPrices: {
      TL: "1000 TL",
      USD: "15 USD",
      RUB: "1800 RUB",
    },

    paymentNotes: {
      TL: [
        "Укажите номер заявки на анализ в описании платежа.",
        "Отправьте чек в поддержку WhatsApp или Telegram.",
        "После проверки оплаты заявка на анализ будет обработана.",
      ],
      USD: [
        "Для оплаты в USD запросите актуальный платёжный канал у поддержки.",
        "Добавьте номер заявки на анализ в описание платежа.",
        "Отправьте чек или скриншот оплаты в поддержку.",
      ],
      RUB: [
        "Для оплаты в RUB запросите актуальный платёжный канал у поддержки.",
        "Добавьте номер заявки на анализ в описание платежа.",
        "Отправьте чек или скриншот оплаты в поддержку.",
      ],
    },

    socialMediaFallback: "Социальные сети",
    requestNotCreated: "Ещё не создано",

    paymentInfoTitle: "Платёжная информация",
    paymentInfoDesc:
      "Здесь будут добавлены банк, IBAN, Papara, платёжный провайдер или платёжные данные по стране.",
    receiver: "Получатель",
    paymentDescription: "Описание платежа",
    amount: "Сумма",
    receiverName: "MedyaTora",
    paymentDescriptionValue: "Заявка на анализ",

    draftWarning:
      "Не оставляйте этот блок пустым на живом сайте перед добавлением реальных банковских/платёжных данных. Сейчас это безопасный черновик, чтобы закрыть ошибку 404 и подготовить поток оплаты.",

    step1Title: "Укажите описание платежа",
    step1Desc: (requestId) =>
      `Обязательно напишите “Заявка на анализ - ${requestId}” в поле описания.`,
    step2Title: "Завершите оплату",
    step2Desc: (price) =>
      `Оплатите анализ на сумму ${price} способом, подходящим для выбранной валюты.`,
    step3Title: "Отправьте чек в поддержку",
    step3Desc:
      "После получения чека или скриншота оплата будет проверена, и заявка на анализ будет обработана.",

    importantNotes: "Важные заметки",
    whatsappSupport: "Поддержка WhatsApp",
    goAccountPanel: "Перейти в аккаунт",

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
Para birimi: ${currency}`,

    en: `Hello, I would like to send the receipt for my analysis payment.

Request number: ${requestId}
Platform: ${platform}
Amount: ${price}
Currency: ${currency}`,

    ru: `Здравствуйте, хочу отправить чек по оплате анализа.

Номер заявки: ${requestId}
Платформа: ${platform}
Сумма: ${price}
Валюта: ${currency}`,
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
        {icon}
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">
        {label}
      </p>

      <p className="mt-2 text-xl font-black leading-7 text-white">{value}</p>
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
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
        <div className="mb-6">
          <Link
            href="/analiz"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/78 transition hover:bg-white/[0.075] hover:text-white"
          >
            <FaArrowLeft />
            {t.backToAnalysis}
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#080a0d]/95 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.025] md:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_0.82fr]">
            <div>
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

            <aside className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
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

                <p className="mt-2 text-3xl font-black text-white">
                  {currency}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/56">
                  {t.paymentLabels[currency]}
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
                <FaBuildingColumns />
              </div>

              <h2 className="text-2xl font-black text-white">
                {t.paymentInfoTitle}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                {t.paymentInfoDesc}
              </p>

              <div className="mt-5 space-y-3 rounded-[24px] border border-white/10 bg-black/25 p-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    {t.receiver}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {t.receiverName}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    {t.paymentDescription}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {t.paymentDescriptionValue} - {requestId}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    {t.amount}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">{price}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 px-4 py-3 text-sm font-semibold leading-6 text-[#e7d9a4]">
                {t.draftWarning}
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