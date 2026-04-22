import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function syncRates() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  console.log("RATE KEY:", apiKey);

  if (!apiKey) {
    throw new Error("EXCHANGE_RATE_API_KEY eksik.");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  const text = await res.text();

  console.log("RATE API RAW:", text);

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Kur API JSON parse hatası: ${text}`);
  }

  if (!res.ok || data.result !== "success") {
    throw new Error(data["error-type"] || `Kur verisi alınamadı: ${text}`);
  }

  const tryRate = data.conversion_rates?.TRY;
  const rubRate = data.conversion_rates?.RUB;

  if (!tryRate || !rubRate) {
    throw new Error("TRY veya RUB kuru bulunamadı.");
  }

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
    await supabase.from("sync_logs").insert([
      {
        sync_type: "exchange_rates_sync",
        status: "failed",
        message: error.message,
        total_fetched: 2,
        total_inserted: 0,
        total_updated: 0,
      },
    ]);

    throw new Error(error.message);
  }

  await supabase.from("sync_logs").insert([
    {
      sync_type: "exchange_rates_sync",
      status: "success",
      message: "USD->TRY ve USD->RUB kurları güncellendi",
      total_fetched: 2,
      total_inserted: 2,
      total_updated: 0,
    },
  ]);

  return {
    success: true,
    base: "USD",
    TRY: tryRate,
    RUB: rubRate,
  };
}

export async function POST() {
  try {
    const result = await syncRates();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu",
        rawError: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}