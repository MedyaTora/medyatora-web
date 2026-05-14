"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import type { OrderServiceItem } from "@/lib/services";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getAllPlatforms } from "@/lib/platforms";
import ServiceTermsModal from "../components/service-terms-modal";
import UserMenu from "../components/auth/UserMenu";
import { trackVisitorAction } from "../components/visitor-tracker";

import * as SiIcons from "react-icons/si";

import {
  FaArrowDown,
  FaArrowUp,
  FaBoxesStacked,
  FaCartShopping,
  FaFileInvoice,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaSliders,
  FaUserCheck,
  FaWhatsapp,
} from "react-icons/fa6";

type CurrencyCode = "TL" | "USD" | "RUB";
type CheckoutMode = "single" | "cart" | null;
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta" | "";
type PaymentMethod = "turkey_bank" | "support" | "balance" | "";
type QualityFilter = "all" | "Core" | "Plus" | "Prime";
type GuaranteeFilter = "all" | "guaranteed" | "no-guarantee";
type RegionFilter = "all" | "TR" | "RU" | "Global";
type PriceSort = "smart" | "price-asc" | "price-desc";

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

type CreatedPaymentInfo = {
  fullName: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  currency: CurrencyCode;
  totalAmount: number;
  orderNumbers: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  takipci: "Takipçi",
  begeni: "Beğeni",
  yorum: "Yorum",
  izlenme: "İzlenme",
  kaydetme: "Kaydetme",
  paylasim: "Paylaşım",
  repost: "Repost",
  retweet: "Retweet",
  abone: "Abone",
  uye: "Üye",
  reaksiyon: "Reaksiyon",
  story: "Story",
  story_izlenme: "Story İzlenme",
  reels: "Reels",
  reels_izlenme: "Reels İzlenme",
  reels_begeni: "Reels Beğeni",
  reels_yorum: "Reels Yorum",
  shorts: "Shorts",
  shorts_izlenme: "Shorts İzlenme",
  shorts_begeni: "Shorts Beğeni",
  canli_yayin: "Canlı Yayın",
  profil_ziyareti: "Profil Ziyareti",
  sayfa_begenisi: "Sayfa Beğenisi",
  grup_uyesi: "Grup Üyesi",
  oylama: "Oylama",
  dinlenme: "Dinlenme",
  other: "Diğer",
};

const CATEGORY_SORT_ORDER: Record<string, number> = {
  takipci: 1,
  abone: 2,
  uye: 3,
  begeni: 4,
  yorum: 5,
  izlenme: 6,
  reels_izlenme: 7,
  reels_begeni: 8,
  reels_yorum: 9,
  shorts_izlenme: 10,
  shorts_begeni: 11,
  story_izlenme: 12,
  kaydetme: 13,
  paylasim: 14,
  repost: 15,
  retweet: 16,
  reaksiyon: 17,
  canli_yayin: 18,
  profil_ziyareti: 19,
  sayfa_begenisi: 20,
  grup_uyesi: 21,
  oylama: 22,
  dinlenme: 23,
  story: 24,
  reels: 25,
  shorts: 26,
  other: 999,
};

const currencyOptions: CurrencyCode[] = ["TL", "USD", "RUB"];
const localeOptions: Locale[] = ["tr", "en", "ru"];
const contactTypes: ContactType[] = [
  "Telegram",
  "WhatsApp",
  "Instagram",
  "E-posta",
];

const TELEGRAM_USERNAME = "medyatora";
const WHATSAPP_NUMBER = "905530739292";

const TURKEY_BANK_ACCOUNT_NAME =
  "BİLÇAĞ İLETİŞİM TELEKOMİNASYON BİLGİSAYAR DAY. TÜK. MAİL. GIDA SAN. VE TİC.LTD.ŞTİ";

const TURKEY_BANK_IBAN = "TR48 0001 0001 3349 7700 5150 01";

const MAX_VISIBLE_UNIT_PRICE_TL = 10000;

function toSafeNumber(value: unknown) {
  if (typeof value === "number") return value;

  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getServiceTlUnitPrice(service: OrderServiceItem) {
  const serviceRecord = service as unknown as Record<string, unknown>;

  return (
    toSafeNumber(service.salePriceTl) ||
    toSafeNumber(serviceRecord.sale_price_tl) ||
    toSafeNumber(serviceRecord.tl_sale_price) ||
    toSafeNumber(serviceRecord.pricePer1000) ||
    toSafeNumber(serviceRecord.price_per_1000) ||
    toSafeNumber(serviceRecord.salePrice)
  );
}

function isVisibleCustomerService(service: OrderServiceItem) {
  const tlPrice = getServiceTlUnitPrice(service);
  const min = toSafeNumber(service.min);
  const max = toSafeNumber(service.max);

  if (min > 0 && max > 0 && min > max) return false;
  if (tlPrice > MAX_VISIBLE_UNIT_PRICE_TL) return false;

  return true;
}

function PlatformIcon({
  slug,
  title,
}: {
  slug: string;
  title?: string | null;
}) {
  const className = "h-7 w-7";

  const iconMap: Record<string, string> = {
    instagram: "SiInstagram",
    tiktok: "SiTiktok",
    youtube: "SiYoutube",
    telegram: "SiTelegram",
    spotify: "SiSpotify",
    facebook: "SiFacebook",
    x: "SiX",
    twitch: "SiTwitch",
    kick: "SiKick",
    discord: "SiDiscord",
    snapchat: "SiSnapchat",
    pinterest: "SiPinterest",
    linkedin: "SiLinkedin",
    reddit: "SiReddit",
    threads: "SiThreads",
    "apple-music": "SiApplemusic",
    soundcloud: "SiSoundcloud",
    audiomack: "SiAudiomack",
    deezer: "SiDeezer",
    shazam: "SiShazam",
    boomplay: "SiBoomplay",
    steam: "SiSteam",
    xbox: "SiXbox",
    vk: "SiVk",
    rutube: "SiRutube",
    "ok-ru": "SiOdnoklassniki",
    dzen: "SiDzen",
    github: "SiGithub",
    tumblr: "SiTumblr",
    bluesky: "SiBluesky",
    vimeo: "SiVimeo",
    "google-review": "SiGoogle",
    "google-maps": "SiGooglemaps",
    whatsapp: "SiWhatsapp",
  };

  const iconName = iconMap[slug];
  const Icon = iconName
    ? (SiIcons as unknown as Record<string, IconType | undefined>)[iconName]
    : undefined;

  if (Icon) {
    return <Icon className={className} />;
  }

  const safeTitle = String(title || slug || "MT").trim();
  const initials = safeTitle.slice(0, 2).toUpperCase();

  return (
    <span className="text-sm font-black uppercase tracking-tight text-white">
      {initials || "MT"}
    </span>
  );
}

function getCategoryName(slug: string) {
  return CATEGORY_LABELS[slug] || slug.replace(/_/g, " ");
}

function getPaymentMethodSupportLabel(method: PaymentMethod, locale: Locale) {
  if (method === "turkey_bank") {
    if (locale === "en") return "Bank transfer / EFT";
    if (locale === "ru") return "Банковский перевод";
    return "Havale / EFT";
  }

  if (method === "balance") {
    if (locale === "en") return "MedyaTora Balance";
    if (locale === "ru") return "Баланс MedyaTora";
    return "MedyaTora Bakiyesi";
  }

  if (locale === "en") return "Support payment";
  if (locale === "ru") return "Оплата через поддержку";
  return "Destek ile ödeme";
}

function getOrderSupportMessage({
  orderNumbers,
  locale,
  fullName,
  amount,
  currency,
  paymentMethod,
}: {
  orderNumbers: string[];
  locale: Locale;
  fullName: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
}) {
  const orderText = orderNumbers.join("\n");
  const amountText = formatPrice(amount, currency);
  const paymentMethodText = getPaymentMethodSupportLabel(paymentMethod, locale);

  if (locale === "en") {
    return `Hello, I am waiting for payment confirmation.

Sender Full Name: ${fullName}
Payment Amount: ${amountText}
Order Number(s):
${orderText}
Payment Method: ${paymentMethodText}

I am sending the receipt as an attachment.`;
  }

  if (locale === "ru") {
    return `Здравствуйте, ожидаю подтверждения оплаты.

Имя отправителя: ${fullName}
Сумма оплаты: ${amountText}
Номер заказа:
${orderText}
Способ оплаты: ${paymentMethodText}

Отправляю чек во вложении.`;
  }

  return `Merhaba, ödeme onayı bekliyorum.

Gönderen Ad Soyad: ${fullName}
Ödeme Tutarı: ${amountText}
Sipariş Numarası:
${orderText}
Ödeme Yöntemi: ${paymentMethodText}

Dekontu ekte iletiyorum.`;
}

function buildTelegramLink(paymentInfo: CreatedPaymentInfo, locale: Locale) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(
    getOrderSupportMessage({
      orderNumbers: paymentInfo.orderNumbers,
      locale,
      fullName: paymentInfo.fullName,
      amount: paymentInfo.totalAmount,
      currency: paymentInfo.currency,
      paymentMethod: paymentInfo.paymentMethod,
    })
  )}`;
}

function buildWhatsappLink(paymentInfo: CreatedPaymentInfo, locale: Locale) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    getOrderSupportMessage({
      orderNumbers: paymentInfo.orderNumbers,
      locale,
      fullName: paymentInfo.fullName,
      amount: paymentInfo.totalAmount,
      currency: paymentInfo.currency,
      paymentMethod: paymentInfo.paymentMethod,
    })
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

function getUnitSalePrice(
  service: OrderServiceItem | null,
  currency: CurrencyCode
) {
  if (!service) return 0;
  if (currency === "USD") return service.salePriceUsd;
  if (currency === "RUB") return service.salePriceRub;
  return service.salePriceTl;
}

function getUnitCostPrice(
  service: OrderServiceItem | null,
  currency: CurrencyCode
) {
  if (!service) return 0;
  if (currency === "USD") return service.costPriceUsd;
  if (currency === "RUB") return service.costPriceRub;
  return service.costPriceTl;
}

function formatPrice(value: number, currency: CurrencyCode) {
  if (!value) return `0 ${currency}`;
  if (currency === "TL") return `${Math.round(value).toLocaleString("tr-TR")} TL`;
  return `${value.toFixed(2)} ${currency}`;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeBadgeText(value: unknown) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c");
}

function getGuaranteeBadgeClass(
  label: string | null | undefined,
  guaranteed?: boolean
) {
  const text = normalizeBadgeText(label);

  if (
    !guaranteed ||
    text.includes("garantisiz") ||
    text.includes("no guarantee")
  ) {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }

  if (
    text.includes("omur") ||
    text.includes("lifetime") ||
    text.includes("life time") ||
    text.includes("non drop") ||
    text.includes("nondrop") ||
    text.includes("no drop")
  ) {
    return "border-white/18 bg-white/[0.075] text-white";
  }

  const dayMatch = text.match(/(\d+)/);
  const days = dayMatch ? Number(dayMatch[1]) : 0;

  if (days >= 60) return "border-white/18 bg-white/[0.075] text-white";
  if (days >= 30) return "border-sky-300/28 bg-sky-300/10 text-sky-100";
  if (days >= 7) return "border-amber-300/30 bg-amber-300/10 text-amber-100";

  return "border-white/15 bg-white/[0.07] text-white/72";
}

function getQualityBadgeClass(level: string | null | undefined) {
  const text = normalizeBadgeText(level);

  if (text.includes("prime") || text.includes("vip") || text.includes("ultra")) {
    return "border-white/20 bg-white/[0.08] text-white";
  }

  if (text.includes("plus") || text.includes("premium") || text.includes("hq")) {
    return "border-sky-300/28 bg-sky-300/10 text-sky-100";
  }

  return "border-white/15 bg-white/[0.07] text-white/70";
}

function formatWalletBalance(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);

  return `${safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getSelectedBalance(
  authUser: {
    balance_usd: number;
    balance_tl: number;
    balance_rub: number;
  } | null,
  currency: CurrencyCode
) {
  if (!authUser) return 0;
  if (currency === "USD") return Number(authUser.balance_usd || 0);
  if (currency === "RUB") return Number(authUser.balance_rub || 0);
  return Number(authUser.balance_tl || 0);
}

function normalizeSearchText(value: unknown) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function getCategoryLabel(name: string, locale: Locale) {
  const map: Record<string, Record<Locale, string>> = {
    Takipçi: { tr: "Takipçi", en: "Followers", ru: "Подписчики" },
    Beğeni: { tr: "Beğeni", en: "Likes", ru: "Лайки" },
    Yorum: { tr: "Yorum", en: "Comments", ru: "Комментарии" },
    İzlenme: { tr: "İzlenme", en: "Views", ru: "Просмотры" },
    Kaydetme: { tr: "Kaydetme", en: "Saves", ru: "Сохранения" },
    Paylaşım: { tr: "Paylaşım", en: "Shares", ru: "Репосты" },
    Repost: { tr: "Repost", en: "Repost", ru: "Репост" },
    Retweet: { tr: "Retweet", en: "Retweet", ru: "Ретвит" },
    Abone: { tr: "Abone", en: "Subscribers", ru: "Подписчики" },
    Üye: { tr: "Üye", en: "Members", ru: "Участники" },
    Reaksiyon: { tr: "Reaksiyon", en: "Reactions", ru: "Реакции" },
    Story: { tr: "Story", en: "Story", ru: "История" },
    "Story İzlenme": {
      tr: "Story İzlenme",
      en: "Story Views",
      ru: "Просмотры историй",
    },
    Reels: { tr: "Reels", en: "Reels", ru: "Reels" },
    "Reels İzlenme": {
      tr: "Reels İzlenme",
      en: "Reels Views",
      ru: "Просмотры Reels",
    },
    "Reels Beğeni": {
      tr: "Reels Beğeni",
      en: "Reels Likes",
      ru: "Лайки Reels",
    },
    "Reels Yorum": {
      tr: "Reels Yorum",
      en: "Reels Comments",
      ru: "Комментарии Reels",
    },
    Shorts: { tr: "Shorts", en: "Shorts", ru: "Shorts" },
    "Shorts İzlenme": {
      tr: "Shorts İzlenme",
      en: "Shorts Views",
      ru: "Просмотры Shorts",
    },
    "Shorts Beğeni": {
      tr: "Shorts Beğeni",
      en: "Shorts Likes",
      ru: "Лайки Shorts",
    },
    "Canlı Yayın": {
      tr: "Canlı Yayın",
      en: "Live Stream",
      ru: "Прямой эфир",
    },
    "Profil Ziyareti": {
      tr: "Profil Ziyareti",
      en: "Profile Visits",
      ru: "Посещения профиля",
    },
    "Sayfa Beğenisi": {
      tr: "Sayfa Beğenisi",
      en: "Page Likes",
      ru: "Лайки страницы",
    },
    "Grup Üyesi": {
      tr: "Grup Üyesi",
      en: "Group Members",
      ru: "Участники группы",
    },
    Oylama: { tr: "Oylama", en: "Poll / Votes", ru: "Голосования" },
    Dinlenme: { tr: "Dinlenme", en: "Plays / Streams", ru: "Прослушивания" },
    Diğer: { tr: "Diğer", en: "Other", ru: "Другое" },
  };

  return map[name]?.[locale] || name;
}

function localizeCommonServiceText(value: string, locale: Locale) {
  if (!value || locale === "tr") return value;

  const enMap: Record<string, string> = {
    Takipçi: "Followers",
    Beğeni: "Likes",
    Yorum: "Comments",
    İzlenme: "Views",
    Kaydetme: "Saves",
    Paylaşım: "Shares",
    Abone: "Subscribers",
    Üye: "Members",
    Reaksiyon: "Reactions",
    Kalite: "Quality",
    Garantisiz: "No Guarantee",
    Garantili: "Guaranteed",
    Gün: "Day",
    Günlük: "Daily",
    Günde: "Daily",
    Hızlı: "Fast",
    Yavaş: "Slow",
    Türk: "Turkish",
    Rus: "Russian",
    Yabancı: "Global",
    "Temel başlangıç seviyesidir.": "This is a basic entry-level service.",
    "Düşük bütçeyle görünürlük kazanmak isteyen kullanıcılar için hazırlanmıştır.":
      "It is prepared for users who want to gain visibility with a low budget.",
    "Teslimat hızı, kalıcılık ve yoğunluk durumu seçilen servise göre değişebilir.":
      "Delivery speed, retention, and traffic intensity may vary depending on the selected service.",
    "Bu hizmet garantisizdir.": "This service does not include a refill guarantee.",
    "Teslimat sonrası düşüş, yavaşlama veya dalgalanma yaşanabilir; yeniden gönderim taahhüdü bulunmaz.":
      "Drops, slowdowns, or fluctuations may occur after delivery; no refill commitment is provided.",
    "Takipçi hizmetlerinde profilin herkese açık olması gerekir.":
      "For follower services, the profile must be public.",
    "Sipariş devam ederken kullanıcı adı değiştirilmemelidir.":
      "The username should not be changed while the order is in progress.",
    "Garanti süresi": "Guarantee period",
    gündür: "days",
    "Garantili hizmettir.": "This is a guaranteed service.",
    "Düşüş olması durumunda destek sağlanır.":
      "Support is provided in case of drops.",
  };

  const ruMap: Record<string, string> = {
    Takipçi: "Подписчики",
    Beğeni: "Лайки",
    Yorum: "Комментарии",
    İzlenme: "Просмотры",
    Kaydetme: "Сохранения",
    Paylaşım: "Репосты",
    Abone: "Подписчики",
    Üye: "Участники",
    Reaksiyon: "Реакции",
    Kalite: "Качество",
    Garantisiz: "Без гарантии",
    Garantili: "С гарантией",
    Gün: "дней",
    Günlük: "В день",
    Günde: "В день",
    Hızlı: "Быстро",
    Yavaş: "Медленно",
    Türk: "Турция",
    Rus: "Россия",
    Yabancı: "Глобальный",
    "Temel başlangıç seviyesidir.": "Это базовая услуга начального уровня.",
    "Düşük bütçeyle görünürlük kazanmak isteyen kullanıcılar için hazırlanmıştır.":
      "Подходит для пользователей, которые хотят получить видимость с небольшим бюджетом.",
    "Teslimat hızı, kalıcılık ve yoğunluk durumu seçilen servise göre değişebilir.":
      "Скорость выполнения, удержание и нагрузка могут отличаться в зависимости от выбранной услуги.",
    "Bu hizmet garantisizdir.":
      "Эта услуга предоставляется без гарантии восстановления.",
    "Teslimat sonrası düşüş, yavaşlama veya dalgalanma yaşanabilir; yeniden gönderim taahhüdü bulunmaz.":
      "После выполнения возможны списания, замедления или колебания; повторная отправка не гарантируется.",
    "Takipçi hizmetlerinde profilin herkese açık olması gerekir.":
      "Для услуг подписчиков профиль должен быть открытым.",
    "Sipariş devam ederken kullanıcı adı değiştirilmemelidir.":
      "Не меняйте username во время выполнения заказа.",
    "Garanti süresi": "Гарантийный срок",
    gündür: "дней",
    "Garantili hizmettir.": "Это услуга с гарантией.",
    "Düşüş olması durumunda destek sağlanır.":
      "При списаниях предоставляется поддержка.",
  };

  const map = locale === "en" ? enMap : ruMap;

  return Object.entries(map).reduce((text, [from, to]) => {
    return text.replaceAll(from, to);
  }, value);
}

function getLocalizedServiceTitle(title: string, locale: Locale) {
  return localizeCommonServiceText(title, locale);
}

function getLocalizedServiceDescription(description: string, locale: Locale) {
  if (locale === "tr") return description;

  if (locale === "en") {
    return "This service is processed according to the selected platform, target and quantity. Delivery speed, quality and guarantee conditions may vary depending on the selected service. Please make sure the target profile, post or link is public and accessible before ordering.";
  }

  return "Эта услуга обрабатывается в соответствии с выбранной платформой, целью и количеством. Скорость выполнения, качество и условия гарантии могут отличаться в зависимости от выбранной услуги. Перед заказом убедитесь, что профиль, публикация или ссылка открыты и доступны.";
}

function getLocalizedGuaranteeLabel(label: string, locale: Locale) {
  return localizeCommonServiceText(label, locale);
}

function getLocalizedSpeed(speed: string, locale: Locale) {
  return localizeCommonServiceText(speed, locale);
}

function getContactTypeLabel(type: ContactType, locale: Locale) {
  if (!type) return "";

  if (type === "E-posta") {
    if (locale === "en") return "Email";
    if (locale === "ru") return "E-mail";
    return "E-posta";
  }

  return type;
}

function makeCartId() {
  return Math.random().toString(36).slice(2, 10);
}

function OrderBeforeNotice({ t }: { t: ReturnType<typeof getDictionary> }) {
  const notices: { title: string; text: string; icon: IconType }[] = [
    {
      title: t.noticePriceTitle,
      text: t.noticePriceText,
      icon: FaFileInvoice,
    },
    {
      title: t.noticeProfileTitle,
      text: t.noticeProfileText,
      icon: FaShieldHalved,
    },
    {
      title: t.noticeStartTitle,
      text: t.noticeStartText,
      icon: FaUserCheck,
    },
    {
      title: t.noticeSupportTitle,
      text: t.noticeSupportText,
      icon: FaWhatsapp,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/[0.025] blur-3xl" />

      <div className="relative mb-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
          {t.orderBeforeBadge}
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          {t.orderBeforeTitle}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
          {t.orderBeforeDesc}
        </p>
      </div>

      <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {notices.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white/82">
              <item.icon />
            </div>

            <p className="text-sm font-bold text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


export default function SmmToraPage() {
  const platforms = getAllPlatforms();

  const [selectedPlatform, setSelectedPlatform] = useState(
    platforms[0]?.slug || "instagram"
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("TL");
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);

  const [authUser, setAuthUser] = useState<{
    id: number;
    email: string;
    full_name: string | null;
    balance_usd: number;
    balance_tl: number;
    balance_rub: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentReviewLoading, setPaymentReviewLoading] = useState(false);
  const [paymentReviewMessage, setPaymentReviewMessage] = useState("");
  const [paymentReviewError, setPaymentReviewError] = useState("");
  const [createdOrderNumbers, setCreatedOrderNumbers] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdPaymentInfo, setCreatedPaymentInfo] =
    useState<CreatedPaymentInfo | null>(null);

  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const cartSectionRef = useRef<HTMLDivElement | null>(null);

  const [infoTab, setInfoTab] = useState<"service" | "before" | "notes">(
    "service"
  );
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const [showServiceFilters, setShowServiceFilters] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>("all");
  const [guaranteeFilter, setGuaranteeFilter] =
    useState<GuaranteeFilter>("all");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [priceSort, setPriceSort] = useState<PriceSort>("price-asc");

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
            balance_usd: Number(data.user.balance_usd || 0),
            balance_tl: Number(data.user.balance_tl || 0),
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

  useEffect(() => {
    setSelectedLocale(detectInitialLocale());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("medyatora_locale", selectedLocale);
      document.cookie = `medyatora_locale=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;

      window.dispatchEvent(
        new CustomEvent("medyatora_locale_change", {
          detail: { locale: selectedLocale },
        })
      );

      window.dispatchEvent(
        new CustomEvent("medyatora_locale_changed", {
          detail: { locale: selectedLocale },
        })
      );
    }
  }, [selectedLocale]);

  const t = getDictionary(selectedLocale);

  const resetServiceFilters = () => {
    setServiceSearch("");
    setQualityFilter("all");
    setGuaranteeFilter("all");
    setRegionFilter("all");
    setPriceSort("price-asc");
  };

  useEffect(() => {
    async function loadServices() {
      setServicesLoading(true);
      setError("");

      try {
        const res = await fetch("/api/services", {
          cache: "no-store",
        });
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

  const availablePlatformSlugs = useMemo(() => {
    return new Set(services.map((service) => service.platform).filter(Boolean));
  }, [services]);

  const availablePlatforms = useMemo(() => {
    if (servicesLoading) return platforms;

    return platforms.filter((platform) =>
      availablePlatformSlugs.has(platform.slug)
    );
  }, [platforms, servicesLoading, availablePlatformSlugs]);

  const visiblePlatforms = useMemo(() => {
    return showAllPlatforms ? availablePlatforms : availablePlatforms.slice(0, 10);
  }, [availablePlatforms, showAllPlatforms]);

  const hiddenPlatformCount = Math.max(
    availablePlatforms.length - visiblePlatforms.length,
    0
  );

  useEffect(() => {
    if (servicesLoading) return;
    if (!availablePlatforms.length) return;

    const selectedStillAvailable = availablePlatforms.some(
      (platform) => platform.slug === selectedPlatform
    );

    if (!selectedStillAvailable) {
      setSelectedPlatform(availablePlatforms[0].slug);
      setSelectedCategory("");
      setSelectedServiceId(null);
      resetServiceFilters();
    }
  }, [availablePlatforms, servicesLoading, selectedPlatform]);

  const platformServices = useMemo(() => {
    return services.filter((item) => item.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        platformServices
          .map((service) => service.category)
          .filter((category): category is string => Boolean(category))
      )
    );

    return uniqueCategories
      .map((slug) => ({
        slug,
        name: getCategoryName(slug),
      }))
      .sort((a, b) => {
        const aOrder = CATEGORY_SORT_ORDER[a.slug] ?? 500;
        const bOrder = CATEGORY_SORT_ORDER[b.slug] ?? 500;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name, "tr");
      });
  }, [platformServices]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory("");
      setSelectedServiceId(null);
      return;
    }

    const hasCurrentCategory = categories.some(
      (category) => category.slug === selectedCategory
    );

    const nextCategory = hasCurrentCategory
      ? selectedCategory
      : categories[0].slug;

    setSelectedCategory(nextCategory);
    setSelectedServiceId(null);
  }, [categories, selectedCategory]);

  const filteredServices = useMemo(() => {
    if (!selectedCategory && !serviceSearch.trim()) return [];

    const search = normalizeSearchText(serviceSearch.trim());

    const filtered = services
      .filter(isVisibleCustomerService)
      .filter((item) => {
        if (search) return true;

        return (
          item.platform === selectedPlatform && item.category === selectedCategory
        );
      })
      .filter((item) => {
        if (!search) return true;

        const text = normalizeSearchText(
          [
            item.id,
            item.siteCode,
            item.platform,
            item.category,
            item.title,
            item.subtitle,
            item.guaranteeLabel,
            item.speed,
            item.level,
            item.regionLabel,
            item.originalName,
          ].join(" ")
        );

        return text.includes(search);
      })
      .filter((item) => {
        if (search) return true;
        if (qualityFilter === "all") return true;

        return item.level === qualityFilter;
      })
      .filter((item) => {
        if (search) return true;
        if (guaranteeFilter === "all") return true;

        const isGuaranteed =
          item.guarantee === true &&
          item.guaranteeLabel &&
          item.guaranteeLabel !== "Garantisiz";

        if (guaranteeFilter === "guaranteed") return isGuaranteed;

        return !isGuaranteed;
      })
      .filter((item) => {
        if (search) return true;
        if (regionFilter === "all") return true;

        const region = item.regionLabel || "";

        if (regionFilter === "TR") return region.includes("TR");
        if (regionFilter === "RU") return region.includes("RU");
        if (regionFilter === "Global") return region.includes("Global");

        return true;
      });

    return filtered.sort((a, b) => {
      const aPrice = getUnitSalePrice(a, selectedCurrency);
      const bPrice = getUnitSalePrice(b, selectedCurrency);

      if (priceSort === "price-desc") return bPrice - aPrice;

      const aGuaranteed = a.guarantee ? 1 : 0;
      const bGuaranteed = b.guarantee ? 1 : 0;

      if (aPrice !== bPrice) return aPrice - bPrice;
      if (aGuaranteed !== bGuaranteed) return bGuaranteed - aGuaranteed;
      if (a.max !== b.max) return b.max - a.max;

      return a.id - b.id;
    });
  }, [
    services,
    selectedPlatform,
    selectedCategory,
    selectedCurrency,
    serviceSearch,
    qualityFilter,
    guaranteeFilter,
    regionFilter,
    priceSort,
  ]);

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
    return filteredServices.find((item) => item.id === selectedServiceId) ?? null;
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

    if (
      quantityNumber < selectedService.min ||
      quantityNumber > selectedService.max
    ) {
      return 0;
    }

    return (quantityNumber / 1000) * selectedUnitPrice;
  }, [quantityNumber, selectedService, selectedUnitPrice]);

  const totalCostPrice = useMemo(() => {
    if (!selectedService) return 0;
    if (!quantityNumber) return 0;

    if (
      quantityNumber < selectedService.min ||
      quantityNumber > selectedService.max
    ) {
      return 0;
    }

    return (quantityNumber / 1000) * selectedUnitCostPrice;
  }, [quantityNumber, selectedService, selectedUnitCostPrice]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
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
    !!contactValue.trim() &&
    !!paymentMethod &&
    paymentTermsAccepted;

    const scrollProducts = (direction: "up" | "down") => {
      if (!productsScrollRef.current) return;
  
      productsScrollRef.current.scrollBy({
        top: direction === "down" ? 320 : -320,
        behavior: "smooth",
      });
    };
  
    const goToCart = () => {
      cartSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
      setPaymentMethod("");
      setPaymentTermsAccepted(false);
    };
  
    const buildCurrentItem = (): CartItem | null => {
      if (!selectedService || !canUseCurrentForm) return null;
  
      return {
        cartId: makeCartId(),
        service_id: selectedService.id,
        site_code: selectedService.siteCode,
        service_title: getLocalizedServiceTitle(
          selectedService.title,
          selectedLocale
        ),
        platform: selectedPlatform,
        category: selectedCategory,
        quantity: quantityNumber,
        unit_price: selectedUnitPrice,
        total_price: totalPrice,
        unit_cost_price: selectedUnitCostPrice,
        total_cost_price: totalCostPrice,
        guarantee_label: getLocalizedGuaranteeLabel(
          selectedService.guaranteeLabel,
          selectedLocale
        ),
        speed: getLocalizedSpeed(selectedService.speed, selectedLocale),
        target_username: targetUsername.trim(),
        target_link: targetLink.trim(),
        order_note: orderNote.trim(),
      };
    };
  
    const repriceCartItem = (item: CartItem, currency: CurrencyCode): CartItem => {
      const service =
        services.find(
          (serviceItem) =>
            serviceItem.id === item.service_id &&
            serviceItem.siteCode === item.site_code
        ) || services.find((serviceItem) => serviceItem.id === item.service_id);
  
      if (!service) return item;
  
      const unitPrice = roundMoney(getUnitSalePrice(service, currency));
      const unitCostPrice = roundMoney(getUnitCostPrice(service, currency));
      const totalPrice = roundMoney((item.quantity / 1000) * unitPrice);
      const totalCostPrice = roundMoney((item.quantity / 1000) * unitCostPrice);
  
      return {
        ...item,
        service_title: getLocalizedServiceTitle(service.title, selectedLocale),
        guarantee_label: getLocalizedGuaranteeLabel(
          service.guaranteeLabel,
          selectedLocale
        ),
        speed: getLocalizedSpeed(service.speed, selectedLocale),
        unit_price: unitPrice,
        total_price: totalPrice,
        unit_cost_price: unitCostPrice,
        total_cost_price: totalCostPrice,
      };
    };
  
    const handleCurrencyChange = (currency: CurrencyCode) => {
      setSelectedCurrency(currency);
      setError("");
      setCartMessage("");
      setPaymentReviewMessage("");
      setPaymentReviewError("");
  
      setCartItems((prev) => prev.map((item) => repriceCartItem(item, currency)));
      setCheckoutItems((prev) =>
        prev.map((item) => repriceCartItem(item, currency))
      );
  
      trackVisitorAction({
        event_type: "payment_method_select",
        event_label: `Para birimi seçildi: ${currency}`,
        event_value: currency,
        event_data: {
          checkout_mode: checkoutMode,
          item_count: checkoutItems.length,
          selected_currency: currency,
        },
      });
    };
  
    const clearStatusMessages = () => {
      setError("");
      setCartMessage("");
      setCreatedOrderNumbers([]);
      setCreatedPaymentInfo(null);
      setPaymentReviewMessage("");
      setPaymentReviewError("");
      setSuccessOpen(false);
    };
  
    const handleAddToCart = () => {
      const item = buildCurrentItem();
      if (!item) return;
  
      trackVisitorAction({
        event_type: "add_to_cart",
        event_label: item.service_title,
        event_value: String(item.site_code),
        event_data: {
          service_id: item.service_id,
          site_code: item.site_code,
          platform: item.platform,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          currency: selectedCurrency,
          target_username: item.target_username,
          has_target_link: Boolean(item.target_link),
        },
      });
  
      setCartItems((prev) => [...prev, item]);
      resetItemForm();
      setCartMessage(t.successOrder);
      setError("");
      setCreatedOrderNumbers([]);
      setCreatedPaymentInfo(null);
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
      setCartMessage(t.edit);
  
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  
    const handleOpenSingleCheckout = () => {
      const item = buildCurrentItem();
      if (!item) return;
  
      trackVisitorAction({
        event_type: "checkout_open",
        event_label: item.service_title,
        event_value: String(item.site_code),
        event_data: {
          mode: "single",
          service_id: item.service_id,
          site_code: item.site_code,
          platform: item.platform,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          currency: selectedCurrency,
          target_username: item.target_username,
          has_target_link: Boolean(item.target_link),
        },
      });
  
      setCheckoutItems([item]);
      setCheckoutMode("single");
      setPaymentTermsAccepted(false);
      setError("");
    };
  
    const handleOpenCartCheckout = () => {
      if (cartItems.length === 0) return;
  
      trackVisitorAction({
        event_type: "checkout_open",
        event_label: "Sepet ödeme ekranı",
        event_value: String(cartItems.length),
        event_data: {
          mode: "cart",
          item_count: cartItems.length,
          total_price: cartTotal,
          currency: selectedCurrency,
          items: cartItems.map((item) => ({
            service_id: item.service_id,
            site_code: item.site_code,
            service_title: item.service_title,
            platform: item.platform,
            category: item.category,
            quantity: item.quantity,
            total_price: item.total_price,
          })),
        },
      });
  
      setCheckoutItems(cartItems);
      setCheckoutMode("cart");
      setPaymentTermsAccepted(false);
      setError("");
    };
  
    const submitItems = async () => {
      if (!isCheckoutValid || checkoutItems.length === 0) return;
  
      const checkoutTotalAmount = checkoutItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
  
      setLoading(true);
      setError("");
      setCartMessage("");
      setCreatedOrderNumbers([]);
      setCreatedPaymentInfo(null);
      setPaymentReviewMessage("");
      setPaymentReviewError("");
  
      try {
        const res = await fetch("/api/order-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            full_name: fullName,
            phone_number: phoneNumber,
            contact_type: contactType,
            contact_value: contactValue,
            currency: selectedCurrency,
            payment_method: paymentMethod,
            items: checkoutItems,
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.error || "Sipariş oluşturulamadı.");
        }
  
        trackVisitorAction({
          event_type: "order_created",
          event_label: "Sipariş oluşturuldu",
          event_value: Array.isArray(data.orderNumbers)
            ? data.orderNumbers.join(", ")
            : "",
          event_data: {
            order_numbers: data.orderNumbers || [],
            checkout_mode: checkoutMode,
            item_count: checkoutItems.length,
            total_price: checkoutTotalAmount,
            currency: selectedCurrency,
            payment_method: paymentMethod,
            contact_type: contactType,
            items: checkoutItems.map((item) => ({
              service_id: item.service_id,
              site_code: item.site_code,
              service_title: item.service_title,
              platform: item.platform,
              category: item.category,
              quantity: item.quantity,
              total_price: item.total_price,
            })),
          },
        });
  
        const createdNumbers = Array.isArray(data.orderNumbers)
          ? data.orderNumbers
          : [];
  
        setCreatedOrderNumbers(createdNumbers);
  
        setCreatedPaymentInfo({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          paymentMethod,
          currency: selectedCurrency,
          totalAmount: checkoutTotalAmount,
          orderNumbers: createdNumbers,
        });
  
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
  
    const handlePaymentCompleted = async () => {
      if (!createdPaymentInfo || !createdPaymentInfo.orderNumbers.length) {
        setPaymentReviewError("Sipariş numarası bulunamadı.");
        return;
      }
  
      setPaymentReviewLoading(true);
      setPaymentReviewMessage("");
      setPaymentReviewError("");
  
      try {
        const res = await fetch("/api/order-request/payment-review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            order_numbers: createdPaymentInfo.orderNumbers,
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Ödeme bildirimi alınamadı.");
        }
  
        setPaymentReviewMessage(
          data.message || "Ödeme bildirimi alındı. Sipariş kontrol edilecek."
        );
      } catch (err) {
        setPaymentReviewError(
          err instanceof Error
            ? err.message
            : "Ödeme bildirimi sırasında hata oluştu."
        );
      } finally {
        setPaymentReviewLoading(false);
      }
    };
  
    const paymentPolicyText = {
      tr: {
        securityTitle: "Ödeme Güvenliği",
        securityText:
          "Ödeme yapacak kişinin adı soyadı, dekonttaki gönderen adı soyadı ile aynı olmalıdır. Banka transferi yaparken açıklama kısmını boş bırakın. Eşleşmeyen ödemeler onaylanmaz.",
        privacyText:
          "Kişisel bilgileriniz yalnızca ödeme doğrulama amacıyla kullanılır ve üçüncü kişilerle paylaşılmaz.",
        refundTitle: "İade Koşulları",
        refundText1:
          "İşlem başlamadan önce iade talep edebilirsiniz. İşlem başladıktan sonra iptal/iade yapılamaz.",
        refundText2:
          "İşlem bizden kaynaklı bir sebeple tamamen veya kısmen tamamlanamazsa, tamamlanamayan kısma ait tutar siparişinizin ödeme yöntemi ve hesap durumuna göre iade edilir veya hesabınıza bakiye olarak yansıtılır.",
        acceptText:
          "Okudum, ödeme güvenliği ve iade koşullarını kabul ediyorum.",
      },
      en: {
        securityTitle: "Payment Security",
        securityText:
          "The payer's full name must match the sender name on the receipt. Leave the payment description field empty when making a bank transfer. Payments with mismatched information may not be approved.",
        privacyText:
          "Your personal information is used only for payment verification and is not shared with third parties.",
        refundTitle: "Refund Conditions",
        refundText1:
          "You may request a refund before the process starts. Once the process has started, cancellation/refund is not available.",
        refundText2:
          "If the service cannot be completed fully or partially due to a reason caused by us, the amount for the incomplete part may be refunded according to your payment method and account status, or added to your account balance.",
        acceptText:
          "I have read and accept the payment security and refund conditions.",
      },
      ru: {
        securityTitle: "Безопасность оплаты",
        securityText:
          "Имя плательщика должно совпадать с именем отправителя в чеке. При банковском переводе оставьте поле комментария к платежу пустым. Платежи с несовпадающими данными могут быть не подтверждены.",
        privacyText:
          "Ваши персональные данные используются только для проверки оплаты и не передаются третьим лицам.",
        refundTitle: "Условия возврата",
        refundText1:
          "Вы можете запросить возврат до начала обработки заказа. После начала обработки отмена/возврат невозможны.",
        refundText2:
          "Если услуга полностью или частично не может быть выполнена по нашей причине, сумма за невыполненную часть может быть возвращена в соответствии со способом оплаты и статусом аккаунта либо зачислена на баланс аккаунта.",
        acceptText:
          "Я прочитал(а) и принимаю условия безопасности оплаты и возврата.",
      },
    }[selectedLocale];

    const smmFixedText = {
      tr: {
        completeFormHint:
          "Hizmeti seç, hedef kullanıcı adını yaz ve geçerli miktar gir. Sonra satın alma veya sepete ekleme aktif olur.",
        selectedPaymentCurrency: "Seçili ödeme birimi",
        balanceLoginRequired: "Bakiye ile ödeme için giriş yapmalısın.",
        balancePaymentTitle: "Bakiye ile ödeme",
        balancePaymentDesc:
          "TL, USD ve RUB bakiyeleri ayrı ayrı tutulur. Sipariş hangi para birimiyle oluşturuluyorsa ödeme sadece o para birimindeki bakiyeden düşülür.",
        orderInfoTitle: "Sipariş Bilgisi",
        balancePaymentCompleted: "Bakiye ile ödeme tamamlandı",
        orderTrackingAccountText:
          "Sipariş durumunu Hesabım sayfasındaki Siparişlerim bölümünden takip edebilirsin.",
        goAccount: "Hesabıma Git",
        viewOrders: "Siparişlerimi Gör",
        paymentDoneTitle: "Ödemeyi yaptıysan",
        paymentDoneDesc:
          "Dekontu Telegram veya WhatsApp üzerinden gönderdikten sonra aşağıdaki butona bas. Siparişin ödeme kontrolüne alınacak.",
        paymentReviewLoading: "Kontrole Alınıyor...",
        paymentReviewDone: "Ödeme Kontrolüne Alındı",
        paymentCompletedButton: "Ödemeyi Tamamladım",
      },
      en: {
        completeFormHint:
          "Select a service, enter the target username, and enter a valid quantity. Then checkout or add to cart will become active.",
        selectedPaymentCurrency: "Selected payment currency",
        balanceLoginRequired: "You need to log in to pay with balance.",
        balancePaymentTitle: "Pay with balance",
        balancePaymentDesc:
          "TL, USD, and RUB balances are kept separately. The order amount is deducted only from the balance in the selected order currency.",
        orderInfoTitle: "Order Information",
        balancePaymentCompleted: "Balance payment completed",
        orderTrackingAccountText:
          "You can track the order status from the My Orders section in your account.",
        goAccount: "Go to My Account",
        viewOrders: "View My Orders",
        paymentDoneTitle: "If you have completed the payment",
        paymentDoneDesc:
          "After sending the receipt via Telegram or WhatsApp, press the button below. Your order will be sent for payment review.",
        paymentReviewLoading: "Sending for Review...",
        paymentReviewDone: "Payment Sent for Review",
        paymentCompletedButton: "I Completed the Payment",
      },
      ru: {
        completeFormHint:
          "Выберите услугу, укажите целевой username и введите корректное количество. После этого покупка или добавление в корзину станет доступным.",
        selectedPaymentCurrency: "Выбранная валюта оплаты",
        balanceLoginRequired: "Для оплаты с баланса необходимо войти в аккаунт.",
        balancePaymentTitle: "Оплата с баланса",
        balancePaymentDesc:
          "Балансы TL, USD и RUB хранятся отдельно. Сумма заказа списывается только с баланса в выбранной валюте заказа.",
        orderInfoTitle: "Информация о заказе",
        balancePaymentCompleted: "Оплата с баланса завершена",
        orderTrackingAccountText:
          "Статус заказа можно отслеживать в разделе «Мои заказы» в аккаунте.",
        goAccount: "Перейти в аккаунт",
        viewOrders: "Мои заказы",
        paymentDoneTitle: "Если вы уже оплатили",
        paymentDoneDesc:
          "После отправки чека через Telegram или WhatsApp нажмите кнопку ниже. Заказ будет отправлен на проверку оплаты.",
        paymentReviewLoading: "Отправляется на проверку...",
        paymentReviewDone: "Оплата отправлена на проверку",
        paymentCompletedButton: "Я оплатил",
      },
    }[selectedLocale];


    return (
      <main className="mt-premium-page px-3 py-4 text-white sm:px-6 sm:py-6">
        <div className="mt-top-fade" />
        <div className="mt-bottom-fade" />
  
        <ServiceTermsModal />
  
        <div className="mt-premium-inner mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07090c]/94 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.025] backdrop-blur-2xl sm:p-5">
  <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-white/[0.025] blur-3xl" />
  <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-white/[0.018] blur-3xl" />

  <div className="relative flex flex-col gap-4">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <a href="/" className="inline-flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.075] font-black text-white shadow-[0_0_24px_rgba(255,255,255,0.07)]">
          MT
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-black tracking-[0.14em] text-white">
            MEDYATORA
          </div>
          <div className="mt-1 truncate text-[10px] uppercase tracking-[0.24em] text-white/38">
            SMMTora servis paneli
          </div>
        </div>
      </a>

      <nav className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-white/70 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:text-sm">
        <a
          href="/"
          className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-4"
        >
          Ana Sayfa
        </a>

        <a
          href="/analiz"
          className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-4"
        >
          Analiz
        </a>

        <a
          href="/paketler"
          className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-4"
        >
          Paketler
        </a>
      </nav>
    </div>

    <div className="grid gap-3 xl:grid-cols-[auto_auto_1fr] xl:items-center">
      <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/25 p-1 xl:w-fit">
        <span className="hidden px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35 sm:inline">
          Dil
        </span>

        {localeOptions.map((locale) => {
          const active = selectedLocale === locale;

          return (
            <button
              key={locale}
              type="button"
              onClick={() => setSelectedLocale(locale)}
              className={`h-9 flex-1 rounded-xl px-3 text-xs font-black transition xl:flex-none ${
                active
                  ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.10)]"
                  : "text-white/58 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {locale.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/25 p-1 xl:w-fit">
        <span className="hidden px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35 sm:inline">
          Para
        </span>

        {currencyOptions.map((currency) => {
          const active = selectedCurrency === currency;

          return (
            <button
              key={currency}
              type="button"
              onClick={() => {
                handleCurrencyChange(currency);
                clearStatusMessages();
              }}
              className={`h-9 flex-1 rounded-xl px-3 text-xs font-black transition xl:flex-none ${
                active
                  ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.10)]"
                  : "text-white/58 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {currency}
            </button>
          );
        })}
      </div>

      <div className="relative z-[9999] flex w-full justify-end sm:w-auto xl:justify-end">
  <div className="flex max-w-full items-center justify-end">
    <UserMenu showLocaleSwitcher={false} />
  </div>
</div>
    </div>
  </div>
</header>
  
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#07090c]/94 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.56)] ring-1 ring-white/[0.035] backdrop-blur-2xl sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />
  
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/72">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {t.smmHeroBadge}
                </div>
  
                <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {t.smmHeroTitle}
                </h1>
  
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                  {t.smmHeroDesc}
                </p>
  
                <div className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    [t.smmTaxIncluded, FaFileInvoice],
                    [t.smmOrderTracking, FaUserCheck],
                    [t.smmSupport, FaWhatsapp],
                    [t.smmDataUse, FaShieldHalved],
                  ].map(([title, Icon]) => {
                    const IconComponent = Icon as IconType;
  
                    return (
                      <div
                        key={title as string}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.065]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-white/82">
                          <IconComponent />
                        </span>
                        <span className="leading-5">{title as string}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
  
          <OrderBeforeNotice t={t} />
  
          <PremiumShellCard className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionEyebrow
                title={t.platformSelection}
                description={t.platformSelectionDesc}
              />
  
              <button
                type="button"
                onClick={goToCart}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                {t.goToCart}
              </button>
            </div>
  
            {servicesLoading ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                {t.platformLoading}
              </div>
            ) : availablePlatforms.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                {t.noActivePlatform}
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {visiblePlatforms.map((platform) => {
                    const active = selectedPlatform === platform.slug;
  
                    return (
                      <button
                        key={platform.slug}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(platform.slug);
                          setSelectedServiceId(null);
                          resetServiceFilters();
                          clearStatusMessages();
  
                          trackVisitorAction({
                            event_type: "platform_select",
                            event_label: platform.title,
                            event_value: platform.slug,
                            event_data: {
                              platform_slug: platform.slug,
                              platform_title: platform.title,
                            },
                          });
                        }}
                        className={`group relative overflow-hidden rounded-[26px] border p-4 text-left transition duration-200 hover:-translate-y-1 ${
                          active
                            ? "border-white/30 bg-white/[0.105] shadow-[0_18px_55px_rgba(0,0,0,0.34),0_0_0_1px_rgba(255,255,255,0.08)]"
                            : "border-white/10 bg-white/[0.038] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_16px_45px_rgba(0,0,0,0.24)]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${
                            platform.brandGlow || "bg-white/10"
                          } blur-3xl transition group-hover:scale-125`}
                        />
  
                        <div className="relative">
                          <div
                            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                              active
                                ? "border-white/18 bg-white/[0.08] text-white"
                                : "border-white/10 bg-black/25 text-white/82"
                            }`}
                          >
                            <PlatformIcon
                              slug={platform.slug}
                              title={platform.shortTitle || platform.title}
                            />
                          </div>
  
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-white sm:text-base">
                                {platform.title}
                              </div>
                              <div className="mt-1 text-xs text-white/42">
                                {t.singleServices}
                              </div>
                            </div>
  
                            {active && (
                              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black">
                                {t.selected}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
  
                {availablePlatforms.length > 10 && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllPlatforms((prev) => !prev)}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/75 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                    >
                      {showAllPlatforms
                        ? t.showLessPlatforms
                        : `${t.showMorePlatforms} (${hiddenPlatformCount} ${t.moreCount})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </PremiumShellCard>
  
          <PremiumShellCard className="p-5 sm:p-6">
            <SectionEyebrow title={t.categorySelection} />
  
            {servicesLoading ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                {t.servicesLoading}
              </div>
            ) : categories.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                {t.noActiveServiceForPlatform}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = selectedCategory === category.slug;
  
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        setSelectedServiceId(null);
                        resetServiceFilters();
                        clearStatusMessages();
  
                        trackVisitorAction({
                          event_type: "category_select",
                          event_label: getCategoryLabel(
                            category.name,
                            selectedLocale
                          ),
                          event_value: category.slug,
                          event_data: {
                            platform: selectedPlatform,
                            category_slug: category.slug,
                            category_name: category.name,
                            locale: selectedLocale,
                          },
                        });
                      }}
                      className={`rounded-full border px-4 py-2 text-xs font-bold transition sm:text-sm ${
                        active
                          ? "border-white bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.10)]"
                          : "border-white/10 bg-white/[0.055] text-white/78 hover:border-white/20 hover:bg-white/[0.09]"
                      }`}
                    >
                      {getCategoryLabel(category.name, selectedLocale)}
                    </button>
                  );
                })}
              </div>
            )}
          </PremiumShellCard>
  
          <section className="grid items-start gap-5 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="flex flex-col gap-5">
              <PremiumShellCard className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <SectionEyebrow
                    title={t.serviceListTitle}
                    description={t.serviceListDesc}
                  />
  
                  {filteredServices.length > 0 && (
                    <div className="hidden items-center gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => scrollProducts("up")}
                        className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-white/78 transition hover:-translate-y-0.5 hover:bg-white/[0.08] sm:text-sm"
                      >
                        {t.up}
                      </button>
  
                      <button
                        type="button"
                        onClick={() => scrollProducts("down")}
                        className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-white/78 transition hover:-translate-y-0.5 hover:bg-white/[0.08] sm:text-sm"
                      >
                        {t.down}
                      </button>
                    </div>
                  )}
                </div>
  
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowServiceFilters((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white/78 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span>{t.filter}</span>
                  </button>
  
                  <p className="text-xs text-white/42">
                    {filteredServices.length} {t.servicesShown}
                  </p>
                </div>
  
                <div className="mb-4">
                  <input
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                  />
  
                  {serviceSearch.trim() ? (
                    <p className="mt-2 text-xs text-white/42">
                      “{serviceSearch.trim()}” — {filteredServices.length}{" "}
                      {t.searchResultText}
                    </p>
                  ) : null}
                </div>
  
                {showServiceFilters && (
                  <div className="mb-4 rounded-3xl border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                          {t.quality}
                        </label>
                        <select
                          value={qualityFilter}
                          onChange={(event) =>
                            setQualityFilter(event.target.value as QualityFilter)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#080a0d] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28"
                        >
                          <option value="all">{t.all}</option>
                          <option value="Core">{t.coreQuality}</option>
                          <option value="Plus">{t.plusQuality}</option>
                          <option value="Prime">{t.primeQuality}</option>
                        </select>
                      </div>
  
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                          {t.guarantee}
                        </label>
                        <select
                          value={guaranteeFilter}
                          onChange={(event) =>
                            setGuaranteeFilter(
                              event.target.value as GuaranteeFilter
                            )
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#080a0d] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28"
                        >
                          <option value="all">{t.all}</option>
                          <option value="guaranteed">{t.guaranteed}</option>
                          <option value="no-guarantee">{t.noGuarantee}</option>
                        </select>
                      </div>
  
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                          {t.region}
                        </label>
                        <select
                          value={regionFilter}
                          onChange={(event) =>
                            setRegionFilter(event.target.value as RegionFilter)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#080a0d] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28"
                        >
                          <option value="all">{t.all}</option>
                          <option value="TR">TR</option>
                          <option value="RU">RU</option>
                          <option value="Global">Global</option>
                        </select>
                      </div>
  
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/38">
                          {t.sort}
                        </label>
                        <select
                          value={priceSort}
                          onChange={(event) =>
                            setPriceSort(event.target.value as PriceSort)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#080a0d] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28"
                        >
                          <option value="smart">{t.recommendedSort}</option>
                          <option value="price-asc">{t.priceAsc}</option>
                          <option value="price-desc">{t.priceDesc}</option>
                        </select>
                      </div>
                    </div>
  
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={resetServiceFilters}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  </div>
                )}
  
                {servicesLoading ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                    {t.productsLoading}
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/50">
                    {t.noProductsFound}
                  </div>
                ) : (
                  <div
                    ref={productsScrollRef}
                    className="max-h-[760px] min-h-[420px] space-y-3 overflow-y-auto pr-1"
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

        trackVisitorAction({
          event_type: "service_select",
          event_label: getLocalizedServiceTitle(
            service.title,
            selectedLocale
          ),
          event_value: String(service.siteCode),
          event_data: {
            service_id: service.id,
            site_code: service.siteCode,
            platform: service.platform,
            category: service.category,
            title: getLocalizedServiceTitle(service.title, selectedLocale),
            level: service.level,
            guarantee: service.guarantee,
            guarantee_label: getLocalizedGuaranteeLabel(
              service.guaranteeLabel,
              selectedLocale
            ),
            min: service.min,
            max: service.max,
            price_per_1000: getUnitSalePrice(service, selectedCurrency),
            currency: selectedCurrency,
          },
        });
      }}
      className={`group relative w-full overflow-hidden rounded-[28px] border p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:p-5 ${
        active
          ? "border-white/30 bg-gradient-to-br from-white/[0.14] via-white/[0.075] to-white/[0.04] shadow-[0_22px_70px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.08)]"
          : "border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_16px_45px_rgba(0,0,0,0.24)]"
      }`}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-white/[0.045] blur-3xl transition group-hover:scale-125" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                #{service.siteCode}
              </span>

              {active ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black">
                  {t.selected}
                </span>
              ) : null}

              {service.regionLabel ? (
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[10px] font-bold text-white/62">
                  {service.regionLabel}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 line-clamp-2 text-base font-black leading-6 text-white sm:text-lg">
              {getLocalizedServiceTitle(service.title, selectedLocale)}
            </h3>

            {service.subtitle ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/52">
                {getLocalizedServiceDescription(
                  service.subtitle,
                  selectedLocale
                )}
              </p>
            ) : null}
          </div>

          <div className="w-full rounded-2xl border border-white/12 bg-black/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:w-[170px] sm:text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">
              {t.per1000}
            </p>
            <p className="mt-1 text-xl font-black text-white">
              {formatPrice(unitPrice, selectedCurrency)}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
              Min / Max
            </p>
            <p className="mt-1 text-xs font-bold text-white/75 sm:text-sm">
              {service.min} · {service.max}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
              {t.speed}
            </p>
            <p className="mt-1 truncate text-xs font-bold text-white/75 sm:text-sm">
              {getLocalizedSpeed(service.speed, selectedLocale)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
              {t.serviceNo}
            </p>
            <p className="mt-1 text-xs font-bold text-white/75 sm:text-sm">
              {service.siteCode}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${getGuaranteeBadgeClass(
              service.guaranteeLabel,
              service.guarantee
            )}`}
          >
            {getLocalizedGuaranteeLabel(
              service.guaranteeLabel,
              selectedLocale
            )}
          </span>

          <span
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${getQualityBadgeClass(
              service.level
            )}`}
          >
            {localizeCommonServiceText(service.level, selectedLocale)}
          </span>

          <span className="ml-auto hidden rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-black text-white/55 transition group-hover:bg-white group-hover:text-black sm:inline-flex">
            {active ? t.selected : "Seç"}
          </span>
        </div>
      </div>
    </button>
  );
})}
                  </div>
                )}
              </PremiumShellCard>

              <PremiumShellCard className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  ["service", t.serviceInfo],
                  ["before", t.beforeOrder],
                  ["notes", t.importantNotes],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setInfoTab(key as "service" | "before" | "notes")
                    }
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      infoTab === key
                        ? "border-white bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,0.10)]"
                        : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {infoTab === "service" && (
                <div className="space-y-3 text-sm leading-7 text-white/66">
                  <p>{t.serviceInfoP1}</p>
                  <p>{t.serviceInfoP2}</p>
                  <p>{t.serviceInfoP3}</p>
                </div>
              )}

              {infoTab === "before" && (
                <div className="space-y-3 text-sm leading-7 text-white/66">
                  <p>{t.beforeOrderP1}</p>
                  <p>{t.beforeOrderP2}</p>
                </div>
              )}

              {infoTab === "notes" && (
                <div className="space-y-3 text-sm leading-7 text-white/66">
                  <p>{t.note1}</p>
                  <p>{t.note2}</p>
                  <p>{t.note3}</p>
                  <p>{t.note4}</p>
                </div>
              )}
            </PremiumShellCard>
          </div>

          <div className="flex flex-col gap-5">
          <PremiumShellCard className="p-4 sm:p-6 xl:sticky xl:top-5">
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <SectionEyebrow title={t.orderInfo} />

      {selectedService ? (
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-black text-white/58">
          #{selectedService.siteCode}
        </span>
      ) : null}
    </div>

    {selectedService ? (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-gradient-to-br from-white/[0.10] via-white/[0.055] to-white/[0.025] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/[0.045] blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getGuaranteeBadgeClass(
                  selectedService.guaranteeLabel,
                  selectedService.guarantee
                )}`}
              >
                {getLocalizedGuaranteeLabel(
                  selectedService.guaranteeLabel,
                  selectedLocale
                )}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getQualityBadgeClass(
                  selectedService.level
                )}`}
              >
                {localizeCommonServiceText(
                  selectedService.level,
                  selectedLocale
                )}
              </span>
            </div>

            <h3 className="mt-3 text-base font-black leading-6 text-white sm:text-lg">
              {getLocalizedServiceTitle(selectedService.title, selectedLocale)}
            </h3>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                  Min
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {selectedService.min}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                  Max
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {selectedService.max}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                  {t.per1000}
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {formatPrice(selectedUnitPrice, selectedCurrency)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-white/45">
              {t.speed}:{" "}
              <span className="font-bold text-white/70">
                {getLocalizedSpeed(selectedService.speed, selectedLocale)}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <p className="text-sm font-bold text-white/82">
            {t.productDescription}
          </p>

          <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-white/58">
            {getLocalizedServiceDescription(
              selectedService.description,
              selectedLocale
            )}
          </p>
        </div>
      </div>
    ) : (
      <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm leading-6 text-white/50">
        {t.selectProductFirst}
      </div>
    )}

    <div className="space-y-3">
      <input
        value={targetUsername}
        onChange={(e) => {
          const value = e.target.value;
          setTargetUsername(value);

          if (value.trim().length >= 3 && selectedService) {
            trackVisitorAction({
              event_type: "target_entered",
              event_label: "Hedef kullanıcı adı girildi",
              event_value: value.trim(),
              event_data: {
                service_id: selectedService.id,
                site_code: selectedService.siteCode,
                platform: selectedPlatform,
                category: selectedCategory,
              },
            });
          }
        }}
        placeholder={t.targetUsername}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
      />

      <input
        value={targetLink}
        onChange={(e) => setTargetLink(e.target.value)}
        placeholder={t.targetLink}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
      />

      <input
        value={quantity}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setQuantity(value);

          const numericValue = Number(value);

          if (numericValue > 0 && selectedService) {
            trackVisitorAction({
              event_type: "quantity_entered",
              event_label: "Miktar girildi",
              event_value: String(numericValue),
              event_data: {
                service_id: selectedService.id,
                site_code: selectedService.siteCode,
                platform: selectedPlatform,
                category: selectedCategory,
                quantity: numericValue,
                min: selectedService.min,
                max: selectedService.max,
                valid:
                  numericValue >= selectedService.min &&
                  numericValue <= selectedService.max,
              },
            });
          }
        }}
        placeholder={t.quantity}
        inputMode="numeric"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
      />

      {selectedService && (
        <p className="text-xs leading-5 text-white/42">
          {t.minQuantityText
            .replace("{min}", String(selectedService.min))
            .replace("{max}", String(selectedService.max))}
        </p>
      )}

      <input
        value={orderNote}
        onChange={(e) => setOrderNote(e.target.value)}
        placeholder={t.orderNote}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
      />
    </div>

    <div className="relative overflow-hidden rounded-[26px] border border-white/14 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-white/[0.025] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.06] blur-3xl" />

      <div className="relative flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
            {t.totalSalePrice}
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {totalPrice > 0 ? formatPrice(totalPrice, selectedCurrency) : "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-right">
          <p className="text-[10px] font-black text-white/35">
            {selectedCurrency}
          </p>
          <p className="text-xs font-bold text-white/68">
            {quantityNumber > 0 ? quantityNumber.toLocaleString("tr-TR") : "0"}
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-3">
      <button
        type="button"
        onClick={handleOpenSingleCheckout}
        disabled={!canUseCurrentForm}
        className="rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {t.buyNow}
      </button>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canUseCurrentForm}
          className="rounded-2xl border border-white/14 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {t.addToCart}
        </button>

        <button
          type="button"
          onClick={goToCart}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          {t.goToCart}
        </button>
      </div>
    </div>

    {!canUseCurrentForm && (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-100/80">
        {smmFixedText.completeFormHint}
      </div>
    )}
  </div>
</PremiumShellCard>

            <PremiumShellCard ref={cartSectionRef} className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <SectionEyebrow title={t.cart} />

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenCartCheckout}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-black text-black shadow-[0_12px_30px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 sm:text-sm"
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
                      className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:border-white/15 hover:bg-white/[0.07]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">
                            {item.service_title}
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-white/52 sm:text-sm">
                            <p>
                              {t.serviceNo}: {item.site_code}
                            </p>
                            <p>
                              {t.targetUsername}: {item.target_username}
                            </p>
                            <p>
                              {t.targetLink}: {item.target_link || "-"}
                            </p>
                            <p>
                              {t.quantity}: {item.quantity}
                            </p>
                            <p>
                              {t.orderNote}: {item.order_note || "-"}
                            </p>
                            <p>
                              {t.per1000}:{" "}
                              {formatPrice(item.unit_price, selectedCurrency)}
                            </p>
                            <p>
                              {t.totalSalePrice}:{" "}
                              {formatPrice(item.total_price, selectedCurrency)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
                          <button
                            type="button"
                            onClick={() => handleEditCartItem(item.cartId)}
                            className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:-translate-y-0.5 hover:bg-amber-400/15"
                          >
                            {t.edit}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(item.cartId)}
                            className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-400/15"
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
                <div className="rounded-2xl border border-white/14 bg-gradient-to-br from-white/[0.10] to-white/[0.035] p-4 shadow-[0_14px_42px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between text-sm text-white/58">
                    <span>{t.cartTotal}</span>
                    <span className="text-lg font-black text-white">
                      {formatPrice(cartTotal, selectedCurrency)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/42">
                    {t.cartTotalDesc}
                  </p>
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
            </PremiumShellCard>
          </div>
        </section>
      </div>

      {checkoutMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[calc(100dvh-32px)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#080a0d]/96 p-4 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {t.checkoutTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {t.checkoutDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutMode(null)}
                className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-5 grid items-start gap-3 md:grid-cols-2">
              <div>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    selectedLocale === "tr"
                      ? "Ödeme Yapacak Kişinin Adı Soyadı"
                      : t.fullName
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                />

                <p className="mt-2 text-xs leading-5 text-amber-100/80">
                  Dekonttaki gönderen adı soyadı ile aynı olmalıdır.
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/45">
                  +
                </span>

                <input
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ""))
                  }
                  placeholder="90 5xx xxx xx xx / 7 xxx xxx xx xx"
                  inputMode="tel"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 pl-8 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
                />
              </div>

              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as ContactType)}
                className="w-full rounded-2xl border border-white/10 bg-[#080a0d] px-4 py-3 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28"
              >
                <option value="">{t.contactTypeSelect}</option>
                {contactTypes.map((item) => (
                  <option key={item} value={item}>
                    {getContactTypeLabel(item, selectedLocale)}
                  </option>
                ))}
              </select>

              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={t.contactValue}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition focus:border-white/28 focus:bg-white/[0.07]"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              <p>{t.contactWarning1}</p>
              <p className="mt-1">{t.contactWarning2}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <p className="text-sm font-bold text-white">{t.paymentMethod}</p>
              <p className="mt-1 text-sm leading-6 text-white/58">
                {t.paymentMethodDesc}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("turkey_bank");

                    trackVisitorAction({
                      event_type: "payment_method_select",
                      event_label: "Türkiye Banka Havalesi / EFT",
                      event_value: "turkey_bank",
                      event_data: {
                        checkout_mode: checkoutMode,
                        item_count: checkoutItems.length,
                        total_price: checkoutItems.reduce(
                          (sum, item) => sum + item.total_price,
                          0
                        ),
                        currency: selectedCurrency,
                      },
                    });
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "turkey_bank"
                      ? "border-white/30 bg-white/[0.095] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-sm font-bold text-white">
                    {t.turkeyBankTransfer}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/52">
                    {t.turkeyBankTransferDesc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("balance");

                    trackVisitorAction({
                      event_type: "payment_method_select",
                      event_label: "MedyaTora Bakiyesi",
                      event_value: "balance",
                      event_data: {
                        checkout_mode: checkoutMode,
                        item_count: checkoutItems.length,
                        total_price: checkoutItems.reduce(
                          (sum, item) => sum + item.total_price,
                          0
                        ),
                        currency: selectedCurrency,
                        balance_usd: authUser?.balance_usd || 0,
                        balance_tl: authUser?.balance_tl || 0,
                        balance_rub: authUser?.balance_rub || 0,
                      },
                    });
                  }}
                  disabled={!authUser}
                  className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    paymentMethod === "balance"
                      ? "border-white/30 bg-white/[0.095] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-sm font-bold text-white">
                    MedyaTora Bakiyesi
                  </p>

                  {authUser ? (
                    <>
                      <p className="mt-1 text-xs leading-5 text-white/52">
                        {smmFixedText.selectedPaymentCurrency}:{" "}
                        <span className="font-bold text-white/82">
                          {selectedCurrency}
                        </span>
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/52">
                        Bu sipariş{" "}
                        <span className="font-bold text-white">
                          {formatWalletBalance(
                            getSelectedBalance(authUser, selectedCurrency),
                            selectedCurrency
                          )}
                        </span>{" "}
                        bakiyenden düşer.
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs leading-5 text-white/52">
                      {smmFixedText.balanceLoginRequired}
                    </p>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("support");

                    trackVisitorAction({
                      event_type: "payment_method_select",
                      event_label: "Destek ile ödeme",
                      event_value: "support",
                      event_data: {
                        checkout_mode: checkoutMode,
                        item_count: checkoutItems.length,
                        total_price: checkoutItems.reduce(
                          (sum, item) => sum + item.total_price,
                          0
                        ),
                        currency: selectedCurrency,
                      },
                    });
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "support"
                      ? "border-white/30 bg-white/[0.095] shadow-[0_12px_34px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-sm font-bold text-white">
                    {t.otherPaymentMethods}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/52">
                    {t.otherPaymentMethodsDesc}
                  </p>
                </button>
              </div>

              {paymentMethod === "turkey_bank" && (
                <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/78">
                  <p className="font-bold text-white">{t.turkeyBankInfo}</p>

                  <div className="mt-3 space-y-2">
                    <p>
                      <span className="font-bold text-white">
                        {t.receiverName}:
                      </span>{" "}
                      {TURKEY_BANK_ACCOUNT_NAME}
                    </p>
                    <p>
                      <span className="font-bold text-white">{t.iban}:</span>{" "}
                      {TURKEY_BANK_IBAN}
                    </p>
                    <p>
                      <span className="font-bold text-white">
                        {t.paymentDescription}:
                      </span>{" "}
                      {t.digitalServiceOrderNo}
                    </p>
                    <p className="text-white/64">{t.receiptInfo}</p>
                  </div>
                </div>
              )}

              {paymentMethod === "support" && (
                <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-50">
                  <p className="font-bold text-white">
                    {t.otherPaymentMethods}
                  </p>
                  <p className="mt-2 text-white/70">
                    {t.otherPaymentInfoText}
                  </p>
                </div>
              )}

              {paymentMethod === "balance" && (
                <div className="mt-4 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/78">
                  <p className="font-bold text-white">{smmFixedText.balancePaymentTitle}</p>

                  <p className="mt-2 text-white/64">
                    {smmFixedText.balancePaymentDesc}
                  </p>

                  {authUser && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {(["TL", "USD", "RUB"] as CurrencyCode[]).map(
                        (currency) => {
                          const value =
                            currency === "TL"
                              ? authUser.balance_tl
                              : currency === "USD"
                                ? authUser.balance_usd
                                : authUser.balance_rub;

                          return (
                            <button
                              key={currency}
                              type="button"
                              onClick={() => handleCurrencyChange(currency)}
                              className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                                selectedCurrency === currency
                                  ? "border-white/30 bg-white/[0.10] shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
                                  : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                              }`}
                            >
                              <p className="text-xs font-black text-white/42">
                                {currency} Bakiyesi
                              </p>
                              <p className="mt-1 text-sm font-black text-white">
                                {formatWalletBalance(value, currency)}
                              </p>
                              <p className="mt-1 text-[10px] font-bold text-white/48">
                                {currency} ile öde
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                  <p className="mt-3 text-xs leading-5 text-white/52">
                    {smmFixedText.selectedPaymentCurrency}:{" "}
                    <span className="font-bold text-white">
                      {selectedCurrency}
                    </span>
                    . Bu sipariş yalnızca {selectedCurrency} bakiyenden
                    düşecektir.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
              <p className="font-bold text-white">
                {paymentPolicyText.securityTitle}
              </p>

              <p className="mt-2 text-white/75">
                {paymentPolicyText.securityText}
              </p>

              <p className="mt-2 text-white/75">
                {paymentPolicyText.privacyText}
              </p>

              <p className="mt-4 font-bold text-white">
                {paymentPolicyText.refundTitle}
              </p>

              <p className="mt-2 text-white/75">
                {paymentPolicyText.refundText1}
              </p>

              <p className="mt-2 text-white/75">
                {paymentPolicyText.refundText2}
              </p>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <input
                  type="checkbox"
                  checked={paymentTermsAccepted}
                  onChange={(event) =>
                    setPaymentTermsAccepted(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />

                <span className="text-sm font-semibold text-white">
                  {paymentPolicyText.acceptText}
                </span>
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <div className="flex items-center justify-between text-sm text-white/58">
                <span>{t.servicesToConfirm}</span>
                <span>{checkoutItems.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                <span>{t.totalSalePrice}</span>
                <span>
                  {formatPrice(
                    checkoutItems.reduce(
                      (sum, item) => sum + item.total_price,
                      0
                    ),
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
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
              >
                {loading ? t.sending : t.confirmPurchase}
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#080a0d]/96 shadow-[0_28px_120px_rgba(0,0,0,0.58)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:max-h-[92vh] sm:rounded-[32px]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="text-sm font-black text-white/80">
                {smmFixedText.orderInfoTitle}
              </p>

              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {t.close}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <h2 className="text-2xl font-black text-white">
                {t.orderConfirmedTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {t.orderConfirmedDesc}
              </p>

              <div className="mt-5 space-y-3">
                {createdOrderNumbers.map((number) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/14 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                  >
                    <p className="text-sm text-white/60">
                      {t.yourOrderNumber}
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      {number}
                    </p>
                  </div>
                ))}
              </div>

              {createdPaymentInfo?.paymentMethod === "balance" ? (
                <div className="mt-5 rounded-2xl border border-white/14 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <p className="text-sm font-bold text-white">
                    {smmFixedText.balancePaymentCompleted}
                  </p>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/72">
                    <p>
                      Sipariş tutarı{" "}
                      <span className="font-bold text-white">
                        {formatPrice(
                          createdPaymentInfo.totalAmount,
                          createdPaymentInfo.currency
                        )}
                      </span>{" "}
                      olarak {createdPaymentInfo.currency} bakiyenden düşüldü.
                    </p>

                    <p className="mt-2 text-white/64">
                      {smmFixedText.orderTrackingAccountText}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href="/hesabim"
                      className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:bg-white/90"
                    >
                      {smmFixedText.goAccount}
                    </a>

                    <a
                      href="/hesabim/siparisler"
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      {smmFixedText.viewOrders}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <p className="text-sm font-bold text-white">
                    {t.paymentStepTitle}
                  </p>

                  {createdPaymentInfo && (
                    <div className="mt-3 rounded-2xl border border-white/14 bg-white/[0.055] p-4 text-sm leading-6 text-white/72">
                      <p>
                        <span className="font-bold text-white">
                          Gönderen Ad Soyad:
                        </span>{" "}
                        {createdPaymentInfo.fullName}
                      </p>

                      <p>
                        <span className="font-bold text-white">
                          Ödenecek Tutar:
                        </span>{" "}
                        {formatPrice(
                          createdPaymentInfo.totalAmount,
                          createdPaymentInfo.currency
                        )}
                      </p>

                      <p>
                        <span className="font-bold text-white">
                          Ödeme Yöntemi:
                        </span>{" "}
                        {getPaymentMethodSupportLabel(
                          createdPaymentInfo.paymentMethod,
                          selectedLocale
                        )}
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {t.paymentStepDesc}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        createdPaymentInfo
                          ? buildTelegramLink(createdPaymentInfo, selectedLocale)
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-sky-400/20 bg-sky-400/15 px-5 py-3 text-center text-sm font-bold text-sky-100 shadow-[0_16px_38px_rgba(56,189,248,0.10)] transition hover:bg-sky-400/20"
                    >
                      {t.telegramPaymentInfo}
                    </a>

                    <a
                      href={
                        createdPaymentInfo
                          ? buildWhatsappLink(createdPaymentInfo, selectedLocale)
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.10)] transition hover:bg-white/90"
                    >
                      {t.whatsappPaymentInfo}
                    </a>
                  </div>
                </div>
              )}

              {createdPaymentInfo?.paymentMethod === "turkey_bank" && (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-bold text-white">
                    {smmFixedText.paymentDoneTitle}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-50/80">
                    {smmFixedText.paymentDoneDesc}
                  </p>

                  <button
                    type="button"
                    onClick={handlePaymentCompleted}
                    disabled={
                      paymentReviewLoading || Boolean(paymentReviewMessage)
                    }
                    className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                  >
                    {paymentReviewLoading
                      ? smmFixedText.paymentReviewLoading
                      : paymentReviewMessage
                        ? smmFixedText.paymentReviewDone
                        : smmFixedText.paymentCompletedButton}
                  </button>

                  {paymentReviewMessage && (
                    <div className="mt-3 rounded-2xl border border-white/14 bg-white/[0.055] px-4 py-3 text-sm text-white">
                      {paymentReviewMessage}
                    </div>
                  )}

                  {paymentReviewError && (
                    <div className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      {paymentReviewError}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#080a0d]/96 px-4 py-3 backdrop-blur-xl sm:px-5">
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90"
              >
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

type PremiumShellCardProps = {
  children: React.ReactNode;
  className?: string;
};

const PremiumShellCard = React.forwardRef<HTMLDivElement, PremiumShellCardProps>(
  function PremiumShellCard({ children, className = "" }, ref) {
    return (
      <section
        ref={ref}
        className={`relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080a0d]/92 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl ${className}`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-white/[0.025] blur-3xl" />
        <div className="relative">{children}</div>
      </section>
    );
  }
);

function SectionEyebrow({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/42">
        {title}
      </p>

      {description ? (
        <p className="mt-1 text-sm leading-6 text-white/52">{description}</p>
      ) : null}
    </div>
  );
}