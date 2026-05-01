"use client";

import { useEffect, useMemo, useState } from "react";
import AuthModal from "./AuthModal";

type PublicUser = {
  id: number;
  email: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  balance_usd: number;
  balance_tl: number;
  balance_rub: number;
  free_analysis_used: boolean;
  welcome_bonus_claimed: boolean;
};

type AuthMode = "login" | "register";
type CurrencyCode = "TL" | "USD" | "RUB";
type LocaleCode = "tr" | "en" | "ru";

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];
const localeOptions: LocaleCode[] = ["tr", "en", "ru"];

function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "TL";

  const saved = window.localStorage.getItem("medyatora_header_currency");
  if (saved === "TL" || saved === "USD" || saved === "RUB") {
    return saved;
  }

  return "TL";
}

function getStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");
  if (saved === "tr" || saved === "en" || saved === "ru") {
    return saved;
  }

  return "tr";
}

function formatSelectedBalance(user: PublicUser, currency: CurrencyCode) {
  if (currency === "USD") {
    return `${Number(user.balance_usd || 0).toFixed(2)} USD`;
  }

  if (currency === "RUB") {
    return `${Number(user.balance_rub || 0).toFixed(2)} RUB`;
  }

  return `${Number(user.balance_tl || 0).toFixed(2)} TL`;
}

function getInitials(user: PublicUser) {
  const value = (user.full_name || user.email || "MT").trim();
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

export default function UserMenu() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("TL");
  const [selectedLocale, setSelectedLocale] = useState<LocaleCode>("tr");

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (data.ok && data.user) {
        setUser({
          id: Number(data.user.id),
          email: data.user.email,
          full_name: data.user.full_name,
          username: data.user.username,
          phone_number: data.user.phone_number,
          email_verified: Boolean(data.user.email_verified),
          phone_verified: Boolean(data.user.phone_verified),
          balance_usd: Number(data.user.balance_usd || 0),
          balance_tl: Number(data.user.balance_tl || 0),
          balance_rub: Number(data.user.balance_rub || 0),
          free_analysis_used: Boolean(data.user.free_analysis_used),
          welcome_bonus_claimed: Boolean(data.user.welcome_bonus_claimed),
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSelectedCurrency(getStoredCurrency());
    setSelectedLocale(getStoredLocale());
    loadMe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "medyatora_header_currency",
        selectedCurrency
      );
    }
  }, [selectedCurrency]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch {
      setUser(null);
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function handleLocaleChange(locale: LocaleCode) {
    setSelectedLocale(locale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("medyatora_locale", locale);
      window.location.reload();
    }
  }

  const shownBalance = useMemo(() => {
    if (!user) return "0.00 TL";
    return formatSelectedBalance(user, selectedCurrency);
  }, [user, selectedCurrency]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/55">
        Hesap kontrol ediliyor...
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-black text-black">
              {getInitials(user)}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/75">
                Hoş geldin
              </p>
              <p className="max-w-[120px] truncate text-sm font-black text-white">
                {user.full_name || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200/75">
                Bakiye
              </p>
              <p className="text-sm font-black text-white">{shownBalance}</p>
            </div>

            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20">
              {currencyOptions.map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-3 py-2 text-[11px] font-black transition ${
                    selectedCurrency === currency
                      ? "bg-emerald-400 text-black"
                      : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase transition ${
                  selectedLocale === locale
                    ? "bg-white text-black"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <a
            href="/hesabim"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
          >
            Hesabım
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-400/15"
          >
            Çıkış
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase transition ${
                  selectedLocale === locale
                    ? "bg-white text-black"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openAuth("login")}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.1] hover:text-white"
          >
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={() => openAuth("register")}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(52,211,153,0.18)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-emerald-400"
          >
            Üye Ol
          </button>
        </div>
      )}

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(nextUser) => setUser(nextUser)}
      />
    </>
  );
}