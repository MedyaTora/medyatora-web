"use client";

import { useMemo, useState } from "react";

type CurrencyCode = "TL" | "USD" | "RUB";
type PaymentMethod = "turkey_bank" | "support";
type SupportChannel = "whatsapp" | "telegram";

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

  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function normalizeAmount(value: string) {
  return value.replace(/[^\d.,]/g, "").replace(",", ".");
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
  const methodText =
    paymentMethod === "turkey_bank"
      ? "Türkiye Banka Havalesi / EFT"
      : "Destek ile ödeme";

  return `Merhaba, yatırım onayı bekliyorum.

Gönderen Ad Soyad: ${fullName}
Kullanıcı / E-posta: ${email}
Yatırım Tutarı: ${formatMoney(amount, currency)}
Yatırım Numarası:
${requestNumber}
Ödeme Yöntemi: ${methodText}

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
  const [open, setOpen] = useState(false);

  const [fullName, setFullName] = useState(userFullName || "");
  const [amountInput, setAmountInput] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("turkey_bank");
  const [supportChannel, setSupportChannel] =
    useState<SupportChannel>("whatsapp");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const amount = useMemo(() => {
    const value = Number(normalizeAmount(amountInput));
    return Number.isFinite(value) ? value : 0;
  }, [amountInput]);

  const supportMessage = useMemo(() => {
    if (!requestNumber) return "";

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

  function resetAfterClose() {
    setOpen(false);
  }

  async function submitTopupRequest() {
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setRequestNumber("");

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
          support_channel: supportChannel,
          user_note:
            paymentMethod === "turkey_bank"
              ? "Kullanıcı banka havalesi/EFT ile yatırım bildirimi oluşturdu."
              : "Kullanıcı destek ile yatırım bildirimi oluşturdu.",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Yatırım bildirimi oluşturulamadı.");
      }

      setRequestNumber(String(data.requestNumber || ""));
      setSuccessMessage(
        data.message ||
          "Yatırım bildiriminiz alındı. Dekont kontrolünden sonra bakiyenize yansıtılacaktır."
      );
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
          setOpen(true);
          setError("");
          setSuccessMessage("");
        }}
        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
      >
        Para Yatır
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 p-0 backdrop-blur-sm">
          <div className="relative flex h-dvh w-full max-w-none flex-col overflow-hidden border-0 bg-[#080a0d] shadow-[0_28px_120px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.035] md:my-5 md:h-[94dvh] md:max-w-5xl md:rounded-[32px] md:border md:border-white/10">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                  Bakiye Yükleme
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Para Yatır
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
                  Yatırım tutarını ve para birimini seç. Bildirim oluşturulduktan
                  sonra dekontu WhatsApp veya Telegram üzerinden iletebilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={resetAfterClose}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/[0.1] hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                <div className="space-y-5">
                  <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-5">
                    <p className="text-sm font-black text-white">
                      Yatırım Bilgileri
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <input
                          value={fullName}
                          onChange={(event) =>
                            setFullName(event.target.value)
                          }
                          placeholder="Ödeme yapan kişinin adı soyadı"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.06]"
                        />

                        <p className="mt-2 text-xs leading-5 text-white/45">
                          Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                        </p>
                      </div>

                      <input
                        value={userEmail}
                        disabled
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/50 outline-none"
                      />

                      <input
                        value={amountInput}
                        onChange={(event) =>
                          setAmountInput(normalizeAmount(event.target.value))
                        }
                        placeholder="Yatırım tutarı"
                        inputMode="decimal"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.06]"
                      />

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
                                    : "border-white/10 bg-black/25 text-white/65 hover:bg-white/[0.07] hover:text-white"
                                }`}
                              >
                                {item}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-5">
                    <p className="text-sm font-black text-white">
                      Ödeme Yöntemi
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      Şimdilik banka havalesi/EFT aktif. PayTR, BTC ve diğer
                      ödeme yöntemleri daha sonra aynı alana eklenecek.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("turkey_bank")}
                        className={`rounded-2xl border p-4 text-left transition ${
                          paymentMethod === "turkey_bank"
                            ? "border-white/30 bg-white/[0.095]"
                            : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <p className="text-sm font-black text-white">
                          Türkiye Banka Havalesi / EFT
                        </p>
                        <p className="mt-2 text-xs leading-5 text-white/52">
                          Havale/EFT ile ödeme yaptıktan sonra dekontu ilet.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("support")}
                        className={`rounded-2xl border p-4 text-left transition ${
                          paymentMethod === "support"
                            ? "border-white/30 bg-white/[0.095]"
                            : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <p className="text-sm font-black text-white">
                          Destek ile ödeme
                        </p>
                        <p className="mt-2 text-xs leading-5 text-white/52">
                          Farklı ödeme yöntemleri için destek üzerinden
                          ilerlenir.
                        </p>
                      </button>
                    </div>

                    {paymentMethod === "turkey_bank" && (
                      <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/75">
                        <p className="font-black text-white">
                          Türkiye Banka Bilgileri
                        </p>

                        <div className="mt-3 space-y-2">
                          <p>
                            <span className="font-bold text-white">
                              Alıcı Adı:
                            </span>{" "}
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
                            Yatırım numarası ödeme bildirimi oluşturulduktan
                            sonra verilecektir.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "support" && (
                      <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/75">
                        <p className="font-black text-white">
                          Destek ile ödeme
                        </p>
                        <p className="mt-2">
                          PayTR, BTC veya farklı ödeme yöntemi için yatırım
                          bildirimini oluşturduktan sonra WhatsApp ya da
                          Telegram üzerinden destekle iletişime geç.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-5">
                    <p className="text-sm font-black text-white">
                      Ödeme Güvenliği
                    </p>

                    <div className="mt-3 space-y-2 text-sm leading-6 text-white/65">
                      <p>
                        Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı
                        soyadı ile aynı olmalıdır.
                      </p>
                      <p>Eşleşmeyen ödemeler onaylanmaz.</p>
                      <p>
                        Yatırım bildirimi oluşturulduktan sonra dekontu WhatsApp
                        veya Telegram üzerinden iletmelisin.
                      </p>
                      <p>
                        Admin onayından sonra bakiye hesabına eklenir.
                      </p>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(event) =>
                          setTermsAccepted(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-white"
                      />

                      <span className="text-sm font-semibold leading-6 text-white">
                        Okudum, ödeme güvenliği ve bakiye yükleme koşullarını
                        kabul ediyorum.
                      </span>
                    </label>
                  </section>
                </div>

                <aside className="space-y-5">
                  <section className="sticky top-0 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                      Yatırım Özeti
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <span className="text-sm text-white/55">
                          Para Birimi
                        </span>
                        <span className="text-sm font-black text-white">
                          {currency}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <span className="text-sm text-white/55">Tutar</span>
                        <span className="text-sm font-black text-white">
                          {formatMoney(amount, currency)}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-sm text-white/55">Durum</p>
                        <p className="mt-1 text-sm font-black text-white">
                          {requestNumber
                            ? "Dekont Bekleniyor / İnceleme Bekliyor"
                            : "Bildirim Oluşturulmadı"}
                        </p>
                      </div>

                      {requestNumber && (
                        <div className="rounded-2xl border border-white/14 bg-white/[0.065] px-4 py-3">
                          <p className="text-sm text-white/55">
                            Yatırım Numaran
                          </p>
                          <p className="mt-1 break-all text-base font-black text-white">
                            {requestNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {!requestNumber && (
                      <button
                        type="button"
                        onClick={submitTopupRequest}
                        disabled={!canSubmit}
                        className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {loading
                          ? "Yatırım Bildirimi Oluşturuluyor..."
                          : "Yatırım Bildirimi Oluştur"}
                      </button>
                    )}

                    {error && (
                      <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-100">
                        {error}
                      </div>
                    )}

                    {successMessage && (
                      <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white">
                        {successMessage}
                      </div>
                    )}

                    {requestNumber && (
                      <div className="mt-5 space-y-3">
                        <p className="text-sm leading-6 text-white/60">
                          Dekontu iletmek için aşağıdaki kanallardan birini seç.
                          Mesaj otomatik hazırlanacaktır.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                          <a
                            href={buildWhatsappLink(supportMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setSupportChannel("whatsapp")}
                            className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
                          >
                            WhatsApp ile Dekont Gönder
                          </a>

                          <a
                            href={buildTelegramLink(supportMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setSupportChannel("telegram")}
                            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]"
                          >
                            Telegram ile Dekont Gönder
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={resetAfterClose}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Kapat
                        </button>
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}