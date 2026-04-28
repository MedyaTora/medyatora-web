import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

type PanelService = {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string | number;
  max: string | number;
  refill: boolean;
  cancel: boolean;
  dripfeed?: boolean;
};

type ExchangeRateRow = {
  target_currency: string;
  rate: number;
};

type NormalizedServiceRow = {
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
  usd_cost_price: number;
  tl_cost_price: number;
  tl_sale_price: number;
  usd_sale_price: number;
  rub_sale_price: number;
  refill: boolean;
  cancel: boolean;
  dripfeed: boolean;
  is_active: boolean;
  last_synced_at: string;
};

function getPool() {
  return getMysqlPool();
}

function mysqlNow() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function isAuthorized(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) return true;
  if (!authHeader) return false;

  return authHeader === `Bearer ${cronSecret}`;
}

function getSearchText(service: PanelService): string {
  return `${service.name} ${service.category}`.toLowerCase();
}

function normalizeGuarantee(service: PanelService): string {
  const text = getSearchText(service);

  if (
    text.includes("ömür boyu") ||
    text.includes("omur boyu") ||
    text.includes("lifetime") ||
    text.includes("life time") ||
    text.includes("non drop") ||
    text.includes("nondrop") ||
    text.includes("no drop") ||
    text.includes("düşüş olmaz") ||
    text.includes("dusus olmaz") ||
    text.includes("dusmez") ||
    text.includes("düşmez")
  ) {
    return "365 Gün Garantili";
  }

  const dayMatch = text.match(/(\d+)\s*(gün|gun|day|days|день|дней)/i);

  if (dayMatch?.[1]) {
    const days = Number(dayMatch[1]);

    if (Number.isFinite(days) && days > 0) {
      if (days >= 365) return "365 Gün Garantili";
      return `${days} Gün Garantili`;
    }
  }

  if (
    service.refill ||
    text.includes("refill") ||
    text.includes("guarantee") ||
    text.includes("guaranteed") ||
    text.includes("garanti") ||
    text.includes("telafi")
  ) {
    return "Garantili";
  }

  return "Garantisiz";
}

function hasGuarantee(service: PanelService): boolean {
  return normalizeGuarantee(service) !== "Garantisiz";
}

function createSiteCode(realId: number): number {
  return realId + 987;
}

function detectPlatform(service: PanelService): string {
  const text = getSearchText(service);

  if (text.includes("instagram")) return "instagram";
  if (text.includes("tiktok") || text.includes("tik tok")) return "tiktok";
  if (text.includes("youtube") || text.includes("yt")) return "youtube";
  if (text.includes("telegram")) return "telegram";
  if (text.includes("spotify")) return "spotify";
  if (text.includes("facebook") || text.includes("fb")) return "facebook";

  if (
    text.includes("twitter") ||
    text.includes(" x ") ||
    text.startsWith("x ") ||
    text.includes("x/twitter")
  ) {
    return "x";
  }

  if (text.includes("twitch")) return "twitch";
  if (text.includes("kick")) return "kick";
  if (text.includes("discord")) return "discord";
  if (text.includes("snapchat") || text.includes("snap chat")) return "snapchat";
  if (text.includes("pinterest")) return "pinterest";
  if (text.includes("linkedin")) return "linkedin";
  if (text.includes("reddit")) return "reddit";
  if (text.includes("threads")) return "threads";
  if (text.includes("apple music")) return "apple-music";
  if (text.includes("soundcloud")) return "soundcloud";
  if (text.includes("audiomack")) return "audiomack";
  if (text.includes("deezer")) return "deezer";
  if (text.includes("shazam")) return "shazam";
  if (text.includes("boomplay")) return "boomplay";
  if (text.includes("steam")) return "steam";
  if (text.includes("xbox")) return "xbox";
  if (text.includes("vk")) return "vk";
  if (text.includes("rutube")) return "rutube";
  if (text.includes("ok.ru") || text.includes("odnoklassniki")) return "ok-ru";
  if (text.includes("dzen")) return "dzen";
  if (text.includes("github")) return "github";
  if (text.includes("tumblr")) return "tumblr";
  if (text.includes("bluesky")) return "bluesky";
  if (text.includes("vimeo")) return "vimeo";
  if (text.includes("google review")) return "google-review";
  if (text.includes("google maps")) return "google-maps";
  if (text.includes("whatsapp")) return "whatsapp";

  return "other";
}

function detectCategory(service: PanelService): string {
  const text = getSearchText(service);

  if (
    text.includes("story") ||
    text.includes("stories") ||
    text.includes("hikaye") ||
    text.includes("öykü") ||
    text.includes("oyku")
  ) {
    if (
      text.includes("view") ||
      text.includes("views") ||
      text.includes("izlenme") ||
      text.includes("görüntü") ||
      text.includes("goruntu")
    ) {
      return "story_izlenme";
    }

    return "story";
  }

  if (text.includes("reels") || text.includes("reel")) {
    if (
      text.includes("like") ||
      text.includes("likes") ||
      text.includes("beğeni") ||
      text.includes("begeni")
    ) {
      return "reels_begeni";
    }

    if (
      text.includes("comment") ||
      text.includes("comments") ||
      text.includes("yorum")
    ) {
      return "reels_yorum";
    }

    if (
      text.includes("view") ||
      text.includes("views") ||
      text.includes("izlenme") ||
      text.includes("görüntü") ||
      text.includes("goruntu")
    ) {
      return "reels_izlenme";
    }

    return "reels";
  }

  if (text.includes("shorts") || text.includes("short")) {
    if (
      text.includes("view") ||
      text.includes("views") ||
      text.includes("izlenme")
    ) {
      return "shorts_izlenme";
    }

    if (
      text.includes("like") ||
      text.includes("likes") ||
      text.includes("beğeni") ||
      text.includes("begeni")
    ) {
      return "shorts_begeni";
    }

    return "shorts";
  }

  if (
    text.includes("live") ||
    text.includes("canlı") ||
    text.includes("canli") ||
    text.includes("livestream") ||
    text.includes("stream")
  ) {
    return "canli_yayin";
  }

  if (
    text.includes("profile visit") ||
    text.includes("profile visits") ||
    text.includes("profil ziyareti") ||
    text.includes("profil ziyaret")
  ) {
    return "profil_ziyareti";
  }

  if (
    text.includes("sayfa beğeni") ||
    text.includes("sayfa begeni") ||
    text.includes("page like") ||
    text.includes("page likes")
  ) {
    return "sayfa_begenisi";
  }

  if (
    text.includes("grup üye") ||
    text.includes("grup uye") ||
    text.includes("group member") ||
    text.includes("group members")
  ) {
    return "grup_uyesi";
  }

  if (
    text.includes("takipçi") ||
    text.includes("takipci") ||
    text.includes("followers") ||
    text.includes("follower")
  ) {
    return "takipci";
  }

  if (
    text.includes("abone") ||
    text.includes("subscriber") ||
    text.includes("subscribers") ||
    text.includes("subs ")
  ) {
    return "abone";
  }

  if (
    text.includes("üye") ||
    text.includes("uye") ||
    text.includes("member") ||
    text.includes("members")
  ) {
    return "uye";
  }

  if (
    text.includes("beğeni") ||
    text.includes("begeni") ||
    text.includes("likes") ||
    text.includes("like")
  ) {
    return "begeni";
  }

  if (
    text.includes("yorum") ||
    text.includes("comment") ||
    text.includes("comments")
  ) {
    return "yorum";
  }

  if (
    text.includes("kaydet") ||
    text.includes("save") ||
    text.includes("saves") ||
    text.includes("bookmark") ||
    text.includes("bookmarks")
  ) {
    return "kaydetme";
  }

  if (
    text.includes("paylaşım") ||
    text.includes("paylasim") ||
    text.includes("share") ||
    text.includes("shares")
  ) {
    return "paylasim";
  }

  if (text.includes("repost")) {
    return "repost";
  }

  if (text.includes("retweet") || text.includes("rt ")) {
    return "retweet";
  }

  if (
    text.includes("reaksiyon") ||
    text.includes("reaction") ||
    text.includes("reactions") ||
    text.includes("emoji reaction")
  ) {
    return "reaksiyon";
  }

  if (
    text.includes("poll") ||
    text.includes("vote") ||
    text.includes("votes") ||
    text.includes("oylama") ||
    text.includes("anket")
  ) {
    return "oylama";
  }

  if (
    text.includes("play") ||
    text.includes("plays") ||
    text.includes("stream") ||
    text.includes("streams") ||
    text.includes("listen") ||
    text.includes("dinlenme")
  ) {
    return "dinlenme";
  }

  if (
    text.includes("izlenme") ||
    text.includes("görüntü") ||
    text.includes("goruntu") ||
    text.includes("views") ||
    text.includes("view")
  ) {
    return "izlenme";
  }

  return "other";
}

function buildCleanTitle(service: PanelService): string {
  const text = getSearchText(service);
  const parts: string[] = [];

  if (text.includes("doğrulanmış") || text.includes("verified")) parts.push("Doğrulanmış");
  else if (text.includes("gerçek") || text.includes("real")) parts.push("Gerçek");
  else if (text.includes("vip")) parts.push("VIP");
  else if (text.includes("uhq")) parts.push("UHQ");
  else if (text.includes("hq")) parts.push("HQ");
  else if (text.includes("güçlü")) parts.push("Güçlü");
  else parts.push("Standart");

  const category = detectCategory(service);

  if (category === "takipci") parts.push("Takipçi");
  else if (category === "abone") parts.push("Abone");
  else if (category === "uye") parts.push("Üye");
  else if (category === "begeni") parts.push("Beğeni");
  else if (category === "yorum") parts.push("Yorum");
  else if (category === "izlenme") parts.push("İzlenme");
  else if (category === "kaydetme") parts.push("Kaydetme");
  else if (category === "paylasim") parts.push("Paylaşım");
  else if (category === "repost") parts.push("Repost");
  else if (category === "retweet") parts.push("Retweet");
  else if (category === "reaksiyon") parts.push("Reaksiyon");
  else if (category === "story_izlenme") parts.push("Story İzlenme");
  else if (category === "reels_izlenme") parts.push("Reels İzlenme");
  else if (category === "reels_begeni") parts.push("Reels Beğeni");
  else if (category === "reels_yorum") parts.push("Reels Yorum");
  else if (category === "shorts_izlenme") parts.push("Shorts İzlenme");
  else if (category === "shorts_begeni") parts.push("Shorts Beğeni");
  else if (category === "canli_yayin") parts.push("Canlı Yayın");
  else if (category === "profil_ziyareti") parts.push("Profil Ziyareti");
  else if (category === "sayfa_begenisi") parts.push("Sayfa Beğenisi");
  else if (category === "grup_uyesi") parts.push("Grup Üyesi");
  else if (category === "oylama") parts.push("Oylama");
  else if (category === "dinlenme") parts.push("Dinlenme");
  else if (category === "story") parts.push("Story");
  else if (category === "reels") parts.push("Reels");
  else if (category === "shorts") parts.push("Shorts");
  else parts.push("Diğer Servis");

  if (
    text.includes("morethanpanel türk servisleri") ||
    text.includes("türkiye") ||
    text.includes("turkey") ||
    text.includes("türk") ||
    text.includes("turk") ||
    text.includes("🇹🇷")
  ) {
    parts.push("Türk");
  } else if (
    text.includes("rus") ||
    text.includes("russia") ||
    text.includes("рос") ||
    text.includes("🇷🇺")
  ) {
    parts.push("Rus");
  } else if (text.includes("usa") || text.includes("abd") || text.includes("united states")) {
    parts.push("ABD");
  } else if (text.includes("almanya") || text.includes("germany")) {
    parts.push("Almanya");
  } else if (text.includes("fransa") || text.includes("france")) {
    parts.push("Fransa");
  } else if (text.includes("hindistan") || text.includes("india")) {
    parts.push("Hindistan");
  } else if (text.includes("italya") || text.includes("italy")) {
    parts.push("İtalya");
  } else if (text.includes("kanada") || text.includes("canada")) {
    parts.push("Kanada");
  } else if (text.includes("brezilya") || text.includes("brazil")) {
    parts.push("Brezilya");
  } else if (text.includes("avrupa") || text.includes("europe") || text.includes("eu")) {
    parts.push("Avrupa");
  } else if (
    text.includes("arap") ||
    text.includes("arab") ||
    text.includes("uae") ||
    text.includes("saudi")
  ) {
    parts.push("Arap");
  } else if (text.includes("global")) {
    parts.push("Global");
  }

  return parts.join(" ");
}

function detectSpeed(service: PanelService): string {
  const rawText = `${service.name} ${service.category}`;

  const speedPatterns = [/hız[:\s]*([^\|\n]+)/i, /speed[:\s]*([^\|\n]+)/i];

  for (const pattern of speedPatterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const text = rawText.toLowerCase();

  if (text.includes("anlık")) return "Anlık Başlangıç";
  if (text.includes("hızlı")) return "Hızlı Başlangıç";
  if (text.includes("slow")) return "Yavaş Başlangıç";

  return "Yoğunluğa Göre Değişir";
}

function detectLevel(service: PanelService): string {
  const text = getSearchText(service);

  if (text.includes("vip") || text.includes("uhq") || text.includes("premium")) return "Prime";
  if (text.includes("hq") || text.includes("gerçek") || text.includes("real") || text.includes("verified")) return "Plus";
  return "Core";
}

function buildDescription(service: PanelService): string {
  return `Bu servis için minimum ${service.min}, maksimum ${service.max} adet sipariş verilebilir. Garanti: ${normalizeGuarantee(
    service
  )}. Hız: ${detectSpeed(service)}.`;
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

async function getUsdRates() {
  const pool = getPool();

  const [rows] = await pool.query(
    `
    SELECT target_currency, rate
    FROM exchange_rates
    WHERE base_currency = 'USD'
      AND target_currency IN ('TRY', 'RUB')
    `
  );

  const rates = (rows as any[]) as ExchangeRateRow[];
  const tryRate = rates.find((r) => r.target_currency === "TRY")?.rate;
  const rubRate = rates.find((r) => r.target_currency === "RUB")?.rate;

  if (!tryRate || !rubRate) {
    throw new Error("USD->TRY veya USD->RUB kuru bulunamadı.");
  }

  return {
    tryRate: Number(tryRate),
    rubRate: Number(rubRate),
  };
}

async function insertSyncLog(log: {
  status: "success" | "failed";
  message: string;
  total_fetched: number;
  total_inserted: number;
  total_updated: number;
}) {
  try {
    const pool = getPool();

    await pool.execute(
      `
      INSERT INTO sync_logs (
        sync_type,
        status,
        message,
        total_fetched,
        total_inserted,
        total_updated
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        "panel_services_sync",
        log.status,
        log.message,
        log.total_fetched,
        log.total_inserted,
        log.total_updated,
      ]
    );
  } catch (error) {
    console.error("sync_logs insert error:", error);
  }
}

async function fetchPanelServices(): Promise<PanelService[]> {
  const apiKey = process.env.MORETHANPANEL_API_KEY;

  if (!apiKey) {
    throw new Error("MORETHANPANEL_API_KEY eksik.");
  }

  const form = new URLSearchParams();
  form.append("key", apiKey);
  form.append("action", "services");

  const response = await fetch("https://morethanpanel.com/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Panel API hatası: ${response.status} ${raw}`);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Panel JSON parse hatası: ${raw}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Panel services cevabı dizi değil.");
  }

  return parsed as PanelService[];
}

function normalizePanelServices(
  panelServices: PanelService[],
  tryRate: number,
  rubRate: number
): NormalizedServiceRow[] {
  return panelServices
    .map((service) => {
      const platform = detectPlatform(service);
      const category = detectCategory(service);

      const usdCost = Number(service.rate || 0);
      const min = Number(service.min || 0);
      const max = Number(service.max || 0);

      if (!Number.isFinite(usdCost) || usdCost <= 0) {
        return null;
      }

      if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
        return null;
      }

      const tlCost = Math.floor(usdCost * tryRate);
      const tlSale = calculateSalePrice(tlCost);
      const usdSale = Number((tlSale / tryRate).toFixed(4));
      const rubSale = Number(((tlSale / tryRate) * rubRate).toFixed(4));

      if (tlCost <= 0 || tlSale <= 0 || usdSale <= 0 || rubSale <= 0) {
        return null;
      }

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
        min,
        max,
        speed: detectSpeed(service),
        level: detectLevel(service),
        description: buildDescription(service),
        usd_cost_price: usdCost,
        tl_cost_price: tlCost,
        tl_sale_price: tlSale,
        usd_sale_price: usdSale,
        rub_sale_price: rubSale,
        refill: !!service.refill,
        cancel: !!service.cancel,
        dripfeed: !!service.dripfeed,
        is_active: true,
        last_synced_at: mysqlNow(),
      };
    })
    .filter((item): item is NormalizedServiceRow => item !== null);
}

function buildSafeSyncUpdate(item: NormalizedServiceRow) {
  return {
    original_name: item.original_name,

    platform: item.platform,
    category: item.category,

    min: item.min,
    max: item.max,
    speed: item.speed,
    level: item.level,
    guarantee: item.guarantee,
    guarantee_label: item.guarantee_label,

    usd_cost_price: item.usd_cost_price,
    tl_cost_price: item.tl_cost_price,
    tl_sale_price: item.tl_sale_price,
    usd_sale_price: item.usd_sale_price,
    rub_sale_price: item.rub_sale_price,

    refill: item.refill,
    cancel: item.cancel,
    dripfeed: item.dripfeed,

    is_active: true,
    last_synced_at: item.last_synced_at,
  };
}

async function deactivateMissingServices(syncedIds: number[]): Promise<number> {
  if (syncedIds.length === 0) return 0;

  const pool = getPool();

  const [activeRows] = await pool.query(
    "SELECT panel_service_id FROM services WHERE is_active = 1"
  );

  const activeIds = (activeRows as any[]).map((row) => Number(row.panel_service_id));
  const idsToDeactivate = activeIds.filter((id) => !syncedIds.includes(id));

  if (idsToDeactivate.length === 0) {
    return 0;
  }

  const placeholders = idsToDeactivate.map(() => "?").join(",");

  await pool.execute(
    `
    UPDATE services
    SET is_active = 0, last_synced_at = NOW()
    WHERE panel_service_id IN (${placeholders})
    `,
    idsToDeactivate
  );

  return idsToDeactivate.length;
}

async function syncPanelServices() {
  const pool = getPool();
  const { tryRate, rubRate } = await getUsdRates();
  const panelServices = await fetchPanelServices();
  const items = normalizePanelServices(panelServices, tryRate, rubRate);
  const syncedIds = items.map((item) => item.panel_service_id);

  let insertedCount = 0;
  let updatedCount = 0;

  try {
    for (const item of items) {
      const [result] = await pool.execute(
        `
        INSERT INTO services (
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
          usd_cost_price,
          tl_cost_price,
          tl_sale_price,
          usd_sale_price,
          rub_sale_price,
          refill,
          cancel,
          dripfeed,
          is_active,
          last_synced_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          original_name = VALUES(original_name),
          platform = VALUES(platform),
          category = VALUES(category),
          min = VALUES(min),
          max = VALUES(max),
          speed = VALUES(speed),
          level = VALUES(level),
          guarantee = VALUES(guarantee),
          guarantee_label = VALUES(guarantee_label),
          usd_cost_price = VALUES(usd_cost_price),
          tl_cost_price = VALUES(tl_cost_price),
          tl_sale_price = VALUES(tl_sale_price),
          usd_sale_price = VALUES(usd_sale_price),
          rub_sale_price = VALUES(rub_sale_price),
          refill = VALUES(refill),
          cancel = VALUES(cancel),
          dripfeed = VALUES(dripfeed),
          is_active = 1,
          last_synced_at = VALUES(last_synced_at)
        `,
        [
          item.panel_service_id,
          item.site_code,
          item.platform,
          item.category,
          item.original_name,
          item.clean_title,
          item.subtitle,
          item.guarantee ? 1 : 0,
          item.guarantee_label,
          item.min,
          item.max,
          item.speed,
          item.level,
          item.description,
          item.usd_cost_price,
          item.tl_cost_price,
          item.tl_sale_price,
          item.usd_sale_price,
          item.rub_sale_price,
          item.refill ? 1 : 0,
          item.cancel ? 1 : 0,
          item.dripfeed ? 1 : 0,
          item.is_active ? 1 : 0,
          item.last_synced_at,
        ]
      );

      const info = result as any;

      if (info.affectedRows === 1) {
        insertedCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    const deactivatedCount = await deactivateMissingServices(syncedIds);

    await insertSyncLog({
      status: "success",
      message: `Panel servisleri MySQL'e senkronize edildi. TRY: ${tryRate}, RUB: ${rubRate}. Yeni eklenen: ${insertedCount}. Güncellenen: ${updatedCount}. Pasife alınan servis: ${deactivatedCount}`,
      total_fetched: panelServices.length,
      total_inserted: insertedCount,
      total_updated: updatedCount + deactivatedCount,
    });

    return {
      success: true,
      mode: "mysql-safe-sync",
      totalFetched: panelServices.length,
      totalInserted: insertedCount,
      totalUpdated: updatedCount,
      totalDeactivated: deactivatedCount,
      tryRate,
      rubRate,
    };
  } catch (error) {
    await insertSyncLog({
      status: "failed",
      message: error instanceof Error ? error.message : "Panel servisleri senkronize edilemedi.",
      total_fetched: panelServices.length,
      total_inserted: insertedCount,
      total_updated: updatedCount,
    });

    throw error;
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
    }

    const result = await syncPanelServices();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}