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

type CardProps = {
  item: ServiceCardItem;
};

function ServiceCard({ item }: CardProps) {
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [username, setUsername] = useState("");
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

    return Math.floor((quantityNumber / 1000) * item.salePrice);
  }, [quantityNumber, item.min, item.max, item.salePrice]);

  const totalCost = useMemo(() => {
    if (!quantityNumber || quantityNumber < item.min || quantityNumber > item.max) {
      return 0;
    }

    return Math.floor((quantityNumber / 1000) * item.costPriceTl);
  }, [quantityNumber, item.min, item.max, item.costPriceTl]);

  const isBelowMin = quantity !== "" && quantityNumber < item.min;
  const isAboveMax = quantity !== "" && quantityNumber > item.max;

  const isValid =
    quantity !== "" &&
    quantityNumber >= item.min &&
    quantityNumber <= item.max &&
    customerName.trim() !== "" &&
    username.trim() !== "";

  async function handleOrder() {
    if (!isValid || loading) return;

    try {
      setLoading(true);

      const payload = {
        customerName,
        username,
        siteCode: item.siteCode,
        providerServiceId: item.id,
        productTitle: item.title,
        quantity: quantityNumber,
        costPrice: totalCost,
        salePrice: totalPrice,
      };

      const response = await fetch("/api/order-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result?.error || "Sipariş gönderilemedi.");
        return;
      }

      alert("Sipariş başarıyla gönderildi.");
      setQuantity("");
      setCustomerName("");
      setUsername("");
    } catch (error) {
      alert("Sipariş gönderilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
          {item.title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item.guaranteeLabel}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Minimum: {item.min}</p>
        <p>Maksimum: {item.max}</p>
        <p>Alış Fiyatımız: {item.costPriceTl} TL</p>
        <p>Satış Fiyatımız: {item.salePrice} TL</p>
      </div>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Miktar gir"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Ad Soyad"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Kullanıcı adı / iletişim"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        {isBelowMin && (
          <p className="text-xs font-medium text-red-500">
            Minimum {item.min} adet girmelisin.
          </p>
        )}

        {isAboveMax && (
          <p className="text-xs font-medium text-red-500">
            Maksimum {item.max} adet girebilirsin.
          </p>
        )}

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs text-gray-500">Toplam Satış Fiyatı</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {quantityNumber >= item.min && quantityNumber <= item.max
              ? `${totalPrice} TL`
              : "-"}
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
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ServiceCard key={`${item.siteCode}-${item.id}`} item={item} />
      ))}
    </div>
  );
}