"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaEnvelope, FaPaperPlane } from "react-icons/fa6";
import { detectBrowserLocale, type Locale } from "@/lib/i18n";

type Props = {
  email: string;
  initialEmailVerified: boolean;
  initialFreeAnalysisGrantedAt?: string | null;
};

type TextContent = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDesc: string;
  emailLabel: string;
  verified: string;
  notVerified: string;
  freeAnalysisTitle: string;
  freeAnalysisGranted: string;
  freeAnalysisWaiting: string;
  sendCode: string;
  sendingCode: string;
  codeLabel: string;
  codePlaceholder: string;
  verifyCode: string;
  verifyingCode: string;
  emptyCodeError: string;
  sendFailed: string;
  verifyFailed: string;
  genericError: string;
  codeSentTitle: string;
  successTitle: string;
};

const texts: Record<Locale, TextContent> = {
  tr: {
    sectionEyebrow: "E-posta doğrulama",
    sectionTitle: "E-posta adresini doğrula",
    sectionDesc:
      "E-posta doğrulaması tamamlanınca hesabına 1 ücretsiz analiz hakkı tanımlanır. Bu hak yalnızca bir kez verilir.",
    emailLabel: "E-posta",
    verified: "Doğrulandı",
    notVerified: "Doğrulanmadı",
    freeAnalysisTitle: "Ücretsiz analiz hakkı",
    freeAnalysisGranted: "Tanımlandı",
    freeAnalysisWaiting: "Bekliyor",
    sendCode: "Kod Gönder",
    sendingCode: "Kod Gönderiliyor...",
    codeLabel: "Doğrulama kodu",
    codePlaceholder: "6 haneli kod",
    verifyCode: "Kodu Doğrula",
    verifyingCode: "Doğrulanıyor...",
    emptyCodeError: "Lütfen 6 haneli doğrulama kodunu yaz.",
    sendFailed: "E-posta doğrulama kodu gönderilemedi.",
    verifyFailed: "E-posta doğrulama kodu doğrulanamadı.",
    genericError: "İşlem sırasında hata oluştu.",
    codeSentTitle: "Kod gönderildi. E-postanı kontrol et.",
    successTitle: "E-posta doğrulaması tamamlandı.",
  },

  en: {
    sectionEyebrow: "Email verification",
    sectionTitle: "Verify your email address",
    sectionDesc:
      "When email verification is completed, 1 free analysis right is assigned to your account. This right is granted only once.",
    emailLabel: "Email",
    verified: "Verified",
    notVerified: "Not verified",
    freeAnalysisTitle: "Free analysis right",
    freeAnalysisGranted: "Granted",
    freeAnalysisWaiting: "Waiting",
    sendCode: "Send Code",
    sendingCode: "Sending...",
    codeLabel: "Verification code",
    codePlaceholder: "6-digit code",
    verifyCode: "Verify Code",
    verifyingCode: "Verifying...",
    emptyCodeError: "Please enter the 6-digit verification code.",
    sendFailed: "Email verification code could not be sent.",
    verifyFailed: "Email verification code could not be verified.",
    genericError: "An error occurred during the process.",
    codeSentTitle: "Code sent. Please check your email.",
    successTitle: "Email verification completed.",
  },

  ru: {
    sectionEyebrow: "Подтверждение e-mail",
    sectionTitle: "Подтвердите e-mail адрес",
    sectionDesc:
      "После подтверждения e-mail аккаунту назначается 1 право на бесплатный анализ. Это право выдаётся только один раз.",
    emailLabel: "E-mail",
    verified: "Подтверждено",
    notVerified: "Не подтверждено",
    freeAnalysisTitle: "Право на бесплатный анализ",
    freeAnalysisGranted: "Назначено",
    freeAnalysisWaiting: "Ожидает",
    sendCode: "Отправить код",
    sendingCode: "Отправляется...",
    codeLabel: "Код подтверждения",
    codePlaceholder: "6-значный код",
    verifyCode: "Подтвердить код",
    verifyingCode: "Проверяется...",
    emptyCodeError: "Введите 6-значный код подтверждения.",
    sendFailed: "Не удалось отправить код подтверждения e-mail.",
    verifyFailed: "Не удалось подтвердить код e-mail.",
    genericError: "Во время операции произошла ошибка.",
    codeSentTitle: "Код отправлен. Проверьте e-mail.",
    successTitle: "Подтверждение e-mail завершено.",
  },
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function EmailVerificationCard({
  email,
  initialEmailVerified,
  initialFreeAnalysisGrantedAt = null,
}: Props) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [emailVerified, setEmailVerified] = useState<boolean>(
    Boolean(initialEmailVerified)
  );
  const [freeAnalysisGrantedAt, setFreeAnalysisGrantedAt] = useState<
    string | null
  >(initialFreeAnalysisGrantedAt || null);

  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const t = useMemo(() => texts[locale] || texts.tr, [locale]);

  useEffect(() => {
    setLocale(detectBrowserLocale());

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
      window.removeEventListener("medyatora_locale_changed", handleLocaleChange);
    };
  }, []);

  async function sendCode() {
    setError("");
    setSuccessMessage("");
    setCodeSent(false);

    if (emailVerified) return;

    setSending(true);

    try {
      const res = await fetch("/api/auth/email/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || t.sendFailed);
      }

      setCodeSent(true);
      setSuccessMessage(String(data.message || t.codeSentTitle));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    setError("");
    setSuccessMessage("");

    const cleanCode = onlyDigits(verificationCode).slice(0, 6);

    if (cleanCode.length !== 6) {
      setError(t.emptyCodeError);
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/email/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email,
          code: cleanCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || t.verifyFailed);
      }

      setEmailVerified(true);
      setVerificationCode("");
      setCodeSent(false);
      setSuccessMessage(String(data.message || t.successTitle));

      if (data.freeAnalysisGrantedAt) {
        setFreeAnalysisGrantedAt(String(data.freeAnalysisGrantedAt));
      } else if (data.freeAnalysisGranted || data.bonusGranted) {
        setFreeAnalysisGrantedAt(new Date().toISOString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
            {t.sectionEyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {t.sectionTitle}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
            {t.sectionDesc}
          </p>
        </div>

        <div className="grid gap-3 sm:min-w-[420px] sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
              {t.emailLabel}
            </p>

            <p className="mt-2 truncate text-sm font-black text-white">
              {email}
            </p>

            <p className="mt-2 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/70">
              {emailVerified ? t.verified : t.notVerified}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
              {t.freeAnalysisTitle}
            </p>

            <p className="mt-2 text-lg font-black text-white">
              {freeAnalysisGrantedAt ? t.freeAnalysisGranted : t.freeAnalysisWaiting}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
          {error}
        </div>
      )}

      {emailVerified ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
              <FaCheck />
            </div>

            <div>
              <p className="text-sm font-black text-white">{t.verified}</p>
              <p className="mt-1 text-sm text-white/55">{email}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.emailLabel}
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <FaEnvelope className="shrink-0 text-white/60" />
                <span className="min-w-0 truncate text-sm font-bold text-white">
                  {email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={sendCode}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPaperPlane />
              {sending ? t.sendingCode : t.sendCode}
            </button>
          </div>

          {codeSent && (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.codeLabel}
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(onlyDigits(event.target.value).slice(0, 6))
                  }
                  placeholder={t.codePlaceholder}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-2xl font-black tracking-[0.18em] text-white outline-none placeholder:text-white/25 transition focus:border-white/24 focus:bg-white/[0.065]"
                />

                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={verifying}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifying ? t.verifyingCode : t.verifyCode}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}