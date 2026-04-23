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

export function mapDbServiceToOrderItem(row: DbServiceRow): OrderServiceItem {
  const usdCost = Number(row.usd_cost_price || 0);
  const tlCost = Number(row.tl_cost_price || 0);

  const rubCost =
    row.usd_sale_price && row.rub_sale_price
      ? Number(
          ((usdCost * Number(row.rub_sale_price || 0)) /
            Number(row.usd_sale_price || 1)).toFixed(4)
        )
      : 0;

  return {
    id: row.panel_service_id,
    siteCode: row.site_code,
    platform: row.platform,
    category: row.category,
    title: row.clean_title,
    subtitle: row.subtitle,
    guarantee: row.guarantee,
    guaranteeLabel: row.guarantee_label,
    min: row.min,
    max: row.max,

    salePrice: Number(row.tl_sale_price || 0),
    salePriceTl: Number(row.tl_sale_price || 0),
    salePriceUsd: Number(row.usd_sale_price || 0),
    salePriceRub: Number(row.rub_sale_price || 0),

    costPriceTl: tlCost,
    costPriceUsd: usdCost,
    costPriceRub: rubCost,

    speed: row.speed || "Yoğunluğa Göre Değişir",
    level: row.level || "Temel",
    description: row.description || "",
    originalName: row.original_name,
  };
}

export type ServiceCardItem = OrderServiceItem;

type GetInstagramServicesParams = {
  serviceSlug: string;
  region: "turk" | "rus" | "yabanci";
  country?: string;
};

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

function matchesRegion(originalName: string, region: "turk" | "rus" | "yabanci") {
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

export async function getInstagramServices({
  serviceSlug,
  region,
  country,
}: GetInstagramServicesParams): Promise<ServiceCardItem[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    .eq("platform", "instagram")
    .eq("category", serviceSlug)
    .order("panel_service_id", { ascending: true });

  if (error) {
    console.error("Instagram servisleri çekilemedi:", error.message);
    return [];
  }

  const rows = (data || []) as DbServiceRow[];

  return rows
    .filter((row) => matchesRegion(row.original_name, region))
    .filter((row) => matchesCountry(row.original_name, country))
    .map(mapDbServiceToOrderItem);
}