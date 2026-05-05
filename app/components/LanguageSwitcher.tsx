"use client";

import { useEffect, useState } from "react";
import {
  detectBrowserLocale,
  normalizeLocale,
  saveLocale,
  type Locale,
} from "@/lib/i18n";

type Props = {
  compact?: boolean;
  className?: string;
};

const localeOptions: {
  value: Locale;
  shortLabel: string;
  longLabel: string;
}[] = [
  {
    value: "tr",
    shortLabel: "TR",
    longLabel: "Türkçe",
  },
  {
    value: "en",
    shortLabel: "EN",
    longLabel: "English",
  },
  {
    value: "ru",
    shortLabel: "RU",
    longLabel: "Русский",
  },
];

export default function LanguageSwitcher({
  compact = false,
  className = "",
}: Props) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");

  useEffect(() => {
    const detectedLocale = detectBrowserLocale();
    setSelectedLocale(detectedLocale);
    saveLocale(detectedLocale);
  }, []);

  function handleLocaleChange(locale: Locale) {
    const nextLocale = normalizeLocale(locale);

    setSelectedLocale(nextLocale);
    saveLocale(nextLocale);

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  if (compact) {
    return (
      <div
        className={`flex h-9 items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-12 sm:rounded-2xl ${className}`}
      >
        {localeOptions.map((locale) => {
          const active = selectedLocale === locale.value;

          return (
            <button
              key={locale.value}
              type="button"
              onClick={() => handleLocaleChange(locale.value)}
              className={`h-7 rounded-full px-2 text-[10px] font-black uppercase transition sm:h-9 sm:rounded-xl sm:px-3 ${
                active
                  ? "bg-white text-black"
                  : "text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
              aria-label={locale.longLabel}
            >
              {locale.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      <span className="hidden px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/38 sm:inline">
        Dil
      </span>

      {localeOptions.map((locale) => {
        const active = selectedLocale === locale.value;

        return (
          <button
            key={locale.value}
            type="button"
            onClick={() => handleLocaleChange(locale.value)}
            className={`rounded-xl px-3 py-2 text-xs font-black uppercase transition ${
              active
                ? "bg-white text-black"
                : "text-white/62 hover:bg-white/[0.08] hover:text-white"
            }`}
            aria-label={locale.longLabel}
          >
            {locale.shortLabel}
          </button>
        );
      })}
    </div>
  );
}