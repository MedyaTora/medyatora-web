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
    actionCards: {
      title: string;
      description: string;
      eyebrow: string;
      href: string;
      icon: typeof FaChartLine;
      primary: boolean;
    }[];
    trustItems: string[];
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
    actionCards: [
      {
        title: "Analize Başla",
        description:
          "Hesabının neden ilerlemediğini, reklamlarının neden dönüşmediğini ve içeriklerinin neden keşfete düşmediğini analiz ettir.",
        href: "/analiz",
        eyebrow: "Profesyonel analiz",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Takipçi Al",
        description:
          "Instagram, TikTok, YouTube ve X için hazır paketleri hızlıca incele ve sipariş oluştur.",
        href: "/paketler",
        eyebrow: "Hızlı paketler",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "SMMTora’ya Git",
        description:
          "Geniş servis listesine, platform filtrelerine ve detaylı hizmet seçeneklerine ulaş.",
        href: "/smmtora",
        eyebrow: "Geniş servis paneli",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
    trustItems: [
      "KDV + vergiler dahil",
      "Sipariş numarası ile takip",
      "WhatsApp / Telegram destek",
      "Güvenli işlem akışı",
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
    actionCards: [
      {
        title: "Start Analysis",
        description:
          "Get your account reviewed to understand why it is not growing, why your ads are not converting, and why your content is not reaching more people.",
        href: "/analiz",
        eyebrow: "Professional analysis",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Buy Followers",
        description:
          "Quickly review ready-made packages for Instagram, TikTok, YouTube, and X, then create your order.",
        href: "/paketler",
        eyebrow: "Fast packages",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "Go to SMMTora",
        description:
          "Access the wider service list, platform filters, and detailed service options.",
        href: "/smmtora",
        eyebrow: "Advanced service panel",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
    trustItems: [
      "VAT + taxes included",
      "Track with order number",
      "WhatsApp / Telegram support",
      "Secure order flow",
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
    actionCards: [
      {
        title: "Начать анализ",
        description:
          "Проверьте аккаунт и узнайте, почему он не растёт, почему реклама не даёт результат и почему контент не получает больше охвата.",
        href: "/analiz",
        eyebrow: "Профессиональный анализ",
        icon: FaChartLine,
        primary: true,
      },
      {
        title: "Купить подписчиков",
        description:
          "Быстро посмотрите готовые пакеты для Instagram, TikTok, YouTube и X, затем оформите заказ.",
        href: "/paketler",
        eyebrow: "Быстрые пакеты",
        icon: FaUserCheck,
        primary: false,
      },
      {
        title: "Перейти в SMMTora",
        description:
          "Откройте расширенный список услуг, фильтры платформ и подробные варианты сервисов.",
        href: "/smmtora",
        eyebrow: "Расширенная панель услуг",
        icon: FaBoxesStacked,
        primary: false,
      },
    ],
    trustItems: [
      "НДС + налоги включены",
      "Отслеживание по номеру заказа",
      "Поддержка WhatsApp / Telegram",
      "Безопасный процесс заказа",
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
      <polygon points="22,20 32,20 50,56 68,20 78,20 50,76" />
      <path d="M 39 30 L 61 30 L 58 36 L 52 36 L 52 48 L 48 48 L 48 36 L 42 36 Z" />
    </svg>
  );
}

function MinimalStars() {
  const stars: {
    top: string;
    left?: string;
    right?: string;
    size: number;
    delay: string;
    duration: string;
  }[] = [
    { top: "18%", left: "22%", size: 3, delay: "0s", duration: "5.5s" },
    { top: "26%", right: "18%", size: 4, delay: "1.2s", duration: "6.5s" },
    { top: "62%", left: "14%", size: 2.5, delay: "0.8s", duration: "5.8s" },
    { top: "70%", right: "20%", size: 3.5, delay: "1.8s", duration: "7s" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.7,
            boxShadow:
              "0 0 10px rgba(255,255,255,0.85), 0 0 18px rgba(255,255,255,0.28)",
            animation: `mtStarFloat ${star.duration} ease-in-out infinite, mtStarTwinkle 3.2s ease-in-out infinite`,
            animationDelay: star.delay,
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

    return () => {
      window.removeEventListener("medyatora_locale_changed", handleLocaleChanged);
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

      <section className="mt-premium-inner mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.16)]">
              <LuxuryMonogram size={34} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-white sm:text-base sm:tracking-[0.42em]">
                MedyaTora
              </p>

              <p className="mt-1 hidden text-[9px] uppercase tracking-[0.3em] text-white/35 sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center justify-end">
            <UserMenu />
          </div>
        </header>

        <div className="flex flex-1 items-center py-8 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 inline-flex border border-white/10 bg-white/[0.045] px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/55 shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:text-xs sm:tracking-[0.38em]">
                {t.heroBadge}
              </div>

              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center text-white drop-shadow-[0_0_38px_rgba(255,255,255,0.18)] sm:h-28 sm:w-28">
                <LuxuryMonogram size={86} className="sm:hidden" />
                <LuxuryMonogram size={122} className="hidden sm:block" />
              </div>

              <div className="mt-title-glow-wrap mx-auto">
                <h1 className="mt-title-glow-text mx-auto max-w-full text-center text-[34px] font-light uppercase leading-none tracking-[0.22em] text-white sm:text-6xl sm:tracking-[0.3em] md:text-7xl lg:text-8xl">
                  MedyaTora
                </h1>
              </div>

              <p className="mx-auto mt-5 max-w-2xl text-xs font-medium uppercase leading-7 tracking-[0.16em] text-white/52 sm:mt-7 sm:text-sm sm:tracking-[0.22em]">
                {t.heroLine1}
              </p>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                {t.heroLine2}
              </p>

              <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:mt-10 md:grid-cols-3">
                {t.actionCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      className={`group relative overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 sm:p-6 ${
                        card.primary
                          ? "border-white/20 bg-white/[0.11] hover:bg-white/[0.15]"
                          : "border-white/12 bg-white/[0.07] hover:border-white/22 hover:bg-white/[0.11]"
                      }`}
                    >
                      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/[0.07] blur-3xl transition group-hover:scale-125" />

                      <div className="relative">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-black/30 text-lg text-white">
                          <Icon />
                        </div>

                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/42">
                          {card.eyebrow}
                        </p>

                        <h2 className="text-2xl font-black tracking-tight text-white">
                          {card.title}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-white/58 md:min-h-[108px]">
                          {card.description}
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-white">
                          {t.continue}
                          <FaArrowRight className="transition group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mx-auto mt-8 grid max-w-4xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {t.trustItems.map((item) => (
                  <div
                    key={item}
                    className="border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs font-semibold text-white/52 backdrop-blur-xl"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/8 py-4 text-xs text-white/35 sm:flex-row">
          <p>© MedyaTora</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/analiz" className="transition hover:text-white/70">
              {t.footerAnalysis}
            </Link>

            <Link href="/paketler" className="transition hover:text-white/70">
              {t.footerPackages}
            </Link>

            <Link href="/smmtora" className="transition hover:text-white/70">
              SMMTora
            </Link>

            <a
              href="https://wa.me/905530739292"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-white/70"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}