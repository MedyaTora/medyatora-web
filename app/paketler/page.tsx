"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTACT, getWhatsappLink } from "@/lib/contact";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaChartLine,
  FaInstagram,
  FaShieldHalved,
  FaTelegram,
  FaUserCheck,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

type PlatformSlug = "instagram" | "tiktok" | "youtube" | "x" | "telegram";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta" | "";
type PaymentMethod = "turkey_bank" | "support" | "balance" | "";

type CategoryConfig = {
  slug: string;
  title: string;
  description: string;
};

type PackageTypeSlug = "ekonomik" | "global" | "turk" | "garantili" | "hizli";

type PackageTypeConfig = {
  slug: PackageTypeSlug;
  title: string;
  description: string;
  badge: string;
  colorClass: string;
};

type PlatformConfig = {
  slug: PlatformSlug;
  title: string;
  description: string;
  icon: IconType;
  gradient: string;
  glow: string;
  categories: CategoryConfig[];
};

type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  balance_tl: number;
  balance_usd: number;
  balance_rub: number;
};

type CreatedPaymentInfo = {
  orderNumbers: string[];
  fullName: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
};

const MIN_QUANTITY = 100;
const MAX_QUANTITY = 5_000_000;

const TELEGRAM_USERNAME = "medyatora";
const WHATSAPP_NUMBER = "905530739292";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC.LTD.ŞTİ";

const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

const contactTypes: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const quickQuantities = [
  100,
  500,
  1000,
  2500,
  5000,
  10000,
  25000,
  50000,
  100000,
  250000,
  500000,
  1000000,
  5000000,
];

const platforms: PlatformConfig[] = [
  {
    slug: "instagram",
    title: "Instagram",
    description: "Takipçi, beğeni, Reels izlenme, yorum ve kaydetme paketleri.",
    icon: FaInstagram,
    gradient: "from-pink-500/20 via-rose-500/10 to-orange-400/10",
    glow: "bg-pink-500/20",
    categories: [
      {
        slug: "takipci",
        title: "Takipçi",
        description: "Profilin daha güçlü ve güvenilir görünmesi için.",
      },
      {
        slug: "begeni",
        title: "Beğeni",
        description: "Gönderilerin daha aktif görünmesi için.",
      },
      {
        slug: "reels_izlenme",
        title: "Reels İzlenme",
        description: "Reels videolarının izlenme sayısını artırmak için.",
      },
      {
        slug: "yorum",
        title: "Yorum",
        description: "Gönderilerde daha canlı bir etkileşim görünümü için.",
      },
      {
        slug: "kaydetme",
        title: "Kaydetme",
        description: "İçeriklerin daha değerli görünmesine destek olur.",
      },
      {
        slug: "story_izlenme",
        title: "Story İzlenme",
        description: "Hikaye görüntülenmelerini artırmak için.",
      },
      {
        slug: "profil_ziyareti",
        title: "Profil Ziyareti",
        description: "Profil ziyaretlerini artırmak için.",
      },
    ],
  },
  {
    slug: "tiktok",
    title: "TikTok",
    description: "Takipçi, beğeni, izlenme, yorum ve paylaşım paketleri.",
    icon: FaTiktok,
    gradient: "from-cyan-400/20 via-pink-500/10 to-white/5",
    glow: "bg-cyan-400/20",
    categories: [
      {
        slug: "takipci",
        title: "Takipçi",
        description: "TikTok profilini daha güçlü göstermek için.",
      },
      {
        slug: "begeni",
        title: "Beğeni",
        description: "Videolardaki etkileşim görüntüsünü artırmak için.",
      },
      {
        slug: "izlenme",
        title: "İzlenme",
        description: "Videoların izlenme sayısını yükseltmek için.",
      },
      {
        slug: "yorum",
        title: "Yorum",
        description: "Videolarda daha aktif bir görünüm oluşturmak için.",
      },
      {
        slug: "paylasim",
        title: "Paylaşım",
        description: "İçeriklerin yayılımını güçlendirmek için.",
      },
      {
        slug: "kaydetme",
        title: "Kaydetme",
        description: "İçeriklerin daha değerli görünmesi için.",
      },
      {
        slug: "favori",
        title: "Favori",
        description: "Videoların favori / kayıt görünümünü güçlendirmek için.",
      },
    ],
  },
  {
    slug: "youtube",
    title: "YouTube",
    description: "Abone, izlenme, beğeni, yorum ve Shorts paketleri.",
    icon: FaYoutube,
    gradient: "from-red-500/20 via-rose-500/10 to-white/5",
    glow: "bg-red-500/20",
    categories: [
      {
        slug: "abone",
        title: "Abone",
        description: "Kanalın daha güvenilir görünmesi için.",
      },
      {
        slug: "izlenme",
        title: "İzlenme",
        description: "Videoların izlenme sayısını artırmak için.",
      },
      {
        slug: "shorts_izlenme",
        title: "Shorts İzlenme",
        description: "Shorts içerikleri için izlenme desteği.",
      },
      {
        slug: "begeni",
        title: "Beğeni",
        description: "Videolardaki olumlu etkileşim görünümü için.",
      },
      {
        slug: "yorum",
        title: "Yorum",
        description: "Video altında daha aktif bir topluluk görünümü için.",
      },
      {
        slug: "canli_yayin",
        title: "Canlı Yayın",
        description: "Canlı yayın görünürlüğünü desteklemek için.",
      },
    ],
  },
  {
    slug: "x",
    title: "X / Twitter",
    description: "Takipçi, beğeni, görüntülenme, retweet ve yorum paketleri.",
    icon: FaXTwitter,
    gradient: "from-white/15 via-sky-400/10 to-white/5",
    glow: "bg-white/15",
    categories: [
      {
        slug: "takipci",
        title: "Takipçi",
        description: "Profilin daha güçlü görünmesi için.",
      },
      {
        slug: "begeni",
        title: "Beğeni",
        description: "Paylaşımlarındaki etkileşimi artırmak için.",
      },
      {
        slug: "izlenme",
        title: "Görüntülenme",
        description: "Tweet görüntülenmelerini artırmak için.",
      },
      {
        slug: "retweet",
        title: "Retweet",
        description: "Paylaşımların daha yaygın görünmesi için.",
      },
      {
        slug: "yorum",
        title: "Yorum",
        description: "Paylaşımlarda daha aktif görünüm için.",
      },
      {
        slug: "bookmark",
        title: "Yer İmi / Kaydetme",
        description: "Paylaşımların daha değerli görünmesini destekler.",
      },
    ],
  },
  {
    slug: "telegram",
    title: "Telegram",
    description: "Üye, gönderi izlenme, reaksiyon ve paylaşım paketleri.",
    icon: FaTelegram,
    gradient: "from-sky-400/20 via-cyan-400/10 to-white/5",
    glow: "bg-sky-400/20",
    categories: [
      {
        slug: "uye",
        title: "Üye",
        description: "Kanal veya grup üye sayısını artırmak için.",
      },
      {
        slug: "izlenme",
        title: "Gönderi İzlenme",
        description: "Telegram gönderilerinin görüntülenmesini artırmak için.",
      },
      {
        slug: "reaksiyon",
        title: "Reaksiyon",
        description: "Gönderilere emoji reaksiyonu eklemek için.",
      },
      {
        slug: "paylasim",
        title: "Paylaşım",
        description: "Gönderi yayılımını desteklemek için.",
      },
      {
        slug: "oylama",
        title: "Oylama",
        description: "Anket ve oylama görünümünü desteklemek için.",
      },
    ],
  },
];

const packageTypes: PackageTypeConfig[] = [
  {
    slug: "ekonomik",
    title: "Ekonomik",
    description: "Uygun fiyatlı, hızlı başlangıç yapmak isteyenler için.",
    badge: "Uygun Fiyat",
    colorClass:
      "border-lime-400/40 bg-lime-400/10 text-lime-200 shadow-[0_18px_60px_rgba(163,230,53,0.08)]",
  },
  {
    slug: "global",
    title: "Global",
    description: "Yabancı / global kitle ağırlıklı dengeli paket.",
    badge: "Global",
    colorClass:
      "border-sky-400/40 bg-sky-400/10 text-sky-200 shadow-[0_18px_60px_rgba(56,189,248,0.08)]",
  },
  {
    slug: "turk",
    title: "Türk Kitle",
    description: "Türkiye odaklı daha kaliteli görünüm isteyenler için.",
    badge: "TR",
    colorClass:
      "border-red-400/40 bg-red-400/10 text-red-200 shadow-[0_18px_60px_rgba(248,113,113,0.08)]",
  },
  {
    slug: "garantili",
    title: "Garantili / Düşmeyen",
    description: "Düşüş riskine karşı daha güvenli paket seçeneği.",
    badge: "Garantili",
    colorClass:
      "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-[0_18px_60px_rgba(52,211,153,0.08)]",
  },
  {
    slug: "hizli",
    title: "Hızlı Teslimat",
    description: "Daha hızlı başlangıç isteyen kullanıcılar için.",
    badge: "Hızlı",
    colorClass:
      "border-amber-400/40 bg-amber-400/10 text-amber-200 shadow-[0_18px_60px_rgba(251,191,36,0.08)]",
  },
];

const PACKAGE_PRICE_MATRIX: Record<
  PlatformSlug,
  Record<string, Record<PackageTypeSlug, number>>
> = {
  instagram: {
    takipci: { ekonomik: 119, global: 149, turk: 249, garantili: 249, hizli: 299 },
    begeni: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    reels_izlenme: { ekonomik: 29, global: 39, turk: 59, garantili: 59, hizli: 79 },
    reels_begeni: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    reels_yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    kaydetme: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
    story_izlenme: { ekonomik: 39, global: 49, turk: 79, garantili: 79, hizli: 99 },
    profil_ziyareti: { ekonomik: 49, global: 69, turk: 99, garantili: 99, hizli: 129 },
  },

  tiktok: {
    takipci: { ekonomik: 109, global: 139, turk: 229, garantili: 229, hizli: 279 },
    begeni: { ekonomik: 49, global: 69, turk: 109, garantili: 109, hizli: 139 },
    izlenme: { ekonomik: 19, global: 29, turk: 49, garantili: 49, hizli: 69 },
    yorum: { ekonomik: 179, global: 229, turk: 379, garantili: 379, hizli: 429 },
    kaydetme: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    paylasim: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    favori: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
  },

  youtube: {
    abone: { ekonomik: 299, global: 399, turk: 599, garantili: 599, hizli: 699 },
    izlenme: { ekonomik: 69, global: 89, turk: 149, garantili: 149, hizli: 179 },
    shorts_izlenme: { ekonomik: 39, global: 59, turk: 89, garantili: 89, hizli: 119 },
    begeni: { ekonomik: 89, global: 119, turk: 179, garantili: 179, hizli: 219 },
    yorum: { ekonomik: 249, global: 329, turk: 499, garantili: 499, hizli: 599 },
    canli_yayin: { ekonomik: 99, global: 129, turk: 199, garantili: 199, hizli: 249 },
  },

  x: {
    takipci: { ekonomik: 149, global: 199, turk: 299, garantili: 299, hizli: 349 },
    begeni: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
    izlenme: { ekonomik: 29, global: 39, turk: 69, garantili: 69, hizli: 89 },
    retweet: { ekonomik: 89, global: 119, turk: 179, garantili: 179, hizli: 219 },
    yorum: { ekonomik: 199, global: 249, turk: 399, garantili: 399, hizli: 449 },
    bookmark: { ekonomik: 69, global: 89, turk: 139, garantili: 139, hizli: 169 },
  },

  telegram: {
    uye: { ekonomik: 129, global: 169, turk: 249, garantili: 249, hizli: 299 },
    izlenme: { ekonomik: 19, global: 29, turk: 49, garantili: 49, hizli: 69 },
    reaksiyon: { ekonomik: 49, global: 69, turk: 99, garantili: 99, hizli: 129 },
    paylasim: { ekonomik: 59, global: 79, turk: 119, garantili: 119, hizli: 149 },
    oylama: { ekonomik: 79, global: 99, turk: 149, garantili: 149, hizli: 179 },
  },
};

function getPackagePricePer1000(
  platform: PlatformSlug,
  category: string,
  packageType: PackageTypeSlug
) {
  const platformPrices = PACKAGE_PRICE_MATRIX[platform];
  const categoryPrices = platformPrices?.[category];

  if (categoryPrices?.[packageType]) {
    return categoryPrices[packageType];
  }

  const firstCategoryKey = Object.keys(platformPrices || {})[0];
  const fallbackPrice = platformPrices?.[firstCategoryKey]?.[packageType];

  return fallbackPrice || 149;
}

const highlights: {
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    title: "Hızlı Paket Seçimi",
    description: "Platform, kategori ve paket türünü seçerek hızlıca ilerle.",
    icon: FaBoxesStacked,
  },
  {
    title: "Günlük Yüksek Limit",
    description:
      "Minimum 100, günlük maksimum 5.000.000 adede kadar işlem alınabilir.",
    icon: FaChartLine,
  },
  {
    title: "Sipariş Takibi",
    description: "Siparişini hesabından ve sipariş numarasıyla takip edebilirsin.",
    icon: FaUserCheck,
  },
  {
    title: "Güvenli Bilgilendirme",
    description: "Ödeme, iade ve işlem detayları sipariş öncesi açıkça gösterilir.",
    icon: FaShieldHalved,
  },
];

function formatNumber(value: number) {
  return value.toLocaleString("tr-TR");
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.min(Math.max(value, MIN_QUANTITY), MAX_QUANTITY);
}

function getPaymentMethodLabel(method: PaymentMethod) {
  if (method === "turkey_bank") return "Türkiye Banka Havalesi / EFT";
  if (method === "balance") return "MedyaTora Bakiyesi";
  if (method === "support") return "Destek ile ödeme";
  return "-";
}

function getOrderSupportMessage(paymentInfo: CreatedPaymentInfo) {
  const orderText = paymentInfo.orderNumbers.join("\n");

  return `Merhaba, ödeme onayı bekliyorum.

Gönderen Ad Soyad: ${paymentInfo.fullName}
Ödeme Tutarı: ${formatMoney(paymentInfo.totalAmount)}
Sipariş Numarası:
${orderText}
Ödeme Yöntemi: ${getPaymentMethodLabel(paymentInfo.paymentMethod)}

Dekontu ekte iletiyorum.`;
}

function buildTelegramLink(paymentInfo?: CreatedPaymentInfo | null) {
  const message = paymentInfo ? getOrderSupportMessage(paymentInfo) : "";

  return `https://t.me/${TELEGRAM_USERNAME}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
}

function buildWhatsappPaymentLink(paymentInfo: CreatedPaymentInfo) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    getOrderSupportMessage(paymentInfo)
  )}`;
}

export default function PaketlerPage() {
  const [selectedPlatformSlug, setSelectedPlatformSlug] =
    useState<PlatformSlug>("instagram");

  const selectedPlatform = useMemo(
    () =>
      platforms.find((platform) => platform.slug === selectedPlatformSlug) ||
      platforms[0],
    [selectedPlatformSlug]
  );

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    selectedPlatform.categories[0].slug
  );

  const [selectedPackageTypeSlug, setSelectedPackageTypeSlug] =
    useState<PackageTypeConfig["slug"]>("global");

  const [quantity, setQuantity] = useState(1000);
  const [targetUsername, setTargetUsername] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactType, setContactType] = useState<ContactType>("");
  const [contactValue, setContactValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdPaymentInfo, setCreatedPaymentInfo] =
    useState<CreatedPaymentInfo | null>(null);

  const selectedCategory = useMemo(() => {
    return (
      selectedPlatform.categories.find(
        (category) => category.slug === selectedCategorySlug
      ) || selectedPlatform.categories[0]
    );
  }, [selectedPlatform, selectedCategorySlug]);

  const selectedPackageType = useMemo(() => {
    return (
      packageTypes.find((type) => type.slug === selectedPackageTypeSlug) ||
      packageTypes[0]
    );
  }, [selectedPackageTypeSlug]);

  const selectedPricePer1000 = useMemo(() => {
    return getPackagePricePer1000(
      selectedPlatform.slug,
      selectedCategory.slug,
      selectedPackageType.slug
    );
  }, [selectedPlatform.slug, selectedCategory.slug, selectedPackageType.slug]);

  function getTypePricePer1000(typeSlug: PackageTypeSlug) {
    return getPackagePricePer1000(
      selectedPlatform.slug,
      selectedCategory.slug,
      typeSlug
    );
  }

  const estimatedPrice = useMemo(() => {
    return (quantity / 1000) * selectedPricePer1000;
  }, [quantity, selectedPricePer1000]);

  const canOpenCheckout =
    Boolean(targetUsername.trim()) && quantity >= MIN_QUANTITY;

  const isCheckoutValid =
    !!fullName.trim() &&
    !!phoneNumber.trim() &&
    !!contactType &&
    !!contactValue.trim() &&
    !!paymentMethod &&
    paymentTermsAccepted;

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (data.ok && data.user) {
          setAuthUser({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            balance_tl: Number(data.user.balance_tl || 0),
            balance_usd: Number(data.user.balance_usd || 0),
            balance_rub: Number(data.user.balance_rub || 0),
          });
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      }
    }

    loadAuthUser();
  }, []);

  function handlePlatformSelect(slug: PlatformSlug) {
    const nextPlatform =
      platforms.find((platform) => platform.slug === slug) || platforms[0];

    setSelectedPlatformSlug(slug);
    setSelectedCategorySlug(nextPlatform.categories[0].slug);
    setError("");
    setSuccessMessage("");
  }

  function handleQuantityInput(value: string) {
    const onlyDigits = value.replace(/\D/g, "");
    const numericValue = Number(onlyDigits || MIN_QUANTITY);
    setQuantity(clampQuantity(numericValue));
  }

  function resetCheckoutForm() {
    setFullName("");
    setPhoneNumber("");
    setContactType("");
    setContactValue("");
    setPaymentMethod("");
    setPaymentTermsAccepted(false);
  }

  function closeCheckoutModal() {
    setCheckoutOpen(false);
    resetCheckoutForm();
  }

  async function submitPackageOrder() {
    if (!isCheckoutValid) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/package-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          platform: selectedPlatform.slug,
          category: selectedCategory.slug,
          package_type: selectedPackageType.slug,
          quantity,
          target_username: targetUsername.trim(),
          target_link: targetLink.trim(),
          order_note: orderNote.trim(),
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          contact_type: contactType,
          contact_value: contactValue.trim(),
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Paket siparişi oluşturulamadı.");
      }

      const orderNumbers = Array.isArray(data.orderNumbers)
        ? data.orderNumbers
        : data.orderNumber
          ? [data.orderNumber]
          : [];

      setCreatedPaymentInfo({
        orderNumbers,
        fullName: fullName.trim(),
        totalAmount: Number(data.totalPrice || estimatedPrice),
        paymentMethod,
      });

      setSuccessMessage(data.message || "Paket siparişiniz alındı.");
      setCheckoutOpen(false);
      setSuccessOpen(true);
      resetCheckoutForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mt-premium-page text-white">
      <div className="mt-premium-inner">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_28%,transparent_72%,rgba(255,255,255,0.02))]" />
  
          <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-16">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <a
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              ← MedyaTora Ana Sayfa
            </a>

            <div className="flex flex-wrap gap-3">
              <a
                href="/smmtora"
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
              >
                Geniş Servis Listesi
              </a>

              <a
                href={getWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                WhatsApp Destek
              </a>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Hızlı sosyal medya paketleri
              </div>

              <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Platformunu seç, paketini oluştur, hızlıca satın al.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Instagram, TikTok, YouTube, X ve Telegram için takipçi, beğeni,
                izlenme ve etkileşim paketlerini hızlıca seç. Minimum 100,
                günlük maksimum 5.000.000 adede kadar işlem alınabilir.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#package-builder"
                  className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  Paket Oluştur
                </a>

                <a
                  href="/smmtora"
                  className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Tekli Servislere Git
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/45">
                Seçili paket özeti
              </p>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                  {selectedPackageType.badge}
                </div>

                <h3 className="mb-3 text-2xl font-bold">
                  {selectedPlatform.title} {selectedCategory.title}
                </h3>

                <p className="mb-5 text-sm leading-6 text-white/65">
                  {selectedPackageType.title} paketi ·{" "}
                  {formatNumber(quantity)} adet
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs text-white/40">Minimum</p>
                    <p className="mt-1 font-black text-white">
                      {formatNumber(MIN_QUANTITY)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs text-white/40">Günlük Maksimum</p>
                    <p className="mt-1 font-black text-white">
                      {formatNumber(MAX_QUANTITY)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs text-white/40">Birim</p>
                    <p className="mt-1 font-black text-white">
                      {formatMoney(selectedPricePer1000)} / 1000
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <p className="text-xs text-emerald-100/70">Tahmini Tutar</p>
                    <p className="mt-1 font-black text-emerald-200">
                      {formatMoney(estimatedPrice)}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-white/45">
                  KDV + vergiler dahildir. Paketler, hızlı sipariş vermek
                  isteyen kullanıcılar için hazırlanmıştır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="package-builder"
        className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-14"
      >
        <div className="mb-7">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Paket oluştur
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            Önce platformunu seç
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-white/65">
            Paket yapısı sade tutuldu. Platformu, kategoriyi ve paket türünü seç;
            hedef kullanıcı adını yaz ve ödeme ekranına geç.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const active = selectedPlatform.slug === platform.slug;

            return (
              <button
                key={platform.slug}
                type="button"
                onClick={() => handlePlatformSelect(platform.slug)}
                className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
                  active
                    ? "border-emerald-400/70 from-emerald-400/20 to-white/[0.04]"
                    : `border-white/10 ${platform.gradient} hover:border-white/20`
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${platform.glow} blur-3xl transition group-hover:scale-125`}
                />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/30 text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-2 text-xl font-bold">{platform.title}</h3>

                  <p className="min-h-[72px] text-sm leading-6 text-white/65">
                    {platform.description}
                  </p>

                  {active ? (
                    <span className="mt-4 inline-flex rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-black">
                      Seçili
                    </span>
                  ) : (
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Seç
                      <FaArrowRight className="transition group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              Kategori seçimi
            </p>

            <h3 className="mb-4 text-2xl font-bold">
              {selectedPlatform.title} için ne almak istiyorsun?
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {selectedPlatform.categories.map((category) => {
                const active = selectedCategory.slug === category.slug;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setSelectedCategorySlug(category.slug)}
                    className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      active
                        ? "border-emerald-400/70 bg-emerald-400/10"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="font-black text-white">{category.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              Miktar seçimi
            </p>

            <h3 className="mb-4 text-2xl font-bold">
              Almak istediğin miktarı seç
            </h3>

            <input
              value={String(quantity)}
              onChange={(event) => handleQuantityInput(event.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-lg font-black text-white outline-none transition focus:border-emerald-400"
            />

            <p className="mt-2 text-xs leading-5 text-white/45">
              Minimum {formatNumber(MIN_QUANTITY)} · Günlük maksimum{" "}
              {formatNumber(MAX_QUANTITY)}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {quickQuantities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuantity(item)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                    quantity === item
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : "border-white/10 bg-black/20 text-white/75 hover:bg-white/[0.06]"
                  }`}
                >
                  {formatNumber(item)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Paket türü
          </p>

          <h3 className="mb-4 text-2xl font-bold">
            Nasıl bir paket istiyorsun?
          </h3>

          <div className="grid gap-3 md:grid-cols-5">
            {packageTypes.map((type) => {
              const active = selectedPackageType.slug === type.slug;

              return (
                <button
                  key={type.slug}
                  type="button"
                  onClick={() => setSelectedPackageTypeSlug(type.slug)}
                  className={`relative overflow-hidden rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                    active
                      ? type.colorClass
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative">
                    <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white/55">
                      {type.badge}
                    </span>

                    <p className="font-black text-white">{type.title}</p>

                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {type.description}
                    </p>

                    <p
                      className={`mt-3 text-sm font-black ${
                        active ? "text-white" : "text-emerald-300"
                      }`}
                    >
                      {formatMoney(getTypePricePer1000(type.slug))} / 1000
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            Hedef bilgileri
          </p>

          <h3 className="mb-4 text-2xl font-bold">
            Siparişin uygulanacağı hesabı yaz
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={targetUsername}
              onChange={(event) => setTargetUsername(event.target.value)}
              placeholder="Hedef kullanıcı adı / kanal adı"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
            />

            <input
              value={targetLink}
              onChange={(event) => setTargetLink(event.target.value)}
              placeholder="Hedef link"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
            />
          </div>

          <textarea
            value={orderNote}
            onChange={(event) => setOrderNote(event.target.value)}
            placeholder="Sipariş notu"
            className="mt-3 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          />
        </div>

        <div className="mt-5 rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">
                Sipariş özeti
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                {selectedPlatform.title} {selectedCategory.title} ·{" "}
                {selectedPackageType.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Miktar:{" "}
                <span className="font-black text-white">
                  {formatNumber(quantity)}
                </span>{" "}
                · Tahmini tutar:{" "}
                <span className="font-black text-emerald-200">
                  {formatMoney(estimatedPrice)}
                </span>
              </p>

              <p className="mt-2 text-xs leading-5 text-white/45">
                KDV + vergiler dahildir. Ödeme sonrası sipariş kontrol edilerek
                işleme alınır.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!canOpenCheckout}
                onClick={() => {
                  setError("");
                  setPaymentTermsAccepted(false);
                  setCheckoutOpen(true);
                }}
                className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Paketi Satın Al
              </button>

              <a
                href={getWhatsappLink(
                  `Merhaba, ${selectedPlatform.title} ${selectedCategory.title} paketi hakkında bilgi almak istiyorum. Paket türü: ${selectedPackageType.title}, miktar: ${formatNumber(
                    quantity
                  )}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
              >
                <FaWhatsapp />
                Destek Al
              </a>
            </div>
          </div>

          {!canOpenCheckout && (
            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Devam etmek için hedef kullanıcı adını yazmalısın.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg text-emerald-300">
                <item.icon />
              </div>

              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-white/65">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              Geniş servis listesi
            </p>

            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Daha fazla medya ve servis için SMMTora’ya geç
            </h2>

            <p className="leading-7 text-white/70">
              Burada hızlı paket akışı yer alır. Tüm servisleri, detaylı filtreleri
              ve geniş platform listesini görmek için SMMTora alanını kullanabilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/smmtora"
              className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
            >
              SMMTora’ya Git
            </a>

            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Telegram Destek
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">© MedyaTora Paketler</div>
            <div>Platforma göre hızlı sosyal medya paketleri</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/" className="transition hover:text-white">
              MedyaTora
            </a>

            <a href="/smmtora" className="transition hover:text-white">
              SMMTora
            </a>

            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121826]/95 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-black text-white">Paket Ödeme</p>
                <p className="mt-1 text-xs text-white/45">
                  {selectedPlatform.title} {selectedCategory.title} ·{" "}
                  {formatMoney(estimatedPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckoutModal}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Ödeme yapacak kişinin adı soyadı"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400"
                  />

                  <p className="mt-2 text-xs leading-5 text-amber-100/80">
                    Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                  </p>
                </div>

                <input
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value.replace(/[^\d+]/g, ""))
                  }
                  placeholder="Telefon numarası"
                  inputMode="tel"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400"
                />

                <select
                  value={contactType}
                  onChange={(event) =>
                    setContactType(event.target.value as ContactType)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                >
                  <option value="" className="bg-[#121826]">
                    İletişim türü seç
                  </option>
                  {contactTypes.map((item) => (
                    <option key={item} value={item} className="bg-[#121826]">
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  placeholder="İletişim bilgisi"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <p className="text-sm font-bold text-white">Ödeme yöntemi</p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  Paketler şu an TL üzerinden satılır. Bakiye ödemesi yalnızca
                  TL bakiyeden düşer.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("turkey_bank")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "turkey_bank"
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      Havale / EFT
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Dekont sonrası ödeme kontrol edilir.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("balance")}
                    disabled={!authUser}
                    className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      paymentMethod === "balance"
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">TL Bakiyesi</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      {authUser
                        ? `Mevcut TL bakiye: ${formatMoney(authUser.balance_tl)}`
                        : "Bakiye ile ödeme için giriş yapmalısın."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("support")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "support"
                        ? "border-sky-400 bg-sky-400/10"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-bold text-white">
                      Destek ile ödeme
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Alternatif ödeme için destek ekibiyle ilerle.
                    </p>
                  </button>
                </div>

                {paymentMethod === "turkey_bank" && (
                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
                    <p className="font-bold text-white">Banka bilgileri</p>
                    <p className="mt-2">
                      <span className="font-bold text-white">Alıcı:</span>{" "}
                      {TURKEY_BANK_ACCOUNT_NAME}
                    </p>
                    <p>
                      <span className="font-bold text-white">IBAN:</span>{" "}
                      {TURKEY_BANK_IBAN}
                    </p>
                    <p>
                      <span className="font-bold text-white">Açıklama:</span>{" "}
                      Sipariş numaranız
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                <p className="font-bold text-white">Ödeme Güvenliği</p>

                <p className="mt-2 text-white/75">
                  Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı
                  soyadı ile aynı olmalıdır. Eşleşmeyen ödemeler onaylanmaz.
                </p>

                <p className="mt-4 font-bold text-white">
                  İade ve Sözleşme Onayı
                </p>

                <p className="mt-2 text-white/75">
                  İşlem başlamadan önce iade talep edebilirsiniz. İşlem
                  başladıktan sonra iptal/iade yapılamaz. Bizden kaynaklı eksik
                  işlem olursa eksik kalan kısım için iade yapılabilir.
                </p>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <input
                    type="checkbox"
                    checked={paymentTermsAccepted}
                    onChange={(event) =>
                      setPaymentTermsAccepted(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 shrink-0 accent-emerald-400"
                  />

                  <span className="text-sm leading-6 text-white/80">
                    <a
                      href="/kullanim-sartlari"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                    >
                      Kullanım şartlarını
                    </a>
                    ,{" "}
                    <a
                      href="/gizlilik-politikasi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                    >
                      gizlilik politikasını
                    </a>
                    ,{" "}
                    <a
                      href="/iade-politikasi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                    >
                      iade koşullarını
                    </a>{" "}
                    ve{" "}
                    <a
                      href="/mesafeli-satis-sozlesmesi"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                    >
                      mesafeli satış sözleşmesini
                    </a>{" "}
                    okudum, kabul ediyorum.
                  </span>
                </label>

                {!paymentTermsAccepted && (
                  <p className="mt-3 text-xs leading-5 text-amber-100/80">
                    Siparişi oluşturmak için sözleşme ve politika onayını
                    işaretlemelisin.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Paket</span>
                  <span>
                    {selectedPlatform.title} {selectedCategory.title}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-white/60">
                  <span>Paket türü</span>
                  <span>{selectedPackageType.title}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm text-white/60">
                  <span>Miktar</span>
                  <span>{formatNumber(quantity)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-base font-black text-white">
                  <span>Toplam</span>
                  <span>{formatMoney(estimatedPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#121826]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={submitPackageOrder}
                disabled={!isCheckoutValid || loading}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sipariş oluşturuluyor..." : "Siparişi Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121826]/95 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-white/80">Paket Siparişi</p>

              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <h2 className="text-2xl font-bold text-white">
                Siparişiniz alındı
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {successMessage ||
                  "Paket siparişiniz oluşturuldu. Ödeme durumuna göre işleme alınacaktır."}
              </p>

              <div className="mt-5 space-y-3">
                {createdPaymentInfo?.orderNumbers.map((number) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"
                  >
                    <p className="text-sm text-emerald-200">Sipariş numarası</p>
                    <p className="mt-1 text-lg font-bold text-white">{number}</p>
                  </div>
                ))}
              </div>

              {createdPaymentInfo?.paymentMethod === "balance" ? (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm font-bold text-white">
                    Bakiye ile ödeme tamamlandı
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Paket tutarı olan{" "}
                    <span className="font-bold text-white">
                      {formatMoney(createdPaymentInfo.totalAmount)}
                    </span>{" "}
                    TL bakiyenden düşüldü.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href="/hesabim"
                      className="rounded-2xl bg-emerald-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-emerald-300"
                    >
                      Hesabıma Git
                    </a>

                    <a
                      href="/hesabim/siparisler"
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      Siparişlerimi Gör
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-sm font-bold text-white">
                    Ödeme bildirimi gönder
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Ödeme yaptıktan sonra dekontu WhatsApp veya Telegram
                    üzerinden gönder.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={buildTelegramLink(createdPaymentInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-sky-500 px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-sky-400"
                    >
                      Telegram’a Git
                    </a>

                    <a
                      href={
                        createdPaymentInfo
                          ? buildWhatsappPaymentLink(createdPaymentInfo)
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 text-center text-sm font-black text-black transition hover:from-emerald-300 hover:to-emerald-400"
                    >
                      WhatsApp’a Gönder
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#121826]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
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