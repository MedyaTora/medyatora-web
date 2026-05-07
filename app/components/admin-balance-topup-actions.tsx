"use client";

import { useState } from "react";

type ActionType = "approve" | "reject";

type Props = {
  requestId: number;
  requestNumber: string;
  amount: number | string;
  currency: string;
};

function formatMoney(value: number | string, currency: string) {
  const numberValue = Number(value || 0);

  return `${numberValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getActionLabel(action: ActionType) {
  if (action === "approve") return "Onayla";
  return "Reddet";
}

function getLoadingLabel(action: ActionType) {
  if (action === "approve") return "Onaylanıyor...";
  return "Reddediliyor...";
}

function getDefaultAdminNote(action: ActionType) {
  if (action === "approve") {
    return "Dekont kontrol edildi, bakiye yükleme onaylandı.";
  }

  return "Dekont doğrulanamadığı için bakiye yükleme reddedildi.";
}

export default function AdminBalanceTopupActions({
  requestId,
  requestNumber,
  amount,
  currency,
}: Props) {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(action: ActionType) {
    if (loadingAction) return;

    const confirmed = window.confirm(
      action === "approve"
        ? `${requestNumber} numaralı ${formatMoney(
            amount,
            currency
          )} yatırım talebini onaylamak istiyor musun? Onaylanırsa tutar kullanıcının ${currency} bakiyesine eklenecek.`
        : `${requestNumber} numaralı yatırım talebini reddetmek istiyor musun?`
    );

    if (!confirmed) return;

    setLoadingAction(action);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/balance-topup/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_note: adminNote.trim() || getDefaultAdminNote(action),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "İşlem tamamlanamadı.");
      }

      setMessage(data.message || "İşlem tamamlandı.");

      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder="Admin notu yazabilirsin..."
        rows={2}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-white/30 focus:border-white/25"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={Boolean(loadingAction)}
          className="rounded-xl border border-white/20 bg-white px-4 py-2 text-xs font-black text-black shadow-[0_10px_28px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loadingAction === "approve"
            ? getLoadingLabel("approve")
            : getActionLabel("approve")}
        </button>

        <button
          type="button"
          onClick={() => submit("reject")}
          disabled={Boolean(loadingAction)}
          className="rounded-xl border border-rose-300/35 bg-rose-300/90 px-4 py-2 text-xs font-black text-black shadow-[0_10px_28px_rgba(251,113,133,0.12)] transition hover:-translate-y-0.5 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loadingAction === "reject"
            ? getLoadingLabel("reject")
            : getActionLabel("reject")}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-bold text-white">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/25 bg-rose-300/12 px-3 py-2 text-xs font-bold text-rose-100">
          {error}
        </div>
      )}
    </div>
  );
}