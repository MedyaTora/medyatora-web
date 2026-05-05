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

export default function AnalizPage() {
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
    () => analysisText[selectedLocale] || analysisText.tr,
    [selectedLocale]
  );

  return (
    <main className="mt-premium-page">
      <div className="mt-premium-inner mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/72 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            ← {t.home}
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/paketler"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                {t.packages}
              </Link>

              <Link
                href="/smmtora"
                className="rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-black text-black shadow-[0_14px_34px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
              >
                SMMTora
              </Link>
            </nav>

            <UserMenu />
          </div>
        </header>

        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-10">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/72">
              <FaChartLine />
              {t.badge}
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              {t.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
              {t.description}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {t.platforms.map((platform) => {
              const Icon = platform.icon;

              return (
                <div
                  key={platform.title}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-xl text-white">
                    <Icon />
                  </div>

                  <h2 className="text-lg font-black text-white">
                    {platform.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {platform.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6">
            <div className="mb-6">
              <p className="text-sm font-bold text-white">{t.formTitle}</p>

              <p className="mt-2 text-sm leading-7 text-white/65">
                {t.formDescription}
              </p>
            </div>

            <AnalysisForm />
          </div>
        </section>
      </div>
    </main>
  );
}