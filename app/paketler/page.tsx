import { getAllPlatforms } from "@/lib/platforms";
import { CONTACT, getWhatsappLink } from "@/lib/contact";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaInstagram,
  FaShieldHalved,
  FaTelegram,
  FaUserCheck,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import { FaFacebook, FaSpotify } from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function PlatformIcon({ slug }: { slug: string }) {
  const className = "h-7 w-7";

  if (slug === "instagram") return <FaInstagram className={className} />;
  if (slug === "tiktok") return <FaTiktok className={className} />;
  if (slug === "youtube") return <FaYoutube className={className} />;
  if (slug === "telegram") return <FaTelegram className={className} />;
  if (slug === "spotify") return <FaSpotify className={className} />;
  if (slug === "facebook") return <FaFacebook className={className} />;
  if (slug === "x") return <FaXTwitter className={className} />;

  return <FaBoxesStacked className={className} />;
}

const packageExamples = [
  {
    title: "Başlangıç Paketi",
    description: "Yeni hesaplar için temel görünüm desteği.",
    items: ["1.000 takipçi", "200 beğeni", "5.000 izlenme", "50 kaydetme"],
  },
  {
    title: "Güven Paketi",
    description: "Satış sayfaları ve reklam öncesi vitrin hazırlığı.",
    items: ["2.500 takipçi", "500 beğeni", "10.000 izlenme", "150 kaydetme"],
  },
  {
    title: "Büyüme Paketi",
    description: "Daha güçlü sosyal kanıt isteyen hesaplar için.",
    items: ["5.000 takipçi", "1.000 beğeni", "25.000 izlenme", "300 kaydetme"],
  },
];

const highlights: {
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    title: "Hazır Paket Mantığı",
    description: "Tek tek servis seçmeden platforma göre hazırlanmış paketleri incele.",
    icon: FaBoxesStacked,
  },
  {
    title: "Platforma Göre Seçim",
    description: "Instagram, TikTok, YouTube ve diğer platformlar için ayrı paket yapısı.",
    icon: FaChartLine,
  },
  {
    title: "Sipariş Takibi",
    description: "Paket siparişlerinde işlem numarasıyla destek süreci takip edilir.",
    icon: FaUserCheck,
  },
  {
    title: "Güvenli Bilgilendirme",
    description: "Fiyat, içerik ve işlem detayları sipariş öncesi açıkça gösterilir.",
    icon: FaShieldHalved,
  },
];

export default function PaketlerPage() {
  const platforms = getAllPlatforms().filter((platform) =>
    ["instagram", "tiktok", "youtube", "telegram", "spotify", "facebook", "x"].includes(
      platform.slug
    )
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172033_0%,#080b12_50%,#030408_100%)] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-32 h-[320px] w-[320px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <a
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              ← MedyaTora Ana Sayfa
            </a>

            <div className="flex flex-wrap gap-3">
              <a
                href="/smmtora"
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

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Platforma göre hazır sosyal medya paketleri
              </div>

              <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Önce platformunu seç, sonra hazır paketleri incele.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Instagram, TikTok, YouTube ve diğer platformlar için hazırlanacak paketler
                burada listelenecek. Tekli hizmet almak istersen SMMTora alanına geçebilirsin.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#platforms"
                  className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  Platform Seç
                </a>

                <a
                  href="/smmtora"
                  className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Tekli Hizmetlere Git
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
                Paket örneği
              </p>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                  Örnek
                </div>

                <h3 className="mb-3 text-2xl font-bold">Instagram Güven Paketi</h3>

                <p className="mb-5 text-sm leading-6 text-white/65">
                  Satış sayfaları ve reklam öncesi daha güven veren profil görünümü için.
                </p>

                <div className="space-y-2">
                  {["1.000 takipçi", "200 beğeni", "5.000 izlenme", "50 kaydetme"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>

                <p className="mt-5 text-xs leading-5 text-white/45">
                  Paket detayları ve fiyatlandırma bir sonraki aşamada platformlara göre
                  düzenlenecek.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platforms" className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-14">
        <div className="mb-7">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Platform seçimi
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            Paket görmek istediğin platformu seç
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-white/65">
            Şimdilik platform seçimi ekranı hazır. Bir sonraki aşamada her platformun kendi
            başlangıç, güven ve büyüme paketleri burada açılacak.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => (
            <a
              key={platform.slug}
              href={`#${platform.slug}-packages`}
              className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${
                platform.brandGradient || "from-white/[0.08] to-white/[0.03]"
              } p-5 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]`}
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${
                  platform.brandGlow || "bg-white/10"
                } blur-3xl transition group-hover:scale-125`}
              />

              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/30 text-white">
                  <PlatformIcon slug={platform.slug} />
                </div>

                <h3 className="mb-2 text-xl font-bold">{platform.title}</h3>

                <p className="mb-5 min-h-[48px] text-sm leading-6 text-white/65">
                  {platform.description}
                </p>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Paketleri gör
                  <FaArrowRight className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Paket yapısı
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            Her platform için paket sistemi kurulacak
          </h2>

          <div className="grid gap-5 lg:grid-cols-3">
            {packageExamples.map((pack) => (
              <div
                key={pack.title}
                className="rounded-[28px] border border-white/10 bg-black/20 p-6"
              >
                <h3 className="mb-3 text-2xl font-bold">{pack.title}</h3>

                <p className="mb-5 text-sm leading-6 text-white/65">
                  {pack.description}
                </p>

                <div className="space-y-2">
                  {pack.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100">
                  Fiyat ve sipariş akışı sonraki aşamada aktif edilecek.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg text-emerald-300">
                <item.icon />
              </div>

              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-white/65">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              Tekli hizmet mi lazım?
            </p>

            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Tek tek servis seçmek için SMMTora’ya geç
            </h2>

            <p className="leading-7 text-white/70">
              Platform, kategori, ürün ve miktar seçerek tekli sipariş oluşturmak istiyorsan
              SMMTora alanını kullanabilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/smmtora"
              className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
            >
              SMMTora’ya Git
            </a>

            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Telegram Destek
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">© MedyaTora Paketler</div>
            <div>Platforma göre hazır sosyal medya paketleri</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/" className="transition hover:text-white">
              MedyaTora
            </a>

            <a href="/smmtora" className="transition hover:text-white">
              SMMTora
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