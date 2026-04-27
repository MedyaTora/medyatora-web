import AnalysisForm from "./components/analysis-form";
import { CONTACT, getWhatsappLink } from "@/lib/contact";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaFileInvoice,
  FaShieldHalved,
  FaTelegram,
  FaUserCheck,
  FaWhatsapp,
} from "react-icons/fa6";

const topHighlights: {
  title: string;
  icon: IconType;
}[] = [
  {
    title: "KDV + vergiler dahil",
    icon: FaFileInvoice,
  },
  {
    title: "Sipariş numarası ile takip",
    icon: FaUserCheck,
  },
  {
    title: "WhatsApp / Telegram destek",
    icon: FaWhatsapp,
  },
  {
    title: "Bilgiler yalnızca işlem için kullanılır",
    icon: FaShieldHalved,
  },
];

const quickCards: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: IconType;
  variant?: "primary" | "default";
}[] = [
  {
    title: "Analiz",
    description: "Hesap görünümü, içerik düzeni ve güven algısı kontrolü.",
    href: "#analysis",
    cta: "Ücretsiz Analiz Al",
    icon: FaChartLine,
  },
  {
    title: "Paketler",
    description: "Tekli sosyal medya destek hizmetleri ve platform bazlı seçim.",
    href: "/paketler",
    cta: "Tekli Hizmetleri İncele",
    icon: FaBoxesStacked,
    variant: "primary",
  },
  {
    title: "SMMTora",
    description: "Hazır büyüme, güven ve sosyal destek paketleri.",
    href: "/smmtora",
    cta: "SMMTora’ya Git",
    icon: FaBoxesStacked,
  },
];

function HighlightCard({
  title,
  icon: Icon,
}: {
  title: string;
  icon: IconType;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg text-emerald-300">
        <Icon />
      </div>
      <p className="text-sm font-medium leading-6 text-white/85">{title}</p>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
  cta,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: IconType;
  variant?: "primary" | "default";
}) {
  const isPrimary = variant === "primary";

  return (
    <a
      href={href}
      className={`group rounded-[28px] border p-6 transition hover:-translate-y-1 ${
        isPrimary
          ? "border-emerald-400/20 bg-emerald-400/10 hover:bg-emerald-400/15"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl ${
          isPrimary
            ? "border-emerald-400/20 bg-black/20 text-emerald-300"
            : "border-white/10 bg-black/20 text-white"
        }`}
      >
        <Icon />
      </div>

      <h3 className="mb-3 text-3xl font-bold text-white">{title}</h3>

      <p className="mb-6 text-sm leading-6 text-white/65">{description}</p>

      <span
        className={`inline-flex items-center gap-2 text-sm font-semibold ${
          isPrimary ? "text-emerald-300" : "text-white"
        }`}
      >
        {cta}
        <FaArrowRight className="transition group-hover:translate-x-1" />
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2440_0%,#0a1020_45%,#04070f_100%)] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-24 h-[300px] w-[300px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora sosyal medya destek sistemi
              </div>

              <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Hesabını daha güven veren ve daha güçlü göster.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Tekli hizmetleri incele, hazır paketleri gör veya ücretsiz analiz al.
                İhtiyacın olan alanı seç, hızlıca ilerle.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="/paketler"
                  className="rounded-2xl bg-emerald-400 px-6 py-3 text-center font-semibold text-black transition hover:bg-emerald-300"
                >
                  Paketleri İncele
                </a>

                <a
                  href="/smmtora"
                  className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  SMMTora’ya Git
                </a>

                <a
                  href="#analysis"
                  className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Ücretsiz Analiz
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
                Hızlı geçiş
              </p>

              <div className="space-y-4">
                <a
                  href="/paketler"
                  className="block rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:bg-black/35"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-xl text-emerald-300">
                    <FaBoxesStacked />
                  </div>
                  <h3 className="text-xl font-bold">Paketler</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Tekli hizmet seçmek isteyenler için.
                  </p>
                </a>

                <a
                  href="/smmtora"
                  className="block rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:bg-black/35"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-xl text-sky-300">
                    <FaChartLine />
                  </div>
                  <h3 className="text-xl font-bold">SMMTora</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Hazır sosyal destek paketleri için.
                  </p>
                </a>

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href={getWhatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
                  >
                    <div className="mb-2 text-emerald-300">
                      <FaWhatsapp />
                    </div>
                    WhatsApp
                  </a>

                  <a
                    href={CONTACT.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
                  >
                    <div className="mb-2 text-sky-300">
                      <FaTelegram />
                    </div>
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topHighlights.map((item) => (
            <HighlightCard
              key={item.title}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {quickCards.map((card) => (
            <QuickCard
              key={card.title}
              title={card.title}
              description={card.description}
              href={card.href}
              cta={card.cta}
              icon={card.icon}
              variant={card.variant}
            />
          ))}
        </div>
      </section>

      <section
        id="analysis"
        className="mx-auto max-w-4xl px-6 pb-20 scroll-mt-8"
      >
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/45">
            Ücretsiz analiz
          </p>

          <h2 className="mb-3 text-3xl font-bold">
            Hesabındaki eksikleri öğren
          </h2>

          <p className="leading-7 text-white/70">
            Profil görünümü, içerik yapısı ve güven algısı için analiz talebi bırak.
          </p>
        </div>

        <AnalysisForm />
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">© MedyaTora</div>
            <div>Sosyal medya destek sistemi</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/paketler" className="transition hover:text-white">
              Paketler
            </a>

            <a href="/smmtora" className="transition hover:text-white">
              SMMTora
            </a>

            <a
              href={getWhatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              WhatsApp
            </a>

            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Telegram
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