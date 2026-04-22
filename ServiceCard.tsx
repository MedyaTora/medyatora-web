"use client";

import { useMemo, useState } from "react";

type ServiceCardProps = {
  id: number;
  title: string;
  subtitle: string;
  guarantee: string;
  min: number;
  max: number;
  pricePer1000: number;
};

export default function ServiceCard({
  id,
  title,
  subtitle,
  guarantee,
  min,
  max,
  pricePer1000,
}: ServiceCardProps) {
  const [quantity, setQuantity] = useState("");

  function handleChange(value: string) {
    const onlyDigits = value.replace(/\D/g, "");
    setQuantity(onlyDigits);
  }

  const quantityNumber = quantity ? Number(quantity) : 0;

  const totalPrice = useMemo(() => {
    if (!quantityNumber || quantityNumber < min || quantityNumber > max) {
      return 0;
    }

    return Math.floor((quantityNumber / 1000) * pricePer1000);
  }, [quantityNumber, min, max, pricePer1000]);

  const isBelowMin = quantity !== "" && quantityNumber < min;
  const isAboveMax = quantity !== "" && quantityNumber > max;
  const isValid =
    quantity !== "" && quantityNumber >= min && quantityNumber <= max;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {guarantee}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Servis No: {id}</p>
        <p>Minimum: {min}</p>
        <p>Maksimum: {max}</p>
        <p>1000 adet: {pricePer1000} TL</p>
      </div>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={quantity}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Miktar gir"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        {isBelowMin && (
          <p className="text-xs font-medium text-red-500">
            Minimum {min} adet girmelisin.
          </p>
        )}

        {isAboveMax && (
          <p className="text-xs font-medium text-red-500">
            Maksimum {max} adet girebilirsin.
          </p>
        )}

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs text-gray-500">Toplam Fiyat</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {isValid ? `${totalPrice} TL` : "-"}
          </p>
        </div>
      </div>

      <button
        disabled={!isValid}
        className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Devam Et
      </button>
    </div>
  );
}