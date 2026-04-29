"use client";

import { useEffect, useState } from "react";
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
  free_analysis_used: boolean;
  welcome_bonus_claimed: boolean;
};

type AuthMode = "login" | "register";

function formatBalance(value: number) {
  return `${Number(value || 0).toFixed(2)} USD`;
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
        setUser(data.user);
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
    } catch {
      setUser(null);
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/50">
        Hesap kontrol ediliyor...
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2">
            <p className="text-xs text-emerald-200/80">Hoş geldin</p>
            <p className="max-w-[180px] truncate text-sm font-bold text-white">
              {user.full_name || user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2">
            <p className="text-xs text-sky-200/80">Bakiye</p>
            <p className="text-sm font-bold text-white">
              {formatBalance(user.balance_usd)}
            </p>
          </div>

          <a
            href="/hesabim"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
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
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
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
