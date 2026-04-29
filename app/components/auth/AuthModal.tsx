"use client";

import { useState } from "react";

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

  if (!open) return null;

  const isRegister = mode === "register";

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111827] p-5 text-white shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              MedyaTora Hesap
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {isRegister ? "Üye Ol" : "Giriş Yap"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/60">
              {isRegister
                ? "Hesabını oluştur, ücretsiz analiz hakkı kazan. Telefon doğrulama sonrası başlangıç bakiyesi aktif edilecek."
                : "Hesabına giriş yap, bakiye ve analiz haklarını görüntüle."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
          >
            Kapat
          </button>
        </div>

        <div className="mt-5 flex rounded-2xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition ${
              mode === "login"
                ? "bg-emerald-400 text-black"
                : "text-white/65 hover:bg-white/5 hover:text-white"
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
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition ${
              mode === "register"
                ? "bg-emerald-400 text-black"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            Üye Ol
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {isRegister && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
          />

          {isRegister && (
            <input
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
              placeholder="Şifre Tekrar"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400 focus:bg-white/[0.075]"
            />
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(52,211,153,0.18)] transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading
              ? "İşleniyor..."
              : isRegister
                ? "Üye Ol ve Ücretsiz Analiz Hakkı Kazan"
                : "Giriş Yap"}
          </button>

          <p className="text-center text-xs leading-5 text-white/45">
            Şifreler güvenli şekilde saklanır. MedyaTora hesabınla analiz, bakiye ve sipariş geçmişi özellikleri aktif olur.
          </p>
        </div>
      </div>
    </div>
  );
}