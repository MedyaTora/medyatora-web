export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMysqlPool } from "@/lib/mysql";

type CurrencyCode = "TL" | "USD" | "RUB" | string;

type ProfitOrderRow = {
  id: number;
  created_at: string;
  order_number: string | null;
  batch_code: string | null;
  full_name: string | null;
  platform: string | null;
  category: string | null;
  service_id: number | null;
  site_code: number | null;
  service_title: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  unit_cost_price: number | null;
  total_cost_price: number | null;
  refunded_total: number;
  currency: CurrencyCode | null;
  status: string | null;
};

type SearchParams = {
  month?: string;
  currency?: string;
};

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#050505] p-8 text-white">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
        Hata: {message}
      </div>
    </main>
  );
}

function getCurrentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthRange(monthValue: string) {
  const [yearRaw, monthRaw] = monthValue.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    const fallback = getCurrentMonthValue();
    return getMonthRange(fallback);
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return "-";
  }
}

function safeNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function normalizeCurrency(currency: string | null | undefined) {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return value || "UNKNOWN";
}

function formatMoney(value: number, currency?: string | null) {
  const displayCurrency = normalizeCurrency(currency);

  if (displayCurrency === "TL") {
    return `${Math.round(value).toLocaleString("tr-TR")} TL`;
  }

  return `${value.toFixed(2)} ${displayCurrency}`;
}

function getNetSale(order: ProfitOrderRow) {
  return Math.max(0, safeNumber(order.total_price) - safeNumber(order.refunded_total));
}

function calculateProfit(order: ProfitOrderRow) {
  return getNetSale(order) - safeNumber(order.total_cost_price);
}

function getCurrencyTotals(orders: ProfitOrderRow[]) {
  const totals = new Map<
    string,
    {
      currency: string;
      grossSale: number;
      refunded: number;
      netSale: number;
      cost: number;
      profit: number;
      count: number;
    }
  >();

  for (const order of orders) {
    const currency = normalizeCurrency(order.currency);
    const current = totals.get(currency) || {
      currency,
      grossSale: 0,
      refunded: 0,
      netSale: 0,
      cost: 0,
      profit: 0,
      count: 0,
    };

    const grossSale = safeNumber(order.total_price);
    const refunded = safeNumber(order.refunded_total);
    const netSale = Math.max(0, grossSale - refunded);
    const cost = safeNumber(order.total_cost_price);

    current.grossSale += grossSale;
    current.refunded += refunded;
    current.netSale += netSale;
    current.cost += cost;
    current.profit += netSale - cost;
    current.count += 1;

    totals.set(currency, current);
  }

  return Array.from(totals.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency, "tr")
  );
}

function getStatusLabel(status: string | null | undefined) {
  const map: Record<string, string> = {
    completed: "Tamamlandı",
    partial_refunded: "Kısmi Tamamlandı",
  };

  return map[status || ""] || status || "-";
}

function StatCard({
  title,
  value,
  subtitle,
  accent = "white",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: "emerald" | "amber" | "sky" | "rose" | "white";
}) {
  const accentMap: Record<string, string> = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    white: "border-white/10 bg-white/[0.04] text-white",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${accentMap[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
        {title}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {subtitle ? <p className="mt-2 text-xs opacity-65">{subtitle}</p> : null}
    </div>
  );
}

export default async function ProfitPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};

  const selectedMonth = params.month || getCurrentMonthValue();
  const selectedCurrency = params.currency || "all";
  const { startIso, endIso } = getMonthRange(selectedMonth);

  const pool = getMysqlPool();

  function toDateValue(value: unknown) {
    if (!value) return "";
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  let orders: ProfitOrderRow[] = [];

  try {
    const sqlParams: unknown[] = [startIso, endIso];

    let currencyCondition = "";

    if (selectedCurrency !== "all") {
      currencyCondition = "AND o.currency = ?";
      sqlParams.push(selectedCurrency);
    }

    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        o.created_at,
        o.order_number,
        o.batch_code,
        o.full_name,
        o.platform,
        o.category,
        o.service_id,
        o.site_code,
        o.service_title,
        o.quantity,
        o.unit_price,
        o.total_price,
        o.unit_cost_price,
        o.total_cost_price,
        COALESCE(r.refunded_total, 0) AS refunded_total,
        o.currency,
        o.status
      FROM order_requests o
      LEFT JOIN (
        SELECT
          order_id,
          currency,
          SUM(amount) AS refunded_total
        FROM order_refund_transactions
        GROUP BY order_id, currency
      ) r ON r.order_id = o.id AND r.currency = o.currency
      WHERE o.status IN ('completed', 'partial_refunded')
        AND o.created_at >= ?
        AND o.created_at < ?
        ${currencyCondition}
      ORDER BY o.created_at DESC
      `,
      sqlParams
    );

    orders = (rows as any[]).map((row) => ({
      id: Number(row.id),
      created_at: toDateValue(row.created_at),
      order_number: row.order_number,
      batch_code: row.batch_code,
      full_name: row.full_name,
      platform: row.platform,
      category: row.category,
      service_id: row.service_id === null ? null : Number(row.service_id),
      site_code: row.site_code === null ? null : Number(row.site_code),
      service_title: row.service_title,
      quantity: row.quantity === null ? null : Number(row.quantity),
      unit_price: row.unit_price === null ? null : Number(row.unit_price),
      total_price: row.total_price === null ? null : Number(row.total_price),
      unit_cost_price:
        row.unit_cost_price === null ? null : Number(row.unit_cost_price),
      total_cost_price:
        row.total_cost_price === null ? null : Number(row.total_cost_price),
      refunded_total: Number(row.refunded_total || 0),
      currency: normalizeCurrency(row.currency),
      status: row.status,
    }));
  } catch (error) {
    return (
      <ErrorScreen
        message={error instanceof Error ? error.message : "MySQL kâr verileri alınamadı."}
      />
    );
  }

  const currencyTotals = getCurrencyTotals(orders);

  const availableCurrencies = Array.from(
    new Set(orders.map((order) => order.currency).filter(Boolean) as string[])
  ).sort();

  const totalOrderCount = orders.length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora Finans
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Profit Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Aylık Net Kâr
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Tamamlanan ve kısmi tamamlanan siparişler kâr hesabına dahil edilir.
                İade edilen tutarlar brüt satıştan düşülerek net satış ve net kâr
                hesaplanır. İptal edilen, tam iade edilen ve bekleyen siparişler bu
                ekranda hesaplanmaz.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Admin Panel
              </a>

              <a
                href="/admin/customers"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Müşteriler
              </a>

              <a
                href="/admin/profit"
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
              >
                Kâr Paneli
              </a>
            </div>
          </div>
        </header>

        <form className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                Ay
              </label>
              <input
                type="month"
                name="month"
                defaultValue={selectedMonth}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                Para Birimi
              </label>
              <select
                name="currency"
                defaultValue={selectedCurrency}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="all" className="bg-[#121826]">
                  Tümü
                </option>
                <option value="TL" className="bg-[#121826]">
                  TL
                </option>
                <option value="USD" className="bg-[#121826]">
                  USD
                </option>
                <option value="RUB" className="bg-[#121826]">
                  RUB
                </option>
                {availableCurrencies
                  .filter((currency) => !["TL", "USD", "RUB"].includes(currency))
                  .map((currency) => (
                    <option key={currency} value={currency} className="bg-[#121826]">
                      {currency}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">
                Filtrele
              </button>

              <a
                href="/admin/profit"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white/80"
              >
                Temizle
              </a>
            </div>
          </div>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Kâr Hesabına Dahil Sipariş"
            value={totalOrderCount}
            subtitle="completed + partial_refunded"
            accent="sky"
          />

          {currencyTotals.length === 0 ? (
            <>
              <StatCard title="Brüt Satış" value="0" accent="emerald" />
              <StatCard title="Toplam İade" value="0" accent="amber" />
              <StatCard title="Net Kâr" value="0" accent="white" />
            </>
          ) : (
            currencyTotals.slice(0, 3).map((total) => (
              <StatCard
                key={total.currency}
                title={`${total.currency} Net Kâr`}
                value={formatMoney(total.profit, total.currency)}
                subtitle={`Brüt: ${formatMoney(
                  total.grossSale,
                  total.currency
                )} • İade: ${formatMoney(
                  total.refunded,
                  total.currency
                )} • Net: ${formatMoney(
                  total.netSale,
                  total.currency
                )} • Alış: ${formatMoney(total.cost, total.currency)}`}
                accent={total.profit >= 0 ? "emerald" : "rose"}
              />
            ))
          )}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Para Birimi Toplamları</h2>
            <span className="text-sm text-white/45">
              {currencyTotals.length} para birimi
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-3 py-2">Para Birimi</th>
                  <th className="px-3 py-2">Sipariş</th>
                  <th className="px-3 py-2">Brüt Satış</th>
                  <th className="px-3 py-2">Toplam İade</th>
                  <th className="px-3 py-2">Net Satış</th>
                  <th className="px-3 py-2">Toplam Alış</th>
                  <th className="px-3 py-2">Net Kâr</th>
                </tr>
              </thead>

              <tbody>
                {currencyTotals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="rounded-2xl bg-black/20 px-3 py-5 text-white/45"
                    >
                      Bu ay için tamamlanan veya kısmi tamamlanan sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  currencyTotals.map((total) => (
                    <tr key={total.currency} className="bg-black/20">
                      <td className="rounded-l-2xl px-3 py-3 font-semibold">
                        {total.currency}
                      </td>

                      <td className="px-3 py-3 text-white/70">{total.count}</td>

                      <td className="px-3 py-3 text-white/70">
                        {formatMoney(total.grossSale, total.currency)}
                      </td>

                      <td className="px-3 py-3 text-amber-300">
                        {formatMoney(total.refunded, total.currency)}
                      </td>

                      <td className="px-3 py-3 text-sky-300">
                        {formatMoney(total.netSale, total.currency)}
                      </td>

                      <td className="px-3 py-3 text-white/70">
                        {formatMoney(total.cost, total.currency)}
                      </td>

                      <td
                        className={`rounded-r-2xl px-3 py-3 font-bold ${
                          total.profit >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {formatMoney(total.profit, total.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Kâr Hesabına Dahil Siparişler
            </h2>
            <span className="text-sm text-white/45">{orders.length} kayıt</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1450px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-3 py-2">Tarih</th>
                  <th className="px-3 py-2">Durum</th>
                  <th className="px-3 py-2">Sipariş No</th>
                  <th className="px-3 py-2">Müşteri</th>
                  <th className="px-3 py-2">Panel ID</th>
                  <th className="px-3 py-2">Ürün Kodu</th>
                  <th className="px-3 py-2">Hizmet</th>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">Miktar</th>
                  <th className="px-3 py-2">Brüt Satış</th>
                  <th className="px-3 py-2">İade</th>
                  <th className="px-3 py-2">Net Satış</th>
                  <th className="px-3 py-2">Alış</th>
                  <th className="px-3 py-2">Net Kâr</th>
                  <th className="px-3 py-2">Detay</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="rounded-2xl bg-black/20 px-3 py-5 text-white/45"
                    >
                      Bu filtreye uygun tamamlanan veya kısmi tamamlanan sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const netSale = getNetSale(order);
                    const profit = calculateProfit(order);

                    return (
                      <tr key={order.id} className="bg-black/20">
                        <td className="rounded-l-2xl px-3 py-3 text-white/60">
                          {formatDate(order.created_at)}
                        </td>

                        <td className="px-3 py-3 text-white/70">
                          {getStatusLabel(order.status)}
                        </td>

                        <td className="px-3 py-3 text-white/80">
                          {order.order_number || "-"}
                        </td>

                        <td className="px-3 py-3 font-semibold">
                          {order.full_name || "-"}
                        </td>

                        <td className="px-3 py-3 text-emerald-300">
                          {order.service_id ?? "-"}
                        </td>

                        <td className="px-3 py-3 text-sky-300">
                          {order.site_code ?? "-"}
                        </td>

                        <td className="max-w-[300px] px-3 py-3 text-white/70">
                          {order.service_title || "-"}
                        </td>

                        <td className="px-3 py-3 text-white/70">
                          {order.platform || "-"} / {order.category || "-"}
                        </td>

                        <td className="px-3 py-3 text-white/70">
                          {order.quantity ?? "-"}
                        </td>

                        <td className="px-3 py-3 text-white/70">
                          {formatMoney(safeNumber(order.total_price), order.currency)}
                        </td>

                        <td className="px-3 py-3 text-amber-300">
                          {formatMoney(safeNumber(order.refunded_total), order.currency)}
                        </td>

                        <td className="px-3 py-3 text-sky-300">
                          {formatMoney(netSale, order.currency)}
                        </td>

                        <td className="px-3 py-3 text-white/70">
                          {formatMoney(safeNumber(order.total_cost_price), order.currency)}
                        </td>

                        <td
                          className={`px-3 py-3 font-bold ${
                            profit >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatMoney(profit, order.currency)}
                        </td>

                        <td className="rounded-r-2xl px-3 py-3">
                          <a
                            href={`/admin/orders/${order.id}`}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"
                          >
                            Aç
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}