import Link from "next/link";
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

const fallbackPrices: Record<CurrencyCode, string> = {
  TL: "1000 TL",
  USD: "15 USD",
  RUB: "1800 RUB",
};

const paymentLabels: Record<CurrencyCode, string> = {
  TL: "Türkiye ödeme bilgileri",
  USD: "Dolar ödeme bilgileri",
  RUB: "Ruble ödeme bilgileri",
};

const paymentNotes: Record<CurrencyCode, string[]> = {
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
};

function normalizeCurrency(value?: string): CurrencyCode {
  const upperValue = String(value || "").toUpperCase();

  if (upperValue === "USD") return "USD";
  if (upperValue === "RUB") return "RUB";

  return "TL";
}

function getSafeText(value: string | undefined, fallback: string) {
  const cleanValue = String(value || "").trim();
  return cleanValue || fallback;
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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

  const currency = normalizeCurrency(params.currency);
  const price = getSafeText(params.price, fallbackPrices[currency]);
  const platform = getSafeText(params.platform, "Sosyal medya");
  const requestId = getSafeText(params.request_id, "Henüz oluşturulmadı");

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
            Analiz sayfasına dön
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#080a0d]/95 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.025] md:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_0.82fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/72">
                <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
                Analiz ödeme ekranı
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Analiz talebiniz oluşturuldu
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/62 md:text-base">
                Ödeme işlemini tamamladıktan sonra dekont veya ödeme ekran
                görüntüsünü destek hattına iletin. Kontrol sonrası analiz
                talebiniz işleme alınır ve ekip tarafından manuel olarak
                incelenir.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <InfoCard
                  icon={<FaReceipt />}
                  label="Talep numarası"
                  value={requestId}
                />

                <InfoCard
                  icon={<FaCreditCard />}
                  label="Ödenecek tutar"
                  value={price}
                />

                <InfoCard
                  icon={<FaPaperPlane />}
                  label="Platform"
                  value={platform}
                />
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white">
                <FaShieldHalved />
              </div>

              <h2 className="text-2xl font-black text-white">
                Ödeme kontrolü
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                Analiz ödemeleri manuel kontrol edilir. Bu yüzden açıklama
                kısmına talep numaranızı eklemeniz önemlidir.
              </p>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/38">
                  Seçili para birimi
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {currency}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/56">
                  {paymentLabels[currency]}
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
                Ödeme bilgileri
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                Buraya banka, IBAN, Papara, ödeme sağlayıcı veya ülkeye göre
                kullanılacak ödeme bilgileri eklenecek.
              </p>

              <div className="mt-5 space-y-3 rounded-[24px] border border-white/10 bg-black/25 p-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    Alıcı
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    MedyaTora
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    Ödeme açıklaması
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    Analiz Talebi - {requestId}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
                    Tutar
                  </p>
                  <p className="mt-1 text-sm font-black text-white">{price}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 px-4 py-3 text-sm font-semibold leading-6 text-[#e7d9a4]">
                Gerçek banka/ödeme bilgilerini eklemeden önce bu alanı canlıda
                boş bırakma. Şimdilik sayfanın 404 hatasını kapatmak ve ödeme
                akışını hazırlamak için güvenli taslak olarak duruyor.
              </div>
            </div>

            <div className="grid gap-4">
              <StepCard
                number="1"
                title="Ödeme açıklamasını yazın"
                description={`Açıklama kısmına mutlaka “Analiz Talebi - ${requestId}” yazın.`}
              />

              <StepCard
                number="2"
                title="Ödemeyi tamamlayın"
                description={`${price} tutarındaki analiz ödemesini seçtiğiniz para birimine uygun şekilde yapın.`}
              />

              <StepCard
                number="3"
                title="Dekontu destek hattına gönderin"
                description="Dekont veya ekran görüntüsü geldikten sonra ödeme kontrolü yapılır ve analiz talebiniz işleme alınır."
              />
            </div>
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/25 p-5">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/70">
                  <FaCircleInfo />
                  Önemli notlar
                </div>

                <ul className="space-y-3 text-sm leading-6 text-white/62">
                  {paymentNotes[currency].map((note) => (
                    <li key={note} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-5 py-3 text-sm font-black text-black transition hover:bg-white"
                >
                  <FaWhatsapp />
                  WhatsApp destek
                </a>

                <Link
                  href="/hesabim"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  <FaHeadset />
                  Hesabım paneline git
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/48">
            <span className="inline-flex items-center gap-2">
              <FaCheck className="text-white/70" />
              Talep numarası korunur
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/24 sm:block" />
            <span>Ödeme sonrası manuel kontrol yapılır</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/24 sm:block" />
            <span>Analiz sonucu iletişim kanalınızdan paylaşılır</span>
          </div>
        </div>
      </section>
    </main>
  );
}