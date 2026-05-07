"use client";

import { useMemo, useState } from "react";

type CurrencyCode = "TL" | "USD" | "RUB";
type PaymentMethod = "turkey_bank" | "support";

type Props = {
  userFullName?: string | null;
  userEmail?: string | null;
};

type CreatedTopupInfo = {
  requestNumber: string;
  amount: number;
  currency: CurrencyCode;
  fullName: string;
  paymentMethod: PaymentMethod;
};

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];

const TELEGRAM_USERNAME = "medyatora";
const WHATSAPP_NUMBER = "905530739292";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC.LTD.ŞTİ";

const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

function formatMoney(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);

  if (!Number.isFinite(safeValue) || safeValue <= 0) {
    return `0,00 ${currency}`;
  }

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  return "Destek ile ödeme";
}

function getTopupSupportMessage(info: CreatedTopupInfo) {
  return `Merhaba, yatırım ödeme onayı bekliyorum.

Gönderen Ad Soyad: ${info.fullName}
Yatırım Tutarı: ${formatMoney(info.amount, info.currency)}
Yatırım Numarası:
${info.requestNumber}
Ödeme Yöntemi: ${getPaymentMethodLabel(info.paymentMethod)}

Dekontu ekte iletiyorum.`;
}

function buildTelegramLink(info: CreatedTopupInfo) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    getTopupSupportMessage(info)
  )}`;
}

function buildWhatsappLink(info: CreatedTopupInfo) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    getTopupSupportMessage(info)
  )}`;
}

export default function BalanceTopUpCard({
  userFullName,
  userEmail,
}: Props) {
  const [open, setOpen] = useState(false);

  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [amount, setAmount] = useState("");
  const [fullName, setFullName] = useState(userFullName || "");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("turkey_bank");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<CreatedTopupInfo | null>(null);
  const [error, setError] = useState("");

  const amountNumber = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const value = Number(normalized);

    return Number.isFinite(value) ? value : 0;
  }, [amount]);

  const canSubmit =
    fullName.trim().length >= 3 &&
    amountNumber > 0 &&
    Boolean(paymentMethod) &&
    termsAccepted &&
    !loading;

  function resetModal() {
    setAmount("");
    setFullName(userFullName || "");
    setCurrency("TL");
    setPaymentMethod("turkey_bank");
    setTermsAccepted(false);
    setCreatedInfo(null);
    setError("");
  }

  function openModal() {
    resetModal();
    setOpen(true);
  }

  async function submitTopupRequest() {
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setCreatedInfo(null);

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
          amount: amountNumber,
          currency,
          payment_method: paymentMethod,
          support_channel: "whatsapp",
          user_note: "",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Yatırım bildirimi oluşturulamadı.");
      }

      setCreatedInfo({
        requestNumber: data.requestNumber,
        amount: Number(data.amount || amountNumber),
        currency: data.currency || currency,
        fullName: fullName.trim(),
        paymentMethod,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Yatırım bildirimi sırasında hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black shadow-[0_14px_34px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90"
      >
        Para Yatır
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d]/96 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Para Yatır
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Yatırım tutarını seç, ödeme yöntemini belirle ve dekontu
                    WhatsApp veya Telegram üzerinden ilet. Dekont onaylandıktan
                    sonra tutar ilgili para birimi bakiyene yansıtılır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]"
                >
                  Kapat
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {!createdInfo ? (
                <>
                  <div className="grid items-start gap-3 md:grid-cols-2">
                    <div>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Ödeme Yapacak Kişinin Adı Soyadı"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                      />

                      <p className="mt-2 text-xs leading-5 text-amber-100/80">
                        Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                      </p>
                    </div>

                    <div>
                      <input
                        value={amount}
                        onChange={(event) =>
                          setAmount(
                            event.target.value.replace(/[^0-9.,]/g, "")
                          )
                        }
                        placeholder="Yatırılacak Tutar"
                        inputMode="decimal"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                      />

                      <p className="mt-2 text-xs leading-5 text-white/42">
                        Örnek: 500, 1000, 5000
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <p className="text-sm font-bold text-white">Para Birimi</p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {currencyOptions.map((item) => {
                        const active = currency === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrency(item)}
                            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                              active
                                ? "border-white/30 bg-white/[0.10] shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
                                : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <p className="text-sm font-black text-white">
                              {item}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-white/48">
                              {item} bakiyene yüklenir.
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <p className="text-sm font-bold text-white">
                      Ödeme Yöntemi
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/58">
                      Şimdilik banka havalesi/EFT aktif. PayTR, BTC ve diğer
                      yöntemler aynı alana daha sonra eklenecek.
                    </p>

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
                          Türkiye Banka Havalesi / EFT
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/52">
                          Havale/EFT ile ödeme yaptıktan sonra dekontu ilet.
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
                          Farklı ödeme yöntemleri için destek üzerinden ilerlenir.
                        </p>
                      </button>
                    </div>

                    {paymentMethod === "turkey_bank" && (
                      <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/78">
                        <p className="font-bold text-white">
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
                            Yatırım numarası ödeme sonrası oluşturulacaktır.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "support" && (
                      <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-50">
                        <p className="font-bold text-white">
                          Destek ile ödeme
                        </p>

                        <p className="mt-2 text-white/72">
                          PayTR, BTC veya farklı ödeme yöntemi için yatırım
                          bildirimi oluşturduktan sonra WhatsApp ya da Telegram
                          üzerinden destekle iletişime geç.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                    <p className="font-bold text-white">Ödeme Güvenliği</p>

                    <p className="mt-2 text-white/75">
                      Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı
                      soyadı ile aynı olmalıdır. Eşleşmeyen ödemeler onaylanmaz.
                    </p>

                    <p className="mt-2 text-white/75">
                      Yatırım bildirimi oluşturulduktan sonra dekontu WhatsApp
                      veya Telegram üzerinden iletmelisin. Admin onayından sonra
                      bakiye hesabına eklenir.
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
                        Okudum, ödeme güvenliği ve bakiye yükleme koşullarını
                        kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <div className="flex items-center justify-between text-sm text-white/58">
                      <span>Yatırım Tutarı</span>
                      <span className="text-lg font-black text-white">
                        {formatMoney(amountNumber, currency)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm text-white/58">
                      <span>Ödeme Yöntemi</span>
                      <span className="font-bold text-white">
                        {getPaymentMethodLabel(paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {userEmail && (
                    <p className="mt-3 text-xs leading-5 text-white/38">
                      Bu yatırım talebi hesabına bağlı e-posta ile kaydedilir:{" "}
                      <span className="font-bold text-white/60">
                        {userEmail}
                      </span>
                    </p>
                  )}

                  {error && (
                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                      {error}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={submitTopupRequest}
                      disabled={!canSubmit}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading ? "Oluşturuluyor..." : "Yatırımı Oluştur"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/14 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <p className="text-sm text-white/60">Yatırım Numaranız</p>

                    <p className="mt-1 text-lg font-black text-white">
                      {createdInfo.requestNumber}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <p className="text-sm font-bold text-white">
                      Dekont Gönder
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Ödemeyi tamamladıysan aşağıdaki butonlardan biriyle hazır
                      mesajı aç ve dekontu ek olarak gönder.
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/72">
                      <p>
                        <span className="font-bold text-white">
                          Gönderen Ad Soyad:
                        </span>{" "}
                        {createdInfo.fullName}
                      </p>

                      <p>
                        <span className="font-bold text-white">
                          Yatırım Tutarı:
                        </span>{" "}
                        {formatMoney(createdInfo.amount, createdInfo.currency)}
                      </p>

                      <p>
                        <span className="font-bold text-white">
                          Ödeme Yöntemi:
                        </span>{" "}
                        {getPaymentMethodLabel(createdInfo.paymentMethod)}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <a
                        href={buildTelegramLink(createdInfo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-sky-400/20 bg-sky-400/15 px-5 py-3 text-center text-sm font-bold text-sky-100 shadow-[0_16px_38px_rgba(56,189,248,0.10)] transition hover:bg-sky-400/20"
                      >
                        Telegram ile Dekont Gönder
                      </a>

                      <a
                        href={buildWhatsappLink(createdInfo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:bg-white/90"
                      >
                        WhatsApp ile Dekont Gönder
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                    Dekont kontrol edildikten sonra yatırımın admin panelinden
                    onaylanacak ve tutar {createdInfo.currency} bakiyene
                    yansıyacak.
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
                    >
                      Tamam
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}