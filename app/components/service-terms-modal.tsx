"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "medyatora_service_terms_accepted_v1";

const rules = [
  {
    title: "Profil ve bağlantı sorumluluğu",
    text: "Sipariş verilen profil herkese açık olmalıdır. Gizli, kapalı, yanlış link verilmiş veya kullanıcı adı değişmiş hesaplarda işlem başlamayabilir ya da gecikebilir.",
  },
  {
    title: "İşlem başladıktan sonra iptal",
    text: "İşlem başladıktan sonra keyfi iptal yapılamaz. Sipariş verirken platform, kullanıcı adı, bağlantı ve miktar bilgilerinin doğru girilmesi kullanıcının sorumluluğundadır.",
  },
  {
    title: "Tamamlanan hizmetlerde iade",
    text: "Tamamlanan dijital hizmetlerde iade yapılmaz. Hizmet tamamlandıktan sonra siparişin geri alınması veya nakit iadesi talep edilemez.",
  },
  {
    title: "Bakiye ve ödeme iadesi",
    text: "Bakiye olarak eklenen tutar, dijital hizmet alımı için kullanılır. Kullanıcı, hesaba eklenen bakiyenin nakit iade kapsamında olmadığını kabul eder.",
  },
  {
    title: "Eksik veya tamamlanamayan işlem",
    text: "Ürün yüklemesinde teknik sorun oluşursa veya işlem tamamen tamamlanamazsa, yüklenmeyen miktarın karşılığı MedyaTora bakiyesine iade edilebilir.",
  },
  {
    title: "Gizlilik ve veri güvencesi",
    text: "Paylaştığınız kullanıcı adı, bağlantı, iletişim bilgisi ve sipariş detayları yalnızca hizmet ve destek sürecini yürütmek için kullanılır. Bilgileriniz üçüncü kişilerle paylaşılmaz.",
  },
  {
    title: "Hesap silme ve garanti süreci",
    text: "Hesabınızı veya kayıtlı bilgilerinizi silmek istediğinizde aktif siparişiniz ya da garanti süreniz yoksa bilgileriniz sistemden silinebilir. Aktif garanti veya devam eden işlem varsa, takip süreci tamamlanana kadar ilgili kayıtlar saklanabilir.",
  },
];

export default function ServiceTermsModal() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedCheck, setAcceptedCheck] = useState(false);
  const [hasAcceptedBefore, setHasAcceptedBefore] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const accepted = localStorage.getItem(STORAGE_KEY) === "true";

    setHasAcceptedBefore(accepted);

    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  function handleAccept() {
    if (!acceptedCheck) return;

    localStorage.setItem(STORAGE_KEY, "true");
    setHasAcceptedBefore(true);
    setIsOpen(false);
  }

  function handleClose() {
    if (!hasAcceptedBefore) return;
    setIsOpen(false);
  }

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#080b12] text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:max-h-[92vh]">
        <div className="shrink-0 border-b border-white/10 bg-[#080b12]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                MedyaTora Bilgilendirme
              </div>

              <h2 className="text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
                Hizmet Kullanım ve Gizlilik Onayı
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Sipariş vermeden önce aşağıdaki şartları okuyup onaylaman gerekir.
              </p>
            </div>

            {hasAcceptedBefore ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xl font-black text-white/70 transition hover:bg-white/[0.12] hover:text-white"
                aria-label="Kapat"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 sm:p-5">
            <p className="text-sm leading-7 text-white/70">
              Bu bilgilendirme; işlem süreci, iptal/iade şartları, bakiye
              kullanımı, gizlilik ve garanti takibi hakkında temel kuralları
              içerir.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {rules.map((rule, index) => (
              <div
                key={rule.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                    {index + 1}
                  </span>

                  <h3 className="font-semibold text-white">{rule.title}</h3>
                </div>

                <p className="text-sm leading-6 text-white/65">{rule.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
            <p className="font-semibold text-white">Önemli ayrım:</p>
            <p className="mt-1 text-white/75">
              Tamamlanan dijital hizmetlerde iade yapılmaz. Ancak ürün
              yüklemesinde sorun yaşanırsa veya hizmet tamamlanamazsa,
              yüklenmeyen miktarın karşılığı MedyaTora bakiyesine iade
              edilebilir.
            </p>
          </div>

          {!hasAcceptedBefore ? (
            <label className="mt-4 flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <input
                type="checkbox"
                checked={acceptedCheck}
                onChange={(e) => setAcceptedCheck(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-emerald-400"
              />

              <span className="text-sm leading-6 text-white/75">
                Okudum, anladım ve kabul ediyorum. İşlem başladıktan sonra keyfi
                iptal yapılamayacağını, tamamlanan dijital hizmetlerde iade
                olmadığını, bakiye olarak eklenen tutarın nakit iade kapsamında
                olmadığını kabul ediyorum.
              </span>
            </label>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#080b12]/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            {!hasAcceptedBefore ? (
              <button
                type="button"
                onClick={handleAccept}
                disabled={!acceptedCheck}
                className="w-full rounded-2xl bg-white px-6 py-3 text-center font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-1"
              >
                Okudum ve Kabul Ediyorum
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-2xl bg-white px-6 py-3 text-center font-black text-black transition hover:bg-white/90 sm:flex-1"
              >
                Devam Et
              </button>
            )}

            <a
              href="/"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-center font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:flex-1"
            >
              Ana Ekrana Dön
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}