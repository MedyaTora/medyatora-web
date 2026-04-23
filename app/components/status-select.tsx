"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "pending", label: "Bekliyor" },
  { value: "in_review", label: "İnceleniyor" },
  { value: "contacted", label: "İletişime Geçildi" },
  { value: "completed", label: "Tamamlandı" },
];

type Props = {
  id: string;
  initialStatus: string;
};

export default function StatusSelect({ id, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateStatus = async (nextStatus: string) => {
    if (nextStatus === status) return;

    const previousStatus = status;
    setStatus(nextStatus);
    setMessage("");

    try {
      const res = await fetch("/api/update-analysis-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Durum güncellenemedi.");
      }

      setMessage("Kaydedildi.");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setStatus(previousStatus);
      setMessage(error instanceof Error ? error.message : "Durum güncellenemedi.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => updateStatus(e.target.value)}
        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {statuses.map((item) => (
          <option
            key={item.value}
            value={item.value}
            className="bg-[#121826] text-white"
          >
            {item.label}
          </option>
        ))}
      </select>

      {message ? (
        <p className="text-xs text-white/55">{message}</p>
      ) : null}
    </div>
  );
}