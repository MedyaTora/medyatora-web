"use client";

import { useState } from "react";

type Props = {
  requestId: number;
};

type ActionType = "approve" | "reject";

function getActionLabel(action: ActionType) {
  if (action === "approve") return "Onayla";
  return "Reddet";
}

function getLoadingLabel(action: ActionType) {
  if (action === "approve") return "Onaylanıyor...";
  return "Reddediliyor...";
}

function getAdminNote(action: ActionType) {
  if (action === "approve") {
    return "Admin panelinden doğrulandı.";
  }

  return "Admin panelinden reddedildi.";
}

export default function AdminContactVerificationActions({ requestId }: Props) {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(action: ActionType) {
    if (loadingAction) return;

    const confirmed = window.confirm(
      action === "approve"
        ? "Bu iletişim doğrulama talebini onaylamak istiyor musun? Onaylanırsa kullanıcıya 1 USD bonus daha önce verilmediyse tanımlanır."
        : "Bu iletişim doğrulama talebini reddetmek istiyor musun?"
    );

    if (!confirmed) return;

    setLoadingAction(action);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/contact-verification/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_note: getAdminNote(action),
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={Boolean(loadingAction)}
          className="rounded-xl border border-emerald-300/35 bg-emerald-300/90 px-4 py-2 text-xs font-black text-black shadow-[0_10px_28px_rgba(52,211,153,0.16)] transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/12 px-3 py-2 text-xs font-bold text-emerald-100">
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