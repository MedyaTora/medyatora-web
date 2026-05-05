"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { detectBrowserLocale, type Locale } from "@/lib/i18n";

type Channel = "whatsapp" | "telegram";
type CountryCode = "TR" | "RU";

type Props = {
  initialWhatsappVerifiedAt?: string | null;
  initialTelegramVerifiedAt?: string | null;
  initialContactBonusGrantedAt?: string | null;
  initialPhoneNumber?: string | null;
};

type TextContent = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDesc: string;

  verifiedChannel: string;
  noVerifiedChannel: string;
  bonusTitle: string;
  bonusGranted: string;
  bonusWaiting: string;

  activeVerificationTitle: string;
  whatsapp: string;
  telegram: string;
  verified: string;
  notVerified: string;

  channelLabel: string;
  countryLabel: string;
  phoneLabel: string;
  phonePlaceholderTR: string;
  phonePlaceholderRU: string;
  codeLabel: string;
  codePlaceholder: string;

  sendCode: string;
  sendingCode: string;
  verifyCode: string;
  verifyingCode: string;

  emptyPhoneError: string;
  emptyCodeError: string;
  startFailed: string;
  verifyFailed: string;
  genericError: string;

  codeSentTitle: string;
  codeSentDesc: string;
  remainingCodeRequests: string;
  cooldownText: string;
  providerDebug: string;
  debugCodeText: string;

  successTitle: string;
};

const texts: Record<Locale, TextContent> = {
  tr: {
    sectionEyebrow: "WhatsApp / Telegram doğrulama",
    sectionTitle: "Telefon numaranı doğrula",
    sectionDesc:
      "WhatsApp veya Telegram üzerinden tek bir telefon numarası doğrulaman yeterli. Doğrulama tamamlanınca 1 USD bonus yalnızca bir kez tanımlanır.",

    verifiedChannel: "Doğrulanan kanal",
    noVerifiedChannel: "Henüz yok",
    bonusTitle: "1 USD bonus",
    bonusGranted: "Tanımlandı",
    bonusWaiting: "Bekliyor",

    activeVerificationTitle: "Telefon doğrulaman aktif.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Doğrulandı",
    notVerified: "Doğrulanmadı",

    channelLabel: "Kanal",
    countryLabel: "Ülke",
    phoneLabel: "Telefon numarası",
    phonePlaceholderTR: "5xx xxx xx xx",
    phonePlaceholderRU: "9xx xxx xx xx",
    codeLabel: "Doğrulama kodu",
    codePlaceholder: "6 haneli kod",

    sendCode: "Kod Gönder",
    sendingCode: "Kod Gönderiliyor...",
    verifyCode: "Kodu Doğrula",
    verifyingCode: "Doğrulanıyor...",

    emptyPhoneError: "Lütfen telefon numaranı yaz.",
    emptyCodeError: "Lütfen 6 haneli doğrulama kodunu yaz.",
    startFailed: "Kod gönderilemedi.",
    verifyFailed: "Kod doğrulanamadı.",
    genericError: "İşlem sırasında hata oluştu.",

    codeSentTitle: "Kod oluşturuldu",
    codeSentDesc:
      "Kod gönderim altyapısı bağlandığında bu kod seçtiğin kanaldan telefonuna iletilecek. Şimdilik test ortamında kod server logunda görünür.",
    remainingCodeRequests: "Kalan kod alma hakkı",
    cooldownText: "Yeni kod için bekleme süresi",
    providerDebug: "Test sağlayıcı",
    debugCodeText: "Test kodu",

    successTitle: "Doğrulama tamamlandı.",
  },

  en: {
    sectionEyebrow: "WhatsApp / Telegram verification",
    sectionTitle: "Verify your phone number",
    sectionDesc:
      "Verifying one phone number via WhatsApp or Telegram is enough. After verification, a 1 USD bonus is granted only once.",

    verifiedChannel: "Verified channel",
    noVerifiedChannel: "None yet",
    bonusTitle: "1 USD bonus",
    bonusGranted: "Granted",
    bonusWaiting: "Waiting",

    activeVerificationTitle: "Your phone verification is active.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Verified",
    notVerified: "Not verified",

    channelLabel: "Channel",
    countryLabel: "Country",
    phoneLabel: "Phone number",
    phonePlaceholderTR: "5xx xxx xx xx",
    phonePlaceholderRU: "9xx xxx xx xx",
    codeLabel: "Verification code",
    codePlaceholder: "6-digit code",

    sendCode: "Send Code",
    sendingCode: "Sending...",
    verifyCode: "Verify Code",
    verifyingCode: "Verifying...",

    emptyPhoneError: "Please enter your phone number.",
    emptyCodeError: "Please enter the 6-digit verification code.",
    startFailed: "Code could not be sent.",
    verifyFailed: "Code could not be verified.",
    genericError: "An error occurred during the process.",

    codeSentTitle: "Code created",
    codeSentDesc:
      "Once the sending provider is connected, the code will be delivered through your selected channel. For now, in test mode, it appears in the server log.",
    remainingCodeRequests: "Remaining code requests",
    cooldownText: "Cooldown for new code",
    providerDebug: "Test provider",
    debugCodeText: "Test code",

    successTitle: "Verification completed.",
  },

  ru: {
    sectionEyebrow: "Подтверждение WhatsApp / Telegram",
    sectionTitle: "Подтвердите номер телефона",
    sectionDesc:
      "Достаточно подтвердить один номер телефона через WhatsApp или Telegram. После подтверждения бонус 1 USD начисляется только один раз.",

    verifiedChannel: "Подтверждённый канал",
    noVerifiedChannel: "Пока нет",
    bonusTitle: "Бонус 1 USD",
    bonusGranted: "Начислен",
    bonusWaiting: "Ожидает",

    activeVerificationTitle: "Подтверждение телефона активно.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Подтверждено",
    notVerified: "Не подтверждено",

    channelLabel: "Канал",
    countryLabel: "Страна",
    phoneLabel: "Номер телефона",
    phonePlaceholderTR: "5xx xxx xx xx",
    phonePlaceholderRU: "9xx xxx xx xx",
    codeLabel: "Код подтверждения",
    codePlaceholder: "6-значный код",

    sendCode: "Отправить код",
    sendingCode: "Отправляется...",
    verifyCode: "Подтвердить код",
    verifyingCode: "Проверяется...",

    emptyPhoneError: "Введите номер телефона.",
    emptyCodeError: "Введите 6-значный код подтверждения.",
    startFailed: "Не удалось отправить код.",
    verifyFailed: "Не удалось подтвердить код.",
    genericError: "Во время операции произошла ошибка.",

    codeSentTitle: "Код создан",
    codeSentDesc:
      "После подключения отправки код будет доставлен через выбранный канал. Пока в тестовом режиме код отображается в server log.",
    remainingCodeRequests: "Оставшиеся запросы кода",
    cooldownText: "Ожидание перед новым кодом",
    providerDebug: "Тестовый провайдер",
    debugCodeText: "Тестовый код",

    successTitle: "Подтверждение завершено.",
  },
};

function getChannelLabel(channel: Channel, t: TextContent) {
  if (channel === "telegram") return t.telegram;
  return t.whatsapp;
}

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getInitialCountry(phoneNumber?: string | null): CountryCode {
  if (String(phoneNumber || "").startsWith("+7")) return "RU";
  return "TR";
}

function getInitialLocalPhone(phoneNumber?: string | null) {
  const value = String(phoneNumber || "");

  if (value.startsWith("+90")) {
    return onlyDigits(value.slice(3));
  }

  if (value.startsWith("+7")) {
    return onlyDigits(value.slice(2));
  }

  return onlyDigits(value);
}

function getPrefix(countryCode: CountryCode) {
  if (countryCode === "RU") return "+7";
  return "+90";
}

function getCountryLabel(countryCode: CountryCode) {
  if (countryCode === "RU") return "RU +7";
  return "TR +90";
}

export default function ContactVerificationCard({
  initialWhatsappVerifiedAt = null,
  initialTelegramVerifiedAt = null,
  initialContactBonusGrantedAt = null,
  initialPhoneNumber = null,
}: Props) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [countryCode, setCountryCode] = useState<CountryCode>(
    getInitialCountry(initialPhoneNumber)
  );
  const [phoneInput, setPhoneInput] = useState(
    getInitialLocalPhone(initialPhoneNumber)
  );
  const [verificationCode, setVerificationCode] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [codeSent, setCodeSent] = useState(false);
  const [sentPhoneNumber, setSentPhoneNumber] = useState("");
  const [remainingCodeRequests, setRemainingCodeRequests] = useState<
    number | null
  >(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const [provider, setProvider] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [bonusGranted, setBonusGranted] = useState(
    Boolean(initialContactBonusGrantedAt)
  );

  const [whatsappVerifiedAt, setWhatsappVerifiedAt] = useState(
    initialWhatsappVerifiedAt
  );
  const [telegramVerifiedAt, setTelegramVerifiedAt] = useState(
    initialTelegramVerifiedAt
  );

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

  useEffect(() => {
    if (!cooldownSeconds || cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (!prev || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const whatsappVerified = Boolean(whatsappVerifiedAt);
  const telegramVerified = Boolean(telegramVerifiedAt);
  const anyContactVerified = whatsappVerified || telegramVerified;

  const activeVerifiedLabel = useMemo(() => {
    if (whatsappVerified && telegramVerified) {
      return `${t.whatsapp} / ${t.telegram}`;
    }

    if (whatsappVerified) return t.whatsapp;
    if (telegramVerified) return t.telegram;

    return t.noVerifiedChannel;
  }, [whatsappVerified, telegramVerified, t]);

  const cleanPhoneInput = onlyDigits(phoneInput);
  const normalizedDisplayPhone = `${getPrefix(countryCode)}${cleanPhoneInput}`;

  async function sendCode() {
    setError("");
    setSuccessMessage("");
    setCodeSent(false);
    setDebugCode("");
    setProvider("");

    if (!cleanPhoneInput) {
      setError(t.emptyPhoneError);
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/auth/phone/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          channel,
          country_code: countryCode,
          phone_number: cleanPhoneInput,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        if (data?.cooldown_seconds) {
          setCooldownSeconds(Number(data.cooldown_seconds || 0));
        }

        throw new Error(data?.error || t.startFailed);
      }

      setCodeSent(true);
      setSentPhoneNumber(String(data.phone_number || normalizedDisplayPhone));
      setRemainingCodeRequests(
        typeof data.remaining_code_requests === "number"
          ? data.remaining_code_requests
          : null
      );
      setProvider(String(data.provider || ""));
      setDebugCode(String(data.debug_code || ""));
      setCooldownSeconds(Number(data.expires_in_seconds || 0));
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
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          channel,
          country_code: countryCode,
          phone_number: sentPhoneNumber || normalizedDisplayPhone,
          code: cleanCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || t.verifyFailed);
      }

      setSuccessMessage(String(data.message || t.successTitle));
      setBonusGranted(Boolean(data.contactBonusGranted || data.bonusGranted));

      const now = new Date().toISOString();

      if (channel === "whatsapp") {
        setWhatsappVerifiedAt(now);
      } else {
        setTelegramVerifiedAt(now);
      }

      setCodeSent(false);
      setVerificationCode("");
      setCooldownSeconds(null);
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
              {t.verifiedChannel}
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {activeVerifiedLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
              {t.bonusTitle}
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {bonusGranted ? t.bonusGranted : t.bonusWaiting}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white">
          {successMessage}
        </div>
      )}

      {anyContactVerified ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-sm font-black text-white">
            {t.activeVerificationTitle}
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                {t.whatsapp}
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {whatsappVerified
                  ? `${t.verified} ${formatDate(whatsappVerifiedAt)}`
                  : t.notVerified}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                {t.telegram}
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {telegramVerified
                  ? `${t.verified} ${formatDate(telegramVerifiedAt)}`
                  : t.notVerified}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_0.75fr_1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.channelLabel}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChannel("whatsapp");
                    setCodeSent(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    channel === "whatsapp"
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <FaWhatsapp />
                  {t.whatsapp}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChannel("telegram");
                    setCodeSent(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    channel === "telegram"
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <FaTelegram />
                  {t.telegram}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.countryLabel}
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(["TR", "RU"] as CountryCode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setCountryCode(item);
                      setPhoneInput("");
                      setCodeSent(false);
                      setVerificationCode("");
                      setError("");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      countryCode === item
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {getCountryLabel(item)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.phoneLabel}
              </label>

              <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-black/20 focus-within:border-white/24 focus-within:bg-white/[0.065]">
                <div className="flex items-center border-r border-white/10 px-4 text-sm font-black text-white">
                  {getPrefix(countryCode)}
                </div>

                <input
                  value={phoneInput}
                  onChange={(event) => {
                    setPhoneInput(onlyDigits(event.target.value).slice(0, 10));
                    setCodeSent(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  placeholder={
                    countryCode === "TR"
                      ? t.phonePlaceholderTR
                      : t.phonePlaceholderRU
                  }
                  inputMode="numeric"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={sendCode}
              disabled={sending || Boolean(cooldownSeconds && codeSent)}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? t.sendingCode : t.sendCode}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
              {error}
            </div>
          )}

          {codeSent && (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    {t.codeSentTitle}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-white/65">
                    {t.codeSentDesc}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                        {t.verifiedChannel}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {getChannelLabel(channel, t)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                        {t.phoneLabel}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {sentPhoneNumber || normalizedDisplayPhone}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                        {t.remainingCodeRequests}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {remainingCodeRequests ?? "-"}
                      </p>
                    </div>
                  </div>

                  {provider === "debug" && (
                    <div className="mt-4 rounded-2xl border border-[#6b5b2a]/60 bg-[#211d11]/70 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7d9a4]">
                        {t.providerDebug}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#e7d9a4]/80">
                        Gerçek WhatsApp / Telegram API bağlanana kadar test
                        kodu server logunda görünür.
                      </p>

                      {debugCode && (
                        <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-lg font-black tracking-[0.18em] text-white">
                          {t.debugCodeText}: {debugCode}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full rounded-3xl border border-white/10 bg-white/[0.045] p-4 lg:max-w-[320px]">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    {t.codeLabel}
                  </label>

                  <input
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(
                        onlyDigits(event.target.value).slice(0, 6)
                      )
                    }
                    placeholder={t.codePlaceholder}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl font-black tracking-[0.18em] text-white outline-none placeholder:text-white/25 transition focus:border-white/24 focus:bg-white/[0.065]"
                  />

                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={verifying}
                    className="mt-3 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifying ? t.verifyingCode : t.verifyCode}
                  </button>

                  {cooldownSeconds ? (
                    <p className="mt-3 text-center text-xs leading-5 text-white/40">
                      {t.cooldownText}: {cooldownSeconds} sn
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}