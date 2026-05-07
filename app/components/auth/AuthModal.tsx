"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaGoogle,
  FaShieldHalved,
  FaUserCheck,
  FaXmark,
} from "react-icons/fa6";
import { detectBrowserLocale, type Locale } from "@/lib/i18n";

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
  preferred_currency?: PreferredCurrency;
  free_analysis_used: boolean;
  welcome_bonus_claimed: boolean;
  whatsapp_verified_at?: string | null;
  telegram_verified_at?: string | null;
  contact_bonus_granted_at?: string | null;
};

type AuthMode = "login" | "register";

type Props = {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthenticated: (user: PublicUser) => void;
};

const authText: Record<
  Locale,
  {
    close: string;
    brandSubtitle: string;
    benefitsEyebrow: string;
    benefitsTitle: string;
    benefitsDesc: string;
    freeAnalysisTitle: string;
    freeAnalysisDesc: string;
    secureSessionTitle: string;
    secureSessionDesc: string;
    accountEyebrow: string;
    loginTitle: string;
    registerTitle: string;
    loginDesc: string;
    registerDesc: string;
    loginTab: string;
    registerTab: string;
    googleButton: string;
    orText: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    passwordAgain: string;
    passwordAgainPlaceholder: string;
    processing: string;
    createAccount: string;
    loginButton: string;
    footerNote: string;
    requiredEmailPassword: string;
    requiredFullName: string;
    passwordMismatch: string;
    shortPassword: string;
    genericFailed: string;
    genericError: string;
  }
> = {
  tr: {
    close: "Kapat",
    brandSubtitle: "Sosyal medya destek sistemi",
    benefitsEyebrow: "Hesap avantajları",
    benefitsTitle: "Analiz, bakiye ve siparişlerini tek yerden yönet.",
    benefitsDesc:
      "MedyaTora hesabı ile analiz hakkını, bakiye durumunu ve sipariş geçmişini daha düzenli takip edebilirsin.",
    freeAnalysisTitle: "Ücretsiz analiz hakkı",
    freeAnalysisDesc: "Üyelik sistemiyle analiz talepleri hesabına bağlanacak.",
    secureSessionTitle: "Güvenli oturum",
    secureSessionDesc: "Oturum bilgileri tarayıcıda güvenli cookie ile tutulur.",
    accountEyebrow: "MedyaTora hesap",
    loginTitle: "Giriş yap",
    registerTitle: "Üye ol",
    loginDesc: "Hesabına giriş yap, bakiye ve sipariş işlemlerine devam et.",
    registerDesc:
      "Hesabını oluştur, ücretsiz analiz ve kullanıcı paneli özelliklerinden yararlan.",
    loginTab: "Giriş Yap",
    registerTab: "Üye Ol",
    googleButton: "Google ile devam et",
    orText: "veya e-posta ile devam et",
    fullName: "Ad Soyad",
    fullNamePlaceholder: "Adını ve soyadını yaz",
    email: "E-posta",
    emailPlaceholder: "ornek@mail.com",
    password: "Şifre",
    passwordPlaceholder: "En az 8 karakter",
    passwordAgain: "Şifre Tekrar",
    passwordAgainPlaceholder: "Şifreni tekrar yaz",
    processing: "İşleniyor...",
    createAccount: "Hesap Oluştur",
    loginButton: "Giriş Yap",
    footerNote:
      "MedyaTora hesabın; analiz, bakiye ve sipariş işlemlerini daha düzenli yönetmek için kullanılır.",
    requiredEmailPassword: "E-posta ve şifre zorunludur.",
    requiredFullName: "Ad soyad alanı zorunludur.",
    passwordMismatch: "Şifreler aynı değil.",
    shortPassword: "Şifre en az 8 karakter olmalıdır.",
    genericFailed: "İşlem başarısız.",
    genericError: "Bir hata oluştu.",
  },

  en: {
    close: "Close",
    brandSubtitle: "Social media support system",
    benefitsEyebrow: "Account benefits",
    benefitsTitle: "Manage analysis, balance, and orders in one place.",
    benefitsDesc:
      "With a MedyaTora account, you can track your analysis rights, wallet balance, and order history more easily.",
    freeAnalysisTitle: "Free analysis right",
    freeAnalysisDesc: "Your analysis requests will be linked to your account.",
    secureSessionTitle: "Secure session",
    secureSessionDesc:
      "Session information is stored with a secure browser cookie.",
    accountEyebrow: "MedyaTora account",
    loginTitle: "Login",
    registerTitle: "Sign up",
    loginDesc: "Log in to continue with your balance and order operations.",
    registerDesc:
      "Create your account and use free analysis and user panel features.",
    loginTab: "Login",
    registerTab: "Sign Up",
    googleButton: "Continue with Google",
    orText: "or continue with email",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "example@mail.com",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    passwordAgain: "Repeat Password",
    passwordAgainPlaceholder: "Enter your password again",
    processing: "Processing...",
    createAccount: "Create Account",
    loginButton: "Login",
    footerNote:
      "Your MedyaTora account is used to manage analysis, balance, and order operations more easily.",
    requiredEmailPassword: "Email and password are required.",
    requiredFullName: "Full name is required.",
    passwordMismatch: "Passwords do not match.",
    shortPassword: "Password must be at least 8 characters.",
    genericFailed: "Operation failed.",
    genericError: "Something went wrong.",
  },

  ru: {
    close: "Закрыть",
    brandSubtitle: "Система поддержки социальных сетей",
    benefitsEyebrow: "Преимущества аккаунта",
    benefitsTitle: "Управляйте анализом, балансом и заказами в одном месте.",
    benefitsDesc:
      "С аккаунтом MedyaTora вы можете удобнее отслеживать право на анализ, баланс и историю заказов.",
    freeAnalysisTitle: "Право на бесплатный анализ",
    freeAnalysisDesc: "Заявки на анализ будут привязаны к вашему аккаунту.",
    secureSessionTitle: "Безопасная сессия",
    secureSessionDesc: "Данные сессии хранятся в защищённом cookie браузера.",
    accountEyebrow: "Аккаунт MedyaTora",
    loginTitle: "Войти",
    registerTitle: "Регистрация",
    loginDesc:
      "Войдите в аккаунт, чтобы продолжить операции с балансом и заказами.",
    registerDesc:
      "Создайте аккаунт и используйте бесплатный анализ и функции личного кабинета.",
    loginTab: "Войти",
    registerTab: "Регистрация",
    googleButton: "Продолжить с Google",
    orText: "или продолжить через e-mail",
    fullName: "Имя и фамилия",
    fullNamePlaceholder: "Введите имя и фамилию",
    email: "E-mail",
    emailPlaceholder: "example@mail.com",
    password: "Пароль",
    passwordPlaceholder: "Минимум 8 символов",
    passwordAgain: "Повторите пароль",
    passwordAgainPlaceholder: "Введите пароль ещё раз",
    processing: "Обработка...",
    createAccount: "Создать аккаунт",
    loginButton: "Войти",
    footerNote:
      "Аккаунт MedyaTora используется для удобного управления анализом, балансом и заказами.",
    requiredEmailPassword: "E-mail и пароль обязательны.",
    requiredFullName: "Имя и фамилия обязательны.",
    passwordMismatch: "Пароли не совпадают.",
    shortPassword: "Пароль должен быть не менее 8 символов.",
    genericFailed: "Операция не выполнена.",
    genericError: "Произошла ошибка.",
  },
};

function normalizePreferredCurrency(value: unknown): PreferredCurrency {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "TL";
}

function normalizePublicUser(user: any): PublicUser {
  return {
    id: Number(user?.id || 0),
    email: String(user?.email || ""),
    full_name: user?.full_name || null,
    username: user?.username || null,
    phone_number: user?.phone_number || null,
    email_verified: Boolean(user?.email_verified),
    phone_verified: Boolean(user?.phone_verified),
    balance_usd: Number(user?.balance_usd || 0),
    balance_tl: Number(user?.balance_tl || 0),
    balance_rub: Number(user?.balance_rub || 0),
    preferred_currency: normalizePreferredCurrency(user?.preferred_currency),
    free_analysis_used: Boolean(user?.free_analysis_used),
    welcome_bonus_claimed: Boolean(user?.welcome_bonus_claimed),
    whatsapp_verified_at: user?.whatsapp_verified_at || null,
    telegram_verified_at: user?.telegram_verified_at || null,
    contact_bonus_granted_at: user?.contact_bonus_granted_at || null,
  };
}

export default function AuthModal({
  open,
  initialMode = "login",
  onClose,
  onAuthenticated,
}: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [locale, setLocale] = useState<Locale>("tr");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordAgain, setPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const isRegister = mode === "register";

  const t = useMemo(() => authText[locale] || authText.tr, [locale]);

  useEffect(() => {
    setMounted(true);
    setLocale(detectBrowserLocale());
  }, []);

  useEffect(() => {
    function handleLocaleChange(event: Event) {
      const customEvent = event as CustomEvent<{ locale?: Locale }>;
      const nextLocale = customEvent.detail?.locale;

      if (nextLocale === "tr" || nextLocale === "en" || nextLocale === "ru") {
        setLocale(nextLocale);
        return;
      }

      setLocale(detectBrowserLocale());
    }

    window.addEventListener("medyatora_locale_change", handleLocaleChange);
    window.addEventListener("medyatora_locale_changed", handleLocaleChange);

    return () => {
      window.removeEventListener("medyatora_locale_change", handleLocaleChange);
      window.removeEventListener(
        "medyatora_locale_changed",
        handleLocaleChange
      );
    };
  }, []);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError("");
      setLocale(detectBrowserLocale());
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

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google/start";
  }

  async function handleSubmit() {
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError(t.requiredEmailPassword);
      return;
    }

    if (isRegister && !fullName.trim()) {
      setError(t.requiredFullName);
      return;
    }

    if (isRegister && cleanPassword !== passwordAgain.trim()) {
      setError(t.passwordMismatch);
      return;
    }

    if (cleanPassword.length < 8) {
      setError(t.shortPassword);
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
        throw new Error(data.error || t.genericFailed);
      }

      onAuthenticated(normalizePublicUser(data.user));
      onClose();

      setFullName("");
      setEmail("");
      setPassword("");
      setPasswordAgain("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex min-h-screen items-center justify-center overflow-y-auto bg-[#030712]/90 px-4 py-8 backdrop-blur-2xl">
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div className="relative z-10 w-full max-w-[920px] overflow-hidden rounded-[34px] border border-white/10 bg-[#0b1120] text-white shadow-[0_30px_140px_rgba(0,0,0,0.72)]">
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-white/[0.055] blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden border-r border-white/10 bg-white/[0.025] p-8 lg:block">
            <a href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white text-base font-black text-black shadow-[0_16px_42px_rgba(255,255,255,0.10)]">
                MT
              </div>

              <div>
                <div className="text-lg font-black tracking-tight">
                  MedyaTora
                </div>
                <div className="text-xs text-white/45">
                  {t.brandSubtitle}
                </div>
              </div>
            </a>

            <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
                {t.benefitsEyebrow}
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
                {t.benefitsTitle}
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/60">
                {t.benefitsDesc}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white">
                  <FaUserCheck />
                </div>
                <p className="text-sm font-bold">{t.freeAnalysisTitle}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {t.freeAnalysisDesc}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white">
                  <FaShieldHalved />
                </div>
                <p className="text-sm font-bold">{t.secureSessionTitle}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {t.secureSessionDesc}
                </p>
              </div>
            </div>
          </aside>

          <section className="p-5 sm:p-7 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">
                  {t.accountEyebrow}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {isRegister ? t.registerTitle : t.loginTitle}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
                  {isRegister ? t.registerDesc : t.loginDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
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
                {t.loginTab}
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
                {t.registerTab}
              </button>
            </div>

            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-5 py-3.5 text-sm font-black text-black shadow-[0_16px_44px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                <FaGoogle className="text-base" />
                {t.googleButton}
              </button>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                  {t.orText}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <div className="space-y-3">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                    {t.fullName}
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    autoComplete="name"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-white/35 focus:bg-white/[0.08]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                  {t.email}
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-white/35 focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                  {t.password}
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-white/35 focus:bg-white/[0.08]"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
                    {t.passwordAgain}
                  </label>
                  <input
                    value={passwordAgain}
                    onChange={(e) => setPasswordAgain(e.target.value)}
                    placeholder={t.passwordAgainPlaceholder}
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none placeholder:text-white/28 transition focus:border-white/35 focus:bg-white/[0.08]"
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
             className="mt-2 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black shadow-[0_16px_44px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading
                  ? t.processing
                  : isRegister
                    ? t.createAccount
                    : t.loginButton}
              </button>

              <p className="text-center text-xs leading-5 text-white/38">
                {t.footerNote}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}