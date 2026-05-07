"use client";

import { useMemo, useState } from "react";

type CurrencyCode = "TL" | "USD" | "RUB";

type Props = {
  initialFullName?: string | null;
  initialEmail?: string | null;
};

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];

const WHATSAPP_NUMBER = "905530739292";
const TELEGRAM_USERNAME = "MEDYATORA";

function formatMoney(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function buildSupportMessage({
  requestNumber,
  amount,
  currency,
  fullName,
}: {
  requestNumber: string;
  amount: number;
  currency: CurrencyCode;
  fullName?: string | null;
}) {
  return `Merhaba, bakiye yükleme dekontumu iletiyorum.

Talep No: ${requestNumber}
Ad Soyad: ${fullName || "-"}
Yükleme Tutarı: ${formatMoney(amount, currency)}

Dekontu ekte iletiyorum.`;
}

function buildWhatsappLink(params: {
  requestNumber: string;
  amount: number;
  currency: CurrencyCode;
  fullName?: string | null;
}) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildSupportMessage(params)
  )}`;
}

function buildTelegramLink(params: {
  requestNumber: string;
  amount: number;
  currency: CurrencyCode;
  fullName?: string | null;
}) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    buildSupportMessage(params)
  )}`;
}

export default function BalanceTopUpCard({
  initialFullName = null,
  initialEmail = null,
}: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [amount, setAmount] = useState("");
  const [userNote, setUserNote] = useState("");
  const [supportChannel, setSupportChannel] = useState<"whatsapp" | "telegram">(
    "whatsapp"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRequestNumber, setCreatedRequestNumber] = useState("");

  const amountNumber = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const parsed = Number(normalized || 0);

    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const supportLink = useMemo(() => {
    if (!createdRequestNumber || amountNumber <= 0) return "";

    const params = {
      requestNumber: createdRequestNumber,
      amount: amountNumber,
      currency,
      fullName: initialFullName,
    };

    if (supportChannel === "telegram") {
      return buildTelegramLink(params);
    }

    return buildWhatsappLink(params);
  }, [
    amountNumber,
    createdRequestNumber,
    currency,
    initialFullName,
    supportChannel,
  ]);

  async function submitTopUpRequest() {
    setError("");
    setSuccessMessage("");
    setCreatedRequestNumber("");

    if (!amountNumber || amountNumber <= 0) {
      setError("Lütfen geçerli bir yükleme tutarı gir.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/balance-topup/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          amount: amountNumber,
          currency,
          user_note: userNote.trim() || null,
          support_channel: supportChannel,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.error || "Para yükleme bildirimi oluşturulamadı."
        );
      }

      setCreatedRequestNumber(String(data.requestNumber || ""));
      setSuccessMessage(
        data.message ||
          "Para yükleme bildiriminiz alındı. Dekont kontrolünden sonra bakiyeniz hesabınıza yansıtılacaktır."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
            Para yükle
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Cüzdanına bakiye ekle
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
            Yüklemek istediğin tutarı ve para birimini seç. Ödemeyi yaptıktan
            sonra “Onayladım ve dekont gönderdim” butonuna bas. Talebin admin
            paneline ve Telegram bildirimi olarak bize düşer.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/60 lg:max-w-[340px]">
          <p className="font-bold text-white">Önemli</p>
          <p className="mt-2">
            TL, USD ve RUB bakiyeleri ayrı tutulur. Hangi para biriminde
            yükleme yaparsan, onay sonrası o cüzdana eklenir.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {currencyOptions.map((item) => {
              const active = currency === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCurrency(item);
                    setError("");
                    setSuccessMessage("");
                    setCreatedRequestNumber("");
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    active
                      ? "border-white bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.10)]"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/38">
                Yüklenecek tutar
              </label>

              <input
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value.replace(/[^\d.,]/g, ""));
                  setError("");
                  setSuccessMessage("");
                  setCreatedRequestNumber("");
                }}
                placeholder={
                  currency === "TL"
                    ? "Örn: 500"
                    : currency === "USD"
                      ? "Örn: 20"
                      : "Örn: 2000"
                }
                inputMode="decimal"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.065]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/38">
                Dekont kanalı
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSupportChannel("whatsapp")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    supportChannel === "whatsapp"
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.07]"
                  }`}
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setSupportChannel("telegram")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    supportChannel === "telegram"
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/[0.07]"
                  }`}
                >
                  Telegram
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/38">
              Not / açıklama
            </label>

            <textarea
              value={userNote}
              onChange={(event) => setUserNote(event.target.value)}
              placeholder="Örn: Akbank üzerinden gönderdim, dekontu WhatsApp’tan iletiyorum."
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.065]"
            />
          </div>

          <button
            type="button"
            onClick={submitTopUpRequest}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading
              ? "Bildirim gönderiliyor..."
              : "Onayladım ve dekont gönderdim"}
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">
            Ödeme bilgisi
          </p>

          <div className="mt-4 space-y-3 text-sm leading-6 text-white/62">
            <p>
              <span className="font-bold text-white">Alıcı:</span> BİLÇAĞ
              İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE
              TİC.LTD.ŞTİ
            </p>

            <p>
              <span className="font-bold text-white">IBAN:</span> TR48 0001
              0001 3349 7700 5150 01
            </p>

            <p>
              <span className="font-bold text-white">Açıklama:</span>{" "}
              MedyaTora bakiye yükleme
            </p>

            <p>
              Ödeme yaptıktan sonra dekontu WhatsApp veya Telegram üzerinden
              ilet. Admin kontrolünden sonra bakiye hesabına yansıtılır.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-white/40">Seçili yükleme</p>
            <p className="mt-1 text-2xl font-black text-white">
              {amountNumber > 0 ? formatMoney(amountNumber, currency) : "-"}
            </p>
            <p className="mt-1 text-xs text-white/42">
              Hesap: {initialEmail || "-"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white">
          {successMessage}
        </div>
      )}

      {createdRequestNumber && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold text-white">
            Talep numaran: {createdRequestNumber}
          </p>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Şimdi dekontu seçtiğin kanaldan ilet. Mesaj hazır olarak açılacak.
          </p>

          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 sm:w-auto"
          >
            Dekontu {supportChannel === "telegram" ? "Telegram" : "WhatsApp"} ile gönder
          </a>
        </div>
      )}
    </section>
  );
}