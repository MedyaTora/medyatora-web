export type AppLocale = "tr" | "en" | "ru";

export function normalizeAppLocale(value: unknown): AppLocale {
  const locale = String(value || "").trim().toLowerCase();

  if (locale === "tr" || locale === "en" || locale === "ru") {
    return locale;
  }

  return "tr";
}

const categoryMap: Record<string, Record<AppLocale, string>> = {
  takipci: { tr: "Takipçi", en: "Followers", ru: "Подписчики" },
  begeni: { tr: "Beğeni", en: "Likes", ru: "Лайки" },
  izlenme: { tr: "İzlenme", en: "Views", ru: "Просмотры" },
  yorum: { tr: "Yorum", en: "Comments", ru: "Комментарии" },
  kaydetme: { tr: "Kaydetme", en: "Saves", ru: "Сохранения" },
  paylasim: { tr: "Paylaşım", en: "Shares", ru: "Репосты" },
  abone: { tr: "Abone", en: "Subscribers", ru: "Подписчики" },
  uye: { tr: "Üye", en: "Members", ru: "Участники" },
  reaksiyon: { tr: "Reaksiyon", en: "Reactions", ru: "Реакции" },
  oylama: { tr: "Oylama", en: "Votes", ru: "Голоса" },
  profil_ziyareti: { tr: "Profil Ziyareti", en: "Profile Visits", ru: "Посещения профиля" },
  story_izlenme: { tr: "Story İzlenme", en: "Story Views", ru: "Просмотры Stories" },
  reels_izlenme: { tr: "Reels İzlenme", en: "Reels Views", ru: "Просмотры Reels" },
  reels_begeni: { tr: "Reels Beğeni", en: "Reels Likes", ru: "Лайки Reels" },
  reels_yorum: { tr: "Reels Yorum", en: "Reels Comments", ru: "Комментарии Reels" },
  shorts_izlenme: { tr: "Shorts İzlenme", en: "Shorts Views", ru: "Просмотры Shorts" },
  shorts_begeni: { tr: "Shorts Beğeni", en: "Shorts Likes", ru: "Лайки Shorts" },
  canli_yayin: { tr: "Canlı Yayın", en: "Live Stream", ru: "Прямой эфир" },
  retweet: { tr: "Retweet", en: "Retweet", ru: "Ретвит" },
  bookmark: { tr: "Yer İşareti", en: "Bookmarks", ru: "Закладки" },
  favori: { tr: "Favori", en: "Favorites", ru: "Избранное" },
};

const paymentMethodMap: Record<string, Record<AppLocale, string>> = {
  balance: { tr: "MedyaTora Bakiyesi", en: "MedyaTora Balance", ru: "Баланс MedyaTora" },
  turkey_bank: { tr: "Havale / EFT", en: "Bank Transfer / EFT", ru: "Банковский перевод / EFT" },
  bank_transfer: { tr: "Havale / EFT", en: "Bank Transfer / EFT", ru: "Банковский перевод / EFT" },
  support: { tr: "Destek ile ödeme", en: "Payment via Support", ru: "Оплата через поддержку" },
  pending_payment: { tr: "Ödeme bekleniyor", en: "Payment Pending", ru: "Ожидает оплаты" },
};

const speedMap: Record<string, Record<AppLocale, string>> = {
  "yoğunluğa göre değişir": {
    tr: "Yoğunluğa Göre Değişir",
    en: "Depends on load",
    ru: "Зависит от нагрузки",
  },
  "yogunluga gore degisir": {
    tr: "Yoğunluğa Göre Değişir",
    en: "Depends on load",
    ru: "Зависит от нагрузки",
  },
  "0-24 saat": { tr: "0-24 Saat", en: "0-24 hours", ru: "0-24 часа" },
  "1-6 saat": { tr: "1-6 Saat", en: "1-6 hours", ru: "1-6 часов" },
  "1-12 saat": { tr: "1-12 Saat", en: "1-12 hours", ru: "1-12 часов" },
  "10-50b/daylük": { tr: "10-50B/Günlük", en: "10-50K/day", ru: "10-50 тыс./день" },
};

const serviceLevelMap: Record<string, Record<AppLocale, string>> = {
  core: { tr: "Core", en: "Core", ru: "Core" },
  plus: { tr: "Plus", en: "Plus", ru: "Plus" },
  prime: { tr: "Prime", en: "Prime", ru: "Prime" },
};

const qualityDescriptionMap: Record<string, Record<AppLocale, string>> = {
  core: {
    tr: "🟢 CORE: Ekonomik ve temel görünüm isteyen kullanıcılar için uygundur. Daha uygun fiyatlı başlangıç yapmak isteyenler için sade bir hizmet seviyesidir.",
    en: "🟢 CORE: Suitable for users who want an affordable and basic appearance. It is a simple service level for those who want to start at a lower cost.",
    ru: "🟢 CORE: Подходит для пользователей, которым нужен доступный и базовый вариант. Это простой уровень услуги для старта с более низкой стоимостью.",
  },
  plus: {
    tr: "🟣 PLUS: Fiyat, kalite ve güvenilirlik dengesini korumak isteyen kullanıcılar için önerilir. Daha dengeli teslimat, daha stabil performans ve daha gerçekçi bir artış yapısı sunmayı hedefler.",
    en: "🟣 PLUS: Recommended for users who want a balance between price, quality, and reliability. It aims to provide more balanced delivery, more stable performance, and a more natural growth structure.",
    ru: "🟣 PLUS: Рекомендуется пользователям, которым нужен баланс цены, качества и надежности. Уровень ориентирован на более стабильное выполнение, сбалансированную доставку и более естественный рост.",
  },
  prime: {
    tr: "🔵 PRIME: En yüksek kalite, daha güvenli ilerleyiş ve daha güçlü görünüm isteyen kullanıcılar için önerilir. Daha premium hizmet seviyesi olarak konumlandırılır.",
    en: "🔵 PRIME: Recommended for users who want the highest quality, safer progress, and a stronger appearance. It is positioned as a more premium service level.",
    ru: "🔵 PRIME: Рекомендуется пользователям, которым нужно максимальное качество, более безопасное продвижение и более сильный внешний вид. Это более премиальный уровень услуги.",
  },
};

function normalizeKey(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i");
}

export function getLocalizedCategory(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();
  const key = normalizeKey(raw);

  return categoryMap[key]?.[locale] || raw || "-";
}

export function getLocalizedPaymentMethod(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();
  const key = normalizeKey(raw);

  if (raw === "MedyaTora Bakiyesi") return paymentMethodMap.balance[locale];
  if (raw === "Havale / EFT") return paymentMethodMap.turkey_bank[locale];
  if (raw === "Destek ile ödeme") return paymentMethodMap.support[locale];

  return paymentMethodMap[key]?.[locale] || raw || "-";
}

export function getLocalizedSpeed(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();
  const key = normalizeKey(raw);

  return speedMap[key]?.[locale] || raw || "-";
}

export function getLocalizedServiceLevel(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();
  const key = normalizeKey(raw);

  return serviceLevelMap[key]?.[locale] || raw || "-";
}

export function getLocalizedQualityDescription(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();
  const key = normalizeKey(raw);

  return qualityDescriptionMap[key]?.[locale] || "";
}

export function getLocalizedGuarantee(value: unknown, locale: AppLocale) {
  const raw = String(value || "").trim();

  if (!raw) return "-";

  const lower = normalizeKey(raw);

  if (
    lower.includes("garantisiz") ||
    lower.includes("no guarantee") ||
    lower.includes("без гарантии")
  ) {
    if (locale === "en") return "No Guarantee";
    if (locale === "ru") return "Без гарантии";
    return "Garantisiz";
  }

  const dayMatch = raw.match(/(\d+)\s*(gün|gun|day|days|день|дней)?/i);

  if (dayMatch?.[1]) {
    const days = dayMatch[1];

    if (locale === "en") return `${days} Day Guaranteed`;
    if (locale === "ru") return `Гарантия ${days} дней`;
    return `${days} Gün Garantili`;
  }

  if (
    lower.includes("lifetime") ||
    lower.includes("ömür") ||
    lower.includes("omur") ||
    lower.includes("365")
  ) {
    if (locale === "en") return "365 Day Guaranteed";
    if (locale === "ru") return "Гарантия 365 дней";
    return "365 Gün Garantili";
  }

  if (lower.includes("garantili") || lower.includes("guaranteed")) {
    if (locale === "en") return "Guaranteed";
    if (locale === "ru") return "С гарантией";
    return "Garantili";
  }

  return raw;
}
