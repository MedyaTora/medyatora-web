"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type CurrencyCode = "TL" | "USD" | "RUB";
type PaymentMethod = "bank" | "support";

type Props = {
  userFullName?: string | null;
  userEmail?: string | null;
};

const TELEGRAM_USERNAME = "MEDYATORA";
const WHATSAPP_NUMBER = "905530739292";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC. LTD. ŞTİ";
const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

function formatMoney(value: number, currency: CurrencyCode) {
  if (!Number.isFinite(value)) return `0,00 ${currency}`;

  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function buildSupportMessage({
  fullName,
  email,
  amount,
  currency,
  paymentMethod,
}: {
  fullName: string;
  email: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
}) {
  const methodText =
    paymentMethod === "bank"
      ? "Banka Havalesi / EFT"
      : "Destek ile ödeme";

  return `Merhaba,

Bakiye yükleme bildirimi oluşturmak istiyorum.

Ad Soyad: ${fullName || "-"}
E-posta: ${email || "-"}
Yatırım Tutarı: ${formatMoney(amount, currency)}
Para Birimi: ${currency}
Yöntem: ${methodText}

Dekontu / ödeme bilgisini sizinle paylaşacağım.
Teşekkür ederim.`;
}

export default function BalanceTopUpCard({
  userFullName,
  userEmail,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [error, setError] = useState("");
  const [notificationReady, setNotificationReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const amountNumber = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
  }, [amount]);

  const supportMessage = useMemo(() => {
    return buildSupportMessage({
      fullName: userFullName || "",
      email: userEmail || "",
      amount: amountNumber,
      currency,
      paymentMethod,
    });
  }, [userFullName, userEmail, amountNumber, currency, paymentMethod]);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    supportMessage
  )}`;

  const telegramLink = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    supportMessage
  )}`;

  function closeModal() {
    setOpen(false);
    setError("");
    setNotificationReady(false);
  }

  function handleCreateNotification() {
    setError("");

    if (!amountNumber || amountNumber <= 0) {
      setError("Lütfen geçerli bir yatırım tutarı girin.");
      return;
    }

    setNotificationReady(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
      >
        Para Yatır
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#080a0d]/98 shadow-[0_30px_140px_rgba(0,0,0,0.65)]">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/38">
                      Bakiye Yükleme
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-white">
                      Para Yatır
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
                      Yatırım tutarını ve para birimini seç. Bildirimini
                      oluşturduktan sonra dekontunu WhatsApp veya Telegram
                      üzerinden iletebilirsin.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/[0.1] hover:text-white"
                  >
                    Kapat
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Yatırım Bilgileri
                        </p>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs text-white/40">
                              Ad Soyad
                            </p>
                            <p className="mt-2 text-sm font-bold text-white">
                              {userFullName || "-"}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/45">
                              Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs text-white/40">E-posta</p>
                            <p className="mt-2 break-all text-sm font-bold text-white">
                              {userEmail || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                              Yatırım Tutarı
                            </label>
                            <input
                              value={amount}
                              onChange={(e) =>
                                setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                              }
                              placeholder="Örn: 500"
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/28 transition focus:border-white/25 focus:bg-white/[0.06]"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                              Para Birimi
                            </label>

                            <div className="flex gap-2">
                              {(["TL", "USD", "RUB"] as CurrencyCode[]).map(
                                (item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCurrency(item)}
                                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                                      currency === item
                                        ? "bg-white text-black"
                                        : "border border-white/10 bg-black/20 text-white/80 hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    {item}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Ödeme Yöntemi
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/58">
                          Şu anda yalnızca banka havalesi / EFT kullanılmaktadır.
                          Alternatif ödeme yöntemleri aktif olduğunda bu alanda
                          ayrıca gösterilecektir.
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("bank")}
                            className={`rounded-2xl border p-4 text-left transition ${
                              paymentMethod === "bank"
                                ? "border-white/28 bg-white/[0.10]"
                                : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <p className="text-sm font-bold text-white">
                              Türkiye Banka Havalesi / EFT
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/52">
                              Bakiye bildirimi oluşturduktan sonra dekontunu
                              iletebilirsin.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("support")}
                            className={`rounded-2xl border p-4 text-left transition ${
                              paymentMethod === "support"
                                ? "border-white/28 bg-white/[0.10]"
                                : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <p className="text-sm font-bold text-white">
                              Destek ile ödeme
                            </p>
                            <p className="mt-2 text-xs leading-5 text-white/52">
                              Farklı bir ödeme konusu için önce yatırım
                              bildirimini oluştur, ardından destek ekibimizle
                              iletişime geç.
                            </p>
                          </button>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/72">
                          <p className="font-bold text-white">
                            Banka Bilgileri
                          </p>

                          <div className="mt-3 space-y-2">
                            <p>
                              <span className="font-bold text-white">
                                Alıcı Adı:
                              </span>{" "}
                              {TURKEY_BANK_ACCOUNT_NAME}
                            </p>
                            <p>
                              <span className="font-bold text-white">
                                IBAN:
                              </span>{" "}
                              {TURKEY_BANK_IBAN}
                            </p>
                            <p className="text-white/60">
                              Havale açıklamasına ad soyad bilgini eklemen,
                              ödeme kontrol sürecini hızlandırır.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-6 text-amber-50">
                        <p className="font-bold text-white">Ödeme Güvenliği</p>

                        <p className="mt-3 text-white/78">
                          Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen
                          adı soyadı ile aynı olmalıdır.
                        </p>

                        <p className="mt-2 text-white/78">
                          Eşleşmeyen ödemeler manuel kontrole alınır ve onay
                          süresi uzayabilir.
                        </p>

                        <p className="mt-2 text-white/78">
                          Kişisel bilgileriniz yalnızca ödeme doğrulama amacıyla
                          kullanılır.
                        </p>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Yatırım Özeti
                        </p>

                        <div className="mt-4 space-y-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-white/58">
                                Para Birimi
                              </span>
                              <span className="text-sm font-black text-white">
                                {currency}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-white/58">
                                Tutar
                              </span>
                              <span className="text-sm font-black text-white">
                                {formatMoney(amountNumber, currency)}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-white/58">
                                Durum
                              </span>
                              <span className="text-sm font-black text-white">
                                {notificationReady
                                  ? "Bildirim Hazır"
                                  : "Bildirim Oluşturulmadı"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {error && (
                          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {error}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleCreateNotification}
                          className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                        >
                          Yatırım Bildirimi Oluştur
                        </button>
                      </section>

                      {notificationReady && (
                        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                          <p className="text-sm font-black text-white">
                            Bildirim hazır
                          </p>

                          <p className="mt-2 text-sm leading-6 text-white/60">
                            Şimdi dekontunla birlikte bildirimi destek ekibine
                            iletebilirsin.
                          </p>

                          <div className="mt-4 grid gap-3">
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                            >
                              WhatsApp ile Gönder
                            </a>

                            <a
                              href={telegramLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                            >
                              Telegram ile Gönder
                            </a>
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}