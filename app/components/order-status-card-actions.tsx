"use client";

import { useState } from "react";

type Props = {
  id: number;
  initialStatus: string;
  initialStartCount?: number | null;
  initialEndCount?: number | null;
  initialCompletionNote?: string | null;
};

const statusOptions = [
  { value: "pending", label: "Bekliyor" },
  { value: "processing", label: "Hazırlanıyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
];

export default function OrderStatusCardActions({
  id,
  initialStatus,
  initialStartCount,
  initialEndCount,
  initialCompletionNote,
}: Props) {
  const [status, setStatus] = useState(initialStatus || "pending");
  const [startCount, setStartCount] = useState(
    initialStartCount ? String(initialStartCount) : ""
  );
  const [endCount, setEndCount] = useState(
    initialEndCount ? String(initialEndCount) : ""
  );
  const [completionNote, setCompletionNote] = useState(
    initialCompletionNote || ""
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/order-request/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          start_count: startCount ? Number(startCount) : null,
          end_count: endCount ? Number(endCount) : null,
          completion_note: completionNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sipariş güncellenemedi.");
      }

      setMessage("Kaydedildi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
        Sipariş Yönetimi
      </p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs text-white/50">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-emerald-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#121826]">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Başlangıç Miktarı</label>
          <input
            value={startCount}
            onChange={(e) => setStartCount(e.target.value.replace(/\D/g, ""))}
            placeholder="Örn: 12500"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Bitiş Miktarı</label>
          <input
            value={endCount}
            onChange={(e) => setEndCount(e.target.value.replace(/\D/g, ""))}
            placeholder="Örn: 13000"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400"
          />
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <label className="mb-2 block text-xs text-white/50">Not</label>
          <input
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            placeholder="İşlem notu"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {message && <p className="text-sm text-white/70">{message}</p>}
      </div>
    </div>
  );
}