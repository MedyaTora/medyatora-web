"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { detectBrowserLocale, type Locale } from "@/lib/i18n";

type Channel = "whatsapp" | "telegram";

type Props = {
  initialWhatsappVerifiedAt?: string | null;
  initialTelegramVerifiedAt?: string | null;
  initialContactBonusGrantedAt?: string | null;
  initialPhoneNumber?: string | null;
};

type CreatedRequest = {
  code: string;
  channel: Channel;
  contactValue: string;
  message: string;
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
  contactValueLabel: string;
  telegramPlaceholder: string;
  whatsappPlaceholder: string;
  createCode: string;
  creating: string;

  emptyContactError: string;
  createFailed: string;
  createGenericError: string;

  verificationCode: string;
  sendCode: string;
  manualApprovalNote: string;

  supportMessage: (channelLabel: string, code: string) => string;
};

const WHATSAPP_NUMBER = "905530739292";
const TELEGRAM_USERNAME = "medyatora";

const texts: Record<Locale, TextContent> = {
  tr: {
    sectionEyebrow: "WhatsApp / Telegram doğrulama",
    sectionTitle: "İletişim hesabını doğrula",
    sectionDesc:
      "WhatsApp veya Telegram hesabından birini doğrulaman yeterli. Admin onayından sonra hesabına 1 USD bonus yalnızca bir kez tanımlanır.",

    verifiedChannel: "Doğrulanan kanal",
    noVerifiedChannel: "Henüz yok",
    bonusTitle: "1 USD bonus",
    bonusGranted: "Tanımlandı",
    bonusWaiting: "Bekliyor",

    activeVerificationTitle: "İletişim doğrulaman aktif.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Doğrulandı",
    notVerified: "Doğrulanmadı",

    channelLabel: "Kanal",
    contactValueLabel: "İletişim bilgisi",
    telegramPlaceholder: "@telegram_kullanici_adiniz",
    whatsappPlaceholder: "+90 5xx xxx xx xx",
    createCode: "Kod Oluştur",
    creating: "Oluşturuluyor...",

    emptyContactError: "Lütfen doğrulamak istediğiniz iletişim bilgisini yazın.",
    createFailed: "Doğrulama talebi oluşturulamadı.",
    createGenericError: "Doğrulama talebi oluşturulurken hata oluştu.",

    verificationCode: "Doğrulama kodun",
    sendCode: "Kodu Gönder",
    manualApprovalNote:
      "Onay manuel yapılır. Onaylandıktan sonra bu alan doğrulanmış görünür ve bonus daha önce verilmediyse 1 USD hesabına eklenir.",

    supportMessage: (channelLabel, code) =>
      `Merhaba, MedyaTora ${channelLabel} doğrulama kodum: ${code}`,
  },

  en: {
    sectionEyebrow: "WhatsApp / Telegram verification",
    sectionTitle: "Verify your contact account",
    sectionDesc:
      "Verifying either WhatsApp or Telegram is enough. After admin approval, a 1 USD bonus is granted to your account only once.",

    verifiedChannel: "Verified channel",
    noVerifiedChannel: "None yet",
    bonusTitle: "1 USD bonus",
    bonusGranted: "Granted",
    bonusWaiting: "Waiting",

    activeVerificationTitle: "Your contact verification is active.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Verified",
    notVerified: "Not verified",

    channelLabel: "Channel",
    contactValueLabel: "Contact information",
    telegramPlaceholder: "@telegram_username",
    whatsappPlaceholder: "+90 5xx xxx xx xx",
    createCode: "Create Code",
    creating: "Creating...",

    emptyContactError: "Please enter the contact information you want to verify.",
    createFailed: "Verification request could not be created.",
    createGenericError: "An error occurred while creating the verification request.",

    verificationCode: "Your verification code",
    sendCode: "Send Code",
    manualApprovalNote:
      "Approval is manual. After approval, this area will appear as verified and 1 USD will be added to your account if the bonus has not been granted before.",

    supportMessage: (channelLabel, code) =>
      `Hello, my MedyaTora ${channelLabel} verification code is: ${code}`,
  },

  ru: {
    sectionEyebrow: "Подтверждение WhatsApp / Telegram",
    sectionTitle: "Подтвердите контактный аккаунт",
    sectionDesc:
      "Достаточно подтвердить WhatsApp или Telegram. После одобрения администратором бонус 1 USD начисляется на аккаунт только один раз.",

    verifiedChannel: "Подтверждённый канал",
    noVerifiedChannel: "Пока нет",
    bonusTitle: "Бонус 1 USD",
    bonusGranted: "Начислен",
    bonusWaiting: "Ожидает",

    activeVerificationTitle: "Подтверждение контакта активно.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    verified: "Подтверждено",
    notVerified: "Не подтверждено",

    channelLabel: "Канал",
    contactValueLabel: "Контактная информация",
    telegramPlaceholder: "@telegram_username",
    whatsappPlaceholder: "+90 5xx xxx xx xx",
    createCode: "Создать код",
    creating: "Создаётся...",

    emptyContactError: "Введите контактные данные, которые хотите подтвердить.",
    createFailed: "Не удалось создать заявку на подтверждение.",
    createGenericError: "Произошла ошибка при создании заявки на подтверждение.",

    verificationCode: "Ваш код подтверждения",
    sendCode: "Отправить код",
    manualApprovalNote:
      "Одобрение выполняется вручную. После одобрения этот блок будет отображаться как подтверждённый, и 1 USD будет добавлен на аккаунт, если бонус ранее не выдавался.",

    supportMessage: (channelLabel, code) =>
      `Здравствуйте, мой код подтверждения MedyaTora ${channelLabel}: ${code}`,
  },
};

function getChannelLabel(channel: Channel, t: TextContent) {
  if (channel === "telegram") return t.telegram;
  return t.whatsapp;
}

function getSupportUrl(request: CreatedRequest, t: TextContent) {
  const channelLabel = getChannelLabel(request.channel, t);
  const text = encodeURIComponent(t.supportMessage(channelLabel, request.code));

  if (request.channel === "telegram") {
    return `https://t.me/${TELEGRAM_USERNAME}?text=${text}`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
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

export default function ContactVerificationCard({
  initialWhatsappVerifiedAt = null,
  initialTelegramVerifiedAt = null,
  initialContactBonusGrantedAt = null,
  initialPhoneNumber = null,
}: Props) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [contactValue, setContactValue] = useState(initialPhoneNumber || "");
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(
    null
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

  const whatsappVerified = Boolean(initialWhatsappVerifiedAt);
  const telegramVerified = Boolean(initialTelegramVerifiedAt);
  const contactBonusGranted = Boolean(initialContactBonusGrantedAt);

  const anyContactVerified = whatsappVerified || telegramVerified;

  const activeVerifiedLabel = useMemo(() => {
    if (whatsappVerified && telegramVerified) {
      return `${t.whatsapp} ve ${t.telegram}`;
    }

    if (whatsappVerified) return t.whatsapp;
    if (telegramVerified) return t.telegram;

    return t.noVerifiedChannel;
  }, [whatsappVerified, telegramVerified, t]);

  async function createRequest() {
    setError("");
    setCreatedRequest(null);

    if (!contactValue.trim()) {
      setError(t.emptyContactError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/contact-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          channel,
          contact_value: contactValue.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t.createFailed);
      }

      setCreatedRequest({
        code: String(data.code || ""),
        channel: data.channel,
        contactValue: String(data.contact_value || ""),
        message: String(data.message || ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.createGenericError);
    } finally {
      setLoading(false);
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
              {contactBonusGranted ? t.bonusGranted : t.bonusWaiting}
            </p>
          </div>
        </div>
      </div>

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
                  ? `${t.verified} ${formatDate(initialWhatsappVerifiedAt)}`
                  : t.notVerified}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                {t.telegram}
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {telegramVerified
                  ? `${t.verified} ${formatDate(initialTelegramVerifiedAt)}`
                  : t.notVerified}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.channelLabel}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel("whatsapp")}
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
                  onClick={() => setChannel("telegram")}
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
                {t.contactValueLabel}
              </label>

              <input
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={
                  channel === "telegram"
                    ? t.telegramPlaceholder
                    : t.whatsappPlaceholder
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/24 focus:bg-white/[0.065]"
              />
            </div>

            <button
              type="button"
              onClick={createRequest}
              disabled={loading}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.creating : t.createCode}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
              {error}
            </div>
          )}

          {createdRequest && (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                {t.verificationCode}
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-2xl font-black tracking-[0.18em] text-white">
                  {createdRequest.code}
                </p>

                <a
                  href={getSupportUrl(createdRequest, t)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                >
                  {t.sendCode}
                </a>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/65">
                {createdRequest.message}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/40">
                {t.manualApprovalNote}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}