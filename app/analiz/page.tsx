import Link from "next/link";
import AnalysisForm from "@/app/components/analysis-form";
import {
  FaArrowRight,
  FaChartLine,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const platforms = [
  {
    title: "Instagram",
    description:
      "Reels, profil güveni, reklam dönüşümü ve satışa giden görünüm analizi.",
    icon: FaInstagram,
  },
  {
    title: "TikTok",
    description:
      "Video tutma gücü, keşfet performansı ve takipçi dönüşümü analizi.",
    icon: FaTiktok,
  },
  {
    title: "YouTube",
    description:
      "Shorts, uzun video, izlenme süresi ve abone dönüşümü analizi.",
    icon: FaYoutube,
  },
  {
    title: "X / Twitter",
    description:
      "Görüntülenme, etkileşim, profil güveni ve DM dönüşümü analizi.",
    icon: FaXTwitter,
  },
];

export const metadata = {
  title: "Sosyal Medya Analizi | MedyaTora",
  description:
    "Instagram, TikTok, YouTube ve X hesapları için MedyaTora profesyonel sosyal medya analiz başvuru sayfası.",
};

export default function AnalizPage() {
  return (
    <main className="mt-premium-page">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <section className="mt-premium-inner mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← Ana Sayfa
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              Portal
            </Link>

            <Link
              href="/paketler"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              Paketler
            </Link>

            <Link
              href="/smmtora"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-black shadow-[0_16px_44px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
            >
              SMMTora
            </Link>
          </div>
        </header>

        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#101621]/88 p-6 shadow-[0_28px_110px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.025] backdrop-blur-2xl md:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                <FaChartLine />
                Profesyonel hesap analizi
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                Analize Başla
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                İçeriklerin keşfete düşmüyor, reklam veriyorum ama ürün
                satamıyorum, profilime gelen kişi takip etmiyor veya mesajlar
                satışa dönüşmüyor diyorsan hesabını birlikte inceleyelim.
              </p>
            </div>

            <Link
              href="#analysis-form"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-black text-black shadow-[0_18px_60px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
            >
              Forma Git
              <FaArrowRight />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/38">
                Durum
              </p>
              <p className="mt-3 text-lg font-black text-white">
                1 / 4 · Platform
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                Ücretsiz Hak
              </p>
              <p className="mt-3 text-lg font-black text-white">
                Üyelik + e-posta doğrulama ile kazanılır
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/38">
                Standart Analiz
              </p>
              <p className="mt-3 text-lg font-black text-white">
                1000 TL / 15 USD / 1800 RUB
              </p>
            </div>
          </div>

          <div className="mt-9">
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Hangi platformu analiz ettirmek istiyorsunuz?
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {platforms.map((platform, index) => {
                const Icon = platform.icon;
                const active = index === 0;

                return (
                  <div
                    key={platform.title}
                    className={`group relative overflow-hidden rounded-3xl border p-5 transition hover:-translate-y-1 ${
                      active
                        ? "border-white/20 bg-white/[0.075] shadow-[0_24px_80px_rgba(255,255,255,0.055)]"
                        : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.07] blur-3xl transition group-hover:scale-125" />

                    <div className="relative">
                      <div
                        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${
                          active
                            ? "border-white/18 bg-white/[0.08] text-white"
                            : "border-white/10 bg-black/25 text-white"
                        }`}
                      >
                        <Icon />
                      </div>

                      <h3 className="text-xl font-black text-white">
                        {platform.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-white/58">
                        {platform.description}
                      </p>

                      {active && (
                        <span className="mt-5 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                          Seçili
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            id="analysis-form"
            className="mt-10 rounded-[30px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6"
          >
            <div className="mb-6">
              <p className="text-sm font-bold text-white">
                Analiz başvuru formu
              </p>

              <p className="mt-2 text-sm leading-7 text-white/62">
                Hesap bilgilerini ve iletişim tercihini doldur. Başvurun
                MedyaTora paneline düşer ve ekibimiz analiz sürecini başlatır.
              </p>
            </div>

            <div className="mt-analysis-form-scope">
  <AnalysisForm />
</div>
          </div>
        </div>
      </section>
    </main>
  );
}