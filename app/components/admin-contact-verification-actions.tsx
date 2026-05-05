"use client";

import { useState } from "react";

type Props = {
  requestId: number;
};

export default function AdminContactVerificationActions({ requestId }: Props) {
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(action: "approve" | "reject") {
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
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_note:
            action === "approve"
              ? "Admin panelinden doğrulandı."
              : "Admin panelinden reddedildi.",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "İşlem tamamlanamadı.");
      }

      setMessage(data.message || "İşlem tamamlandı.");

      setTimeout(() => {
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
          className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === "approve" ? "Onaylanıyor..." : "Onayla"}
        </button>

        <button
          type="button"
          onClick={() => submit("reject")}
          disabled={Boolean(loadingAction)}
          className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-xs font-black text-rose-200 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === "reject" ? "Reddediliyor..." : "Reddet"}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}