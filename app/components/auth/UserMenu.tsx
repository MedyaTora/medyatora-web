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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 64,
    right: 12,
  });

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

  function updateDropdownPosition() {
    if (typeof window === "undefined") return;
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 280;
    const safeGap = 12;

    let right = window.innerWidth - rect.right;
    right = Math.max(safeGap, right);

    if (right + dropdownWidth > window.innerWidth - safeGap) {
      right = safeGap;
    }

    setDropdownPosition({
      top: Math.max(safeGap, rect.bottom + 10),
      right,
    });
  }

  useEffect(() => {
    const detectedLocale = detectBrowserLocale();

    setSelectedLocale(detectedLocale);
    saveLocale(detectedLocale);
    saveLocaleCookie(detectedLocale);

    loadMe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    updateDropdownPosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedTrigger = menuRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedTrigger && !clickedDropdown) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function handleReposition() {
      updateDropdownPosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [menuOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setMenuOpen(false);
    } catch {
      setUser(null);
      setMenuOpen(false);
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
        className="relative z-[9999] flex max-w-full shrink-0 items-center justify-end gap-2"
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
          <div className="relative flex max-w-full justify-end">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                updateDropdownPosition();
                setMenuOpen((prev) => !prev);
              }}
              aria-label={text.menu}
              className="inline-flex h-10 max-w-[220px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.10]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-black shadow-[0_10px_26px_rgba(255,255,255,0.1)]">
                {getInitials(user)}
              </span>

              <span className="min-w-0 text-left">
                <span className="block max-w-[105px] truncate text-[11px] font-black leading-4 text-white sm:max-w-[120px]">
                  {getDisplayName(user)}
                </span>

                <span className="block max-w-[105px] truncate text-[9px] font-bold uppercase tracking-[0.12em] text-white/42 sm:max-w-[120px]">
                  {walletBalance}
                </span>
              </span>

              <span className="ml-1 text-[10px] font-black text-white/45">
                ▾
              </span>
            </button>
          </div>
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

      {user && menuOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[99999] w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-white/10 bg-[#080a0d]/98 p-2 shadow-[0_26px_90px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.035] backdrop-blur-2xl"
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right,
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
              {text.welcome}
            </p>

            <p className="mt-1 truncate text-sm font-black text-white">
              {getDisplayName(user)}
            </p>

            <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
          </div>

          <a
            href="/hesabim/bakiye"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm transition hover:bg-white/[0.08]"
          >
            <span className="font-bold text-white/75">{text.wallet}</span>
            <span className="font-black text-white">{walletBalance}</span>
          </a>

          <a
            href="/hesabim/bakiye"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm font-bold text-white/78 transition hover:bg-white/[0.08] hover:text-white"
          >
            <span>{text.balance}</span>
            <span className="text-white/35">→</span>
          </a>

          <a
            href="/hesabim/siparisler"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm font-bold text-white/78 transition hover:bg-white/[0.08] hover:text-white"
          >
            <span>{text.orders}</span>
            <span className="text-white/35">→</span>
          </a>

          <a
            href="/hesabim"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm font-bold text-white/78 transition hover:bg-white/[0.08] hover:text-white"
          >
            <span>{text.account}</span>
            <span className="text-white/35">→</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="mt-2 w-full rounded-2xl border border-[#6b2232]/75 bg-[#241018]/80 px-3 py-3 text-left text-sm font-black text-[#f2c7d1] transition hover:bg-[#351321]"
          >
            {text.logout}
          </button>
        </div>
      )}

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(nextUser) => {
          setUser(normalizePublicUser(nextUser));
          setAuthOpen(false);
        }}
      />
    </>
  );
}