"use client";

import { useMemo, useState } from "react";

type OrderStatus =
  | "pending_payment"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partial_refunded"
  | "failed";

type Props = {
  orderId?: number | string;
  id?: number | string;

  status?: string | null;
  currentStatus?: string | null;
  initialStatus?: string | null;

  initialStartCount?: number | string | null;
  initialEndCount?: number | string | null;
  initialCompletionNote?: string | null;

  orderNumber?: string | null;
  fullName?: string | null;
  contactType?: string | null;
  contactValue?: string | null;
  serviceTitle?: string | null;
  targetUsername?: string | null;
  paymentMethod?: string | null;
};

const STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "pending_payment",
    label: "Ödeme Bekliyor",
    description: "Müşteri ödeme bildirimini henüz tamamlamadı.",
  },
  {
    value: "pending",
    label: "Beklemede",
    description: "Sipariş alındı, işleme alınmayı bekliyor.",
  },
  {
    value: "processing",
    label: "İşlemde",
    description: "Sipariş aktif olarak işleniyor.",
  },
  {
    value: "completed",
    label: "Tamamlandı",
    description: "Sipariş başarıyla tamamlandı.",
  },
  {
    value: "partial_refunded",
    label: "Kısmi İade",
    description: "Siparişin bir kısmı tamamlandı, kalan kısmın iadesi yapıldı.",
  },
  {
    value: "refunded",
    label: "İade Edildi",
    description: "Sipariş tutarı iade edildi.",
  },
  {
    value: "cancelled",
    label: "İptal Edildi",
    description: "Sipariş iptal edildi.",
  },
  {
    value: "failed",
    label: "Başarısız",
    description: "Sipariş tamamlanamadı.",
  },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Ödeme Bekliyor",
  pending: "Beklemede",
  processing: "İşlemde",
  completed: "Tamamlandı",
  partial_refunded: "Kısmi İade",
  refunded: "İade Edildi",
  cancelled: "İptal Edildi",
  failed: "Başarısız",
};

function normalizeStatus(value?: string | null): OrderStatus {
  const safeValue = String(value || "pending").trim();

  if (
    safeValue === "pending_payment" ||
    safeValue === "pending" ||
    safeValue === "processing" ||
    safeValue === "completed" ||
    safeValue === "cancelled" ||
    safeValue === "refunded" ||
    safeValue === "partial_refunded" ||
    safeValue === "failed"
  ) {
    return safeValue;
  }

  return "pending";
}

function toInputValue(value?: number | string | null) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default function OrderStatusCardActions({
  orderId,
  id,
  status,
  currentStatus,
  initialStatus,
  initialStartCount,
  initialEndCount,
  initialCompletionNote,
}: Props) {
  const resolvedOrderId = orderId ?? id;
  const startingStatus = normalizeStatus(initialStatus || currentStatus || status);

  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(startingStatus);
  const [startCount, setStartCount] = useState(toInputValue(initialStartCount));
  const [endCount, setEndCount] = useState(toInputValue(initialEndCount));
  const [completionNote, setCompletionNote] = useState(
    initialCompletionNote || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedStatusMeta = useMemo(() => {
    return STATUS_OPTIONS.find((item) => item.value === selectedStatus);
  }, [selectedStatus]);

  async function handleSubmit() {
    if (!resolvedOrderId) {
      setMessage({
        type: "error",
        text: "Sipariş ID bulunamadı.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const parsedStartCount = startCount ? Number(startCount) : null;
      const parsedEndCount = endCount ? Number(endCount) : null;
      const trimmedNote = completionNote.trim() || null;

      const res = await fetch("/api/order-request/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: resolvedOrderId,
          order_id: resolvedOrderId,
          id: resolvedOrderId,
          status: selectedStatus,
          start_count: parsedStartCount,
          end_count: parsedEndCount,
          startCount: parsedStartCount,
          endCount: parsedEndCount,
          completion_note: trimmedNote,
          completionNote: trimmedNote,
          note: trimmedNote,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || "Durum güncellenemedi."
        );
      }

      setMessage({
        type: "success",
        text: "Sipariş durumu başarıyla güncellendi.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Beklenmeyen bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
          Sipariş Durumu
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Durum Güncelle
            </h2>

            <p className="mt-1 text-sm font-semibold leading-6 text-white/50">
              Siparişin müşteriye görünen durumunu buradan değiştirebilirsin.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black text-white">
            Mevcut: {STATUS_LABELS[startingStatus]}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
            Yeni Durum
          </span>

          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as OrderStatus)
            }
            className="h-12 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm font-bold text-white outline-none transition focus:border-white/30"
          >
            {STATUS_OPTIONS.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="bg-black text-white"
              >
                {item.label}
              </option>
            ))}
          </select>

          {selectedStatusMeta ? (
            <span className="text-xs font-semibold leading-5 text-white/45">
              {selectedStatusMeta.description}
            </span>
          ) : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Başlangıç Sayısı
            </span>

            <input
              value={startCount}
              onChange={(event) =>
                setStartCount(event.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="Örn: 1200"
              inputMode="numeric"
              className="h-12 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Bitiş Sayısı
            </span>

            <input
              value={endCount}
              onChange={(event) =>
                setEndCount(event.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="Örn: 2200"
              inputMode="numeric"
              className="h-12 rounded-2xl border border-white/10 bg-black/50 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
            Müşteri Notu / Tamamlama Notu
          </span>

          <textarea
            value={completionNote}
            onChange={(event) => setCompletionNote(event.target.value)}
            placeholder="Örn: Merhaba, siparişiniz tamamlandı. İyi günler dileriz."
            rows={4}
            className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
          />
        </label>

        {message ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm font-black",
              message.type === "success"
                ? "border-white/15 bg-white/[0.06] text-white"
                : "border-red-400/30 bg-red-500/10 text-red-100",
            ].join(" ")}
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Güncelleniyor..." : "Durumu Güncelle"}
          </button>
        </div>
      </div>
    </section>
  );
}