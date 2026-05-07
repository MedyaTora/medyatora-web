"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type CurrencyCode = "TL" | "USD" | "RUB";
type PaymentMethod = "turkey_bank" | "support";

type Props = {
  userFullName?: string | null;
  userEmail: string;
};

const WHATSAPP_NUMBER = "905530739292";
const TELEGRAM_USERNAME = "MEDYATORA";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC.LTD.ŞTİ";

const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

function formatMoney(value: number, currency: CurrencyCode) {
  if (!Number.isFinite(value) || value <= 0) return `0,00 ${currency}`;

  if (currency === "TL") {
    return `${Math.round(value).toLocaleString("tr-TR")} TL`;
  }

  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function normalizeAmount(value: string) {
  return value.replace(/[^\d.,]/g, "").replace(",", ".");
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  return "Destek ile ödeme";
}

function buildSupportMessage({
  requestNumber,
  fullName,
  email,
  amount,
  currency,
  paymentMethod,
}: {
  requestNumber: string;
  fullName: string;
  email: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
}) {
  return `Merhaba, yatırım onayı bekliyorum.

Gönderen Ad Soyad: ${fullName}
Yatırım Tutarı: ${formatMoney(amount, currency)}
Yatırım Numarası:
${requestNumber}
Kullanıcı / E-posta: ${email}
Ödeme Yöntemi: ${getPaymentMethodLabel(paymentMethod)}

Dekontu ekte iletiyorum. Kontrol edilip bakiyeme yansıtılmasını rica ederim.`;
}

function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildTelegramLink() {
  return `https://t.me/${TELEGRAM_USERNAME}`;
}

export default function BalanceTopUpCard({ userFullName, userEmail }: Props) {
  const [mounted, setMounted] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [fullName, setFullName] = useState(userFullName || "");
  const [amountInput, setAmountInput] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("turkey_bank");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!checkoutOpen && !successOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [checkoutOpen, successOpen]);

  const amount = useMemo(() => {
    const value = Number(normalizeAmount(amountInput));
    return Number.isFinite(value) ? value : 0;
  }, [amountInput]);

  const supportMessage = useMemo(() => {
    return buildSupportMessage({
      requestNumber,
      fullName: fullName.trim(),
      email: userEmail,
      amount,
      currency,
      paymentMethod,
    });
  }, [requestNumber, fullName, userEmail, amount, currency, paymentMethod]);

  const canSubmit =
    Boolean(fullName.trim()) &&
    amount > 0 &&
    Boolean(currency) &&
    Boolean(paymentMethod) &&
    termsAccepted &&
    !loading;

  function openCheckout() {
    setCheckoutOpen(true);
    setSuccessOpen(false);
    setError("");
  }

  function closeCheckout() {
    if (loading) return;
    setCheckoutOpen(false);
    setError("");
  }

  function closeSuccess() {
    setSuccessOpen(false);
    setRequestNumber("");
    setAmountInput("");
    setTermsAccepted(false);
    setError("");
  }

  async function submitTopupRequest() {
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/balance-topup/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          full_name: fullName.trim(),
          amount,
          currency,
          payment_method: paymentMethod,
          support_channel: "whatsapp",
          user_note:
            paymentMethod === "turkey_bank"
              ? "Kullanıcı banka havalesi/EFT ile yatırım bildirimi oluşturdu."
              : "Kullanıcı destek ile ödeme bildirimi oluşturdu.",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Yatırım bildirimi oluşturulamadı.");
      }

      const nextRequestNumber = String(
        data.requestNumber || data.request_number || data.topupRequestNumber || ""
      );

      if (!nextRequestNumber) {
        throw new Error("Yatırım numarası alınamadı.");
      }

      setRequestNumber(nextRequestNumber);
      setCheckoutOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const checkoutModal =
    checkoutOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-5">
            <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#080a0d] shadow-[0_30px_140px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.04] sm:max-h-[92dvh] sm:rounded-[36px]">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/38">
                    MedyaTora Cüzdan
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    Bakiye Yükleme
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Yatırım bildirimi oluştur, dekontu destek ekibine gönder.
                    Onaylanan tutar bakiyene yansıtılır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCheckout}
                  disabled={loading}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kapat
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <p className="text-sm font-black text-white">
                        Yatırım Bilgileri
                      </p>

                      <div className="mt-4 grid gap-3">
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                            Ödeme yapacak kişi
                          </span>
                          <input
                            value={fullName}
                            onChange={(event) =>
                              setFullName(event.target.value)
                            }
                            placeholder="Ad soyad"
                            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/28 focus:bg-white/[0.07]"
                          />
                          <span className="text-xs leading-5 text-white/45">
                            Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                          </span>
                        </label>

                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                            Hesap e-postası
                          </span>
                          <input
                            value={userEmail}
                            disabled
                            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white/55 outline-none"
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-[1fr_0.9fr]">
                          <label className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                              Yatırım tutarı
                            </span>
                            <input
                              value={amountInput}
                              onChange={(event) =>
                                setAmountInput(
                                  normalizeAmount(event.target.value)
                                )
                              }
                              placeholder="Örn: 5000"
                              inputMode="decimal"
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-white/28 focus:bg-white/[0.07]"
                            />
                          </label>

                          <div className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                              Para birimi
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {(["TL", "USD", "RUB"] as CurrencyCode[]).map(
                                (item) => {
                                  const active = currency === item;

                                  return (
                                    <button
                                      key={item}
                                      type="button"
                                      onClick={() => setCurrency(item)}
                                      className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                                        active
                                          ? "border-white bg-white text-black"
                                          : "border-white/10 bg-black/25 text-white/72 hover:bg-white/[0.08] hover:text-white"
                                      }`}
                                    >
                                      {item}
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <p className="text-sm font-black text-white">
                        Ödeme Yöntemi
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("turkey_bank")}
                          className={`rounded-2xl border p-4 text-left transition ${
                            paymentMethod === "turkey_bank"
                              ? "border-white/35 bg-white/[0.095]"
                              : "border-white/10 bg-black/25 hover:bg-white/[0.06]"
                          }`}
                        >
                          <p className="text-sm font-black text-white">
                            Havale / EFT
                          </p>
                          <p className="mt-1 text-xs leading-5 text-white/52">
                            Dekont sonrası ödeme kontrol edilir.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("support")}
                          className={`rounded-2xl border p-4 text-left transition ${
                            paymentMethod === "support"
                              ? "border-white/35 bg-white/[0.095]"
                              : "border-white/10 bg-black/25 hover:bg-white/[0.06]"
                          }`}
                        >
                          <p className="text-sm font-black text-white">
                            Destek ile ödeme
                          </p>
                          <p className="mt-1 text-xs leading-5 text-white/52">
                            Destek ekibiyle ödeme detayları netleştirilir.
                          </p>
                        </button>
                      </div>

                      {paymentMethod === "turkey_bank" && (
                        <div className="mt-4 rounded-2xl border border-white/14 bg-black/25 p-4 text-sm leading-6 text-white/78">
                          <p className="font-black text-white">
                            Banka bilgileri
                          </p>

                          <div className="mt-3 space-y-2">
                            <p>
                              <span className="font-bold text-white">
                                Alıcı:
                              </span>{" "}
                              {TURKEY_BANK_ACCOUNT_NAME}
                            </p>
                            <p>
                              <span className="font-bold text-white">
                                IBAN:
                              </span>{" "}
                              {TURKEY_BANK_IBAN}
                            </p>
                            <p>
                              <span className="font-bold text-white">
                                Açıklama:
                              </span>{" "}
                              Dijital hizmet
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                      <p className="font-black text-white">Ödeme Güvenliği</p>

                      <p className="mt-2 text-white/75">
                        Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen
                        adı soyadı ile aynı olmalıdır. Eşleşmeyen ödemeler
                        onaylanmayabilir.
                      </p>

                      <p className="mt-4 font-black text-white">
                        Bakiye Yükleme Onayı
                      </p>

                      <p className="mt-2 text-white/75">
                        Yatırım bildirimi oluşturulduktan sonra dekont WhatsApp
                        veya Telegram üzerinden iletilmelidir. Ekip kontrolünden
                        sonra onaylanan tutar ilgili bakiyeye eklenir.
                      </p>

                      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(event) =>
                            setTermsAccepted(event.target.checked)
                          }
                          className="mt-1 h-4 w-4 accent-white"
                        />

                        <span className="text-sm font-semibold text-white">
                          Bakiye yükleme koşullarını okudum, kabul ediyorum.
                        </span>
                      </label>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <p className="text-sm font-black text-white">
                        Yatırım Özeti
                      </p>

                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between text-white/58">
                          <span>Para Birimi</span>
                          <span className="font-bold text-white">
                            {currency}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-white/58">
                          <span>Ödeme Yöntemi</span>
                          <span className="font-bold text-white">
                            {getPaymentMethodLabel(paymentMethod)}
                          </span>
                        </div>

                        <div className="border-t border-white/10 pt-3">
                          <div className="flex items-center justify-between text-base font-black text-white">
                            <span>Yatırım Tutarı</span>
                            <span>{formatMoney(amount, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={submitTopupRequest}
                      disabled={!canSubmit}
                      className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading
                        ? "Yatırım Bildirimi Oluşturuluyor..."
                        : "Yatırım Bildirimi Oluştur"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const successModal =
    successOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-5">
            <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#080a0d] shadow-[0_30px_140px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.04] sm:max-h-[92dvh] sm:rounded-[36px]">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/38">
                    Yatırım Bildirimi
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    Yatırım bildiriminiz alındı
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeSuccess}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Kapat
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <p className="text-sm leading-6 text-white/60">
                  Dekontunuzu WhatsApp veya Telegram üzerinden ilettikten sonra
                  ekibimiz ödemenizi kontrol edecektir. Onaylanan tutar
                  bakiyenize yansıtılır.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/14 bg-white/[0.055] p-4">
                    <p className="text-sm text-white/60">Yatırım numarası</p>
                    <p className="mt-1 break-all text-lg font-black text-white">
                      {requestNumber}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/72">
                    <p>
                      <span className="font-bold text-white">
                        Gönderen Ad Soyad:
                      </span>{" "}
                      {fullName.trim()}
                    </p>
                    <p>
                      <span className="font-bold text-white">
                        Yatırım Tutarı:
                      </span>{" "}
                      {formatMoney(amount, currency)}
                    </p>
                    <p>
                      <span className="font-bold text-white">
                        Ödeme Yöntemi:
                      </span>{" "}
                      {getPaymentMethodLabel(paymentMethod)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-sm font-black text-white">
                    Dekont bildirimi gönder
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    WhatsApp butonu hazır mesajla açılır. Telegram için mesaj
                    metnini kopyalayıp destek sohbetine gönderebilirsin.
                  </p>

                  <textarea
                    value={supportMessage}
                    readOnly
                    rows={8}
                    className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs leading-5 text-white/70 outline-none"
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={buildTelegramLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      Telegram’a Git
                    </a>

                    <a
                      href={buildWhatsappLink(supportMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                    >
                      WhatsApp’a Gönder
                    </a>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#080a0d]/96 px-4 py-3 backdrop-blur-xl sm:px-6">
                <button
                  type="button"
                  onClick={closeSuccess}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openCheckout}
        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
      >
        Para Yatır
      </button>

      {checkoutModal}
      {successModal}
    </>
  );
}