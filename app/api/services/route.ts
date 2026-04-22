import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapDbServiceToOrderItem, type DbServiceRow } from "@/lib/services";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");

    let query = supabase
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
      .order("panel_service_id", { ascending: true });

    if (platform) query = query.eq("platform", platform);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const items = ((data || []) as DbServiceRow[]).map(mapDbServiceToOrderItem);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu",
      },
      { status: 500 }
    );
  }
}