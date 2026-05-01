"use client";

import { useEffect, useMemo, useState } from "react";
import AuthModal from "./AuthModal";

type PreferredCurrency = "TL" | "USD" | "RUB";

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
  preferred_currency: PreferredCurrency;
  free_analysis_used: boolean;
  welcome_bonus_claimed: boolean;
};

type AuthMode = "login" | "register";
type LocaleCode = "tr" | "en" | "ru";

const localeOptions: LocaleCode[] = ["tr", "en", "ru"];

function normalizePreferredCurrency(value: unknown): PreferredCurrency {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";
  return "TL";
}

function normalizePublicUser(value: any): PublicUser {
  return {
    id: Number(value?.id || 0),
    email: String(value?.email || ""),
    full_name: value?.full_name || null,
    username: value?.username || null,
    phone_number: value?.phone_number || null,
    email_verified: Boolean(value?.email_verified),
    phone_verified: Boolean(value?.phone_verified),
    balance_usd: Number(value?.balance_usd || 0),
    balance_tl: Number(value?.balance_tl || 0),
    balance_rub: Number(value?.balance_rub || 0),
    preferred_currency: normalizePreferredCurrency(value?.preferred_currency),
    free_analysis_used: Boolean(value?.free_analysis_used),
    welcome_bonus_claimed: Boolean(value?.welcome_bonus_claimed),
  };
}

function getStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");

  if (saved === "tr" || saved === "en" || saved === "ru") {
    return saved;
  }

  return "tr";
}

function formatMoney(value: number, currency: PreferredCurrency) {
  const safeValue = Number(value || 0);

  if (currency === "TL") {
    return `${safeValue.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TL`;
  }

  if (currency === "RUB") {
    return `${safeValue.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} RUB`;
  }

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

function getWalletBalance(user: PublicUser) {
  if (user.preferred_currency === "USD") {
    return formatMoney(user.balance_usd, "USD");
  }

  if (user.preferred_currency === "RUB") {
    return formatMoney(user.balance_rub, "RUB");
  }

  return formatMoney(user.balance_tl, "TL");
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
        setUser(normalizePublicUser(data.user));
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
    setSelectedLocale(getStoredLocale());
    loadMe();
  }, []);

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

  const walletBalance = useMemo(() => {
    if (!user) return "0,00 TL";
    return getWalletBalance(user);
  }, [user]);

  if (loading) {
    return (
      <div className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:w-auto">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Hesap kontrol ediliyor...
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex h-12 min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-xs font-black text-black shadow-[0_10px_26px_rgba(52,211,153,0.18)]">
              {getInitials(user)}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200/70">
                Hoş geldin
              </p>
              <p className="max-w-[95px] truncate text-xs font-black text-white sm:max-w-[118px]">
                {user.full_name || user.email}
              </p>
            </div>
          </div>

          <a
            href="/hesabim/bakiye"
            className="flex h-12 min-w-0 items-center justify-between gap-2 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-400/14 to-emerald-400/10 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-emerald-400/10"
          >
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/70">
                Cüzdan
              </p>
              <p className="truncate text-xs font-black text-white">
                {walletBalance}
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black text-emerald-300">
              {user.preferred_currency}
            </span>
          </a>

          <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`h-9 flex-1 rounded-xl px-2 text-[10px] font-black uppercase transition sm:px-3 ${
                  selectedLocale === locale
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <a
            href="/hesabim"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
          >
            Hesabım
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="col-span-2 inline-flex h-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 text-xs font-black text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-400/15 sm:col-span-auto"
          >
            Çıkış
          </button>
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <div className="col-span-2 flex h-12 items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-auto">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`h-9 flex-1 rounded-xl px-3 text-[10px] font-black uppercase transition ${
                  selectedLocale === locale
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openAuth("login")}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
          >
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={() => openAuth("register")}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 text-xs font-black text-black shadow-[0_16px_38px_rgba(52,211,153,0.18)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-emerald-400"
          >
            Üye Ol
          </button>
        </div>
      )}

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(nextUser) => setUser(normalizePublicUser(nextUser))}
      />
    </>
  );
}