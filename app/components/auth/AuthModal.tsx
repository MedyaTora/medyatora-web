"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaShieldHalved, FaUserCheck, FaXmark } from "react-icons/fa6";

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

type Props = {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthenticated: (user: PublicUser) => void;
};

export default function AuthModal({
  open,
  initialMode = "login",
  onClose,
  onAuthenticated,
}: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordAgain, setPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  const isRegister = mode === "register";

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError("");
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  async function handleSubmit() {
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }

    if (isRegister && !fullName.trim()) {
      setError("Ad soyad alanı zorunludur.");
      return;
    }

    if (isRegister && cleanPassword !== passwordAgain.trim()) {
      setError("Şifreler aynı değil.");
      return;
    }

    if (cleanPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

      const body = isRegister
        ? {
            full_name: fullName.trim(),
            email: cleanEmail,
            password: cleanPassword,
          }
        : {
            email: cleanEmail,
            password: cleanPassword,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "İşlem başarısız.");
      }

      onAuthenticated(data.user);
      onClose();

      setFullName("");
      setEmail("");
      setPassword("");
      setPasswordAgain("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex min-h-screen items-center justify-center overflow-y-auto bg-[#030712]/90 px-4 py-8 backdrop-blur-2xl">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div className="relative z-10 w-full max-w-[920px] overflow-hidden rounded-[34px] border border-white/10 bg-[#0b1120] text-white shadow-[0_30px_140px_rgba(0,0,0,0.72)]">
        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden border-r border-white/10 bg-white/[0.025] p-8 lg:block">
            <a href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-base font-black text-black">
                MT
              </div>

              <div>
                <div className="text-lg font-black tracking-tight">
                  MedyaTora
                </div>
                <div className="text-xs text-white/45">
                  Sosyal medya destek sistemi
                </div>
              </div>
            </a>

            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
                Hesap avantajları
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
                Analiz, bakiye ve siparişlerini tek yerden yönet.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/60">
                MedyaTora hesabı ile analiz hakkını, bakiye durumunu ve sipariş
                geçmişini daha düzenli takip edebilirsin.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <FaUserCheck />
                </div>
                <p className="text-sm font-bold">Ücretsiz analiz hakkı</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Üyelik sistemiyle analiz talepleri hesabına bağlanacak.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <FaShieldHalved />
                </div>
                <p className="text-sm font-bold">Güvenli oturum</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Oturum bilgileri tarayıcıda güvenli cookie ile tutulur.
                </p>
              </div>
            </div>
          </aside>

          <section className="p-5 sm:p-7 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">
                  MedyaTora hesap
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {isRegister ? "Üye ol" : "Giriş yap"}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
                  {isRegister
                    ? "Hesabını oluştur, ücretsiz analiz ve kullanıcı paneli özelliklerinden yararlan."
                    : "Hesabına giriş yap, bakiye ve sipariş işlemlerine devam et."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  mode === "login"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                Giriş Yap
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  mode === "register"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                Üye Ol
              </button>
            </div>

            <div className="space-y-3">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                    Ad Soyad
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adını ve soyadını yaz"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-emerald-300/70 focus:bg-white/[0.08]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                  E-posta
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-emerald-300/70 focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                  Şifre
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-emerald-300/70 focus:bg-white/[0.08]"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                    Şifre Tekrar
                  </label>
                  <input
                    value={passwordAgain}
                    onChange={(e) => setPasswordAgain(e.target.value)}
                    placeholder="Şifreni tekrar yaz"
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-emerald-300/70 focus:bg-white/[0.08]"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading
                  ? "İşleniyor..."
                  : isRegister
                    ? "Hesap Oluştur"
                    : "Giriş Yap"}
              </button>

              <p className="text-center text-xs leading-5 text-white/38">
                MedyaTora hesabın; analiz, bakiye ve sipariş işlemlerini daha
                düzenli yönetmek için kullanılır.
              </p>
            </div>
          </section>
        </div>
      </div>
      </div>,
    document.body
  );
}