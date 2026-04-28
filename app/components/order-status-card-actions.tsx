"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  initialStatus: string;
  initialStartCount?: number | null;
  initialEndCount?: number | null;
  initialCompletionNote?: string | null;
  orderNumber?: string | null;
  fullName?: string | null;
  contactType?: string | null;
  contactValue?: string | null;
  serviceTitle?: string | null;
  targetUsername?: string | null;
};

const statusOptions = [
  { value: "pending_payment", label: "Ödeme Bekliyor" },
  { value: "pending", label: "Bekliyor" },
  { value: "processing", label: "İşlemde" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
  { value: "refunded", label: "İade Edildi" },
  { value: "failed", label: "Başarısız" },
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function cleanTelegramUsername(value: string) {
  return value
    .replace("https://t.me/", "")
    .replace("http://t.me/", "")
    .replace("t.me/", "")
    .replace("@", "")
    .trim();
}

function cleanInstagramUsername(value: string) {
  return value
    .replace("https://instagram.com/", "")
    .replace("https://www.instagram.com/", "")
    .replace("instagram.com/", "")
    .replace("@", "")
    .split("?")[0]
    .trim();
}

function getStatusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label || status;
}

function buildCustomerMessage({
  orderNumber,
  fullName,
  serviceTitle,
  status,
  startCount,
  endCount,
  completionNote,
}: {
  orderNumber?: string | null;
  fullName?: string | null;
  serviceTitle?: string | null;
  status: string;
  startCount: string;
  endCount: string;
  completionNote: string;
}) {
  const statusLabel = getStatusLabel(status);
  const name = fullName?.trim() || "Değerli müşterimiz";

  if (status === "pending_payment") {
    return `Merhaba ${name}

MedyaTora siparişiniz alınmıştır ve ödeme kontrolü beklenmektedir.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Not: ${completionNote || "Ödeme dekontunuzu ilettikten sonra siparişiniz işleme alınacaktır."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "pending") {
    return `Merhaba ${name}

MedyaTora siparişiniz alınmıştır.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Not: ${completionNote || "Siparişiniz kısa süre içinde kontrol edilecektir."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "processing") {
    return `Merhaba ${name}

MedyaTora siparişiniz işleme alınmıştır.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Başlangıç: ${startCount || "-"}
Not: ${completionNote || "Siparişiniz işlem sürecindedir."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "completed") {
    return `Merhaba ${name}

MedyaTora siparişiniz tamamlanmıştır.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Başlangıç: ${startCount || "-"}
Bitiş: ${endCount || "-"}

Not: ${completionNote || "Bizi tercih ettiğiniz için teşekkür ederiz."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "cancelled") {
    return `Merhaba ${name}

MedyaTora siparişinizle ilgili bilgi vermek istiyorum.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Not: ${completionNote || "Siparişiniz iptal edildi."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "refunded") {
    return `Merhaba ${name}

MedyaTora siparişinizle ilgili bilgi vermek istiyorum.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Not: ${completionNote || "Siparişiniz için iade işlemi işaretlendi."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  if (status === "failed") {
    return `Merhaba ${name}

MedyaTora siparişinizle ilgili bilgi vermek istiyorum.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Not: ${completionNote || "Sipariş işlemi başarısız olarak işaretlendi."}

Detay için buradan dönüş yapabilirsiniz.`;
  }

  return `Merhaba ${name}

MedyaTora siparişinizle ilgili bilgi vermek istiyorum.

Sipariş No: ${orderNumber || "-"}
Hizmet: ${serviceTitle || "-"}
Durum: ${statusLabel}

Başlangıç: ${startCount || "-"}
Bitiş: ${endCount || "-"}

Not: ${completionNote || "-"}

Detay için buradan dönüş yapabilirsiniz.`;
}

function buildContactLink({
  contactType,
  contactValue,
  message,
}: {
  contactType?: string | null;
  contactValue?: string | null;
  message: string;
}) {
  const type = (contactType || "").toLowerCase();
  const value = (contactValue || "").trim();

  if (!value) return null;

  if (type.includes("whatsapp")) {
    const phone = onlyDigits(value);
    if (!phone) return null;

    return {
      label: "WhatsApp Yaz",
      href: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      className: "bg-emerald-500 hover:bg-emerald-400 text-black",
    };
  }

  if (type.includes("telegram")) {
    const username = cleanTelegramUsername(value);
    if (!username) return null;

    return {
      label: "Telegram Aç",
      href: `https://t.me/${username}`,
      className: "bg-sky-500 hover:bg-sky-400 text-black",
    };
  }

  if (type.includes("instagram")) {
    const username = cleanInstagramUsername(value);
    if (!username) return null;

    return {
      label: "Instagram Aç",
      href: `https://instagram.com/${username}`,
      className: "bg-pink-500 hover:bg-pink-400 text-black",
    };
  }

  if (type.includes("posta") || type.includes("mail")) {
    return {
      label: "E-posta Yaz",
      href: `mailto:${value}?subject=${encodeURIComponent(
        "MedyaTora Sipariş Bilgilendirme"
      )}&body=${encodeURIComponent(message)}`,
      className: "bg-white hover:bg-white/90 text-black",
    };
  }

  return null;
}

export default function OrderStatusCardActions({
  id,
  initialStatus,
  initialStartCount,
  initialEndCount,
  initialCompletionNote,
  orderNumber,
  fullName,
  contactType,
  contactValue,
  serviceTitle,
}: Props) {
  const [status, setStatus] = useState(initialStatus || "pending");
  const [startCount, setStartCount] = useState(
    initialStartCount !== null && initialStartCount !== undefined
      ? String(initialStartCount)
      : ""
  );
  const [endCount, setEndCount] = useState(
    initialEndCount !== null && initialEndCount !== undefined
      ? String(initialEndCount)
      : ""
  );
  const [completionNote, setCompletionNote] = useState(initialCompletionNote || "");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const customerMessage = buildCustomerMessage({
    orderNumber,
    fullName,
    serviceTitle,
    status,
    startCount,
    endCount,
    completionNote,
  });

  const contactLink = buildContactLink({
    contactType,
    contactValue,
    message: customerMessage,
  });

  async function handleSave() {
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
          completion_note: completionNote.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sipariş güncellenemedi.");
      }

      setMessage("Kaydedildi.");

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bir hata oluştu.");
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(customerMessage);
      setMessage("Müşteri mesajı kopyalandı.");
    } catch {
      setMessage("Mesaj kopyalanamadı.");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
        Sipariş Yönetimi
      </p>

      <div className="grid gap-3">
        <div>
          <label className="mb-2 block text-xs text-white/50">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none disabled:opacity-60"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#121826]">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-white/50">Başlangıç</label>
            <input
              value={startCount}
              onChange={(e) => setStartCount(e.target.value.replace(/\D/g, ""))}
              placeholder="Örn: 12500"
              disabled={isPending}
              inputMode="numeric"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/50">Bitiş</label>
            <input
              value={endCount}
              onChange={(e) => setEndCount(e.target.value.replace(/\D/g, ""))}
              placeholder="Örn: 13000"
              disabled={isPending}
              inputMode="numeric"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/50">Admin / İşlem Notu</label>
          <input
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            placeholder="İşlem notu / iptal nedeni / iade notu"
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>

        <button
          type="button"
          onClick={copyMessage}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
        >
          Mesajı Kopyala
        </button>

        {contactLink ? (
          <a
            href={contactLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${contactLink.className}`}
          >
            {contactLink.label}
          </a>
        ) : null}
      </div>

      {message ? <p className="mt-3 text-sm text-white/70">{message}</p> : null}
    </div>
  );
}