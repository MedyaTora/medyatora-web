"use client";

import { useMemo, useState } from "react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa6";

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

const WHATSAPP_NUMBER = "905530739292";
const TELEGRAM_USERNAME = "medyatora";

function getChannelLabel(channel: Channel) {
  if (channel === "telegram") return "Telegram";
  return "WhatsApp";
}

function getSupportUrl(request: CreatedRequest) {
  const text = encodeURIComponent(
    `Merhaba, MedyaTora ${getChannelLabel(
      request.channel
    )} doğrulama kodum: ${request.code}`
  );

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
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [contactValue, setContactValue] = useState(initialPhoneNumber || "");
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(
    null
  );
  const [error, setError] = useState("");

  const whatsappVerified = Boolean(initialWhatsappVerifiedAt);
  const telegramVerified = Boolean(initialTelegramVerifiedAt);
  const contactBonusGranted = Boolean(initialContactBonusGrantedAt);

  const anyContactVerified = whatsappVerified || telegramVerified;

  const activeVerifiedLabel = useMemo(() => {
    if (whatsappVerified && telegramVerified) return "WhatsApp ve Telegram";
    if (whatsappVerified) return "WhatsApp";
    if (telegramVerified) return "Telegram";
    return "Henüz yok";
  }, [whatsappVerified, telegramVerified]);

  async function createRequest() {
    setError("");
    setCreatedRequest(null);

    if (!contactValue.trim()) {
      setError("Lütfen doğrulamak istediğiniz iletişim bilgisini yazın.");
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
        throw new Error(data.error || "Doğrulama talebi oluşturulamadı.");
      }

      setCreatedRequest({
        code: String(data.code || ""),
        channel: data.channel,
        contactValue: String(data.contact_value || ""),
        message: String(data.message || ""),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Doğrulama talebi oluşturulurken hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
            WhatsApp / Telegram doğrulama
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            İletişim hesabını doğrula
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
            WhatsApp veya Telegram hesabından birini doğrulaman yeterli. Admin
            onayından sonra hesabına 1 USD bonus yalnızca bir kez tanımlanır.
          </p>
        </div>

        <div className="grid gap-3 sm:min-w-[420px] sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
              Doğrulanan kanal
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {activeVerifiedLabel}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
              1 USD bonus
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {contactBonusGranted ? "Tanımlandı" : "Bekliyor"}
            </p>
          </div>
        </div>
      </div>

      {anyContactVerified ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-sm font-black text-white">
            İletişim doğrulaman aktif.
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                WhatsApp
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {whatsappVerified
                  ? `Doğrulandı ${formatDate(initialWhatsappVerifiedAt)}`
                  : "Doğrulanmadı"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Telegram
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {telegramVerified
                  ? `Doğrulandı ${formatDate(initialTelegramVerifiedAt)}`
                  : "Doğrulanmadı"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Kanal
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
                  WhatsApp
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
                  Telegram
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/35">
                İletişim bilgisi
              </label>

              <input
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={
                  channel === "telegram"
                    ? "@telegram_kullanici_adiniz"
                    : "+90 5xx xxx xx xx"
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
              {loading ? "Oluşturuluyor..." : "Kod Oluştur"}
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
                Doğrulama kodun
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-2xl font-black tracking-[0.18em] text-white">
                  {createdRequest.code}
                </p>

                <a
                  href={getSupportUrl(createdRequest)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                >
                  Kodu Gönder
                </a>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/65">
                {createdRequest.message}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/40">
                Onay manuel yapılır. Onaylandıktan sonra bu alan doğrulanmış
                görünür ve bonus daha önce verilmediyse 1 USD hesabına eklenir.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}