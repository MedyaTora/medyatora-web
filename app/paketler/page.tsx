"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OrderServiceItem } from "@/lib/services";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getFeaturedPlatforms } from "@/lib/platforms";

type CategoryItem = {
  slug: string;
  name: string;
};

type CurrencyCode = "TL" | "USD" | "RUB";
type CheckoutMode = "single" | "cart" | null;
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta" | "";

type CartItem = {
  cartId: string;
  service_id: number;
  site_code: number;
  service_title: string;
  platform: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost_price: number;
  total_cost_price: number;
  guarantee_label: string;
  speed: string;
  target_username: string;
  target_link: string;
  order_note: string;
};

const PLATFORM_CATEGORY_MAP: Record<string, CategoryItem[]> = {
  instagram: [
    { slug: "takipci", name: "Takipçi" },
    { slug: "begeni", name: "Beğeni" },
    { slug: "yorum", name: "Yorum" },
    { slug: "izlenme", name: "İzlenme" },
    { slug: "kaydetme", name: "Kaydetme" },
  ],
  tiktok: [
    { slug: "takipci", name: "Takipçi" },
    { slug: "begeni", name: "Beğeni" },
    { slug: "yorum", name: "Yorum" },
    { slug: "izlenme", name: "İzlenme" },
  ],
  youtube: [
    { slug: "abone", name: "Abone" },
    { slug: "begeni", name: "Beğeni" },
    { slug: "yorum", name: "Yorum" },
    { slug: "izlenme", name: "İzlenme" },
  ],
  telegram: [
    { slug: "uye", name: "Üye" },
    { slug: "izlenme", name: "İzlenme" },
    { slug: "reaksiyon", name: "Reaksiyon" },
  ],
  facebook: [
    { slug: "takipci", name: "Takipçi" },
    { slug: "begeni", name: "Beğeni" },
    { slug: "izlenme", name: "İzlenme" },
  ],
  x: [
    { slug: "takipci", name: "Takipçi" },
    { slug: "begeni", name: "Beğeni" },
    { slug: "retweet", name: "Retweet" },
    { slug: "izlenme", name: "Görüntülenme" },
  ],
};

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];
const localeOptions: Locale[] = ["tr", "en", "ru"];
const contactTypes: ContactType[] = ["Telegram", "WhatsApp", "Instagram", "E-posta"];

const TELEGRAM_USERNAME = "medyatora";
const WHATSAPP_NUMBER = "905530739292";

function buildOrderMessage(orderNumbers: string[]) {
  return `Merhaba, MedyaTora üzerinden sipariş verdim.

Sipariş numaram:
${orderNumbers.join("\n")}

Ödeme ve işlem adımlarını öğrenmek istiyorum.`;
}

function buildTelegramLink(orderNumbers: string[]) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    buildOrderMessage(orderNumbers)
  )}`;
}

function buildWhatsappLink(orderNumbers: string[]) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildOrderMessage(orderNumbers)
  )}`;
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "tr";

  const saved = window.localStorage.getItem("medyatora_locale");
  if (saved === "tr" || saved === "en" || saved === "ru") return saved;

  const browserLang = (navigator.language || "").toLowerCase();
  if (browserLang.startsWith("tr")) return "tr";
  if (browserLang.startsWith("ru")) return "ru";
  return "en";
}

function getUnitSalePrice(service: OrderServiceItem | null, currency: CurrencyCode) {
  if (!service) return 0;
  if (currency === "USD") return service.salePriceUsd;
  if (currency === "RUB") return service.salePriceRub;
  return service.salePriceTl;
}

function getUnitCostPrice(service: OrderServiceItem | null, currency: CurrencyCode) {
  if (!service) return 0;
  if (currency === "USD") return service.costPriceUsd;
  if (currency === "RUB") return service.costPriceRub;
  return service.costPriceTl;
}

function formatPrice(value: number, currency: CurrencyCode) {
  if (!value) return `0 ${currency}`;
  if (currency === "TL") return `${Math.round(value)} TL`;
  return `${value.toFixed(2)} ${currency}`;
}

function getCategoryLabel(name: string, locale: Locale) {
  const map: Record<string, Record<Locale, string>> = {
    Takipçi: { tr: "Takipçi", en: "Followers", ru: "Подписчики" },
    Beğeni: { tr: "Beğeni", en: "Likes", ru: "Лайки" },
    Yorum: { tr: "Yorum", en: "Comments", ru: "Комментарии" },
    İzlenme: { tr: "İzlenme", en: "Views", ru: "Просмотры" },
    Kaydetme: { tr: "Kaydetme", en: "Saves", ru: "Сохранения" },
    Abone: { tr: "Abone", en: "Subscribers", ru: "Подписчики" },
    Üye: { tr: "Üye", en: "Members", ru: "Участники" },
    Reaksiyon: { tr: "Reaksiyon", en: "Reactions", ru: "Реакции" },
    Görüntülenme: { tr: "Görüntülenme", en: "Views", ru: "Просмотры" },
    Retweet: { tr: "Retweet", en: "Retweet", ru: "Ретвит" },
  };

  return map[name]?.[locale] || name;
}

function makeCartId() {
  return Math.random().toString(36).slice(2, 10);
}

function OrderBeforeNotice() {
  return (
    <section className="rounded-[28px] border border-amber-400/20 bg-amber-400/10 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          MedyaTora Bilgilendirme Sistemi
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">
          Sipariş Öncesi Önemli Bilgilendirme
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
          Sipariş oluşturmadan önce aşağıdaki bilgileri dikkatlice kontrol ediniz.
          Bu bilgiler işlemin sorunsuz, hızlı ve doğru şekilde tamamlanması için önemlidir.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">💳 Fiyat Bilgisi</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Tüm fiyatlara KDV + vergiler dahildir. Sipariş ekranında gördüğünüz tutar
            nihai ödeme tutarıdır.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">🔓 Profil Durumu</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            İşlem yapılacak profil, gönderi, video veya kanal herkese açık olmalıdır.
            Gizli ya da erişilemeyen hedeflerde işlem başlatılamaz.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">⏱️ Başlangıç Süresi</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Başlangıç süresi servise göre değişebilir. Genellikle işlemler 0-24 saat
            içinde başlar, yoğunluk durumunda süre uzayabilir.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">↩️ İade Durumu</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Ürün tamamlanamazsa ödeme iadesi yapılır. Sipariş başladıktan sonra keyfi
            iptal/iade yapılamaz.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">🧾 Sipariş No</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Sipariş oluşturulduktan sonra size özel sipariş numarası verilir. Destek
            taleplerinde bu numara ile işlem yapılır.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">🔗 Link Kontrolü</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Kullanıcı adı, profil linki, gönderi linki veya kanal bağlantısı doğru
            girilmelidir. Hatalı bilgi işlem gecikmesine neden olabilir.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">📦 Teslimat Akışı</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Bazı servislerde teslimat kademeli ilerleyebilir. Bu durum işlemin daha
            dengeli ve doğal görünmesi için uygulanır.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">🛡️ Garanti Bilgisi</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Garantili servislerde belirtilen süre içinde destek sağlanır. Garanti süresi
            seçilen servise göre değişir.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-400/20 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">
            ⚠️ Dikkat Edilmesi Gerekenler
          </p>

          <div className="mt-3 space-y-2 text-sm leading-6 text-white/65">
            <p>• Yanlış kullanıcı adı veya link girilirse işlem gecikebilir.</p>
            <p>• Sipariş tamamlandıktan sonra profil tekrar gizliye alınabilir.</p>
            <p>• Minimum ve maksimum sipariş miktarı seçilen servise göre değişir.</p>
            <p>• Sipariş devam ederken hedef kullanıcı adı veya link değiştirilmemelidir.</p>
            <p>• Aynı hedefe aynı anda birden fazla benzer sipariş verilmesi önerilmez.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-white">
            ✅ Güvenli Sipariş İçin Öneriler
          </p>

          <div className="mt-3 space-y-2 text-sm leading-6 text-white/65">
            <p>• Hedef profilin, gönderinin veya kanalın açık olduğundan emin olun.</p>
            <p>• Sipariş miktarını servis minimum ve maksimum limitlerine göre seçin.</p>
            <p>• Ödeme sonrası dekontu seçtiğiniz iletişim kanalından bize iletin.</p>
            <p>• Destek için WhatsApp veya Telegram üzerinden sipariş numaranızı paylaşın.</p>
            <p>• İşlem tamamlanana kadar içeriği silmeyin veya erişime kapatmayın.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
        <p className="text-sm font-semibold text-white">
          🌴 Örnek Servis Bilgilendirmesi
        </p>

        <div className="mt-3 grid gap-3 text-sm leading-6 text-white/65 md:grid-cols-3">
          <p>
            <span className="font-semibold text-white">Coğrafi Bölge:</span> Global / Türkiye / Rusya
          </p>
          <p>
            <span className="font-semibold text-white">Başlangıç:</span> Genellikle 0-24 saat
          </p>
          <p>
            <span className="font-semibold text-white">Min - Maks:</span> Seçilen servise göre değişir
          </p>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/60">
          Örnek bağlantı formatı: https://www.instagram.com/p/XXXXXXXX/
        </p>
      </div>
    </section>
  );
}

export default function PaketlerPage() {
  const platforms = getFeaturedPlatforms();

  const [selectedPlatform, setSelectedPlatform] = useState(
    platforms[0]?.slug || "instagram"
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("TL");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");

  const [services, setServices] = useState<OrderServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactType, setContactType] = useState<ContactType>("");
  const [contactValue, setContactValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [error, setError] = useState("");
  const [createdOrderNumbers, setCreatedOrderNumbers] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const cartSectionRef = useRef<HTMLDivElement | null>(null);

  const [infoTab, setInfoTab] = useState<"service" | "before" | "notes">("service");

  useEffect(() => {
    setSelectedLocale(detectInitialLocale());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("medyatora_locale", selectedLocale);
    }
  }, [selectedLocale]);

  const t = getDictionary(selectedLocale);

  useEffect(() => {
    async function loadServices() {
      setServicesLoading(true);
      setError("");

      try {
        const res = await fetch("/api/services");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Servisler alınamadı.");
        }

        setServices(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Servisler yüklenemedi.");
      } finally {
        setServicesLoading(false);
      }
    }

    loadServices();
  }, []);

  const platformServices = useMemo(() => {
    return services.filter((item) => item.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  const categories = useMemo(() => {
    const availableCategories = PLATFORM_CATEGORY_MAP[selectedPlatform] ?? [];

    return availableCategories.filter((category) =>
      platformServices.some((service) => service.category === category.slug)
    );
  }, [selectedPlatform, platformServices]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory("");
      setSelectedServiceId(null);
      return;
    }

    const hasCurrentCategory = categories.some(
      (category) => category.slug === selectedCategory
    );

    const nextCategory = hasCurrentCategory ? selectedCategory : categories[0].slug;

    setSelectedCategory(nextCategory);
    setSelectedServiceId(null);
  }, [categories, selectedCategory]);

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return [];

    return services
      .filter(
        (item) =>
          item.platform === selectedPlatform && item.category === selectedCategory
      )
      .sort((a, b) => {
        const aPrice = getUnitSalePrice(a, selectedCurrency);
        const bPrice = getUnitSalePrice(b, selectedCurrency);
        return aPrice - bPrice;
      });
  }, [services, selectedPlatform, selectedCategory, selectedCurrency]);

  useEffect(() => {
    if (!filteredServices.length) {
      setSelectedServiceId(null);
      return;
    }

    const hasCurrentService = filteredServices.some(
      (service) => service.id === selectedServiceId
    );

    if (!hasCurrentService) {
      setSelectedServiceId(filteredServices[0].id);
    }
  }, [filteredServices, selectedServiceId]);

  const selectedService = useMemo(() => {
    return (
      filteredServices.find((item) => item.id === selectedServiceId) ?? null
    );
  }, [filteredServices, selectedServiceId]);

  const quantityNumber = quantity ? Number(quantity.replace(/\D/g, "")) : 0;

  const selectedUnitPrice = useMemo(() => {
    return getUnitSalePrice(selectedService, selectedCurrency);
  }, [selectedService, selectedCurrency]);

  const selectedUnitCostPrice = useMemo(() => {
    return getUnitCostPrice(selectedService, selectedCurrency);
  }, [selectedService, selectedCurrency]);

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    if (!quantityNumber) return 0;
    if (quantityNumber < selectedService.min || quantityNumber > selectedService.max) {
      return 0;
    }
    return (quantityNumber / 1000) * selectedUnitPrice;
  }, [quantityNumber, selectedService, selectedUnitPrice]);

  const totalCostPrice = useMemo(() => {
    if (!selectedService) return 0;
    if (!quantityNumber) return 0;
    if (quantityNumber < selectedService.min || quantityNumber > selectedService.max) {
      return 0;
    }
    return (quantityNumber / 1000) * selectedUnitCostPrice;
  }, [quantityNumber, selectedService, selectedUnitCostPrice]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [cartItems]);

  const cartCostTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_cost_price, 0);
  }, [cartItems]);

  const canUseCurrentForm =
    !!selectedService &&
    quantityNumber >= (selectedService?.min ?? 0) &&
    quantityNumber <= (selectedService?.max ?? 0) &&
    !!targetUsername.trim();

  const isCheckoutValid =
    !!fullName.trim() &&
    !!phoneNumber.trim() &&
    !!contactType &&
    !!contactValue.trim();

  const scrollProducts = (direction: "up" | "down") => {
    if (!productsScrollRef.current) return;

    productsScrollRef.current.scrollBy({
      top: direction === "down" ? 320 : -320,
      behavior: "smooth",
    });
  };

  const goToCart = () => {
    cartSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetItemForm = () => {
    setQuantity("");
    setTargetUsername("");
    setTargetLink("");
    setOrderNote("");
  };

  const resetCheckoutForm = () => {
    setFullName("");
    setPhoneNumber("");
    setContactType("");
    setContactValue("");
  };

  const buildCurrentItem = (): CartItem | null => {
    if (!selectedService || !canUseCurrentForm) return null;

    return {
      cartId: makeCartId(),
      service_id: selectedService.id,
      site_code: selectedService.siteCode,
      service_title: selectedService.title,
      platform: selectedPlatform,
      category: selectedCategory,
      quantity: quantityNumber,
      unit_price: selectedUnitPrice,
      total_price: totalPrice,
      unit_cost_price: selectedUnitCostPrice,
      total_cost_price: totalCostPrice,
      guarantee_label: selectedService.guaranteeLabel,
      speed: selectedService.speed,
      target_username: targetUsername.trim(),
      target_link: targetLink.trim(),
      order_note: orderNote.trim(),
    };
  };

  const clearStatusMessages = () => {
    setError("");
    setCartMessage("");
    setCreatedOrderNumbers([]);
    setSuccessOpen(false);
  };

  const handleAddToCart = () => {
    const item = buildCurrentItem();
    if (!item) return;

    setCartItems((prev) => [...prev, item]);
    resetItemForm();
    setCartMessage("Ürün sepete eklendi.");
    setError("");
    setCreatedOrderNumbers([]);
    setSuccessOpen(false);
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleEditCartItem = (cartId: string) => {
    const item = cartItems.find((x) => x.cartId === cartId);
    if (!item) return;

    setSelectedPlatform(item.platform);
    setSelectedCategory(item.category);
    setSelectedServiceId(item.service_id);
    setQuantity(String(item.quantity));
    setTargetUsername(item.target_username);
    setTargetLink(item.target_link);
    setOrderNote(item.order_note);

    setCartItems((prev) => prev.filter((x) => x.cartId !== cartId));
    setCartMessage("Sepet ürünü düzenleme için forma taşındı.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSingleCheckout = () => {
    const item = buildCurrentItem();
    if (!item) return;

    setCheckoutItems([item]);
    setCheckoutMode("single");
    setError("");
  };

  const handleOpenCartCheckout = () => {
    if (cartItems.length === 0) return;

    setCheckoutItems(cartItems);
    setCheckoutMode("cart");
    setError("");
  };

  const submitItems = async () => {
    if (!isCheckoutValid || checkoutItems.length === 0) return;

    setLoading(true);
    setError("");
    setCartMessage("");
    setCreatedOrderNumbers([]);

    try {
      const res = await fetch("/api/order-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber,
          contact_type: contactType,
          contact_value: contactValue,
          currency: selectedCurrency,
          items: checkoutItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sipariş oluşturulamadı.");
      }

      setCreatedOrderNumbers(data.orderNumbers || []);
      setSuccessOpen(true);
      setCheckoutMode(null);

      if (checkoutMode === "cart") {
        setCartItems([]);
      }

      resetItemForm();
      resetCheckoutForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172033_0%,#0b0f19_55%,#070b12_100%)] px-3 py-4 text-white sm:px-4 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.newOrder}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                {t.newOrderDesc}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  Dil
                </p>
                <div className="flex flex-wrap gap-2">
                  {localeOptions.map((locale) => {
                    const active = selectedLocale === locale;

                    return (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => setSelectedLocale(locale)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                          active
                            ? "bg-emerald-400 text-black"
                            : "bg-white/10 text-white/80 hover:bg-white/15"
                        }`}
                      >
                        {locale.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t.currency}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currencyOptions.map((currency) => {
                    const active = selectedCurrency === currency;

                    return (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => {
                          setSelectedCurrency(currency);
                          clearStatusMessages();
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                          active
                            ? "bg-emerald-400 text-black"
                            : "bg-white/10 text-white/80 hover:bg-white/15"
                        }`}
                      >
                        {currency}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrderBeforeNotice />

        <section className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
              {t.selectPlatform}
            </p>

            <button
              type="button"
              onClick={goToCart}
              className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/15 sm:text-sm"
            >
              {t.goToCart}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {platforms.map((platform) => {
              const active = selectedPlatform === platform.slug;

              return (
                <button
                  key={platform.slug}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(platform.slug);
                    setSelectedServiceId(null);
                    clearStatusMessages();
                  }}
                  className={`group rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xl sm:text-2xl">{platform.emoji}</div>
                  <div className="mt-2 text-sm font-semibold sm:text-base">{platform.title}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
            {t.category}
          </p>

          {servicesLoading ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/50">
              {t.servicesLoading}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/50">
              {t.noCategoryFound}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategory === category.slug;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setSelectedServiceId(null);
                      clearStatusMessages();
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                      active
                        ? "bg-emerald-400 text-black"
                        : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {getCategoryLabel(category.name, selectedLocale)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t.products}
                </p>

                {filteredServices.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollProducts("up")}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:text-sm"
                    >
                      {t.up}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollProducts("down")}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:text-sm"
                    >
                      {t.down}
                    </button>
                  </div>
                )}
              </div>

              {servicesLoading ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/50">
                  {t.productsLoading}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/50">
                  {t.noProductsFound}
                </div>
              ) : (
                <div
                  ref={productsScrollRef}
                  className="max-h-[520px] space-y-2 overflow-y-auto pr-1 sm:max-h-[620px]"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {filteredServices.map((service) => {
                    const active = selectedService?.id === service.id;
                    const unitPrice = getUnitSalePrice(service, selectedCurrency);

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          clearStatusMessages();
                        }}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                                {service.title}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-[11px] ${
                                  service.guarantee
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-rose-500/15 text-rose-300"
                                }`}
                              >
                                {service.guaranteeLabel}
                              </span>

                              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 sm:text-[11px]">
                                {service.level}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-1 text-xs text-white/55 sm:text-sm">
                              <p>
                                {t.serviceNo}: {service.siteCode}
                              </p>
                              <p>
                                {t.minMax}: {service.min} · Max: {service.max}
                              </p>
                              <p>
                                {t.speed}: {service.speed}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[11px] text-white/45 sm:text-xs">{t.per1000}</p>
                            <p className="mt-1 text-base font-bold text-emerald-300 sm:text-lg">
                              {formatPrice(unitPrice, selectedCurrency)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setInfoTab("service")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    infoTab === "service"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-white/75"
                  }`}
                >
                  Servis Bilgisi
                </button>
                <button
                  type="button"
                  onClick={() => setInfoTab("before")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    infoTab === "before"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-white/75"
                  }`}
                >
                  Sipariş Öncesi
                </button>
                <button
                  type="button"
                  onClick={() => setInfoTab("notes")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    infoTab === "notes"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-white/75"
                  }`}
                >
                  Önemli Notlar
                </button>
              </div>

              {infoTab === "service" && (
                <div className="space-y-3 text-sm leading-7 text-white/70">
                  <p>
                    Satın alacağınız hizmet, seçtiğiniz platform ve kategoriye göre otomatik
                    işleme alınır. Her servis için minimum ve maksimum sipariş limiti vardır.
                  </p>
                  <p>
                    Garantili servislerde belirtilen süre içinde destek sağlanır. Garantisiz
                    servislerde teslimat sonrası ek koruma bulunmaz.
                  </p>
                  <p>
                    Siparişiniz, daha dengeli ve doğal bir teslimat akışı sağlamak amacıyla
                    kademeli teslimat sistemi ile işleme alınmaktadır. Sipariş yoğunluğa bağlı
                    olarak genellikle 0-12 saat içerisinde tamamlanır.
                  </p>
                </div>
              )}

              {infoTab === "before" && (
                <div className="space-y-3 text-sm leading-7 text-white/70">
                  <p>
                    Kullanıcı adı, bağlantı ve miktar bilgilerini dikkatli giriniz. Yanlış
                    kullanıcı adı veya hatalı link girilmesi siparişin yanlış adrese gitmesine ya
                    da başlatılamamasına neden olabilir.
                  </p>
                  <p>
                    Link isteyen servislerde doğru profil, gönderi, video, kanal veya grup
                    bağlantısı verilmesi zorunludur.
                  </p>
                  <p>
                    Hatalı bilgi girdiğinizi fark ederseniz sipariş numaranız ile bizimle iletişime
                    geçiniz.
                  </p>
                </div>
              )}

              {infoTab === "notes" && (
                <div className="space-y-3 text-sm leading-7 text-white/70">
                  <p>• Siparişten sonra kullanıcı adı veya bağlantıyı değiştirmemeniz önerilir.</p>
                  <p>• Aynı hesap için çok kısa sürede çoklu benzer sipariş vermemeye dikkat ediniz.</p>
                  <p>• Profilin veya içeriğin erişilebilir olması gerekir. Gizli hesaplarda işlem gecikebilir.</p>
                  <p>• Destek talebinde bulunurken sipariş numaranız ile yazınız.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                {t.orderInfo}
              </p>

              {selectedService ? (
                <div className="mb-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{selectedService.title}</p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-[11px] ${
                          selectedService.guarantee
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {selectedService.guaranteeLabel}
                      </span>

                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 sm:text-[11px]">
                        {selectedService.level}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/60">
                      {t.minMax} {selectedService.min} · Max {selectedService.max}
                    </p>

                    <p className="mt-1 text-sm text-white/60">
                      {t.speed}: {selectedService.speed}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white/85">{t.productDescription}</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/50">
                  {t.selectProductFirst}
                </div>
              )}

              <div className="space-y-3">
                <input
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  placeholder={t.targetUsername}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                />

                <input
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  placeholder={t.targetLink}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                />

                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                  placeholder={t.quantity}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                />

                <input
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={t.orderNote}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
                />

                <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                  <p className="text-sm text-white/50">{t.totalSalePrice}</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {totalPrice > 0 ? formatPrice(totalPrice, selectedCurrency) : "-"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleOpenSingleCheckout}
                    disabled={!canUseCurrentForm}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.buyNow}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canUseCurrentForm}
                    className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.addToCart}
                  </button>

                  <button
                    type="button"
                    onClick={goToCart}
                    className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-300 transition hover:bg-sky-400/15"
                  >
                    {t.goToCart}
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={cartSectionRef}
              className="rounded-[28px] border border-white/10 bg-[#121826]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  {t.cart}
                </p>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenCartCheckout}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-400 sm:text-sm"
                  >
                    {t.bulkBuy}
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-4 text-sm text-white/45">
                  {t.cartEmpty}
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartId}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {item.service_title}
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-white/55 sm:text-sm">
                            <p>{t.targetUsername}: {item.target_username}</p>
                            <p>{t.targetLink}: {item.target_link || "-"}</p>
                            <p>{t.quantity}: {item.quantity}</p>
                            <p>{t.orderNote}: {item.order_note || "-"}</p>
                            <p>{t.per1000}: {formatPrice(item.unit_price, selectedCurrency)}</p>
                            <p>{t.totalSalePrice}: {formatPrice(item.total_price, selectedCurrency)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCartItem(item.cartId)}
                            className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15"
                          >
                            {t.edit}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(item.cartId)}
                            className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/15"
                          >
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>{t.cartCostTotal}</span>
                    <span>{formatPrice(cartCostTotal, selectedCurrency)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                    <span>{t.cartSaleTotal}</span>
                    <span>{formatPrice(cartTotal, selectedCurrency)}</span>
                  </div>
                </div>

                {cartMessage && (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300">
                    {cartMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {checkoutMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#121826] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">İletişim ve Onay</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Siparişinizi onaylamak için aşağıdaki alanları eksiksiz doldurunuz.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutMode(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                Kapat
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullName}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
              />

              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Telefon Numarası"
                inputMode="numeric"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
              />

              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as ContactType)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="" className="bg-[#121826]">
                  İletişim Türü Seç
                </option>
                {contactTypes.map((item) => (
                  <option key={item} value={item} className="bg-[#121826]">
                    {item}
                  </option>
                ))}
              </select>

              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder="İletişim Bilgisi"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-400"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              <p>Lütfen yalnızca WhatsApp, Instagram, Telegram veya E-posta bilgisi giriniz.</p>
              <p className="mt-1">Önerilen iletişim yöntemi Telegram’dır.</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Onaylanacak Ürün Sayısı</span>
                <span>{checkoutItems.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                <span>{t.totalSalePrice}</span>
                <span>
                  {formatPrice(
                    checkoutItems.reduce((sum, item) => sum + item.total_price, 0),
                    selectedCurrency
                  )}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={submitItems}
                disabled={!isCheckoutValid || loading}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.sending : "Alımı Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

{successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#121826] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <h2 className="text-2xl font-bold text-white">Siparişiniz Onaylandı</h2>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Siparişiniz başarıyla oluşturuldu. Aşağıdaki sipariş numarası veya numaraları ile bize ulaşabilirsiniz.
            </p>

            <div className="mt-5 space-y-3">
              {createdOrderNumbers.map((number) => (
                <div
                  key={number}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"
                >
                  <p className="text-sm text-emerald-200">Sipariş Numaranız</p>
                  <p className="mt-1 text-lg font-bold text-white">{number}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">
                Ödeme ve işlem adımı için bize yazın
              </p>

              <p className="mt-1 text-sm leading-6 text-white/60">
                Sipariş numaranız otomatik mesajın içine eklenecek. Seçtiğiniz para birimine göre en uygun ödeme iletişim kanalına yönlendirileceksiniz.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(selectedCurrency === "TL" || selectedCurrency === "USD") && (
                  <a
                    href={buildWhatsappLink(createdOrderNumbers)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-emerald-400"
                  >
                    WhatsApp’tan Ödeme Bilgisi Al
                  </a>
                )}

                {(selectedCurrency === "RUB" || selectedCurrency === "USD") && (
                  <a
                    href={buildTelegramLink(createdOrderNumbers)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-sky-500 px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-sky-400"
                  >
                    Telegram’dan Ödeme Bilgisi Al
                  </a>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}