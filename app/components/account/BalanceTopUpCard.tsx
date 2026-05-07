"use client";

import { useMemo, useState } from "react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa6";

type CurrencyCode = "TL" | "USD" | "RUB";

type Props = {
  userFullName?: string | null;
  userEmail?: string | null;
};

type TopupResponse = {
  success?: boolean;
  ok?: boolean;
  error?: string;
  message?: string;
  requestId?: number | string;
  request_id?: number | string;
  requestNumber?: string;
  request_number?: string;
};

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];

const WHATSAPP_NUMBER = "905530739292";
const TELEGRAM_USERNAME = "MEDYATORA";

function formatMoney(value: string | number, currency: CurrencyCode) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0,00 ${currency}`;
  }

  return `${numberValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function buildReceiptMessage({
  requestNumber,
  fullName,
  email,
  amount,
  currency,
}: {
  requestNumber: string;
  fullName: string;
  email: string;
  amount: string;
  currency: CurrencyCode;
}) {
  return [
    "Merhaba, yatırım ödememi tamamladım. Dekontu iletiyorum.",
    "",
    `Yatırım Numaram: ${requestNumber}`,
    `Ad Soyad: ${fullName || "-"}`,
    `Kullanıcı / E-posta: ${email || "-"}`,
    `Yatırım Tutarı: ${formatMoney(amount, currency)}`,
    "",
    "Dekontu ekte iletiyorum. Kontrol edilip bakiyeme yansıtılmasını rica ederim.",
  ].join("\n");
}

function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildTelegramLink(message: string) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

export default function BalanceTopUpCard({
  userFullName = "",
  userEmail = "",
}: Props) {
  const [fullName, setFullName] = useState(userFullName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [userNote, setUserNote] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRequestNumber, setCreatedRequestNumber] = useState("");

  const cleanAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const numberValue = Number(normalized || 0);

    if (!Number.isFinite(numberValue)) return 0;

    return Math.round((numberValue + Number.EPSILON) * 100) / 100;
  }, [amount]);

  const receiptMessage = useMemo(() => {
    if (!createdRequestNumber) return "";

    return buildReceiptMessage({
      requestNumber: createdRequestNumber,
      fullName: fullName.trim(),
      email: email.trim(),
      amount,
      currency,
    });
  }, [createdRequestNumber, fullName, email, amount, currency]);

  const whatsappLink = receiptMessage ? buildWhatsappLink(receiptMessage) : "#";
  const telegramLink = receiptMessage ? buildTelegramLink(receiptMessage) : "#";

  const canSubmit =
    fullName.trim().length >= 3 &&
    email.trim().length >= 5 &&
    cleanAmount > 0 &&
    privacyAccepted &&
    !loading;

  async function submitTopupRequest() {
    setError("");
    setSuccessMessage("");
    setCreatedRequestNumber("");

    if (!fullName.trim()) {
      setError("Ad soyad alanını doldurmalısın.");
      return;
    }

    if (!email.trim()) {
      setError("E-posta alanını doldurmalısın.");
      return;
    }

    if (cleanAmount <= 0) {
      setError("Geçerli bir yatırım tutarı girmelisin.");
      return;
    }

    if (!privacyAccepted) {
      setError("Devam etmek için gizlilik ve ödeme koşullarını kabul etmelisin.");
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
          full_name: fullName.trim(),
          email: email.trim(),
          amount: cleanAmount,
          currency,
          payment_method: "manual_transfer",
          support_channel: "whatsapp_telegram",
          user_note: userNote.trim(),
          receipt_sent: true,
        }),
      });

      const data = (await res.json().catch(() => null)) as TopupResponse | null;

      if (!res.ok || !data || data.success === false || data.ok === false) {
        throw new Error(data?.error || "Yatırım talebi oluşturulamadı.");
      }

      const requestNumber =
        data.requestNumber ||
        data.request_number ||
        String(data.requestId || data.request_id || "");

      if (!requestNumber) {
        throw new Error("Yatırım numarası alınamadı.");
      }

      setCreatedRequestNumber(requestNumber);
      setSuccessMessage(
        "Yatırım talebin oluşturuldu. Şimdi WhatsApp veya Telegram üzerinden dekontu iletebilirsin."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#080a0d]/92 shadow-[0_24px_100px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.03] backdrop-blur-xl">
      <div className="relative p-5 md:p-6">
        <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
                Bakiye Yükleme
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                Manuel yatırım talebi oluştur
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                TL, USD veya RUB cüzdanına bakiye yüklemek için tutarı gir,
                ödemeni tamamla ve dekontu WhatsApp ya da Telegram üzerinden
                yatırım numaranla birlikte ilet. Dekont onaylandığında bakiye
                hesabına yansıtılır.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 lg:min-w-[260px]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Seçili Yatırım
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                {cleanAmount > 0
                  ? formatMoney(cleanAmount, currency)
                  : `0,00 ${currency}`}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Talep oluşturulduktan sonra yatırım numarası ile dekont
                göndermen gerekir.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
            <div className="rounded-[30px] border border-white/10 bg-black/20 p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                    Ad Soyad
                  </label>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Adınız ve soyadınız"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                    E-posta
                  </label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ornek@mail.com"
                    type="email"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                    Yatırım tutarı
                  </label>
                  <input
                    value={amount}
                    onChange={(event) => {
                      const value = event.target.value.replace(/[^\d.,]/g, "");
                      setAmount(value);
                    }}
                    placeholder="500"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.07]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                    Para birimi
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {currencyOptions.map((item) => {
                      const active = currency === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrency(item)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                            active
                              ? "border-white/28 bg-white text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)]"
                              : "border-white/10 bg-white/[0.045] text-white/72 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                  Kullanıcı notu
                </label>

                <textarea
                  value={userNote}
                  onChange={(event) => setUserNote(event.target.value)}
                  placeholder="Ödeme yaptığınız hesap adı, açıklama veya eklemek istediğiniz not..."
                  rows={3}
                  className="min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/30 transition focus:border-white/25 focus:bg-white/[0.07]"
                />
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.065]">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />

                <span className="text-sm leading-6 text-white/65">
                  Gizlilik politikası, ödeme güvenliği ve iade koşullarını
                  okudum, kabul ediyorum.{" "}
                  <a
                    href="/gizlilik-politikasi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white underline underline-offset-4 hover:text-white/80"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Gizlilik politikasını görüntüle
                  </a>
                </span>
              </label>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-100">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white">
                  {successMessage}
                </div>
              )}

              <button
                type="button"
                onClick={submitTopupRequest}
                disabled={!canSubmit}
                className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? "Yatırım talebi oluşturuluyor..." : "Yatırımı Yaptım"}
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Dekont Gönderimi
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  Yatırım numarasıyla dekont ilet
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/58">
                  Yatırım talebini oluşturduktan sonra aşağıdaki WhatsApp veya
                  Telegram butonlarından birine bas. Mesaj otomatik hazırlanır;
                  sadece dekont görselini ekleyip gönder.
                </p>

                {createdRequestNumber ? (
                  <div className="mt-4 rounded-2xl border border-white/12 bg-black/25 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                      Yatırım Numaran
                    </p>

                    <p className="mt-2 break-all text-xl font-black text-white">
                      {createdRequestNumber}
                    </p>

                    <p className="mt-2 text-sm text-white/55">
                      {formatMoney(cleanAmount, currency)} ödeme için dekont
                      bekleniyor.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm leading-6 text-white/45">
                    Yatırım numarası oluşturulmadan dekont mesajı açılamaz.
                    Önce formu doldurup “Yatırımı Yaptım” butonuna bas.
                  </div>
                )}

                <div className="mt-4 grid gap-3">
                  <a
                    href={createdRequestNumber ? whatsappLink : "#"}
                    target={createdRequestNumber ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                      createdRequestNumber
                        ? "bg-white text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] hover:-translate-y-0.5 hover:bg-white/90"
                        : "pointer-events-none cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                    }`}
                  >
                    <FaWhatsapp />
                    WhatsApp ile Dekont Gönder
                  </a>

                  <a
                    href={createdRequestNumber ? telegramLink : "#"}
                    target={createdRequestNumber ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                      createdRequestNumber
                        ? "border border-white/12 bg-white/[0.065] text-white hover:-translate-y-0.5 hover:bg-white/[0.10]"
                        : "pointer-events-none cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                    }`}
                  >
                    <FaTelegram />
                    Telegram ile Dekont Gönder
                  </a>
                </div>
              </div>

              <div className="rounded-[30px] border border-amber-400/20 bg-amber-400/10 p-5">
                <p className="text-sm font-black text-white">Önemli Bilgi</p>

                <div className="mt-3 space-y-2 text-sm leading-6 text-amber-50/80">
                  <p>
                    Dekonttaki gönderen adı ile formdaki ad soyad aynı olmalıdır.
                  </p>
                  <p>Dekont onaylanmadan bakiye hesaba yansımaz.</p>
                  <p>
                    Hatalı tutar veya eksik dekont durumunda yatırım talebi
                    reddedilebilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}