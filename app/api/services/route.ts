import { NextRequest, NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";
import {
  mapDbServicesToRankedOrderItems,
  type DbServiceRow,
} from "@/lib/services";

const ALLOWED_PLATFORMS = new Set([
  "instagram",
  "tiktok",
  "youtube",
  "telegram",
  "facebook",
  "x",
  "spotify",
  "twitch",
  "kick",
  "discord",
  "snapchat",
  "pinterest",
  "linkedin",
  "reddit",
  "threads",
  "apple-music",
  "soundcloud",
  "audiomack",
  "deezer",
  "shazam",
  "boomplay",
  "steam",
  "xbox",
  "vk",
  "rutube",
  "ok-ru",
  "dzen",
  "github",
  "tumblr",
  "bluesky",
  "vimeo",
  "google-review",
  "google-maps",
  "whatsapp",
  "other",
]);

const PAGE_SIZE = 20000;

function toNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function toBoolean(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform")?.trim() || null;
    const category = searchParams.get("category")?.trim() || null;

    if (platform && !ALLOWED_PLATFORMS.has(platform)) {
      return NextResponse.json(
        { error: "Geçersiz platform parametresi." },
        { status: 400 }
      );
    }

    const pool = getMysqlPool();

    const sqlParams: unknown[] = [];
    const conditions = [
      "is_active = 1",
      "public_visible = 1",
      "review_status = 'approved'",
      "product_type = 'single'",
      "public_page = 'paketler'",
      "tl_sale_price > 0",
      "usd_sale_price > 0",
      "rub_sale_price > 0",
      "min > 0",
      "max > 0",
    ];

    if (platform) {
      conditions.push("platform = ?");
      sqlParams.push(platform);
    }

    if (category) {
      conditions.push("category = ?");
      sqlParams.push(category);
    }

    sqlParams.push(PAGE_SIZE);

    const [dbRows] = await pool.query(
      `
      SELECT
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
        rub_sale_price,
        manual_title,
        manual_description,
        manual_sale_price_tl
      FROM services
      WHERE ${conditions.join(" AND ")}
      ORDER BY panel_service_id ASC
      LIMIT ?
      `,
      sqlParams
    );

    const allRows = (dbRows as any[]).map((row) => ({
      id: Number(row.id),
      panel_service_id: Number(row.panel_service_id),
      site_code: Number(row.site_code),
      platform: row.platform || "",
      category: row.category || "",
      original_name: row.original_name || "",
      clean_title: row.clean_title || "",
      subtitle: row.subtitle || "",
      guarantee: toBoolean(row.guarantee),
      guarantee_label: row.guarantee_label || "",
      min: toNumber(row.min),
      max: toNumber(row.max),
      speed: row.speed || "",
      level: row.level || "",
      description: row.description || "",
      tl_cost_price: toNumber(row.tl_cost_price),
      usd_cost_price: toNumber(row.usd_cost_price),
      tl_sale_price: toNumber(row.tl_sale_price),
      usd_sale_price: toNumber(row.usd_sale_price),
      rub_sale_price: toNumber(row.rub_sale_price),
      manual_title: row.manual_title,
      manual_description: row.manual_description,
      manual_sale_price_tl:
        row.manual_sale_price_tl === null ? null : toNumber(row.manual_sale_price_tl),
    })) as DbServiceRow[];

    const rows = allRows.filter((item) => {
      const itemPlatform = (item.platform || "").trim();
      const itemCategory = (item.category || "").trim();
      const cleanTitle = (item.clean_title || "").trim();
      const manualTitle = (item.manual_title || "").trim();
      const guaranteeLabel = (item.guarantee_label || "").trim();
      const subtitle = (item.subtitle || "").trim();

      const hasValidPlatform = itemPlatform.length > 0 && itemPlatform !== "other";
      const hasValidCategory = itemCategory.length > 0 && itemCategory !== "other";

      const hasVisibleTitle = cleanTitle.length > 0 || manualTitle.length > 0;
      const hasVisibleGuarantee = guaranteeLabel.length > 0;
      const hasVisibleCode = subtitle.length > 0 || Number(item.site_code) > 0;

      return (
        hasValidPlatform &&
        hasValidCategory &&
        hasVisibleTitle &&
        hasVisibleGuarantee &&
        hasVisibleCode &&
        Number(item.min) > 0 &&
        Number(item.max) > 0
      );
    });

    const items = mapDbServicesToRankedOrderItems(rows).filter((item) => {
      return (
        item.salePriceTl > 0 &&
        item.salePriceUsd > 0 &&
        item.salePriceRub > 0 &&
        item.min > 0 &&
        item.max > 0
      );
    });

    return NextResponse.json(
      {
        success: true,
        rawCount: rows.length,
        count: items.length,
        items,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("MySQL servisler alınamadı:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}
