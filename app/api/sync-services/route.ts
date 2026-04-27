import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import rawServices from "@/data/services.json";

type RawService = {
  service: number;
  name: string;
  type: string;
  rate: string;
  min: number;
  max: number;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
  category: string;
};

const services = rawServices as RawService[];

function getSearchText(service: RawService): string {
  return `${service.name} ${service.category}`.toLowerCase();
}

function normalizeGuarantee(service: RawService): string {
  const text = getSearchText(service);

  if (text.includes("7 gün") || text.includes("7 day")) return "7 Gün Garantili";
  if (text.includes("30 gün") || text.includes("30 day")) return "30 Gün Garantili";
  if (text.includes("60 gün") || text.includes("60 day")) return "60 Gün Garantili";
  if (text.includes("90 gün") || text.includes("90 day")) return "90 Gün Garantili";

  if (
    text.includes("ömür boyu") ||
    text.includes("lifetime") ||
    text.includes("non drop") ||
    text.includes("düşüş olmaz")
  ) {
    return "365 Gün Garantili";
  }

  return "Garantisiz";
}

function hasGuarantee(service: RawService): boolean {
  return normalizeGuarantee(service) !== "Garantisiz";
}

function convertUsdToTl(rate: string): number {
  const usd = Number(rate || 0);
  return usd * 44.89;
}

function calculateSalePrice(costTl: number): number {
  if (costTl <= 100) return Math.floor(costTl * 2.5);
  if (costTl <= 500) return Math.floor(costTl * 2);
  if (costTl <= 1000) return Math.floor(costTl * 1.8);
  if (costTl < 2000) return Math.floor(costTl + 400);
  if (costTl < 2500) return Math.floor(costTl + 500);
  if (costTl < 3000) return Math.floor(costTl + 600);
  if (costTl < 4000) return Math.floor(costTl + 700);
  if (costTl < 5000) return Math.floor(costTl + 800);
  if (costTl < 6000) return Math.floor(costTl + 900);
  if (costTl < 8000) return Math.floor(costTl + 1000);
  if (costTl < 10000) return Math.floor(costTl + 1200);
  if (costTl < 12000) return Math.floor(costTl + 1500);
  if (costTl < 50000) return Math.floor(costTl * 1.15);
  if (costTl < 200000) return Math.floor(costTl * 1.12);
  return Math.floor(costTl * 1.1);
}

function createSiteCode(realId: number): number {
  return realId + 987;
}

function detectPlatform(service: RawService): string {
  const text = getSearchText(service);

  if (text.includes("instagram")) return "instagram";
  if (text.includes("tiktok") || text.includes("tik tok")) return "tiktok";
  if (text.includes("youtube") || text.includes("yt")) return "youtube";
  if (text.includes("telegram")) return "telegram";
  if (text.includes("facebook") || text.includes("fb")) return "facebook";
  if (text.includes("twitter") || text.includes("x ")) return "x";

  return "other";
}

function detectCategory(service: RawService): string {
  const text = getSearchText(service);

  if (text.includes("takipçi") || text.includes("takipci") || text.includes("followers") || text.includes("follower")) {
    return "takipci";
  }

  if (text.includes("abone") || text.includes("subscriber") || text.includes("subscribers")) {
    return "abone";
  }

  if (text.includes("üye") || text.includes("uye") || text.includes("member") || text.includes("members")) {
    return "uye";
  }

  if (text.includes("beğeni") || text.includes("begeni") || text.includes("likes") || text.includes("like")) {
    return "begeni";
  }

  if (text.includes("yorum") || text.includes("comment") || text.includes("comments")) {
    return "yorum";
  }

  if (text.includes("kaydet") || text.includes("save") || text.includes("saves")) {
    return "kaydetme";
  }

  if (text.includes("retweet")) {
    return "retweet";
  }

  if (text.includes("reaksiyon") || text.includes("reaction")) {
    return "reaksiyon";
  }

  if (
    text.includes("izlenme") ||
    text.includes("görüntü") ||
    text.includes("goruntu") ||
    text.includes("views") ||
    text.includes("view") ||
    text.includes("reels") ||
    text.includes("hikaye") ||
    text.includes("story")
  ) {
    return "izlenme";
  }

  return "other";
}

function buildCleanTitle(service: RawService): string {
  const text = getSearchText(service);
  const parts: string[] = [];

  if (text.includes("doğrulanmış") || text.includes("verified")) parts.push("Doğrulanmış");
  else if (text.includes("gerçek") || text.includes("real")) parts.push("Gerçek");
  else if (text.includes("vip")) parts.push("VIP");
  else if (text.includes("uhq")) parts.push("UHQ");
  else if (text.includes("hq")) parts.push("HQ");
  else parts.push("Standart");

  const category = detectCategory(service);

  if (category === "takipci") parts.push("Takipçi");
  else if (category === "abone") parts.push("Abone");
  else if (category === "uye") parts.push("Üye");
  else if (category === "begeni") parts.push("Beğeni");
  else if (category === "yorum") parts.push("Yorum");
  else if (category === "izlenme") parts.push("İzlenme");
  else if (category === "kaydetme") parts.push("Kaydetme");
  else if (category === "retweet") parts.push("Retweet");
  else if (category === "reaksiyon") parts.push("Reaksiyon");
  else parts.push("Servis");

  if (text.includes("türk") || text.includes("turk") || text.includes("turkey")) parts.push("Türk");
  else if (text.includes("rus") || text.includes("russia")) parts.push("Rus");
  else if (text.includes("global")) parts.push("Global");

  return parts.join(" ");
}

function detectSpeed(service: RawService): string {
  const rawText = `${service.name} ${service.category}`;

  const speedPatterns = [/hız[:\s]*([^\|\n]+)/i, /speed[:\s]*([^\|\n]+)/i];

  for (const pattern of speedPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const text = rawText.toLowerCase();

  if (text.includes("anlık")) return "Anlık Başlangıç";
  if (text.includes("hızlı")) return "Hızlı Başlangıç";

  return "Yoğunluğa Göre Değişir";
}

function detectLevel(service: RawService): string {
  const text = getSearchText(service);

  if (text.includes("vip") || text.includes("uhq")) return "Elit";
  if (text.includes("hq") || text.includes("gerçek") || text.includes("real")) return "Orta";
  return "Temel";
}

function buildDescription(service: RawService): string {
  return `Bu servis için minimum ${service.min}, maksimum ${service.max} adet sipariş verilebilir. Garanti: ${normalizeGuarantee(
    service
  )}. Hız: ${detectSpeed(service)}.`;
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Bu seed route production ortamında kapalıdır." },
      { status: 403 }
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const items = services
      .map((service) => {
        const platform = detectPlatform(service);
        const category = detectCategory(service);

        if (platform === "other" || category === "other") return null;

        const usdCost = Number(service.rate || 0);
        const tlCost = Math.floor(convertUsdToTl(service.rate));
        const tlSale = calculateSalePrice(tlCost);

        return {
          panel_service_id: service.service,
          site_code: createSiteCode(service.service),
          platform,
          category,
          original_name: service.name,
          clean_title: buildCleanTitle(service),
          subtitle: `Ürün Kodu: ${createSiteCode(service.service)}`,
          guarantee: hasGuarantee(service),
          guarantee_label: normalizeGuarantee(service),
          min: service.min,
          max: service.max,
          speed: detectSpeed(service),
          level: detectLevel(service),
          description: buildDescription(service),
          usd_cost_price: usdCost,
          tl_cost_price: tlCost,
          tl_sale_price: tlSale,
          usd_sale_price: 0,
          rub_sale_price: 0,
          refill: service.refill,
          cancel: service.cancel,
          dripfeed: service.dripfeed,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    const { error } = await supabase
      .from("services")
      .upsert(items, { onConflict: "panel_service_id" });

    if (error) {
      await supabase.from("sync_logs").insert([
        {
          sync_type: "services_seed",
          status: "failed",
          message: error.message,
          total_fetched: services.length,
          total_inserted: 0,
          total_updated: 0,
        },
      ]);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("sync_logs").insert([
      {
        sync_type: "services_seed",
        status: "success",
        message: "JSON verileri services tablosuna aktarıldı",
        total_fetched: services.length,
        total_inserted: items.length,
        total_updated: 0,
      },
    ]);

    return NextResponse.json({
      success: true,
      totalRaw: services.length,
      totalSynced: items.length,
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

export async function GET() {
  return POST();
}