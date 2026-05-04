import AnalysisForm from "@/app/components/analysis-form";
import UserMenu from "@/app/components/auth/UserMenu";
import { CONTACT, getWhatsappLink } from "@/lib/contact";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaFileInvoice,
  FaGift,
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
    title: "Profesyonel Analiz",
    description:
      "Hesabının neden büyümediğini, reklamların neden dönüşmediğini ve içeriklerinin neden keşfete düşmediğini profesyonel olarak incelet.",
    href: "/analiz",
    cta: "Analize Başla",
    icon: FaChartLine,
    variant: "primary",
  },
  {
    title: "SMMTora",
    description:
      "Platform bazlı sosyal medya destek hizmetlerini tek panelden incele.",
    href: "/smmtora",
    cta: "SMMTora’ya Git",
    icon: FaBoxesStacked,
  },
  {
    title: "Hızlı Paketler",
    description:
      "Hazır paketlerle hızlı sipariş vermek isteyen kullanıcılar için sade akış.",
    href: "/paketler",
    cta: "Paketleri İncele",
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lg text-white">
        <Icon />
      </div>

      <p className="text-sm font-medium leading-6 text-white/80">{title}</p>
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
          ? "border-white/18 bg-white/[0.075] hover:bg-white/[0.11]"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border text-xl ${
          isPrimary
            ? "border-white/15 bg-black/35 text-white"
            : "border-white/10 bg-black/25 text-white"
        }`}
      >
        <Icon />
      </div>

      <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
        {title}
      </h3>

      <p className="mb-6 text-sm leading-6 text-white/60">{description}</p>

      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
        {cta}
        <FaArrowRight className="transition group-hover:translate-x-1" />
      </span>
    </a>
  );
}

function MembershipBox() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl transition hover:border-white/18 hover:bg-white/[0.06] md:p-8">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-xl text-white">
        <FaGift />
      </div>

      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/45">
        Yeni üyelik avantajı
      </p>

      <h2 className="mb-3 text-3xl font-bold text-white">
        Hesabını oluştur, ücretsiz analiz hakkı kazan.
      </h2>

      <p className="leading-7 text-white/65">
        MedyaTora hesabı ile analiz haklarını, TL / USD / RUB bakiye durumunu ve
        sipariş geçmişini tek yerden takip edebilirsin. E-posta doğrulamasını
        tamamlayan kullanıcılara 1 defalık ücretsiz profesyonel analiz hakkı
        tanımlanır.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold text-white">Ücretsiz analiz hakkı</p>
          <p className="mt-2 text-sm leading-6 text-white/55">
            E-posta doğrulaması tamamlanan üyeye 1 adet ücretsiz profesyonel
            analiz hakkı tanımlanır.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold text-white">
            Çoklu para birimi bakiyesi
          </p>
          <p className="mt-2 text-sm leading-6 text-white/55">
            TL, USD ve RUB bakiyeleri ayrı takip edilir. Sipariş ödemelerinde
            seçili para birimine göre bakiye kullanılabilir.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <main className="mt-premium-page">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <div className="mt-premium-inner">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[110px]" />
          <div className="pointer-events-none absolute right-0 top-24 h-[300px] w-[300px] rounded-full bg-white/[0.035] blur-[110px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-white/[0.03] blur-[110px]" />

          <div className="relative mx-auto max-w-6xl px-6 py-5">
            <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <a href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-black text-black shadow-[0_0_34px_rgba(255,255,255,0.12)]">
                  MT
                </div>

                <div>
                  <div className="text-lg font-black tracking-tight text-white">
                    MedyaTora
                  </div>
                  <div className="text-xs text-white/45">
                    Sosyal medya destek sistemi
                  </div>
                </div>
              </a>

              <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/70">
                <a href="/analiz" className="transition hover:text-white">
                  Analiz
                </a>
                <a href="/smmtora" className="transition hover:text-white">
                  SMMTora
                </a>
                <a href="/paketler" className="transition hover:text-white">
                  Paketler
                </a>
                <a
                  href={CONTACT.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  Destek
                </a>
              </nav>

              <UserMenu />
            </header>
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-semibold text-white/60">
                  <span className="h-2 w-2 rounded-full bg-white/70 shadow-[0_0_16px_rgba(255,255,255,0.45)]" />
                  MedyaTora sosyal medya danışmanlığına hoş geldiniz
                </div>

                <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                  Hesabını analiz et, güven veren bir sosyal medya görünümü
                  oluştur.
                </h1>

                <p className="mb-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                  MedyaTora ile sosyal medya hesabının eksiklerini görebilir,
                  platform bazlı hizmetleri inceleyebilir ve ihtiyaç duyduğun
                  destekleri tek yerden yönetebilirsin.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href="/analiz"
                    className="rounded-2xl bg-white px-6 py-3 text-center font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Analize Başla
                  </a>

                  <a
                    href="/smmtora"
                    className="rounded-2xl border border-white/15 bg-white/[0.045] px-6 py-3 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
                  >
                    SMMTora’ya Git
                  </a>

                  <a
                    href="/paketler"
                    className="rounded-2xl border border-white/15 bg-white/[0.025] px-6 py-3 text-center font-semibold text-white/85 transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white"
                  >
                    Hızlı Paketler
                  </a>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#0b0d12]/85 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl md:p-8">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">
                  Hızlı geçiş
                </p>

                <div className="space-y-4">
                  <a
                    href="/analiz"
                    className="block rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-white/20 hover:bg-white/[0.075]"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-xl text-white">
                      <FaChartLine />
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      Profesyonel Analiz
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Hesabının görünümünü, içeriklerini, reklam dönüşümünü ve
                      güven algısını değerlendirmek için.
                    </p>
                  </a>

                  <a
                    href="/smmtora"
                    className="block rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-xl text-white">
                      <FaBoxesStacked />
                    </div>

                    <h3 className="text-xl font-bold text-white">SMMTora</h3>

                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Platform bazlı sosyal medya destek hizmetleri için.
                    </p>
                  </a>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={getWhatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.075] hover:text-white"
                    >
                      <div className="mb-2 text-white">
                        <FaWhatsapp />
                      </div>
                      WhatsApp
                    </a>

                    <a
                      href={CONTACT.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.075] hover:text-white"
                    >
                      <div className="mb-2 text-white">
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
          <MembershipBox />
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
          className="mx-auto max-w-4xl scroll-mt-8 px-6 pb-20"
        >
          <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/45">
              Profesyonel analiz
            </p>

            <h2 className="mb-3 text-3xl font-bold text-white">
              Hesabındaki eksikleri öğren
            </h2>

            <p className="leading-7 text-white/65">
              Profil görünümü, içerik yapısı, keşfet performansı, reklam
              dönüşümü ve güven algısı için analiz talebi bırak. E-posta
              doğrulaması olan üyeler 1 defalık ücretsiz profesyonel analiz
              hakkını kullanabilir.
            </p>

            <a
              href="/analiz"
              className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Yeni Analiz Sayfasına Git
            </a>
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
              <a href="/analiz" className="transition hover:text-white">
                Analiz
              </a>

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
      </div>
    </main>
  );
}