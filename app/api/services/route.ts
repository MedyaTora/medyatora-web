import { NextResponse } from "next/server";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";
import {
  mapDbServiceToOrderItem,
  type DbServiceRow,
} from "@/lib/services";

function toNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function toBoolean(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export async function GET() {
  try {
    if (!hasMysqlConfig()) {
      console.error("[MedyaTora] /api/services MySQL env eksik.");

      return NextResponse.json(
        {
          success: false,
          error: "MySQL bağlantı ayarları eksik.",
          items: [],
        },
        { status: 503 }
      );
    }

    const pool = getMysqlPool();

    const [rows] = await pool.query(`
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
      WHERE is_active = 1
        AND public_visible = 1
        AND review_status = 'approved'
        AND product_type = 'single'
        AND (
          public_page = 'smmtora'
          OR public_page = 'paketler'
          OR public_page IS NULL
          OR public_page = ''
        )
        AND platform IS NOT NULL
        AND platform != ''
        AND category IS NOT NULL
        AND category != ''
        AND tl_sale_price > 0
        AND usd_sale_price > 0
        AND rub_sale_price > 0
        AND min > 0
        AND max > 0
      ORDER BY
        platform ASC,
        category ASC,
        tl_sale_price ASC,
        id ASC
      LIMIT 5000
    `);

    const items = (rows as any[]).map((row) => {
      const dbRow: DbServiceRow = {
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
        manual_title: row.manual_title || null,
        manual_description: row.manual_description || null,
        manual_sale_price_tl:
          row.manual_sale_price_tl === null
            ? null
            : toNumber(row.manual_sale_price_tl),
      };

      return mapDbServiceToOrderItem(dbRow);
    });

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        items,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[MedyaTora] /api/services error full:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          error?.sqlMessage ||
          error?.code ||
          JSON.stringify(error) ||
          "Servisler alınamadı.",
        code: error?.code || null,
        sqlMessage: error?.sqlMessage || null,
        stack: error?.stack || null,
        items: [],
      },
      { status: 500 }
    );
  }
}