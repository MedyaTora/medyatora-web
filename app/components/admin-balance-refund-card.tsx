"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: number;
  orderNumber: string | null;
  userId: number | null;
  paymentMethod: string | null;
  currency: string | null;
  totalPrice: number | null;
  alreadyRefunded: number;
  remainingRefundable: number;
  status: string | null;

  quantity?: number | null;
  startCount?: number | null;
  endCount?: number | null;
};

function normalizeCurrency(currency: string | null | undefined) {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return "TL";
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: number, currency: string | null | undefined) {
  return `${Number(value || 0).toFixed(2)} ${normalizeCurrency(currency)}`;
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return value.toLocaleString("tr-TR");
}

function getPaymentRefundInfo(paymentMethod: string | null, currency: string) {
  if (paymentMethod === "balance" && currency === "USD") {
    return "Bu sipariş MedyaTora bakiyesiyle ödendiği için iade tutarı otomatik olarak müşterinin USD bakiyesine eklenir.";
  }

  if (paymentMethod === "turkey_bank") {
    return "Bu sipariş banka havalesi/EFT ile ödendiği için gerçek para iadesini bankadan manuel yapmalısın. Bu buton yapılan iadeyi sisteme kaydeder.";
  }

  return "Bu ödeme yöntemi için gerçek para transferi manuel yapılmalıdır. Bu buton yapılan iadeyi sisteme kaydeder.";
}

export default function AdminBalanceRefundCard({
  orderId,
  orderNumber,
  userId,
  paymentMethod,
  currency,
  totalPrice,
  alreadyRefunded,
  remainingRefundable,
  status,
  quantity,
  startCount,
  endCount,
}: Props) {
  const router = useRouter();
  const displayCurrency = normalizeCurrency(currency);

  const [refundAmount, setRefundAmount] = useState(
    remainingRefundable > 0 ? String(remainingRefundable.toFixed(2)) : ""
  );
  const [refundNote, setRefundNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canRefund = useMemo(() => {
    return Number(totalPrice || 0) > 0 && remainingRefundable > 0;
  }, [totalPrice, remainingRefundable]);

  const isAutomaticBalanceRefund =
    Boolean(userId) && paymentMethod === "balance" && displayCurrency === "USD";

  const deliveryInfo = useMemo(() => {
    const orderQuantity =
      typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 0;

    const start =
      typeof startCount === "number" && Number.isFinite(startCount)
        ? startCount
        : null;

    const end =
      typeof endCount === "number" && Number.isFinite(endCount)
        ? endCount
        : null;

    if (!orderQuantity || start === null || end === null) {
      return {
        canCalculate: false,
        delivered: 0,
        missing: 0,
        suggestedRefund: 0,
      };
    }

    const delivered = Math.max(0, end - start);
    const missing = Math.max(0, orderQuantity - delivered);

    const orderTotal = Number(totalPrice || 0);
    const rawSuggestedRefund =
      orderQuantity > 0 ? (orderTotal / orderQuantity) * missing : 0;

    const suggestedRefund = Math.min(
      remainingRefundable,
      roundMoney(rawSuggestedRefund)
    );

    return {
      canCalculate: true,
      delivered,
      missing,
      suggestedRefund,
    };
  }, [quantity, startCount, endCount, totalPrice, remainingRefundable]);

  async function submitRefund(amount: number, autoNote?: string) {
    setMessage("");
    setError("");

    if (!canRefund) {
      setError("Bu sipariş için iade edilebilir tutar kalmamış.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Geçerli bir iade tutarı gir.");
      return;
    }

    const safeAmount = roundMoney(amount);

    if (safeAmount > remainingRefundable) {
      setError(
        `Fazla iade yapılamaz. Kalan tutar: ${formatMoney(
          remainingRefundable,
          displayCurrency
        )}`
      );
      return;
    }

    const finalNote = autoNote || refundNote;

    const confirmText = isAutomaticBalanceRefund
      ? `${orderNumber || `#${orderId}`} siparişi için ${formatMoney(
          safeAmount,
          displayCurrency
        )} müşterinin bakiyesine iade edilsin mi?`
      : `${orderNumber || `#${orderId}`} siparişi için ${formatMoney(
          safeAmount,
          displayCurrency
        )} iade edildi olarak sisteme kaydedilsin mi?`;

    const ok = window.confirm(confirmText);

    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch("/api/order-request/refund-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          order_id: orderId,
          refund_amount: safeAmount,
          refund_note: finalNote,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "İade yapılamadı.");
      }

      setMessage(data.message || "İade işlemi kaydedildi.");
      setRefundNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İade sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleMissingRefund() {
    if (!deliveryInfo.canCalculate) {
      setError("Eksik teslimat iadesi için başlangıç, bitiş ve sipariş miktarı gerekli.");
      return;
    }

    if (deliveryInfo.missing <= 0 || deliveryInfo.suggestedRefund <= 0) {
      setError("Bu siparişte hesaplanan eksik kalan miktar yok.");
      return;
    }

    const autoNote =
      `Eksik teslimat iadesi. ` +
      `Sipariş miktarı: ${quantity || 0}, ` +
      `başlangıç: ${startCount ?? "-"}, ` +
      `bitiş: ${endCount ?? "-"}, ` +
      `gelen: ${deliveryInfo.delivered}, ` +
      `eksik kalan: ${deliveryInfo.missing}.`;

    submitRefund(deliveryInfo.suggestedRefund, autoNote);
  }

  return (
    <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200/70">
          Para İadesi
        </p>

        <h2 className="text-xl font-bold text-white">Tam / Kısmi İade</h2>

        <p className="text-sm leading-6 text-white/60">
          Siparişin para birimi:{" "}
          <span className="font-bold text-white">{displayCurrency}</span>
        </p>

        <p className="text-sm leading-6 text-white/60">
          {getPaymentRefundInfo(paymentMethod, displayCurrency)}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">Sipariş Tutarı</p>
          <p className="mt-1 font-black text-white">
            {formatMoney(Number(totalPrice || 0), displayCurrency)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">Daha Önce İade Edilen</p>
          <p className="mt-1 font-black text-white">
            {formatMoney(alreadyRefunded, displayCurrency)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">İade Edilebilir Kalan</p>
          <p className="mt-1 font-black text-emerald-300">
            {formatMoney(remainingRefundable, displayCurrency)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
        <p className="font-bold text-white">Eksik Teslimat Hesaplama</p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-white/45">Sipariş Miktarı</p>
            <p className="mt-1 font-bold text-white">{formatNumber(quantity)}</p>
          </div>

          <div>
            <p className="text-white/45">Gelen Miktar</p>
            <p className="mt-1 font-bold text-white">
              {deliveryInfo.canCalculate ? formatNumber(deliveryInfo.delivered) : "-"}
            </p>
          </div>

          <div>
            <p className="text-white/45">Eksik Kalan</p>
            <p className="mt-1 font-bold text-amber-300">
              {deliveryInfo.canCalculate ? formatNumber(deliveryInfo.missing) : "-"}
            </p>
          </div>

          <div>
            <p className="text-white/45">Hesaplanan Kısmi İade</p>
            <p className="mt-1 font-bold text-emerald-300">
              {deliveryInfo.canCalculate
                ? formatMoney(deliveryInfo.suggestedRefund, displayCurrency)
                : "-"}
            </p>
          </div>
        </div>

        {!deliveryInfo.canCalculate && (
          <p className="mt-3 text-xs leading-5 text-amber-100/80">
            Eksik teslimatı otomatik hesaplamak için siparişte başlangıç ve bitiş
            sayısını kaydetmelisin.
          </p>
        )}
      </div>

      {!canRefund && (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          Bu sipariş için iade edilebilir tutar kalmamış.
          <br />
          Mevcut durum: {status || "-"}
        </div>
      )}

      {canRefund && (
        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/40">
              İade Tutarı {displayCurrency}
            </label>

            <input
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-emerald-400"
              placeholder="Örn: 250.00"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/40">
              İade Notu
            </label>

            <textarea
              value={refundNote}
              onChange={(event) => setRefundNote(event.target.value)}
              className="mt-2 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              placeholder="Örn: Sipariş tamamlanamadı, müşteriye iade yapıldı."
            />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              disabled={loading || !deliveryInfo.canCalculate}
              onClick={handleMissingRefund}
              className="rounded-2xl border border-amber-300/30 bg-amber-300/15 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "İşleniyor..."
                : `Eksik Kalanı İade Et ${
                    deliveryInfo.canCalculate
                      ? `(${formatMoney(deliveryInfo.suggestedRefund, displayCurrency)})`
                      : ""
                  }`}
            </button>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => submitRefund(remainingRefundable)}
                className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "İşleniyor..." : "Tam Kalanı İade Et"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => submitRefund(Number(refundAmount || 0))}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "İşleniyor..." : "Manuel Kısmi İade Et"}
              </button>
            </div>
          </div>

          {!isAutomaticBalanceRefund && (
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-100">
              Not: Bu ödeme yöntemi otomatik banka transferi yapmaz. Müşteriye
              gerçek para iadesini kendi ödeme kanalından yaptıktan sonra bu butonu
              kullanarak sistem kaydını oluştur.
            </div>
          )}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}
    </section>
  );
}