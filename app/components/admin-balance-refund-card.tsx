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
};

function formatUsd(value: number) {
  return `${Number(value || 0).toFixed(2)} USD`;
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
}: Props) {
  const router = useRouter();

  const [refundAmount, setRefundAmount] = useState(
    remainingRefundable > 0 ? String(remainingRefundable.toFixed(2)) : ""
  );
  const [refundNote, setRefundNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canRefund = useMemo(() => {
    return (
      Boolean(userId) &&
      paymentMethod === "balance" &&
      currency === "USD" &&
      Number(totalPrice || 0) > 0 &&
      remainingRefundable > 0
    );
  }, [userId, paymentMethod, currency, totalPrice, remainingRefundable]);

  async function submitRefund(amount: number) {
    setMessage("");
    setError("");

    if (!canRefund) {
      setError("Bu sipariş için bakiyeye iade yapılamaz.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Geçerli bir iade tutarı gir.");
      return;
    }

    if (amount > remainingRefundable) {
      setError(`Fazla iade yapılamaz. Kalan tutar: ${formatUsd(remainingRefundable)}`);
      return;
    }

    const ok = window.confirm(
      `${orderNumber || `#${orderId}`} siparişi için ${formatUsd(
        amount
      )} bakiyeye iade edilsin mi?`
    );

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
          refund_amount_usd: amount,
          refund_note: refundNote,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "İade yapılamadı.");
      }

      setMessage(data.message || "İade yapıldı.");
      setRefundNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İade sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200/70">
          Bakiye İadesi
        </p>
        <h2 className="text-xl font-bold text-white">Tam / Kısmi İade</h2>
        <p className="text-sm leading-6 text-white/60">
          Sadece MedyaTora bakiyesi ile ödenmiş USD siparişlerde kullanılır.
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">Sipariş Tutarı</p>
          <p className="mt-1 font-black text-white">{formatUsd(Number(totalPrice || 0))}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">Daha Önce İade Edilen</p>
          <p className="mt-1 font-black text-white">{formatUsd(alreadyRefunded)}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-white/45">İade Edilebilir Kalan</p>
          <p className="mt-1 font-black text-emerald-300">
            {formatUsd(remainingRefundable)}
          </p>
        </div>
      </div>

      {!canRefund && (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          Bu sipariş için otomatik bakiyeye iade kapalı.
          <br />
          Gerekli şartlar: kullanıcıya bağlı sipariş, ödeme yöntemi bakiye,
          para birimi USD ve kalan iade tutarı olmalı.
          <br />
          Mevcut durum: {status || "-"}
        </div>
      )}

      {canRefund && (
        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/40">
              İade Tutarı USD
            </label>
            <input
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-emerald-400"
              placeholder="Örn: 0.50"
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
              placeholder="Örn: 10.000 siparişin 5.000'i tamamlandı, kalan tutar iade edildi."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => submitRefund(remainingRefundable)}
              className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "İşleniyor..." : "Tam İade Et"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => submitRefund(Number(refundAmount || 0))}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "İşleniyor..." : "Kısmi İade Et"}
            </button>
          </div>
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