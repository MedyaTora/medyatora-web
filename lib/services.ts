import { createClient } from "@supabase/supabase-js";

export type OrderServiceItem = {
  id: number;
  siteCode: number;
  platform: string;
  category: string;
  title: string;
  subtitle: string;
  guarantee: boolean;
  guaranteeLabel: string;
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
  level: string;
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

export function mapDbServiceToOrderItem(row: DbServiceRow): OrderServiceItem {
  const usdCost = safeNumber(row.usd_cost_price);
  const tlCost = safeNumber(row.tl_cost_price);
  const tlSale = safeNumber(row.tl_sale_price);
  const usdSale = safeNumber(row.usd_sale_price);
  const rubSale = safeNumber(row.rub_sale_price);

  const rubCost =
    usdCost > 0 && usdSale > 0 && rubSale > 0
      ? Number(((usdCost * rubSale) / usdSale).toFixed(4))
      : 0;

  return {
    id: row.panel_service_id,
    siteCode: safeNumber(row.site_code),
    platform: row.platform || "",
    category: row.category || "",
    title: row.clean_title || "Servis",
    subtitle: row.subtitle || "",
    guarantee: Boolean(row.guarantee),
    guaranteeLabel: row.guarantee_label || "Garantisiz",
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
    level: row.level || "Temel",
    description: row.description || "",
    originalName: row.original_name || "",
  };
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

function matchesRegion(originalName: string, region: RegionType) {
  const text = normalizeText(originalName);

  const turkKeywords = [
    "turk",
    "turkiye",
    "turkish",
    "turkiye hedefli",
    "turk hedefli",
  ];

  const rusKeywords = [
    "rus",
    "russian",
    "rusya",
    "russia",
  ];

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

  if (region === "turk") {
    return includesAny(text, turkKeywords);
  }

  if (region === "rus") {
    return includesAny(text, rusKeywords);
  }

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

  return rows
  .filter((row) => matchesRegion(row.original_name, region))
  .filter((row) => matchesCountry(row.original_name, country))
  .map(mapDbServiceToOrderItem)
  .filter(
    (item) =>
      item.salePriceTl > 0 &&
      item.salePriceUsd > 0 &&
      item.salePriceRub > 0 &&
      item.min > 0 &&
      item.max > 0
  );
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