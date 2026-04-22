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