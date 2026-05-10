"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AnalysisForm from "@/app/components/analysis-form";
import UserMenu from "@/app/components/auth/UserMenu";
import {
  FaChartLine,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

type LocaleCode = "tr" | "en" | "ru";

type PlatformItem = {
  title: string;
  description: string;
  icon: IconType;
};

const analysisText: Record<
  LocaleCode,
  {
    home: string;
    packages: string;
    badge: string;
    title: string;
    description: string;
    formTitle: string;
    formDescription: string;
    platforms: PlatformItem[];
  }
> = {
  tr: {
    home: "Ana Sayfa",
    packages: "Paketler",
    badge: "Profesyonel hesap analizi",
    title: "Hesabının neden büyümediğini birlikte netleştirelim.",
    description:
      "İçerik açılışların, hook gücün, profil güvenin, paylaşım düzenin ve dönüşüm akışın profesyonel bir gözle incelenir. Amacımız hesabındaki açıkları netleştirmek ve daha güçlü bir sosyal medya görünümü için uygulanabilir öneriler sunmaktır.",
    formTitle: "Analiz başvuru formu",
    formDescription:
      "Hesap bilgilerini ve iletişim tercihini doldur. Başvurun MedyaTora paneline düşer ve ekibimiz analiz sürecini başlatır.",
    platforms: [
      {
        title: "Instagram",
        description:
          "Reels açılışı, hook yapısı, profil güveni, içerik düzeni ve satış dönüşümü değerlendirilir.",
        icon: FaInstagram,
      },
      {
        title: "TikTok",
        description:
          "İlk saniye etkisi, izlenme akışı, retention gücü, içerik dili ve kitle uyumu incelenir.",
        icon: FaTiktok,
      },
      {
        title: "YouTube",
        description:
          "Shorts yapısı, izleyici tutma gücü, başlık-kapak etkisi ve kanal güveni analiz edilir.",
        icon: FaYoutube,
      },
      {
        title: "X",
        description:
          "Profil konumlandırması, paylaşım dili, etkileşim kalitesi ve görünürlük yapısı değerlendirilir.",
        icon: FaXTwitter,
      },
    ],
  },

  en: {
    home: "Home",
    packages: "Packages",
    badge: "Professional account analysis",
    title: "Let’s clarify why your account is not growing.",
    description:
      "Your content openings, hook strength, profile trust, posting structure, and conversion flow are reviewed from a professional perspective. Our goal is to identify the weak points in your account and provide practical recommendations for a stronger social media presence.",
    formTitle: "Analysis application form",
    formDescription:
      "Fill in your account details and preferred contact method. Your request will be sent to the MedyaTora panel and our team will start the analysis process.",
    platforms: [
      {
        title: "Instagram",
        description:
          "Reels openings, hook structure, profile trust, content layout, and sales conversion are reviewed.",
        icon: FaInstagram,
      },
      {
        title: "TikTok",
        description:
          "First-second impact, view flow, retention strength, content language, and audience fit are reviewed.",
        icon: FaTiktok,
      },
      {
        title: "YouTube",
        description:
          "Shorts structure, viewer retention, title-thumbnail impact, and channel trust are analyzed.",
        icon: FaYoutube,
      },
      {
        title: "X",
        description:
          "Profile positioning, posting language, interaction quality, and visibility structure are reviewed.",
        icon: FaXTwitter,
      },
    ],
  },

  ru: {
    home: "Главная",
    packages: "Пакеты",
    badge: "Профессиональный анализ аккаунта",
    title: "Давайте разберём, почему ваш аккаунт не растёт.",
    description:
      "Мы профессионально анализируем первые секунды контента, силу hook, доверие к профилю, структуру публикаций и путь к конверсии. Наша цель — выявить слабые места аккаунта и дать применимые рекомендации для более сильного присутствия в социальных сетях.",
    formTitle: "Форма заявки на анализ",
    formDescription:
      "Заполните данные аккаунта и предпочтительный способ связи. Заявка попадёт в панель MedyaTora, и наша команда начнёт процесс анализа.",
    platforms: [
      {
        title: "Instagram",
        description:
          "Анализируются начало Reels, структура hook, доверие к профилю, оформление контента и конверсия в продажи.",
        icon: FaInstagram,
      },
      {
        title: "TikTok",
        description:
          "Оцениваются первые секунды, поток просмотров, удержание, язык контента и соответствие аудитории.",
        icon: FaTiktok,
      },
      {
        title: "YouTube",
        description:
          "Анализируются структура Shorts, удержание зрителей, влияние заголовка и обложки, а также доверие к каналу.",
        icon: FaYoutube,
      },
      {
        title: "X",
        description:
          "Оцениваются позиционирование профиля, язык публикаций, качество вовлечения и структура видимости.",
        icon: FaXTwitter,
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
      <polygon points="22,20 32,20 50,56 68,20 78,20 50,76" />
      <path d="M 39 30 L 61 30 L 58 36 L 52 36 L 52 48 L 48 48 L 48 36 L 42 36 Z" />
    </svg>
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

function NavDivider() {
  return (
    <span
      aria-hidden="true"
      className="block h-px w-8 shrink-0 bg-gradient-to-r from-transparent via-white/38 to-transparent sm:w-10 lg:w-14"
    />
  );
}

export default function AnalizPage() {
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
    () => analysisText[selectedLocale] || analysisText.tr,
    [selectedLocale]
  );

  return (
    <main className="mt-premium-page px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <div className="mt-premium-inner mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <header className="grid gap-4 border-b border-white/5 pb-4 sm:pb-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.16)]">
              <LuxuryMonogram size={34} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white sm:text-base sm:tracking-[0.42em]">
                MedyaTora
              </p>

              <p className="mt-1 hidden text-[9px] uppercase tracking-[0.3em] text-white/35 sm:block">
                Professional Analysis
              </p>
            </div>
          </Link>

          <nav className="relative flex items-center justify-center">
            <div className="inline-flex max-w-full items-center justify-center gap-3 px-2 py-2 text-center sm:gap-4 lg:gap-5">
              <Link
                href="/"
                className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.22em] text-white/78 transition duration-300 hover:text-white sm:text-[13px] lg:text-[15px] lg:tracking-[0.28em]"
              >
                {t.home}
              </Link>

              <NavDivider />

              <Link
                href="/paketler"
                className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.22em] text-white/78 transition duration-300 hover:text-white sm:text-[13px] lg:text-[15px] lg:tracking-[0.28em]"
              >
                {t.packages}
              </Link>

              <NavDivider />

              <Link
                href="/smmtora"
                className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.22em] text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.12)] transition duration-300 hover:text-white sm:text-[13px] lg:text-[15px] lg:tracking-[0.28em]"
              >
                SMMTora
              </Link>
            </div>
          </nav>

          <div className="flex justify-end">
            <UserMenu />
          </div>
        </header>

        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#080a0d]/94 p-4 shadow-[0_28px_110px_rgba(0,0,0,0.44)] ring-1 ring-white/[0.025] backdrop-blur-xl sm:rounded-[36px] sm:p-6 md:p-8 lg:p-10">
          <div className="relative">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/72 sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.22em]">
                <FaChartLine className="shrink-0" />
                <span className="truncate">{t.badge}</span>
              </div>

              <h1 className="text-[30px] font-black leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {t.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base md:text-lg md:leading-8">
                {t.description}
              </p>
            </div>

            <div className="relative mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 xl:grid-cols-4">
              {t.platforms.map((platform) => {
                const Icon = platform.icon;

                return (
                  <div
                    key={platform.title}
                    className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:rounded-3xl sm:p-5"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-lg text-white sm:mb-4 sm:h-12 sm:w-12 sm:text-xl">
                      <Icon />
                    </div>

                    <h2 className="text-base font-black text-white sm:text-lg">
                      {platform.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {platform.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-6 rounded-[26px] border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:mt-8 sm:rounded-[30px] sm:p-5 md:p-6">
              <div className="mb-5">
                <p className="text-base font-black text-white sm:text-lg">
                  {t.formTitle}
                </p>

                <p className="mt-2 text-sm leading-7 text-white/62">
                  {t.formDescription}
                </p>
              </div>

              <AnalysisForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}