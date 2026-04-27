export const dynamic = "force-dynamic";
export const revalidate = 0;

import { CONTACT, getWhatsappLink } from "@/lib/contact";

const readyPackages = [
  {
    name: "Mini Hesap Destek Paketi",
    slug: "mini-hesap-destek",
    badge: "Başlangıç",
    price: "799 TL",
    oldPrice: "Tekli alıma göre avantajlı",
    description:
      "Yeni başlayan veya profil görünümünü güçlendirmek isteyen hesaplar için temel sosyal destek paketi.",
    items: [
      "1.000 takipçi",
      "5.000 beğeni",
      "50 kaydetme",
      "365 gün garanti",
    ],
    suitableFor: "Yeni hesaplar, butik sayfalar ve temel güven görünümü isteyen profiller.",
  },
  {
    name: "Orta Hesap Destek Paketi",
    slug: "orta-hesap-destek",
    badge: "En Dengeli",
    price: "1.499 TL",
    oldPrice: "Daha güçlü vitrin",
    description:
      "Profilini daha dolu, daha aktif ve daha güven veren göstermek isteyen hesaplar için dengeli paket.",
    items: [
      "2.500 takipçi",
      "10.000 beğeni",
      "150 kaydetme",
      "2.000 izlenme",
      "365 gün garanti",
    ],
    suitableFor: "Satış sayfaları, içerik üreticileri ve reklam öncesi güven artırmak isteyen hesaplar.",
  },
  {
    name: "Mega Hesap Destek Paketi",
    slug: "mega-hesap-destek",
    badge: "Güçlü Görünüm",
    price: "2.799 TL",
    oldPrice: "Öncelikli destek",
    description:
      "Daha güçlü sosyal kanıt, daha dolu içerik görünümü ve yüksek güven algısı isteyen hesaplar için.",
    items: [
      "5.000 takipçi",
      "25.000 beğeni",
      "500 kaydetme",
      "10.000 izlenme",
      "365 gün garanti",
    ],
    suitableFor: "Markalar, butik işletmeler, kampanya öncesi güçlü vitrin isteyen hesaplar.",
  },
];

const serviceTypes = [
  {
    title: "Takipçi Destekleri",
    description:
      "Profilin ilk bakışta daha güçlü ve güven veren görünmesini destekleyen takipçi hizmetleri.",
  },
  {
    title: "Beğeni ve Etkileşim",
    description:
      "Gönderilerinin daha dolu görünmesi ve ziyaretçiye daha aktif bir hesap algısı vermesi için.",
  },
  {
    title: "İzlenme ve Görüntülenme",
    description:
      "Reels, video, story ve içeriklerinde daha canlı bir vitrin etkisi oluşturmak için.",
  },
  {
    title: "Kaydetme ve Profil Desteği",
    description:
      "İçeriklerin daha değerli görünmesini destekleyen kaydetme ve ek etkileşim hizmetleri.",
  },
];

const rules = [
  "Profil herkese açık olmalıdır. Gizli hesaplarda işlem başlamaz.",
  "Yanlış link, yanlış kullanıcı adı veya kapalı profil işlem süresini geciktirebilir.",
  "İşlem başladıktan sonra keyfi iptal yapılamaz.",
  "Tamamlanan dijital hizmetlerde iade yapılmaz.",
  "Yüklenmeyen veya tamamlanamayan miktarın karşılığı bakiye olarak iade edilebilir.",
  "Verdiğiniz bilgiler yalnızca işlem ve destek süreci için kullanılır.",
];

export default function SmmToraPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172033_0%,#080b12_50%,#030408_100%)] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[340px] w-[340px] rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <a
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              ← MedyaTora Ana Sayfa
            </a>

            <div className="flex flex-wrap gap-3">
              <a
                href="/paketler"
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
              >
                Tekli Hizmetler
              </a>

              <a
                href={getWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                Destek Al
              </a>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora sosyal destek alanı
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                SMMTora ile hesabına hazır sosyal destek paketleri seç.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Takipçi, beğeni, izlenme, kaydetme ve hazır hesap destek paketleri için
                MedyaTora içindeki ayrı SMM alanı. Tekli hizmet alabilir veya hazır paketlerden
                birini seçebilirsin.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#ready-packages"
                  className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  Hazır Paketleri Gör
                </a>

                <a
                  href="/paketler"
                  className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Tekli Hizmet Seç
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/50">
                SMMTora farkı
              </p>

              <div className="space-y-4">
                <InfoCard
                  title="Hazır paket kolaylığı"
                  description="Mini, Orta ve Mega gibi paketlerle tek tek servis seçmeden hızlı başlangıç yap."
                />
                <InfoCard
                  title="365 gün garanti vurgusu"
                  description="Hazır paketlerde güçlü güven algısı için uzun garanti süresi öne çıkarılır."
                />
                <InfoCard
                  title="MedyaTora’dan ayrı konum"
                  description="Ana marka danışmanlık ve medya desteği olarak kalır, SMM hizmetleri burada toplanır."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ready-packages" className="mx-auto max-w-6xl px-6 pb-16 scroll-mt-8">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Hazır paketler
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Hesap destek paketleri
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-white/65">
            Tek tek hizmet seçmek istemeyen kullanıcılar için hazırlanmış sosyal destek
            paketleri. Fiyatlar KDV ve vergiler dahil olacak şekilde gösterilir.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {readyPackages.map((pack) => (
            <div
              key={pack.slug}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-[60px]" />

              <div className="relative">
                <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {pack.badge}
                </div>

                <h3 className="mb-3 text-2xl font-bold">{pack.name}</h3>

                <p className="mb-5 text-sm leading-6 text-white/65">
                  {pack.description}
                </p>

                <div className="mb-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">Fiyat</p>
                  <p className="mt-1 text-3xl font-bold">{pack.price}</p>
                  <p className="mt-1 text-xs text-white/45">{pack.oldPrice}</p>
                </div>

                <div className="mb-5 space-y-2">
                  {pack.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-white/35">
                    Kimler için uygun?
                  </p>
                  <p className="text-sm leading-6 text-white/65">{pack.suitableFor}</p>
                </div>

                <a
                  href="/paketler"
                  className="block rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  Siparişe Geç
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
                Tekli hizmetler
              </p>

              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Kendi ihtiyacına göre servis seç
              </h2>

              <p className="leading-7 text-white/70">
                Hazır paket yerine sadece ihtiyacın olan hizmeti almak istersen tekli
                hizmet ekranından platform, kategori ve miktar seçerek sipariş oluşturabilirsin.
              </p>

              <a
                href="/paketler"
                className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
              >
                Tekli Hizmetleri Aç
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {serviceTypes.map((item) => (
                <InfoCard key={item.title} title={item.title} description={item.description} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-8 md:p-10">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-amber-200/80">
            Sipariş öncesi bilgilendirme
          </p>

          <h2 className="mb-5 text-3xl font-bold">
            İşlem başlamadan önce dikkat edilmesi gerekenler
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {rules.map((rule) => (
              <div
                key={rule}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/75"
              >
                {rule}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              Kararsız mı kaldın?
            </p>

            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Önce destek ekibiyle konuşabilirsin
            </h2>

            <p className="leading-7 text-white/70">
              Hangi paketin hesabına daha uygun olduğunu bilmiyorsan Telegram veya WhatsApp
              üzerinden bize ulaşabilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={getWhatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
            >
              WhatsApp
            </a>

            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Telegram
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">© SMMTora</div>
            <div>MedyaTora sosyal destek hizmetleri alanı</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/" className="transition hover:text-white">
              MedyaTora
            </a>

            <a href="/paketler" className="transition hover:text-white">
              Tekli Hizmetler
            </a>

            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-white/65">{description}</p>
    </div>
  );
}