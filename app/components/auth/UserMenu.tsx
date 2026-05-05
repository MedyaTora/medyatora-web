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

export default function UserMenu() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

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
    loadMe();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      setUser(null);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  const walletBalance = useMemo(() => {
    if (!user) return "0,00 TL";
    return getWalletBalance(user);
  }, [user]);

  if (loading) {
    return (
      <div className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:w-auto">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
        Hesap kontrol ediliyor...
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-xs font-black text-white">
              {getInitials(user)}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/38">
                Hoş geldin
              </p>
              <p className="max-w-[95px] truncate text-xs font-black text-white sm:max-w-[118px]">
                {user.full_name || user.email}
              </p>
            </div>
          </div>

          <a
            href="/hesabim/bakiye"
            className="flex h-11 min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075]"
          >
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/38">
                Cüzdan
              </p>
              <p className="truncate text-xs font-black text-white">
                {walletBalance}
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black text-white/70">
              {user.preferred_currency}
            </span>
          </a>

          <a
            href="/hesabim"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-xs font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Hesabım
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-black text-white/62 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Çıkış
          </button>
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-xs font-black text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={() => openAuth("register")}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-xs font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Üye Ol
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

          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </>
  );
}