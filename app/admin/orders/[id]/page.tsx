export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@supabase/supabase-js";

type OrderDetailRow = {
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
  service_id: number | null;
  site_code: number | null;
  service_title: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  unit_cost_price: number | null;
  total_cost_price: number | null;
  guarantee_label: string | null;
  speed: string | null;
  currency: string | null;
  target_username: string | null;
  target_link: string | null;
  order_note: string | null;
  status: string | null;
  start_count: number | null;
  end_count: number | null;
  completion_note: string | null;
};

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

function calculateProfit(order: OrderDetailRow) {
  const sale = typeof order.total_price === "number" ? order.total_price : 0;
  const cost = typeof order.total_cost_price === "number" ? order.total_cost_price : 0;
  return sale - cost;
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

function InfoCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-emerald-400/20 bg-emerald-400/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        {title}
      </p>
      <p className="break-words text-sm font-semibold text-white/90">{value || "-"}</p>
    </div>
  );
}

function TextCard({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
        {title}
      </p>
      <p className="whitespace-pre-line break-words text-sm leading-7 text-white/85">
        {value || "-"}
      </p>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const orderId = Number(params.id);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return <ErrorScreen message="Geçersiz sipariş id." />;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase
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
      service_id,
      site_code,
      service_title,
      quantity,
      unit_price,
      total_price,
      unit_cost_price,
      total_cost_price,
      guarantee_label,
      speed,
      currency,
      target_username,
      target_link,
      order_note,
      status,
      start_count,
      end_count,
      completion_note
    `)
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return <ErrorScreen message="Sipariş bulunamadı." />;
  }

  const order = data as OrderDetailRow;
  const profit = calculateProfit(order);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <a
          href="/admin"
          className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
        >
          ← Admin’e Dön
        </a>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black">
                  {order.status || "-"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {order.platform || "-"} • {order.category || "-"}
                </span>

                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                  {order.currency || "-"}
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Order Detail
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
                {order.order_number || "Sipariş Detayı"}
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Oluşturulma: {formatDate(order.created_at)}
              </p>

              <p className="mt-1 text-sm text-white/50">
                Batch: {order.batch_code || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300">
              DB ID: {order.id}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Panel Servis ID"
              value={order.service_id ?? "-"}
              highlight
            />
            <InfoCard
              title="Müşteri Ürün Kodu"
              value={order.site_code ?? "-"}
              highlight
            />
            <InfoCard title="Platform" value={order.platform || "-"} />
            <InfoCard title="Kategori" value={order.category || "-"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TextCard title="Hizmet Adı" value={order.service_title} />
            <TextCard title="Hedef Link" value={order.target_link} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard title="Müşteri" value={order.full_name || "-"} />
            <InfoCard title="Telefon" value={order.phone_number || "-"} />
            <InfoCard
              title="İletişim"
              value={`${order.contact_type || "-"} / ${order.contact_value || "-"}`}
            />
            <InfoCard title="Hedef Kullanıcı" value={order.target_username || "-"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard title="Miktar" value={order.quantity ?? "-"} />
            <InfoCard title="Garanti" value={order.guarantee_label || "-"} />
            <InfoCard title="Hız" value={order.speed || "-"} />
            <InfoCard title="Durum" value={order.status || "-"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Birim Satış"
              value={`${order.unit_price ?? 0} ${order.currency || ""} / 1000`}
            />
            <InfoCard
              title="Toplam Satış"
              value={formatMoney(order.total_price, order.currency)}
            />
            <InfoCard
              title="Toplam Alış"
              value={formatMoney(order.total_cost_price, order.currency)}
            />
            <InfoCard
              title="Tahmini Kâr"
              value={formatMoney(profit, order.currency)}
              highlight
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard title="Başlangıç Sayısı" value={order.start_count ?? "-"} />
            <InfoCard title="Bitiş Sayısı" value={order.end_count ?? "-"} />
            <InfoCard
              title="Fark"
              value={
                typeof order.start_count === "number" &&
                typeof order.end_count === "number"
                  ? order.end_count - order.start_count
                  : "-"
              }
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TextCard title="Sipariş Notu" value={order.order_note} />
            <TextCard title="Tamamlanma Notu" value={order.completion_note} />
          </div>
        </section>
      </div>
    </main>
  );
}