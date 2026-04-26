import { createClient } from "@supabase/supabase-js";

export type QualityLevel = "Core" | "Plus" | "Prime";

export type OrderServiceItem = {
  id: number;
  siteCode: number;
  platform: string;
  category: string;
  title: string;
  subtitle: string;
  guarantee: boolean;
  guaranteeLabel: string;
  guaranteeDays: number | null;
  min: number;
  max: number;

  salePrice: number;
  salePriceTl: number;
  salePriceUsd: number;
  salePriceRub: number;

  costPriceTl: number;
  costPriceUsd: number;
  costPriceRub: number;

  speed: string;
  level: QualityLevel;
  qualityScore: number;
  sortScore: number;
  regionLabel: string;
  description: string;
  originalName: string;
};

export type DbServiceRow = {
  id: number;
  panel_service_id: number;
  site_code: number;
  platform: string;
  category: string;
  original_name: string;
  clean_title: string;
  subtitle: string;
  guarantee: boolean;
  guarantee_label: string;
  min: number;
  max: number;
  speed: string;
  level: string;
  description: string;
  tl_cost_price: number;
  usd_cost_price: number;
  tl_sale_price: number;
  usd_sale_price: number;
  rub_sale_price: number;
};

export type ServiceCardItem = OrderServiceItem;

type RegionType = "turk" | "rus" | "yabanci";

type GetPlatformServicesParams = {
  platform: string;
  serviceSlug: string;
  region: RegionType;
  country?: string;
};

type GetInstagramServicesParams = {
  serviceSlug: string;
  region: RegionType;
  country?: string;
};

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function safeNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getPlatformLabel(platform: string) {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    telegram: "Telegram",
    facebook: "Facebook",
    x: "X",
    spotify: "Spotify",
    twitch: "Twitch",
    kick: "Kick",
    discord: "Discord",
    snapchat: "Snapchat",
    pinterest: "Pinterest",
    linkedin: "LinkedIn",
    reddit: "Reddit",
    threads: "Threads",
    "apple-music": "Apple Music",
    soundcloud: "SoundCloud",
    audiomack: "Audiomack",
    deezer: "Deezer",
    shazam: "Shazam",
    boomplay: "Boomplay",
    steam: "Steam",
    xbox: "Xbox",
    vk: "VK",
    rutube: "Rutube",
    "ok-ru": "OK.ru",
    dzen: "Dzen",
    github: "GitHub",
    tumblr: "Tumblr",
    bluesky: "Bluesky",
    vimeo: "Vimeo",
    "google-review": "Google Review",
    "google-maps": "Google Maps",
    whatsapp: "WhatsApp",
    other: "Diğer",
  };

  return labels[platform] || platform.replace(/-/g, " ");
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
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

  return labels[category] || category.replace(/_/g, " ");
}

function detectRegionLabel(row: DbServiceRow) {
  const text = normalizeText(`${row.original_name || ""} ${row.clean_title || ""}`);

  if (
    includesAny(text, [
      "turk",
      "turkiye",
      "turkish",
      "turkey",
      "tr ",
      " tr",
      "🇹🇷",
    ])
  ) {
    return "TR 🇹🇷";
  }

  if (
    includesAny(text, [
      "rus",
      "rusya",
      "russian",
      "russia",
      "ru ",
      " ru",
      "🇷🇺",
    ])
  ) {
    return "RU 🇷🇺";
  }

  if (includesAny(text, ["usa", "abd", "amerika", "united states"])) return "US 🇺🇸";
  if (includesAny(text, ["almanya", "germany"])) return "DE 🇩🇪";
  if (includesAny(text, ["fransa", "france"])) return "FR 🇫🇷";
  if (includesAny(text, ["hindistan", "india"])) return "IN 🇮🇳";
  if (includesAny(text, ["italya", "italy"])) return "IT 🇮🇹";
  if (includesAny(text, ["kanada", "canada"])) return "CA 🇨🇦";
  if (includesAny(text, ["brezilya", "brazil"])) return "BR 🇧🇷";
  if (includesAny(text, ["avrupa", "europe", "eu"])) return "EU 🇪🇺";
  if (includesAny(text, ["azerbaycan", "azerbaijan"])) return "AZ 🇦🇿";
  if (includesAny(text, ["ispanya", "spain"])) return "ES 🇪🇸";
  if (includesAny(text, ["avustralya", "australia"])) return "AU 🇦🇺";
  if (includesAny(text, ["arap", "arab", "uae", "dubai", "saudi"])) return "AR 🌍";

  return "Global 🌍";
}

function detectGuaranteeDays(row: DbServiceRow): number | null {
  const text = normalizeText(
    `${row.guarantee_label || ""} ${row.original_name || ""} ${row.clean_title || ""}`
  );

  if (
    includesAny(text, [
      "omur boyu",
      "lifetime",
      "life time",
      "non drop",
      "nondrop",
      "no drop",
      "dusmez",
      "dusus olmaz",
      "düşmez",
      "düşüş olmaz",
    ])
  ) {
    return 365;
  }

  const match = text.match(/(\d+)\s*(gun|gün|day|days|день|дней)/i);

  if (match?.[1]) {
    const days = Number(match[1]);
    if (Number.isFinite(days) && days > 0) {
      return days >= 365 ? 365 : days;
    }
  }

  return null;
}

function getGuaranteeLabel(row: DbServiceRow) {
  const days = detectGuaranteeDays(row);

  if (days) return `${days} Gün Garantili`;

  if (row.guarantee || normalizeText(row.guarantee_label).includes("garanti")) {
    return row.guarantee_label && row.guarantee_label !== "Garantisiz"
      ? row.guarantee_label
      : "Garantili";
  }

  return "Garantisiz";
}

function getGuaranteeScore(row: DbServiceRow) {
  const days = detectGuaranteeDays(row);

  if (!row.guarantee && !days) return 0;
  if (!days) return 12;

  if (days >= 365) return 35;
  if (days >= 180) return 30;
  if (days >= 90) return 25;
  if (days >= 60) return 20;
  if (days >= 30) return 15;
  if (days >= 15) return 10;
  if (days >= 7) return 8;

  return 5;
}

function getQualitySignalScore(row: DbServiceRow) {
  const text = normalizeText(
    `${row.original_name || ""} ${row.clean_title || ""} ${row.level || ""} ${row.description || ""}`
  );

  let score = 0;

  if (includesAny(text, ["vip", "premium", "exclusive", "best"])) score += 35;
  if (includesAny(text, ["uhq", "ultra high", "ultra quality"])) score += 30;
  if (includesAny(text, ["hq", "high quality", "yuksek kalite", "yüksek kalite"])) score += 20;
  if (includesAny(text, ["verified", "dogrulanmis", "doğrulanmış"])) score += 25;
  if (includesAny(text, ["real", "gercek", "gerçek"])) score += 15;
  if (includesAny(text, ["organic", "organik", "natural", "dogal", "doğal"])) score += 25;
  if (includesAny(text, ["active", "aktif"])) score += 10;
  if (includesAny(text, ["bot", "cheap", "ucuz"])) score -= 8;

  return score;
}

function getSpeedScore(row: DbServiceRow) {
  const text = normalizeText(`${row.speed || ""} ${row.original_name || ""}`);

  if (includesAny(text, ["instant", "anlik", "anlık", "fast", "hizli", "hızlı"])) {
    return 10;
  }

  if (includesAny(text, ["slow", "yavas", "yavaş"])) {
    return -5;
  }

  return 0;
}

function getPriceScore(index: number, total: number) {
  if (total <= 1) return 20;

  const ratio = index / (total - 1);

  if (ratio <= 0.34) return 0;
  if (ratio <= 0.67) return 20;
  return 40;
}

function getQualityLevel(score: number): QualityLevel {
  if (score >= 60) return "Prime";
  if (score >= 25) return "Plus";
  return "Core";
}

function getLevelSortScore(level: QualityLevel) {
  if (level === "Core") return 10;
  if (level === "Plus") return 20;
  return 30;
}

function buildServiceTitle(row: DbServiceRow, level: QualityLevel, guaranteeLabel: string, regionLabel: string) {
  const platformLabel = getPlatformLabel(row.platform || "");
  const categoryLabel = getCategoryLabel(row.category || "");

  return `${platformLabel} ${categoryLabel} - ${guaranteeLabel} ${regionLabel} ${level} Paket`;
}

function buildQualityDescription(level: QualityLevel) {
  if (level === "Core") {
    return "🟠 CORE: Temel başlangıç seviyesidir. Düşük bütçeyle görünürlük kazanmak isteyen kullanıcılar için hazırlanmıştır. Teslimat hızı, kalıcılık ve yoğunluk durumu seçilen servise göre değişebilir.";
  }

  if (level === "Plus") {
    return "🟣 PLUS: Fiyat, kalite ve güvenilirlik dengesini korumak isteyen kullanıcılar için önerilir. Daha dengeli teslimat, daha stabil performans ve daha gerçekçi bir artış yapısı sunmayı hedefler.";
  }

  return "💠 PRIME: Daha güçlü, daha stabil ve daha premium teslimat isteyen kullanıcılar için hazırlanmış üst seviye pakettir. Genellikle daha yüksek kalite, daha iyi kalıcılık ve daha dengeli teslimat akışı hedeflenir.";
}

function buildGuaranteeDescription(guaranteeLabel: string, guaranteeDays: number | null) {
  if (guaranteeLabel === "Garantisiz") {
    return "Bu paket garantisizdir. Teslimat sonrası düşüş, yavaşlama veya dalgalanma yaşanabilir; yeniden gönderim taahhüdü bulunmaz.";
  }

  if (guaranteeDays) {
    return `Bu pakette ${guaranteeDays} gün garanti desteği bulunur. Garanti süresi içinde uygun düşüşlerde destek sağlanabilir.`;
  }

  return "Bu pakette garanti desteği bulunur. Garanti kapsamı seçilen servisin şartlarına göre değerlendirilir.";
}

function buildCategoryDescription(category: string) {
  const categoryLabel = getCategoryLabel(category);

  const map: Record<string, string> = {
    takipci:
      "Takipçi hizmetlerinde profilin herkese açık olması gerekir. Sipariş devam ederken kullanıcı adı değiştirilmemelidir.",
    begeni:
      "Beğeni hizmetlerinde gönderi, reels, video veya içerik bağlantısının doğru girilmesi gerekir. İçerik sipariş tamamlanana kadar silinmemelidir.",
    yorum:
      "Yorum hizmetlerinde içerik bağlantısı doğru girilmelidir. Yorumların görünmesi için gönderinin herkese açık olması gerekir.",
    izlenme:
      "İzlenme hizmetlerinde video, reels, story veya canlı yayın bağlantısının erişilebilir olması gerekir. Teslimat hızı platform yoğunluğuna göre değişebilir.",
    kaydetme:
      "Kaydetme hizmetlerinde gönderi bağlantısı doğru girilmelidir. Bu hizmet özellikle içerik etkileşimini desteklemek isteyen kullanıcılar için uygundur.",
    paylasim:
      "Paylaşım hizmetlerinde içerik bağlantısı doğru girilmelidir. Sipariş süresince içerik silinmemeli veya gizlenmemelidir.",
    repost:
      "Repost hizmetlerinde paylaşım bağlantısının doğru ve herkese açık olması gerekir.",
    retweet:
      "Retweet hizmetlerinde paylaşım bağlantısının doğru ve herkese açık olması gerekir.",
    abone:
      "Abone hizmetlerinde kanal bağlantısı doğru girilmelidir. Hedef kanalın erişilebilir olması gerekir.",
    uye:
      "Üye hizmetlerinde kanal, grup veya topluluk bağlantısı doğru girilmelidir. Hedef bağlantının erişilebilir olması gerekir.",
    reaksiyon:
      "Reaksiyon hizmetlerinde gönderi, mesaj, kanal veya içerik bağlantısı doğru girilmelidir. Platforma göre reaksiyon türleri değişebilir.",
    story_izlenme:
      "Story izlenme hizmetlerinde hikayenin erişilebilir olması gerekir. Story süresi dolmadan sipariş verilmesi önemlidir.",
    reels_izlenme:
      "Reels izlenme hizmetlerinde reels bağlantısının doğru girilmesi ve içeriğin herkese açık olması gerekir.",
    reels_begeni:
      "Reels beğeni hizmetlerinde reels bağlantısının doğru girilmesi ve içeriğin herkese açık olması gerekir.",
    reels_yorum:
      "Reels yorum hizmetlerinde reels bağlantısının doğru girilmesi ve içeriğin herkese açık olması gerekir.",
    shorts_izlenme:
      "Shorts izlenme hizmetlerinde video bağlantısının doğru girilmesi ve içeriğin erişilebilir olması gerekir.",
    shorts_begeni:
      "Shorts beğeni hizmetlerinde video bağlantısının doğru girilmesi ve içeriğin erişilebilir olması gerekir.",
    canli_yayin:
      "Canlı yayın hizmetlerinde yayın bağlantısının doğru girilmesi ve yayın süresince erişilebilir olması gerekir.",
    profil_ziyareti:
      "Profil ziyareti hizmetlerinde profil bağlantısının doğru girilmesi ve profilin erişilebilir olması gerekir.",
    sayfa_begenisi:
      "Sayfa beğenisi hizmetlerinde sayfa bağlantısının doğru girilmesi gerekir.",
    grup_uyesi:
      "Grup üyesi hizmetlerinde grup bağlantısının doğru girilmesi ve grubun erişilebilir olması gerekir.",
    oylama:
      "Oylama hizmetlerinde anket veya oylama bağlantısının doğru girilmesi gerekir.",
    dinlenme:
      "Dinlenme hizmetlerinde şarkı, playlist veya içerik bağlantısının doğru girilmesi gerekir.",
  };

  return (
    map[category] ||
    `${categoryLabel} hizmetinde hedef bağlantının doğru ve erişilebilir olması gerekir.`
  );
}

function buildServiceDescription(
  row: DbServiceRow,
  level: QualityLevel,
  guaranteeLabel: string,
  guaranteeDays: number | null
) {
  return [
    buildQualityDescription(level),
    buildGuaranteeDescription(guaranteeLabel, guaranteeDays),
    buildCategoryDescription(row.category),
  ].join("\n\n");
}

function buildOrderItem(row: DbServiceRow, qualityScore: number, priceScore: number): OrderServiceItem {
  const usdCost = safeNumber(row.usd_cost_price);
  const tlCost = safeNumber(row.tl_cost_price);
  const tlSale = safeNumber(row.tl_sale_price);
  const usdSale = safeNumber(row.usd_sale_price);
  const rubSale = safeNumber(row.rub_sale_price);

  const rubCost =
    usdCost > 0 && usdSale > 0 && rubSale > 0
      ? Number(((usdCost * rubSale) / usdSale).toFixed(4))
      : 0;

  const guaranteeLabel = getGuaranteeLabel(row);
  const guaranteeDays = detectGuaranteeDays(row);
  const level = getQualityLevel(qualityScore);
  const regionLabel = detectRegionLabel(row);
  const sortScore = getLevelSortScore(level) * 100000 + tlSale;

  return {
    id: row.panel_service_id,
    siteCode: safeNumber(row.site_code),
    platform: row.platform || "",
    category: row.category || "",
    title: buildServiceTitle(row, level, guaranteeLabel, regionLabel),
    subtitle: row.subtitle || "",
    guarantee: guaranteeLabel !== "Garantisiz",
    guaranteeLabel,
    guaranteeDays,
    min: safeNumber(row.min),
    max: safeNumber(row.max),

    salePrice: tlSale,
    salePriceTl: tlSale,
    salePriceUsd: usdSale,
    salePriceRub: rubSale,

    costPriceTl: tlCost,
    costPriceUsd: usdCost,
    costPriceRub: rubCost,

    speed: row.speed || "Yoğunluğa Göre Değişir",
    level,
    qualityScore,
    sortScore,
    regionLabel,
    description: buildServiceDescription(row, level, guaranteeLabel, guaranteeDays),
    originalName: row.original_name || "",
  };
}

function getBaseQualityScore(row: DbServiceRow, priceScore: number) {
  return (
    priceScore +
    getGuaranteeScore(row) +
    getQualitySignalScore(row) +
    getSpeedScore(row)
  );
}

export function mapDbServiceToOrderItem(row: DbServiceRow): OrderServiceItem {
  const qualityScore = getBaseQualityScore(row, 20);
  return buildOrderItem(row, qualityScore, 20);
}

export function mapDbServicesToRankedOrderItems(rows: DbServiceRow[]): OrderServiceItem[] {
  const groups = new Map<string, DbServiceRow[]>();

  for (const row of rows) {
    const key = `${row.platform || "other"}::${row.category || "other"}`;
    const current = groups.get(key) || [];
    current.push(row);
    groups.set(key, current);
  }

  const items: OrderServiceItem[] = [];

  for (const groupRows of groups.values()) {
    const sortedRows = [...groupRows].sort(
      (a, b) => safeNumber(a.tl_sale_price) - safeNumber(b.tl_sale_price)
    );

    sortedRows.forEach((row, index) => {
      const priceScore = getPriceScore(index, sortedRows.length);
      const qualityScore = getBaseQualityScore(row, priceScore);
      items.push(buildOrderItem(row, qualityScore, priceScore));
    });
  }

  return items.sort((a, b) => {
    if (a.platform !== b.platform) return a.platform.localeCompare(b.platform, "tr");
    if (a.category !== b.category) return a.category.localeCompare(b.category, "tr");
    if (a.sortScore !== b.sortScore) return a.sortScore - b.sortScore;
    return a.salePriceTl - b.salePriceTl;
  });
}

function matchesRegion(originalName: string, region: RegionType) {
  const text = normalizeText(originalName);

  const turkKeywords = [
    "turk",
    "turkiye",
    "turkish",
    "turkiye hedefli",
    "turk hedefli",
  ];

  const rusKeywords = ["rus", "russian", "rusya", "russia"];

  const foreignKeywords = [
    "abd",
    "amerika",
    "usa",
    "united states",
    "almanya",
    "germany",
    "fransa",
    "france",
    "hindistan",
    "india",
    "italya",
    "italy",
    "kanada",
    "canada",
    "brezilya",
    "brazil",
    "arap",
    "arab",
    "avrupa",
    "europe",
    "pakistan",
    "iran",
    "ispanya",
    "spain",
    "avustralya",
    "australia",
    "azerbaycan",
    "azerbaijan",
    "yabanci",
    "foreign",
    "global",
    "worldwide",
    "international",
  ];

  if (region === "turk") return includesAny(text, turkKeywords);
  if (region === "rus") return includesAny(text, rusKeywords);

  if (region === "yabanci") {
    const isTurk = includesAny(text, turkKeywords);
    const isRus = includesAny(text, rusKeywords);
    const isForeign = includesAny(text, foreignKeywords);

    return isForeign || (!isTurk && !isRus);
  }

  return true;
}

function matchesCountry(originalName: string, country?: string) {
  if (!country) return true;

  const text = normalizeText(originalName);

  const countryKeywords: Record<string, string[]> = {
    abd: ["abd", "amerika", "usa", "united states"],
    almanya: ["almanya", "germany"],
    fransa: ["fransa", "france"],
    hindistan: ["hindistan", "india"],
    italya: ["italya", "italy"],
    kanada: ["kanada", "canada"],
    brezilya: ["brezilya", "brazil"],
    arap: ["arap", "arab", "uae", "dubai", "saudi"],
    avrupa: ["avrupa", "europe", "eu"],
    pakistan: ["pakistan"],
    iran: ["iran"],
    ispanya: ["ispanya", "spain"],
    avustralya: ["avustralya", "australia"],
    azerbaycan: ["azerbaycan", "azerbaijan"],
  };

  const keywords = countryKeywords[country];
  if (!keywords) return true;

  return includesAny(text, keywords);
}

async function fetchServicesFromDb(params: {
  platform: string;
  category: string;
}): Promise<DbServiceRow[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      panel_service_id,
      site_code,
      platform,
      category,
      original_name,
      clean_title,
      subtitle,
      guarantee,
      guarantee_label,
      min,
      max,
      speed,
      level,
      description,
      tl_cost_price,
      usd_cost_price,
      tl_sale_price,
      usd_sale_price,
      rub_sale_price
    `)
    .eq("is_active", true)
    .eq("platform", params.platform)
    .eq("category", params.category)
    .order("panel_service_id", { ascending: true });

  if (error) {
    console.error("Servisler çekilemedi:", error.message);
    return [];
  }

  return (data || []) as DbServiceRow[];
}

export async function getPlatformServices({
  platform,
  serviceSlug,
  region,
  country,
}: GetPlatformServicesParams): Promise<ServiceCardItem[]> {
  const rows = await fetchServicesFromDb({
    platform,
    category: serviceSlug,
  });

  const filteredRows = rows
    .filter((row) => matchesRegion(row.original_name, region))
    .filter((row) => matchesCountry(row.original_name, country))
    .filter(
      (row) =>
        safeNumber(row.tl_sale_price) > 0 &&
        safeNumber(row.usd_sale_price) > 0 &&
        safeNumber(row.rub_sale_price) > 0 &&
        safeNumber(row.min) > 0 &&
        safeNumber(row.max) > 0
    );

  return mapDbServicesToRankedOrderItems(filteredRows);
}

export async function getInstagramServices({
  serviceSlug,
  region,
  country,
}: GetInstagramServicesParams): Promise<ServiceCardItem[]> {
  return getPlatformServices({
    platform: "instagram",
    serviceSlug,
    region,
    country,
  });
}