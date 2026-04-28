import { NextResponse } from "next/server";
import { getMysqlPool } from "@/lib/mysql";

type ExchangeRateApiResponse = {
  result?: string;
  ["error-type"]?: string;
  conversion_rates?: {
    TRY?: number;
    RUB?: number;
  };
};

function getPool() {
  return getMysqlPool();
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
        "exchange_rates_sync",
        log.status,
        log.message,
        log.total_fetched,
        log.total_inserted,
        log.total_updated,
      ]
    );
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
  const pool = getPool();
  const { tryRate, rubRate } = await fetchRatesFromApi();

  try {
    await pool.execute(
      `
      INSERT INTO exchange_rates (
        base_currency,
        target_currency,
        rate,
        source,
        updated_at
      )
      VALUES
        ('USD', 'TRY', ?, 'exchange-rate-api', NOW()),
        ('USD', 'RUB', ?, 'exchange-rate-api', NOW())
      ON DUPLICATE KEY UPDATE
        rate = VALUES(rate),
        source = VALUES(source),
        updated_at = NOW()
      `,
      [tryRate, rubRate]
    );

    await insertSyncLog({
      status: "success",
      message: "USD->TRY ve USD->RUB kurları MySQL üzerinde güncellendi",
      total_fetched: 2,
      total_inserted: 0,
      total_updated: 2,
    });

    return {
      success: true,
      mode: "mysql-rates-sync",
      base: "USD",
      TRY: tryRate,
      RUB: rubRate,
    };
  } catch (error) {
    await insertSyncLog({
      status: "failed",
      message: error instanceof Error ? error.message : "Kur senkronizasyonu başarısız.",
      total_fetched: 2,
      total_inserted: 0,
      total_updated: 0,
    });

    throw error;
  }
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
