"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    balance: string;
    orders: string;
    logout: string;
    login: string;
    register: string;
    language: string;
    menu: string;
  }
> = {
  tr: {
    checking: "Kontrol...",
    welcome: "Hoş geldin",
    wallet: "Cüzdan",
    account: "Hesabım",
    balance: "Bakiye Yükle",
    orders: "Siparişlerim",
    logout: "Çıkış",
    login: "Giriş Yap",
    register: "Üye Ol",
    language: "Dil",
    menu: "Kullanıcı menüsü",
  },
  en: {
    checking: "Checking...",
    welcome: "Welcome",
    wallet: "Wallet",
    account: "Account",
    balance: "Add Balance",
    orders: "My Orders",
    logout: "Logout",
    login: "Login",
    register: "Sign Up",
    language: "Language",
    menu: "User menu",
  },
  ru: {
    checking: "Проверка...",
    welcome: "Добро пожаловать",
    wallet: "Баланс",
    account: "Аккаунт",
    balance: "Пополнить баланс",
    orders: "Мои заказы",
    logout: "Выйти",
    login: "Войти",
    register: "Регистрация",
    language: "Язык",
    menu: "Меню пользователя",
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

function getDisplayName(user: PublicUser) {
  return user.full_name || user.username || user.email;
}

function getInitials(user: PublicUser) {
  const value = getDisplayName(user).trim();
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
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  useEffect(() => {
    if (!userDropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [userDropdownOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setUserDropdownOpen(false);
    } catch {
      setUser(null);
      setUserDropdownOpen(false);
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
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
      <div className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 text-[11px] font-black text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-10 sm:px-4 sm:text-xs">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        {text.checking}
      </div>
    );
  }

  return (
    <>
      <div
        ref={menuRef}
        className="relative z-[80] flex max-w-full shrink-0 items-center justify-end gap-2"
      >
        {showLocaleSwitcher && (
          <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-10">
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={`h-7 rounded-xl px-2.5 text-[10px] font-black uppercase transition sm:h-8 sm:px-3 ${
                  selectedLocale === locale
                    ? "bg-white text-black shadow-[0_10px_22px_rgba(255,255,255,0.1)]"
                    : "text-white/55 hover:bg-white/[0.08] hover:text-white"
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
            <button
              type="button"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              aria-label={text.menu}
              className="group inline-flex h-10 max-w-[160px] shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.09] sm:px-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-black shadow-[0_10px_26px_rgba(255,255,255,0.1)]">
                {getInitials(user)}
              </span>

              <span className="hidden min-w-0 text-left 2xl:block">
                <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-white/38">
                  {text.welcome}
                </span>

                <span className="block max-w-[92px] truncate text-xs font-black leading-4 text-white">
                  {getDisplayName(user)}
                </span>
              </span>

              <span
                className={`ml-0.5 hidden h-1.5 w-1.5 shrink-0 rounded-full bg-white/55 transition sm:block ${
                  userDropdownOpen ? "scale-125 bg-white" : ""
                }`}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[min(330px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d]/98 p-3 text-white shadow-[0_28px_100px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.035] backdrop-blur-2xl">
                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.12)]">
                      {getInitials(user)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">
                        {getDisplayName(user)}
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-white/45">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="/hesabim/bakiye"
                  onClick={() => setUserDropdownOpen(false)}
                  className="mt-3 block rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/18 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
                        {text.wallet}
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        {walletBalance}
                      </p>
                    </div>

                    <span className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-black text-white/70">
                      {user.preferred_currency}
                    </span>
                  </div>
                </a>

                <div className="mt-3 grid gap-2">
                  <a
                    href="/hesabim"
                    onClick={() => setUserDropdownOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black text-white/82 transition hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
                  >
                    {text.account}
                  </a>

                  <a
                    href="/hesabim/bakiye"
                    onClick={() => setUserDropdownOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black text-white/82 transition hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
                  >
                    {text.balance}
                  </a>

                  <a
                    href="/hesabim/siparisler"
                    onClick={() => setUserDropdownOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-black text-white/82 transition hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
                  >
                    {text.orders}
                  </a>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-[#6b2232]/75 bg-[#241018]/80 px-4 py-3 text-left text-sm font-black text-[#f2c7d1] transition hover:border-[#8d3146] hover:bg-[#351321]"
                  >
                    {text.logout}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.055] px-3 text-[10px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.11] sm:h-10 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.login}
            </button>

            <button
              type="button"
              onClick={() => openAuth("register")}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white bg-white px-3 text-[10px] font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-white/90 sm:h-10 sm:rounded-2xl sm:px-4 sm:text-xs"
            >
              {text.register}
            </button>
          </div>
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