import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapDbServiceToOrderItem, type DbServiceRow } from "@/lib/services";

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
]);

const ALLOWED_CATEGORIES = new Set([
  "takipci",
  "begeni",
  "yorum",
  "izlenme",
  "kaydetme",
  "abone",
  "uye",
  "reaksiyon",
  "retweet",
]);

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Supabase environment variables eksik." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform")?.trim() || null;
    const category = searchParams.get("category")?.trim() || null;

    if (platform && !ALLOWED_PLATFORMS.has(platform)) {
      return NextResponse.json(
        { error: "Geçersiz platform parametresi." },
        { status: 400 }
      );
    }

    if (category && !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "Geçersiz kategori parametresi." },
        { status: 400 }
      );
    }

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

    if (platform) {
      query = query.eq("platform", platform);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Servisler alınamadı." },
        { status: 400 }
      );
    }

    const rows = ((data ?? []) as DbServiceRow[]).filter(
      (item) =>
        item.platform &&
        item.category &&
        typeof item.min === "number" &&
        typeof item.max === "number"
    );
    
    const items = rows
    .map(mapDbServiceToOrderItem)
    .filter(
      (item) =>
        item.salePriceTl > 0 &&
        item.salePriceUsd > 0 &&
        item.salePriceRub > 0 &&
        item.min > 0 &&
        item.max > 0
    );

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        items,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}