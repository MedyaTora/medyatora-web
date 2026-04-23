import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ExchangeRateApiResponse = {
  result?: string;
  ["error-type"]?: string;
  conversion_rates?: {
    TRY?: number;
    RUB?: number;
  };
};

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isAuthorized(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) return true;
  if (!authHeader) return false;

  return authHeader === `Bearer ${cronSecret}`;
}

async function insertSyncLog(log: {
  status: "success" | "failed";
  message: string;
  total_fetched: number;
  total_inserted: number;
  total_updated: number;
}) {
  try {
    const supabase = createAdminSupabaseClient();

    await supabase.from("sync_logs").insert([
      {
        sync_type: "exchange_rates_sync",
        status: log.status,
        message: log.message,
        total_fetched: log.total_fetched,
        total_inserted: log.total_inserted,
        total_updated: log.total_updated,
      },
    ]);
  } catch (error) {
    console.error("exchange_rates_sync log insert error:", error);
  }
}

async function fetchRatesFromApi() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    throw new Error("EXCHANGE_RATE_API_KEY eksik.");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  const text = await res.text();

  let data: ExchangeRateApiResponse;

  try {
    data = JSON.parse(text) as ExchangeRateApiResponse;
  } catch {
    throw new Error(`Kur API JSON parse hatası: ${text}`);
  }

  if (!res.ok || data.result !== "success") {
    throw new Error(data["error-type"] || "Kur verisi alınamadı.");
  }

  const tryRate = data.conversion_rates?.TRY;
  const rubRate = data.conversion_rates?.RUB;

  if (!tryRate || !rubRate) {
    throw new Error("TRY veya RUB kuru bulunamadı.");
  }

  return {
    tryRate: Number(tryRate),
    rubRate: Number(rubRate),
  };
}

async function syncRates() {
  const supabase = createAdminSupabaseClient();
  const { tryRate, rubRate } = await fetchRatesFromApi();

  const rows = [
    {
      base_currency: "USD",
      target_currency: "TRY",
      rate: tryRate,
      fetched_at: new Date().toISOString(),
    },
    {
      base_currency: "USD",
      target_currency: "RUB",
      rate: rubRate,
      fetched_at: new Date().toISOString(),
    },
  ];

  const { error } = await supabase
    .from("exchange_rates")
    .upsert(rows, { onConflict: "base_currency,target_currency" });

  if (error) {
    await insertSyncLog({
      status: "failed",
      message: error.message,
      total_fetched: 2,
      total_inserted: 0,
      total_updated: 0,
    });

    throw new Error(error.message);
  }

  await insertSyncLog({
    status: "success",
    message: "USD->TRY ve USD->RUB kurları güncellendi",
    total_fetched: 2,
    total_inserted: 2,
    total_updated: 0,
  });

  return {
    success: true,
    base: "USD",
    TRY: tryRate,
    RUB: rubRate,
  };
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
    }

    const result = await syncRates();
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