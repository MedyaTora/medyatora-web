"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaUserCheck,
  FaWhatsapp,
} from "react-icons/fa6";
import UserMenu from "./components/auth/UserMenu";

type LocaleCode = "tr" | "en" | "ru";

type HomeCard = {
  title: string;
  description: string;
  mobileDescription: string;
  eyebrow: string;
  href: string;
  icon: typeof FaChartLine;
  primary: boolean;
};

const homeText: Record<
  LocaleCode,
  {
    brandSubtitle: string;
    heroBadge: string;
    heroLine1: string;
    heroLine2: string;
    continue: string;
    footerAnalysis: string;
    footerPackages: string;
    licenseText: string;
    privacy: string;
    terms: string;
    distanceSales: string;
    refundPolicy: string;
    supportText: string;
    bottomBadges: string[];
    actionCards: HomeCard[];
  }
> = {
  tr: {
    brandSubtitle: "Private Digital Authority",
    heroBadge: "Premium sosyal medya sistemi",
    heroLine1:
      "Sosyal medya hesabın için analiz, hazır paketler ve gelişmiş servis paneli.",
    heroLine2:
      "Daha güven veren, daha profesyonel ve daha sade bir dijital görünüm için tek giriş noktası.",
    continue: "Devam Et",
    footerAnalysis: "Analiz",
    footerPackages: "Paketler",
    licenseText:
      "MedyaTora; sosyal medya hesap analizi, dijital görünürlük danışmanlığı ve sipariş takip süreçleri için geliştirilmiş özel bir dijital hizmet altyapısıdır. Tüm işlemler kullanım şartları, gizlilik politikası ve mesafeli satış hükümleri kapsamında yürütülür.",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Şartları",
    distanceSales: "Mesafeli Satış",
    refundPolicy: "İade Politikası",
    supportText: "WhatsApp / Telegram destek",
    bottomBadges: [
      "KDV + vergiler dahil",
      "Sipariş numarası ile takip",
      "WhatsApp / Telegram destek",
      "Güvenli işlem akışı",
    ],
    actionCards: [
      {
        title: "Analize Başla",
        description:
          "Hesabının neden ilerlemediğini, reklamlarının neden dönüşmediğini ve içeriklerinin neden keşfete düşmediğini analiz ettir.",
        mobileDescription: "Hesabını profesyonel analiz ettir.",
        href: "/analiz",
        eyebrow: "Profesyonel analiz",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Takipçi Al",
        description:
          "Instagram, TikTok, YouTube ve X için hazır paketleri hızlıca incele ve sipariş oluştur.",
        mobileDescription: "Hazır paketleri hızlıca incele.",
        href: "/paketler",
        eyebrow: "Hızlı paketler",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "SMMTora’ya Git",
        description:
          "Geniş servis listesine, platform filtrelerine ve detaylı hizmet seçeneklerine ulaş.",
        mobileDescription: "Geniş servis paneline geç.",
        href: "/smmtora",
        eyebrow: "Geniş servis paneli",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
  },

  en: {
    brandSubtitle: "Private Digital Authority",
    heroBadge: "Premium social media system",
    heroLine1:
      "Analysis, ready-made packages, and an advanced service panel for your social media account.",
    heroLine2:
      "A single entry point for a more trusted, more professional, and cleaner digital presence.",
    continue: "Continue",
    footerAnalysis: "Analysis",
    footerPackages: "Packages",
    licenseText:
      "MedyaTora is a private digital service infrastructure developed for social media account analysis, digital presence consulting, and order tracking processes. All services are provided under the terms of use, privacy policy, and distance sales provisions.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    distanceSales: "Distance Sales",
    refundPolicy: "Refund Policy",
    supportText: "WhatsApp / Telegram support",
    bottomBadges: [
      "VAT + taxes included",
      "Track with order number",
      "WhatsApp / Telegram support",
      "Secure transaction flow",
    ],
    actionCards: [
      {
        title: "Start Analysis",
        description:
          "Get your account reviewed to understand why it is not growing, why your ads are not converting, and why your content is not reaching more people.",
        mobileDescription: "Get a professional account review.",
        href: "/analiz",
        eyebrow: "Professional analysis",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Buy Followers",
        description:
          "Quickly review ready-made packages for Instagram, TikTok, YouTube, and X, then create your order.",
        mobileDescription: "Review ready-made packages.",
        href: "/paketler",
        eyebrow: "Fast packages",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "Go to SMMTora",
        description:
          "Access a broader service list, platform filters, and detailed service options.",
        mobileDescription: "Open the full service panel.",
        href: "/smmtora",
        eyebrow: "Extended service panel",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
  },

  ru: {
    brandSubtitle: "Private Digital Authority",
    heroBadge: "Премиальная система для соцсетей",
    heroLine1:
      "Анализ, готовые пакеты и расширенная панель услуг для вашего аккаунта в социальных сетях.",
    heroLine2:
      "Единая точка входа для более надёжного, профессионального и аккуратного цифрового образа.",
    continue: "Продолжить",
    footerAnalysis: "Анализ",
    footerPackages: "Пакеты",
    licenseText:
      "MedyaTora — это частная цифровая сервисная инфраструктура для анализа аккаунтов в социальных сетях, консультаций по цифровому присутствию и отслеживания заказов. Все процессы выполняются в рамках условий использования, политики конфиденциальности и правил дистанционной продажи.",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    distanceSales: "Дистанционная продажа",
    refundPolicy: "Политика возврата",
    supportText: "Поддержка WhatsApp / Telegram",
    bottomBadges: [
      "НДС + налоги включены",
      "Отслеживание по номеру заказа",
      "Поддержка WhatsApp / Telegram",
      "Безопасный процесс оплаты",
    ],
    actionCards: [
      {
        title: "Начать анализ",
        description:
          "Проверьте аккаунт и узнайте, почему он не растёт, почему реклама не даёт результат и почему контент не получает больше охвата.",
        mobileDescription: "Профессиональный анализ аккаунта.",
        href: "/analiz",
        eyebrow: "Профессиональный анализ",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Купить подписчиков",
        description:
          "Быстро посмотрите готовые пакеты для Instagram, TikTok, YouTube и X, затем оформите заказ.",
        mobileDescription: "Быстрый просмотр готовых пакетов.",
        href: "/paketler",
        eyebrow: "Быстрые пакеты",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "Перейти в SMMTora",
        description:
          "Откройте расширенный список услуг, фильтры платформ и подробные варианты сервиса.",
        mobileDescription: "Открыть полную панель услуг.",
        href: "/smmtora",
        eyebrow: "Расширенная панель услуг",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
  },
};

function LuxuryMonogram({
  size = 100,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left and right pillars */}
      <rect x="10" y="16" width="8" height="68" rx="1.5" />
      <rect x="82" y="16" width="8" height="68" rx="1.5" />

      {/* M shape */}
      <polygon points="18,16 30,16 44,44 50,34 56,44 70,16 82,16 58,66 50,54 42,66" />

      {/* Small centered T */}
      <rect x="43" y="38" width="14" height="4" rx="1.5" />
      <rect x="48" y="38" width="4" height="16" rx="1.5" />
    </svg>
  );
}

function MinimalStars() {
  const stars = [
    { left: "8%", top: "22%", size: 2.5, opacity: 0.8 },
    { left: "16%", top: "40%", size: 1.4, opacity: 0.55 },
    { left: "27%", top: "14%", size: 1.8, opacity: 0.45 },
    { left: "39%", top: "55%", size: 1.5, opacity: 0.45 },
    { left: "58%", top: "18%", size: 2.2, opacity: 0.62 },
    { left: "74%", top: "31%", size: 1.6, opacity: 0.5 },
    { left: "89%", top: "39%", size: 2.1, opacity: 0.75 },
    { left: "84%", top: "72%", size: 1.4, opacity: 0.5 },
    { left: "11%", top: "78%", size: 2.4, opacity: 0.8 },
    { left: "91%", top: "51%", size: 1.2, opacity: 0.52 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: "0 0 10px rgba(255,255,255,0.45)",
          }}
        />
      ))}
    </div>
  );
}

function detectInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");

  if (saved === "tr" || saved === "en" || saved === "ru") {
    return saved;
  }

  const browserLang = (navigator.language || "").toLowerCase();

  if (browserLang.startsWith("tr")) return "tr";
  if (browserLang.startsWith("ru")) return "ru";

  return "en";
}

export default function Home() {
  const [selectedLocale, setSelectedLocale] = useState<LocaleCode>("tr");

  useEffect(() => {
    setSelectedLocale(detectInitialLocale());

    function handleLocaleChanged() {
      setSelectedLocale(detectInitialLocale());
    }

    window.addEventListener("medyatora_locale_changed", handleLocaleChanged);
    window.addEventListener("medyatora_locale_change", handleLocaleChanged);

    return () => {
      window.removeEventListener(
        "medyatora_locale_changed",
        handleLocaleChanged
      );
      window.removeEventListener(
        "medyatora_locale_change",
        handleLocaleChanged
      );
    };
  }, []);

  const t = useMemo(
    () => homeText[selectedLocale] || homeText.tr,
    [selectedLocale]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040507] text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[20rem] w-[32rem] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />
      </div>

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <MinimalStars />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-start justify-between gap-4 border-b border-white/8 pb-5 sm:items-center">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-visible text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]">
              <LuxuryMonogram size={34} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-white sm:text-base">
                MedyaTora
              </p>

              <p className="mt-1 hidden text-[9px] uppercase tracking-[0.24em] text-white/35 sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </Link>

          <div className="shrink-0">
            <UserMenu />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-5xl text-center">
            <div className="mx-auto mb-5 inline-flex border border-white/10 bg-white/[0.045] px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/55 shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mb-6 sm:px-5 sm:text-xs sm:tracking-[0.28em]">
              {t.heroBadge}
            </div>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-visible text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.16)] sm:mb-7 sm:h-24 sm:w-24">
              <LuxuryMonogram size={72} className="sm:hidden" />
              <LuxuryMonogram size={112} className="hidden sm:block" />
            </div>

            <div className="relative mx-auto">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.10] blur-3xl sm:h-28 sm:w-[78%]" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[82%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              <h1 className="relative mx-auto text-center text-[52px] font-light uppercase leading-none tracking-[0.12em] text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.26)] sm:text-7xl sm:tracking-[0.16em] md:text-8xl lg:text-[108px]">
                MedyaTora
              </h1>
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-[11px] font-medium uppercase leading-6 tracking-[0.07em] text-white/56 sm:text-sm sm:leading-7 sm:tracking-[0.10em]">
              {t.heroLine1}
            </p>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
              {t.heroLine2}
            </p>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
              {t.actionCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={`group relative overflow-hidden rounded-[24px] border p-5 text-left shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 sm:rounded-[28px] sm:p-6 ${
                      card.primary
                        ? "border-white/22 bg-white/[0.12] hover:bg-white/[0.15]"
                        : "border-white/12 bg-white/[0.07] hover:border-white/22 hover:bg-white/[0.11]"
                    }`}
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-black/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <Icon className="text-lg" />
                      </div>

                      <FaArrowRight className="mt-1 text-base text-white/78 transition group-hover:translate-x-1" />
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
                      {card.eyebrow}
                    </p>

                    <h3 className="mt-3 text-[22px] font-black leading-tight text-white">
                      {card.title}
                    </h3>

                    <p className="mt-4 hidden text-sm leading-7 text-white/56 sm:block">
                      {card.description}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-white/56 sm:hidden">
                      {card.mobileDescription}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white">
                      <span>{t.continue}</span>
                      <FaArrowRight className="text-xs transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mx-auto mt-5 grid max-w-5xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {t.bottomBadges.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-center text-[11px] font-bold text-white/46 backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="border-t border-white/8 py-5 text-xs text-white/38">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="font-semibold text-white/50">© MedyaTora</p>

              <p className="mt-2 max-w-3xl text-[11px] leading-5 text-white/32">
                {t.licenseText}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 lg:justify-end">
              <Link href="/analiz" className="transition hover:text-white/70">
                {t.footerAnalysis}
              </Link>

              <Link href="/paketler" className="transition hover:text-white/70">
                {t.footerPackages}
              </Link>

              <Link href="/smmtora" className="transition hover:text-white/70">
                SMMTora
              </Link>

              <Link
                href="/gizlilik-politikasi"
                className="transition hover:text-white/70"
              >
                {t.privacy}
              </Link>

              <Link
                href="/kullanim-sartlari"
                className="transition hover:text-white/70"
              >
                {t.terms}
              </Link>

              <Link
                href="/mesafeli-satis-sozlesmesi"
                className="transition hover:text-white/70"
              >
                {t.distanceSales}
              </Link>

              <Link
                href="/iade-politikasi"
                className="transition hover:text-white/70"
              >
                {t.refundPolicy}
              </Link>

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white/70"
              >
                <FaWhatsapp className="text-sm" />
                {t.supportText}
              </a>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}