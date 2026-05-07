"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaUserCheck,
} from "react-icons/fa6";
import UserMenu from "./components/auth/UserMenu";

type LocaleCode = "tr" | "en" | "ru";

type ActionCard = {
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
    actionCards: ActionCard[];
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
          "Access the full service list, platform filters, and detailed service options.",
        mobileDescription: "Open the full service panel.",
        href: "/smmtora",
        eyebrow: "Advanced service panel",
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
          "Откройте полный список услуг, фильтры платформ и подробные варианты сервисов.",
        mobileDescription: "Открыть панель услуг.",
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
      <rect x="14" y="20" width="8" height="60" />
      <rect x="78" y="20" width="8" height="60" />
      <polygon points="22,20 32,20 50,56 68,20 78,20 54,80 46,80" />
      <polygon points="33,20 43,20 50,36 57,20 67,20 50,61" />
    </svg>
  );
}

function MinimalStars() {
  const stars = [
    { left: "14%", top: "74%", size: 3, opacity: 0.55 },
    { left: "25%", top: "23%", size: 2, opacity: 0.42 },
    { left: "82%", top: "32%", size: 3, opacity: 0.62 },
    { left: "78%", top: "83%", size: 3, opacity: 0.58 },
    { left: "43%", top: "86%", size: 2, opacity: 0.34 },
    { left: "64%", top: "57%", size: 2, opacity: 0.42 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.72)]"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
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
      window.removeEventListener("medyatora_locale_change", handleLocaleChanged);
    };
  }, []);

  const t = useMemo(
    () => homeText[selectedLocale] || homeText.tr,
    [selectedLocale]
  );

  return (
    <main className="mt-premium-page">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <MinimalStars />

      <section className="mt-premium-inner mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex items-start justify-between gap-3 border-b border-white/8 pb-3 sm:items-center sm:pb-5">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.16)] sm:h-10 sm:w-10">
              <LuxuryMonogram size={30} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white sm:text-base sm:tracking-[0.32em]">
                MedyaTora
              </p>

              <p className="mt-1 hidden text-[9px] uppercase tracking-[0.26em] text-white/35 sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </Link>

          <div className="flex min-w-0 shrink-0 items-start justify-end">
            <UserMenu />
          </div>
        </header>

        <div className="flex flex-1 items-start pt-4 pb-4 sm:items-center sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-3 inline-flex border border-white/10 bg-white/[0.045] px-4 py-2 text-[8px] font-black uppercase tracking-[0.18em] text-white/55 shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mb-6 sm:px-5 sm:text-xs sm:tracking-[0.28em]">
                {t.heroBadge}
              </div>

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] sm:mb-7 sm:h-28 sm:w-28">
                <LuxuryMonogram size={64} className="sm:hidden" />
                <LuxuryMonogram size={122} className="hidden sm:block" />
              </div>

              <div className="relative mx-auto">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.105] blur-3xl sm:h-28 sm:w-[82%]" />

                <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[82%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent" />

                <h1 className="relative mx-auto max-w-full text-center text-[32px] font-light uppercase leading-none tracking-[0.105em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.32)] min-[390px]:text-[36px] sm:text-6xl sm:tracking-[0.18em] md:text-7xl lg:text-8xl lg:tracking-[0.2em]">
                  MedyaTora
                </h1>
              </div>

              <p className="mx-auto mt-4 max-w-2xl text-[11px] font-medium uppercase leading-6 tracking-[0.055em] text-white/56 sm:mt-7 sm:text-sm sm:leading-7 sm:tracking-[0.095em]">
                {t.heroLine1}
              </p>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/55 sm:mt-3 sm:text-base sm:leading-7">
                {t.heroLine2}
              </p>

              <div className="mx-auto mt-5 grid max-w-5xl gap-3 sm:mt-8 md:mt-10 md:grid-cols-3 md:gap-4">
                {t.actionCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      className={`group relative overflow-hidden rounded-[22px] border p-3 text-left shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 sm:rounded-[28px] sm:p-5 md:p-6 ${
                        card.primary
                          ? "border-white/22 bg-white/[0.12] hover:bg-white/[0.15]"
                          : "border-white/12 bg-white/[0.07] hover:border-white/22 hover:bg-white/[0.11]"
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-80" />

                      <div className="relative flex items-center gap-4 md:block">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/22 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] sm:h-14 sm:w-14">
                          <Icon className="text-lg sm:text-xl" />
                        </div>

                        <div className="min-w-0 flex-1 md:mt-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">
                            {card.eyebrow}
                          </p>

                          <div className="mt-1 flex items-center justify-between gap-3 sm:mt-2">
                            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                              {card.title}
                            </h2>

                            <FaArrowRight className="shrink-0 text-lg text-white transition group-hover:translate-x-1 md:hidden" />
                          </div>

                          <p className="mt-1 text-sm leading-6 text-white/56 sm:hidden">
                            {card.mobileDescription}
                          </p>

                          <p className="mt-3 hidden text-sm leading-7 text-white/58 sm:block">
                            {card.description}
                          </p>

                          <div className="mt-7 hidden items-center gap-2 text-sm font-black text-white md:flex">
                            {t.continue}
                            <FaArrowRight className="transition group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/8 py-4 text-xs text-white/38 sm:py-5">
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
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}