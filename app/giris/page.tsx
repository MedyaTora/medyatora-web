"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaCheck,
  FaLock,
  FaShieldHalved,
  FaUserCheck,
} from "react-icons/fa6";

type Mode = "login" | "register";

function GirisPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode: Mode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const nextMode: Mode =
      searchParams.get("mode") === "register" ? "register" : "login";

    setMode(nextMode);
  }, [searchParams]);

  const title = mode === "login" ? "Giriş yap" : "Üye ol";

  const description =
    mode === "login"
      ? "Hesabına giriş yap, bakiye ve sipariş işlemlerine devam et."
      : "Hesabını oluştur, ücretsiz analiz ve kullanıcı paneli özelliklerinden yararlan.";

  const buttonText = useMemo(() => {
    if (loading) {
      return mode === "login" ? "Giriş yapılıyor..." : "Hesap oluşturuluyor...";
    }

    return mode === "login" ? "Giriş Yap" : "Hesap Oluştur";
  }, [loading, mode]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setMessageType("");
    setPassword("");
    setPasswordAgain("");

    const url = nextMode === "register" ? "/giris?mode=register" : "/giris";
    window.history.replaceState(null, "", url);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedFullName = fullName.trim();

    if (!cleanedEmail || !password.trim()) {
      setMessage("E-posta ve şifre alanları zorunludur.");
      setMessageType("error");
      return;
    }

    if (mode === "register") {
      if (!cleanedFullName) {
        setMessage("Üye olmak için ad soyad alanı zorunludur.");
        setMessageType("error");
        return;
      }

      if (password.length < 6) {
        setMessage("Şifre en az 6 karakter olmalıdır.");
        setMessageType("error");
        return;
      }

      if (password !== passwordAgain) {
        setMessage("Şifre tekrarı aynı olmalıdır.");
        setMessageType("error");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanedEmail,
          password,
          full_name: cleanedFullName,
          fullName: cleanedFullName,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false || data.ok === false) {
        throw new Error(
          data.error ||
            data.message ||
            (mode === "login"
              ? "Giriş yapılamadı."
              : "Hesap oluşturulamadı.")
        );
      }

      setMessage(
        mode === "login"
          ? "Giriş başarılı. Hesabına yönlendiriliyorsun."
          : "Hesabın oluşturuldu. Hesabına yönlendiriliyorsun."
      );
      setMessageType("success");

      setTimeout(() => {
        router.push("/hesabim");
        router.refresh();
      }, 600);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Bir hata oluştu.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mt-auth-page">
      <div className="mt-auth-shell">
        <div className="mt-auth-card">
          <section className="mt-auth-left">
            <div className="mt-auth-left-content">
              <a href="/" className="mt-auth-logo">
                <div className="mt-auth-logo-mark">MT</div>

                <div>
                  <div className="text-lg font-black tracking-tight text-white">
                    MedyaTora
                  </div>
                  <div className="text-xs text-white/45">
                    Sosyal medya destek sistemi
                  </div>
                </div>
              </a>

              <div className="mt-12">
                <p className="mt-auth-eyebrow">Hesap avantajları</p>

                <h1 className="mt-auth-title">
                  Analiz, bakiye ve siparişlerini tek yerden yönet.
                </h1>

                <p className="mt-auth-text">
                  MedyaTora hesabı ile analiz hakkını, bakiye durumunu ve
                  sipariş geçmişini daha düzenli takip edebilirsin.
                </p>
              </div>

              <div className="mt-9 space-y-4">
                <div className="mt-auth-benefit">
                  <div className="mt-auth-benefit-icon">
                    <FaUserCheck />
                  </div>

                  <p className="mt-5 text-sm font-black text-white">
                    Ücretsiz analiz hakkı
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Üyelik sistemiyle analiz talepleri hesabına bağlanacak.
                  </p>
                </div>

                <div className="mt-auth-benefit">
                  <div className="mt-auth-benefit-icon">
                    <FaShieldHalved />
                  </div>

                  <p className="mt-5 text-sm font-black text-white">
                    Güvenli oturum
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Oturum bilgileri tarayıcıda güvenli cookie ile tutulur.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-auth-right">
            <a
              href="/"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Ana sayfaya dön"
            >
              <FaArrowLeft />
            </a>

            <div className="max-w-md">
              <p className="mt-auth-eyebrow">MedyaTora hesap</p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
                {title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/58">
                {description}
              </p>

              <div className="mt-7 mt-auth-tabs">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`mt-auth-tab ${
                    mode === "login" ? "mt-auth-tab-active" : ""
                  }`}
                >
                  Giriş Yap
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`mt-auth-tab ${
                    mode === "register" ? "mt-auth-tab-active" : ""
                  }`}
                >
                  Üye Ol
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="mt-auth-label">Ad Soyad</label>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Adını ve soyadını yaz"
                      className="mt-auth-field"
                      autoComplete="name"
                    />
                  </div>
                )}

                <div>
                  <label className="mt-auth-label">E-posta</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ornek@mail.com"
                    className="mt-auth-field"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div>
                  <label className="mt-auth-label">Şifre</label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Şifreni yaz"
                    className="mt-auth-field"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="mt-auth-label">Şifre Tekrar</label>
                    <input
                      value={passwordAgain}
                      onChange={(event) =>
                        setPasswordAgain(event.target.value)
                      }
                      placeholder="Şifreni tekrar yaz"
                      className="mt-auth-field"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {message && (
                  <div
                    className={`mt-auth-message ${
                      messageType === "error"
                        ? "mt-auth-error"
                        : "mt-auth-success"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-auth-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {buttonText}
                </button>
              </form>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/48">
                <FaLock className="mt-0.5 shrink-0 text-white/55" />
                <span>
                  MedyaTora hesabın; analiz, bakiye ve sipariş işlemlerini daha
                  düzenli yönetmek için kullanılır.
                </span>
              </div>

              <div className="mt-5 grid gap-2 text-xs text-white/45 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-white/65" />
                  Sipariş takibi
                </div>

                <div className="flex items-center gap-2">
                  <FaCheck className="text-white/65" />
                  Bakiye yönetimi
                </div>

                <div className="flex items-center gap-2">
                  <FaCheck className="text-white/65" />
                  Analiz geçmişi
                </div>

                <div className="flex items-center gap-2">
                  <FaCheck className="text-white/65" />
                  Güvenli oturum
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={null}>
      <GirisPageInner />
    </Suspense>
  );
}