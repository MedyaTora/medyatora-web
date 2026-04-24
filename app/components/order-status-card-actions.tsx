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

// 🔥 NUMARANI BURAYA YAZ
const WHATSAPP_NUMBER = "905XXXXXXXXX";

// 🔥 TELEGRAM USERNAME
const TELEGRAM_USERNAME = "medyatora";

function buildWhatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function buildTelegramLink(text: string) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
}

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

  // 🔥 MÜŞTERİYE GİDECEK MESAJ
  const customerMessage = `Merhaba, siparişiniz tamamlandı 🎉

Başlangıç: ${startCount || "-"}
Bitiş: ${endCount || "-"}

Not: ${completionNote || "-"}

Teşekkür ederiz 🙏`;

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
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#121826]">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Başlangıç</label>
          <input
            value={startCount}
            onChange={(e) => setStartCount(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Bitiş</label>
          <input
            value={endCount}
            onChange={(e) => setEndCount(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Not</label>
          <input
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {/* 🔥 SADECE COMPLETED OLUNCA ÇIKAR */}
        {status === "completed" && (
          <>
            <a
              href={buildWhatsappLink(customerMessage)}
              target="_blank"
              className="rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-black"
            >
              WhatsApp Yaz
            </a>

            <a
              href={buildTelegramLink(customerMessage)}
              target="_blank"
              className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-black"
            >
              Telegram Yaz
            </a>
          </>
        )}
      </div>

      {message && <p className="mt-3 text-sm text-white/70">{message}</p>}
    </div>
  );
}