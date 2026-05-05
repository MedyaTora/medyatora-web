"use client";

import { useEffect, useMemo, useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import AuthModal from "./AuthModal";
import { detectBrowserLocale, saveLocale, type Locale } from "@/lib/i18n";

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
  whatsapp_verified_at?: string | null;
  telegram_verified_at?: string | null;
  contact_bonus_granted_at?: string | null;
};

type AuthMode = "login" | "register";

type Props = {
  showLocaleSwitcher?: boolean;
};

const localeOptions: Locale[] = ["tr", "en", "ru"];

const userMenuText: Record<
  Locale,
  {
    checking: string;
    welcome: string;
    wallet: string;
    account: string;
    logout: string;
    login: string;
    register: string;
    googleLogin: string;
    language: string;
  }
> = {
  tr: {
    checking: "Kontrol...",
    welcome: "Hoş geldin",
    wallet: "Cüzdan",
    account: "Hesabım",
    logout: "Çıkış",
    login: "Giriş Yap",
    register: "Üye Ol",
    googleLogin: "Google",
    language: "Dil",
  },
  en: {
    checking: "Checking...",
    welcome: "Welcome",
    wallet: "Wallet",
    account: "Account",
    logout: "Logout",
    login: "Login",
    register: "Sign Up",
    googleLogin: "Google",
    language: "Language",
  },
  ru: {
    checking: "Проверка...",
    welcome: "Добро пожаловать",
    wallet: "Баланс",
    account: "Аккаунт",
    logout: "Выйти",
    login: "Войти",
    register: "Регистрация",
    googleLogin: "Google",
    language: "Язык",
  },
};

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
    whatsapp_verified_at: value?.whatsapp_verified_at || null,
    telegram_verified_at: value?.telegram_verified_at || null,
    contact_bonus_granted_at: value?.contact_bonus_granted_at || null,
  };
}

function formatMoney(value: number, currency: PreferredCurrency) {
  const safeValue = Number(value || 0);

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
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

function saveLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;

  document.cookie = `medyatora_locale=${locale}; path=/; max-age=${
    60 * 60 * 24 * 365
  }; SameSite=Lax`;
}

function notifyLocaleChange(locale: Locale) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("medyatora_locale_change", {
      detail: { locale },
    })
  );

  window.dispatchEvent(
    new CustomEvent("medyatora_locale_changed", {
      detail: { locale },
    })
  );
}

export default function UserMenu({ showLocaleSwitcher = true }: Props) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");

  const text = userMenuText[selectedLocale] || userMenuText.tr;

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
    const detectedLocale = detectBrowserLocale();

    setSelectedLocale(detectedLocale);
    saveLocale(detectedLocale);
    saveLocaleCookie(detectedLocale);

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

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google/start";
  }

  function handleLocaleChange(locale: Locale) {
    setSelectedLocale(locale);
    saveLocale(locale);
    saveLocaleCookie(locale);
    notifyLocaleChange(locale);

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  const walletBalance = useMemo(() => {
    if (!user) return "0,00 TL";
    return getWalletBalance(user);
  }, [user]);

  if (loading) {
    return (
      <div className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 text-[11px] font-bold text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white sm:h-2 sm:w-2" />
        {text.checking}
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
        {showLocaleSwitcher && (
          <div className="flex h-9 items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-12 sm:rounded-2xl">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`h-7 rounded-full px-2 text-[9px] font-black uppercase transition sm:h-9 sm:rounded-xl sm:px-3 sm:text-[10px] ${
                  selectedLocale === locale
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/[0.08] hover:text-white"
                }`}
                aria-label={`${text.language}: ${locale.toUpperCase()}`}
              >
                {locale}
              </button>
            ))}
          </div>
        )}

        {user ? (
          <>
            <div className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-12 sm:rounded-2xl sm:px-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-black text-black shadow-[0_10px_26px_rgba(255,255,255,0.12)] sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs">
                {getInitials(user)}
              </div>

              <div className="min-w-0">
                <p className="hidden text-[9px] font-black uppercase tracking-[0.16em] text-white/50 sm:block">
                  {text.welcome}
                </p>

                <p className="max-w-[74px] truncate text-[11px] font-black text-white sm:max-w-[118px] sm:text-xs">
                  {user.full_name || user.email}
                </p>
              </div>
            </div>

            <a
              href="/hesabim/bakiye"
              className="flex h-9 min-w-0 items-center justify-between gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1] sm:h-12 sm:rounded-2xl sm:px-3"
            >
              <div className="min-w-0">
                <p className="hidden text-[9px] font-black uppercase tracking-[0.16em] text-white/45 sm:block">
                  {text.wallet}
                </p>

                <p className="max-w-[82px] truncate text-[11px] font-black text-white sm:max-w-none sm:text-xs">
                  {walletBalance}
                </p>
              </div>

              <span className="hidden shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black text-white/70 sm:inline-flex">
                {user.preferred_currency}
              </span>
            </a>

            <a
              href="/hesabim"
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 text-[11px] font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white sm:h-12 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.account}
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#6b2232] bg-[#31101b]/70 px-3 text-[11px] font-black text-[#f2c7d1] transition hover:-translate-y-0.5 hover:bg-[#4a1625] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.logout}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-3 text-[11px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.11] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.login}
            </button>

            <button
              type="button"
              onClick={() => openAuth("register")}
              className="inline-flex h-9 items-center justify-center rounded-full border border-white bg-white px-3 text-[11px] font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-white/90 sm:h-12 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.register}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/[0.08] px-3 text-[11px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.13] sm:h-12 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              <FaGoogle className="text-[11px] sm:text-xs" />
              {text.googleLogin}
            </button>
          </>
        )}
      </div>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(nextUser) => setUser(normalizePublicUser(nextUser))}
      />
    </>
  );
}