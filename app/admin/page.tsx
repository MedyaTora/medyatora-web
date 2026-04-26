export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@supabase/supabase-js";
import StatusSelect from "../components/status-select";
import OrderStatusCardActions from "../components/order-status-card-actions";

type CustomerInfo = {
  full_name: string | null;
  username: string | null;
  account_link: string | null;
  account_type: string | null;
  content_type: string | null;
  daily_post_count: string | number | null;
  main_problem: string | null;
  main_missing: string | null;
  contact_type: string | null;
  contact_value: string | null;
};

type AnalysisRequestRow = {
  id: string;
  coupon_code: string | null;
  package_type: string;
  package_price: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  customers: CustomerInfo | CustomerInfo[] | null;
};

type OrderRequestRow = {
  id: number;
  created_at: string;
  batch_code: string | null;
  order_number: string | null;
  full_name: string | null;
  phone_number: string | null;
  contact_type: string | null;
  contact_value: string | null;
  platform: string | null;
  category: string | null;
  service_title: string | null;
  quantity: number | null;
  total_price: number | null;
  total_cost_price: number | null;
  currency: string | null;
  target_username: string | null;
  target_link: string | null;
  order_note: string | null;
  status: string;
  start_count: number | null;
  end_count: number | null;
  completion_note: string | null;
};

type SearchParams = {
  q?: string;
  analysisStatus?: string;
  orderStatus?: string;
  platform?: string;
  apage?: string;
  opage?: string;
};

const PAGE_SIZE = 20;

function normalizeCustomer(customers: AnalysisRequestRow["customers"]): CustomerInfo | null {
  if (!customers) return null;
  if (Array.isArray(customers)) return customers[0] ?? null;
  return customers;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

function formatMoney(value: number | null | undefined, currency?: string | null) {
  const safeValue = typeof value === "number" ? value : 0;
  return `${safeValue} ${currency || ""}`.trim();
}

function includesText(value: unknown, q: string) {
  return String(value || "").toLowerCase().includes(q.toLowerCase());
}

function getPageItems<T>(items: T[], page: number) {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function buildPageHref(params: URLSearchParams, key: string, page: number) {
  const next = new URLSearchParams(params);
  next.set(key, String(page));
  return `/admin?${next.toString()}`;
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#050505] p-8 text-white">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
        Hata: {message}
      </div>
    </main>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const q = params.q?.trim() || "";
  const analysisStatus = params.analysisStatus || "all";
  const orderStatus = params.orderStatus || "all";
  const platform = params.platform || "all";
  const analysisPage = Math.max(Number(params.apage || 1), 1);
  const orderPage = Math.max(Number(params.opage || 1), 1);

  const queryParams = new URLSearchParams();
  if (q) queryParams.set("q", q);
  if (analysisStatus !== "all") queryParams.set("analysisStatus", analysisStatus);
  if (orderStatus !== "all") queryParams.set("orderStatus", orderStatus);
  if (platform !== "all") queryParams.set("platform", platform);

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: analysisData, error: analysisError } = await supabase
    .from("analysis_requests")
    .select(`
      id,
      coupon_code,
      package_type,
      package_price,
      currency,
      status,
      created_at,
      customers (
        full_name,
        username,
        account_link,
        account_type,
        content_type,
        daily_post_count,
        main_problem,
        main_missing,
        contact_type,
        contact_value
      )
    `)
    .order("created_at", { ascending: false });

  const { data: orderData, error: orderError } = await supabase
    .from("order_requests")
    .select(`
      id,
      created_at,
      batch_code,
      order_number,
      full_name,
      phone_number,
      contact_type,
      contact_value,
      platform,
      category,
      service_title,
      quantity,
      total_price,
      total_cost_price,
      currency,
      target_username,
      target_link,
      order_note,
      status,
      start_count,
      end_count,
      completion_note
    `)
    .order("created_at", { ascending: false });

  const { count: customerCount, error: customerCountError } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  if (analysisError) return <ErrorScreen message={analysisError.message} />;
  if (orderError) return <ErrorScreen message={orderError.message} />;
  if (customerCountError) return <ErrorScreen message={customerCountError.message} />;

  const allItems = (analysisData || []) as AnalysisRequestRow[];
  const allOrders = (orderData || []) as OrderRequestRow[];

  const filteredAnalysis = allItems.filter((item) => {
    const customer = normalizeCustomer(item.customers);

    const statusOk = analysisStatus === "all" || item.status === analysisStatus;
    const searchOk =
      !q ||
      includesText(customer?.full_name, q) ||
      includesText(customer?.username, q) ||
      includesText(customer?.contact_value, q) ||
      includesText(item.coupon_code, q) ||
      includesText(item.id, q);

    return statusOk && searchOk;
  });

  const filteredOrders = allOrders.filter((item) => {
    const statusOk = orderStatus === "all" || item.status === orderStatus;
    const platformOk = platform === "all" || item.platform === platform;
    const searchOk =
      !q ||
      includesText(item.full_name, q) ||
      includesText(item.phone_number, q) ||
      includesText(item.contact_value, q) ||
      includesText(item.order_number, q) ||
      includesText(item.batch_code, q) ||
      includesText(item.target_username, q) ||
      includesText(item.target_link, q) ||
      includesText(item.service_title, q) ||
      includesText(item.platform, q);

    return statusOk && platformOk && searchOk;
  });

  const analysisTotalPages = Math.max(Math.ceil(filteredAnalysis.length / PAGE_SIZE), 1);
  const orderTotalPages = Math.max(Math.ceil(filteredOrders.length / PAGE_SIZE), 1);

  const analysisPageItems = getPageItems(filteredAnalysis, analysisPage);
  const orderPageItems = getPageItems(filteredOrders, orderPage);

  const pendingAnalysis = allItems.filter((item) => item.status === "pending").length;
  const processingAnalysis = allItems.filter(
    (item) => item.status === "in_review" || item.status === "contacted"
  ).length;
  const completedAnalysis = allItems.filter((item) => item.status === "completed").length;
  const pendingOrders = allOrders.filter((item) => item.status === "pending").length;
  const completedOrders = allOrders.filter((item) => item.status === "completed").length;

  const platforms = Array.from(
    new Set(allOrders.map((item) => item.platform).filter(Boolean) as string[])
  ).sort();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora Yönetim
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Admin Panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Başvuruları ve siparişleri arama, filtreleme ve sayfalama ile takip et.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="/admin" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]">
                Başvurular
              </a>
              <a href="/admin/customers" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]">
                Müşteriler
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Yeni Başvuru" value={pendingAnalysis} accent="emerald" />
          <StatCard title="İşlemde" value={processingAnalysis} accent="amber" />
          <StatCard title="Tamamlanan Başvuru" value={completedAnalysis} accent="sky" />
          <StatCard title="Yeni Sipariş" value={pendingOrders} accent="pink" />
          <StatCard title="Tamamlanan Sipariş" value={completedOrders} accent="violet" />
          <StatCard title="Toplam Müşteri" value={customerCount || 0} accent="white" />
        </section>

        <form className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                Arama
              </label>
              <input
                name="q"
                defaultValue={q}
                placeholder="İsim, telefon, sipariş no, kullanıcı adı..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>

            <FilterSelect
              label="Başvuru Durumu"
              name="analysisStatus"
              defaultValue={analysisStatus}
              options={[
                ["all", "Tümü"],
                ["pending", "Bekliyor"],
                ["in_review", "İnceleniyor"],
                ["contacted", "İletişime Geçildi"],
                ["completed", "Tamamlandı"],
              ]}
            />

            <FilterSelect
              label="Sipariş Durumu"
              name="orderStatus"
              defaultValue={orderStatus}
              options={[
                ["all", "Tümü"],
                ["pending", "Bekliyor"],
                ["processing", "Hazırlanıyor"],
                ["completed", "Tamamlandı"],
                ["cancelled", "İptal"],
              ]}
            />

            <FilterSelect
              label="Platform"
              name="platform"
              defaultValue={platform}
              options={[
                ["all", "Tümü"],
                ...platforms.map((item) => [item, item] as [string, string]),
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">
              Filtrele
            </button>
            <a href="/admin" className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80">
              Temizle
            </a>
          </div>
        </form>

        <AnalysisTable
          items={analysisPageItems}
          total={filteredAnalysis.length}
          page={analysisPage}
          totalPages={analysisTotalPages}
          queryParams={queryParams}
        />

        <OrderTable
          items={orderPageItems}
          total={filteredOrders.length}
          page={orderPage}
          totalPages={orderTotalPages}
          queryParams={queryParams}
        />
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: number;
  accent: "emerald" | "amber" | "sky" | "violet" | "pink" | "white";
}) {
  const accentMap: Record<string, string> = {
    emerald: "from-emerald-400/20 to-emerald-500/5 text-emerald-300",
    amber: "from-amber-400/20 to-amber-500/5 text-amber-300",
    sky: "from-sky-400/20 to-sky-500/5 text-sky-300",
    violet: "from-violet-400/20 to-violet-500/5 text-violet-300",
    pink: "from-pink-400/20 to-pink-500/5 text-pink-300",
    white: "from-white/15 to-white/5 text-white",
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${accentMap[accent]}`}>
        {title}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value} className="bg-[#121826]">
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function AnalysisTable({
  items,
  total,
  page,
  totalPages,
  queryParams,
}: {
  items: AnalysisRequestRow[];
  total: number;
  page: number;
  totalPages: number;
  queryParams: URLSearchParams;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <SectionHeader title="Başvurular" total={total} page={page} totalPages={totalPages} />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-3 py-2">Tarih</th>
              <th className="px-3 py-2">Müşteri</th>
              <th className="px-3 py-2">Kullanıcı</th>
              <th className="px-3 py-2">İletişim</th>
              <th className="px-3 py-2">Paket</th>
              <th className="px-3 py-2">Durum</th>
              <th className="px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const customer = normalizeCustomer(item.customers);

              return (
                <tr key={item.id} className="bg-black/20">
                  <td className="rounded-l-2xl px-3 py-3 text-white/60">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {customer?.full_name || "İsimsiz"}
                  </td>
                  <td className="px-3 py-3 text-white/70">
                    {customer?.username || "-"}
                  </td>
                  <td className="px-3 py-3 text-white/70">
                    {customer?.contact_type || "-"} / {customer?.contact_value || "-"}
                  </td>
                  <td className="px-3 py-3 text-white/70">
                    {item.package_type} • {item.package_price ?? "-"} {item.currency ?? ""}
                  </td>
                  <td className="px-3 py-3">
                    <StatusSelect id={String(item.id)} initialStatus={item.status} />
                  </td>
                  <td className="rounded-r-2xl px-3 py-3">
                    <a href={`/admin/${item.id}`} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black">
                      Detay
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/45">
            Kayıt yok
          </div>
        ) : null}
      </div>

      <Pagination page={page} totalPages={totalPages} prevHref={buildPageHref(queryParams, "apage", page - 1)} nextHref={buildPageHref(queryParams, "apage", page + 1)} />
    </section>
  );
}

function OrderTable({
  items,
  total,
  page,
  totalPages,
  queryParams,
}: {
  items: OrderRequestRow[];
  total: number;
  page: number;
  totalPages: number;
  queryParams: URLSearchParams;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <SectionHeader title="Siparişler" total={total} page={page} totalPages={totalPages} />

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/45">
            Kayıt yok
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="grid gap-3 xl:grid-cols-[1fr_1.2fr_auto] xl:items-start">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black">
                      {item.status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                      {item.platform || "-"} • {item.category || "-"}
                    </span>
                  </div>
                  <p className="font-semibold">{item.full_name || "İsimsiz sipariş"}</p>
                  <p className="mt-1 text-xs text-white/45">{formatDate(item.created_at)}</p>
                  <p className="mt-2 text-xs text-white/60">
                    {item.order_number || "-"} / {item.batch_code || "-"}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-white/70 md:grid-cols-2">
                  <MiniInfo label="Telefon" value={item.phone_number || "-"} />
                  <MiniInfo label="İletişim" value={`${item.contact_type || "-"} / ${item.contact_value || "-"}`} />
                  <MiniInfo label="Ürün" value={item.service_title || "-"} />
                  <MiniInfo label="Hedef" value={item.target_username || item.target_link || "-"} />
                  <MiniInfo label="Miktar" value={item.quantity ?? "-"} />
                  <MiniInfo label="Satış" value={formatMoney(item.total_price, item.currency)} />
                </div>

                <OrderStatusCardActions
  id={item.id}
  initialStatus={item.status}
  initialStartCount={item.start_count}
  initialEndCount={item.end_count}
  initialCompletionNote={item.completion_note}
  orderNumber={item.order_number}
  fullName={item.full_name}
  contactType={item.contact_type}
  contactValue={item.contact_value}
  serviceTitle={item.service_title}
  targetUsername={item.target_username}
/>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} prevHref={buildPageHref(queryParams, "opage", page - 1)} nextHref={buildPageHref(queryParams, "opage", page + 1)} />
    </section>
  );
}

function SectionHeader({
  title,
  total,
  page,
  totalPages,
}: {
  title: string;
  total: number;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <span className="text-sm text-white/45">
        {total} kayıt • Sayfa {page}/{totalPages}
      </span>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  prevHref,
  nextHref,
}: {
  page: number;
  totalPages: number;
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-3">
      {page > 1 ? (
        <a href={prevHref} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">
          ← Önceki
        </a>
      ) : null}

      {page < totalPages ? (
        <a href={nextHref} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black">
          Sonraki →
        </a>
      ) : null}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-1 text-xs uppercase tracking-wide text-white/35">{label}</p>
      <p className="break-words text-white/85">{value}</p>
    </div>
  );
}