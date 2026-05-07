"use client";

import { useMemo, useState } from "react";

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
  if (!Number.isFinite(value) || value <= 0) {
    return `0,00 ${currency}`;
  }

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

function buildTelegramLink(message: string) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    message
  )}`;
}

export default function BalanceTopUpCard({ userFullName, userEmail }: Props) {
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

  function closeCheckout() {
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
      const res = await fetch("/api/balance-topup", {
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

      setRequestNumber(String(data.requestNumber || ""));
      setCheckoutOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCheckoutOpen(true);
          setError("");
        }}
        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
      >
        Para Yatır
      </button>

      {checkoutOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/78 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#10141a]/98 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-black text-white">
                  Bakiye Yükleme
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Hesabına bakiye eklemek için yatırım bildirimi oluştur.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid items-start gap-3 md:grid-cols-2">
                <div>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Ödeme yapacak kişinin adı soyadı"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                  />

                  <p className="mt-2 text-xs leading-5 text-amber-100/80">
                    Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                  </p>
                </div>

                <input
                  value={userEmail}
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/55 outline-none"
                />

                <input
                  value={amountInput}
                  onChange={(event) =>
                    setAmountInput(normalizeAmount(event.target.value))
                  }
                  placeholder="Yatırım tutarı"
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                />

                <div className="grid grid-cols-3 gap-2">
                  {(["TL", "USD", "RUB"] as CurrencyCode[]).map((item) => {
                    const active = currency === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrency(item)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                          active
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/[0.045] text-white/72 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Ödeme yöntemi
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/58">
                      Şu anda banka havalesi / EFT yöntemi kullanılmaktadır.
                      Alternatif ödeme yöntemleri aktif olduğunda bu alanda
                      gösterilecektir.
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-black text-white/75">
                    Seçili Para Birimi: {currency}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("turkey_bank")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "turkey_bank"
                        ? "border-white/30 bg-white/[0.095] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
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
                        ? "border-white/30 bg-white/[0.095] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      Destek ile ödeme
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/52">
                      Şu anda aktif değildir. Destek ekibiyle ilerlenir.
                    </p>
                  </button>
                </div>

                {paymentMethod === "turkey_bank" && (
                  <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/78">
                    <p className="font-bold text-white">Banka bilgileri</p>

                    <div className="mt-3 space-y-2">
                      <p>
                        <span className="font-bold text-white">Alıcı:</span>{" "}
                        {TURKEY_BANK_ACCOUNT_NAME}
                      </p>
                      <p>
                        <span className="font-bold text-white">IBAN:</span>{" "}
                        {TURKEY_BANK_IBAN}
                      </p>
                      <p>
                        <span className="font-bold text-white">
                          Açıklama:
                        </span>{" "}
                        Yatırım bildirimi sonrası oluşan yatırım numarası
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                <p className="font-bold text-white">Ödeme Güvenliği</p>

                <p className="mt-2 text-white/75">
                  Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı
                  soyadı ile aynı olmalıdır. Eşleşmeyen ödemeler onaylanmaz.
                </p>

                <p className="mt-4 font-bold text-white">
                  Bakiye Yükleme Onayı
                </p>

                <p className="mt-2 text-white/75">
                  Yatırım bildirimi oluşturulduktan sonra dekont WhatsApp veya
                  Telegram üzerinden iletilmelidir. Ekip kontrolünden sonra
                  onaylanan tutar ilgili bakiyeye eklenir.
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

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <div className="flex items-center justify-between text-sm text-white/58">
                  <span>Para Birimi</span>
                  <span className="font-bold text-white">{currency}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                  <span>Yatırım Tutarı</span>
                  <span>{formatMoney(amount, currency)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#10141a]/96 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={submitTopupRequest}
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Yatırım Bildirimi Oluşturuluyor..."
                  : "Yatırım Bildirimi Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/78 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#10141a]/98 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-white/80">
                Yatırım Bildirimi
              </p>

              <button
                type="button"
                onClick={closeSuccess}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <h2 className="text-2xl font-black text-white">
                Yatırım bildiriminiz alındı
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Dekontunuzu WhatsApp veya Telegram üzerinden ilettikten sonra
                ekibimiz ödemenizi kontrol edecektir. Onaylanan tutar
                bakiyenize yansıtılır.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/14 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <p className="text-sm text-white/60">Yatırım numarası</p>
                  <p className="mt-1 break-all text-lg font-black text-white">
                    {requestNumber}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
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

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <p className="text-sm font-bold text-white">
                  Dekont bildirimi gönder
                </p>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  Dekontu seçtiğiniz kanal üzerinden iletin. Mesaj otomatik
                  hazırlanacaktır.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={buildTelegramLink(supportMessage)}
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

            <div className="shrink-0 border-t border-white/10 bg-[#10141a]/96 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={closeSuccess}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}