"use client";

import { useMemo, useState } from "react";
import type { ServiceCardItem } from "@/lib/services";

type Props = {
  items: ServiceCardItem[];
  meta: {
    platform: string;
    service: string;
    region: string;
    country: string;
  };
};

type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta";
type PaymentMethod = "turkey_bank" | "support";
type CurrencyCode = "TL";

type CardProps = {
  item: ServiceCardItem;
};

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "-";

  return value.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  });
}

function ServiceCard({ item }: CardProps) {
  const [quantity, setQuantity] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactType, setContactType] = useState<ContactType>("Telegram");
  const [contactValue, setContactValue] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("turkey_bank");
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleQuantityChange(value: string) {
    const onlyDigits = value.replace(/\D/g, "");
    setQuantity(onlyDigits);
  }

  const quantityNumber = quantity ? Number(quantity) : 0;

  const totalPrice = useMemo(() => {
    if (!quantityNumber || quantityNumber < item.min || quantityNumber > item.max) {
      return 0;
    }

    return Math.round((quantityNumber / 1000) * item.salePriceTl * 100) / 100;
  }, [quantityNumber, item.min, item.max, item.salePriceTl]);

  const totalCost = useMemo(() => {
    if (!quantityNumber || quantityNumber < item.min || quantityNumber > item.max) {
      return 0;
    }

    return Math.round((quantityNumber / 1000) * item.costPriceTl * 100) / 100;
  }, [quantityNumber, item.min, item.max, item.costPriceTl]);

  const isBelowMin = quantity !== "" && quantityNumber < item.min;
  const isAboveMax = quantity !== "" && quantityNumber > item.max;

  const hasTarget = targetUsername.trim() !== "" || targetLink.trim() !== "";

  const isValid =
    quantity !== "" &&
    quantityNumber >= item.min &&
    quantityNumber <= item.max &&
    fullName.trim().length >= 2 &&
    phoneNumber.trim().length >= 7 &&
    contactValue.trim() !== "" &&
    hasTarget &&
    paymentTermsAccepted;

  async function handleOrder() {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      const payload = {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        contact_type: contactType,
        contact_value: contactValue.trim(),
        currency: "TL" as CurrencyCode,
        payment_method: paymentMethod,
        policies_accepted: paymentTermsAccepted,
        items: [
          {
            service_id: item.id,
            site_code: item.siteCode,
            service_title: item.title,
            platform: item.platform,
            category: item.category,
            quantity: quantityNumber,
            unit_price: item.salePriceTl,
            total_price: totalPrice,
            unit_cost_price: item.costPriceTl,
            total_cost_price: totalCost,
            guarantee_label: item.guaranteeLabel,
            speed: item.speed,
            target_username: targetUsername.trim(),
            target_link: targetLink.trim(),
            order_note: orderNote.trim(),
          },
        ],
      };

      const response = await fetch("/api/order-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        alert(result?.error || "Sipariş gönderilemedi.");
        return;
      }

      alert(
        result?.message ||
          `Sipariş başarıyla alındı. Sipariş kodu: ${result?.batchCode || "-"}`
      );

      setQuantity("");
      setFullName("");
      setPhoneNumber("");
      setContactType("Telegram");
      setContactValue("");
      setTargetUsername("");
      setTargetLink("");
      setOrderNote("");
      setPaymentMethod("turkey_bank");
      setPaymentTermsAccepted(false);
    } catch {
      alert("Sipariş gönderilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {item.level}
          </span>

          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item.guaranteeLabel}
          </span>

          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item.regionLabel}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
          {item.title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Minimum</p>
          <p className="font-bold text-gray-900">{formatPrice(item.min)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Maksimum</p>
          <p className="font-bold text-gray-900">{formatPrice(item.max)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Satış</p>
          <p className="font-bold text-gray-900">
            {formatPrice(item.salePriceTl)} TL / 1000
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Hız</p>
          <p className="line-clamp-1 font-bold text-gray-900">{item.speed}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          value={quantity}
          onChange={(event) => handleQuantityChange(event.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Miktar gir"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        {isBelowMin && (
          <p className="text-xs font-medium text-red-500">
            Minimum {formatPrice(item.min)} adet girmelisin.
          </p>
        )}

        {isAboveMax && (
          <p className="text-xs font-medium text-red-500">
            Maksimum {formatPrice(item.max)} adet girebilirsin.
          </p>
        )}

        <input
          type="text"
          value={targetUsername}
          onChange={(event) => setTargetUsername(event.target.value)}
          placeholder="Hedef kullanıcı adı"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <input
          type="text"
          value={targetLink}
          onChange={(event) => setTargetLink(event.target.value)}
          placeholder="Hedef link"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        {!hasTarget && (targetUsername !== "" || targetLink !== "") && (
          <p className="text-xs font-medium text-red-500">
            Hedef kullanıcı adı veya hedef link girmelisin.
          </p>
        )}

        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Ad Soyad"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <input
          type="text"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="Telefon numarası"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={contactType}
            onChange={(event) => setContactType(event.target.value as ContactType)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="Telegram">Telegram</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="E-posta">E-posta</option>
          </select>

          <input
            type="text"
            value={contactValue}
            onChange={(event) => setContactValue(event.target.value)}
            placeholder="İletişim bilgisi"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        >
          <option value="turkey_bank">Türkiye Banka Havalesi / EFT</option>
          <option value="support">Destek ile iletişime geç</option>
        </select>

        <textarea
          value={orderNote}
          onChange={(event) => setOrderNote(event.target.value)}
          placeholder="Sipariş notu / özel istek"
          rows={3}
          className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            checked={paymentTermsAccepted}
            onChange={(event) => setPaymentTermsAccepted(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-slate-900"
          />

          <span className="text-sm leading-6 text-gray-700">
            <a
              href="/kullanim-sartlari"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              Kullanım şartlarını
            </a>
            ,{" "}
            <a
              href="/gizlilik-politikasi"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              gizlilik politikasını
            </a>
            ,{" "}
            <a
              href="/iade-politikasi"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              iade koşullarını
            </a>{" "}
            ve{" "}
            <a
              href="/mesafeli-satis-sozlesmesi"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              mesafeli satış sözleşmesini
            </a>{" "}
            okudum, kabul ediyorum.
          </span>
        </label>

        {!paymentTermsAccepted && (
          <p className="text-xs font-medium text-amber-600">
            Sipariş vermek için sözleşme ve politika onayını işaretlemelisin.
          </p>
        )}

        <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
          <p className="text-xs text-slate-300">Toplam Satış Fiyatı</p>
          <p className="mt-1 text-2xl font-black">
            {quantityNumber >= item.min && quantityNumber <= item.max
              ? `${formatPrice(totalPrice)} TL`
              : "-"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Fiyatlara KDV + vergiler dahildir.
          </p>
        </div>
      </div>

      <button
        onClick={handleOrder}
        disabled={!isValid || loading}
        className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Sipariş Ver"}
      </button>
    </div>
  );
}

export default function ServicesClient({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Bu kategori için hizmet bulunamadı
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Şu anda seçilen kategoriye uygun aktif hizmet görünmüyor. Lütfen farklı
          bir kategori veya bölge seçmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ServiceCard key={`${item.siteCode}-${item.id}`} item={item} />
      ))}
    </div>
  );
}