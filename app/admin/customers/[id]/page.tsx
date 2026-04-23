export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@supabase/supabase-js";

type CustomerRow = {
  id: number;
  created_at: string;
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

type AnalysisHistoryRow = {
  id: number;
  customer_id: number;
  coupon_code: string | null;
  package_type: string | null;
  package_price: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
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
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        {title}
      </p>
      <p className="break-all text-sm text-white/90">{value || "-"}</p>
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
      <p className="text-sm leading-7 text-white/85">{value || "-"}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const customerId = Number(params.id);

  if (!Number.isFinite(customerId)) {
    return <ErrorScreen message="Geçersiz müşteri id." />;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select(`
      id,
      created_at,
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
    `)
    .eq("id", customerId)
    .single();

  const { data: analysisList, error: analysisError } = await supabase
    .from("analysis_requests")
    .select(`
      id,
      customer_id,
      coupon_code,
      package_type,
      package_price,
      currency,
      status,
      created_at
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (customerError || !customer) {
    return <ErrorScreen message="Müşteri bulunamadı." />;
  }

  if (analysisError) {
    return <ErrorScreen message={analysisError.message} />;
  }

  const customerData = customer as CustomerRow;
  const analyses = (analysisList || []) as AnalysisHistoryRow[];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <a
          href="/admin/customers"
          className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
        >
          ← Müşterilere Dön
        </a>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Customer Detail
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {customerData.full_name || "İsimsiz müşteri"}
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Oluşturulma: {formatDate(customerData.created_at)}
              </p>
            </div>

            <a
              href={`/admin/customers/${customerData.id}`}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300"
            >
              ID: {customerData.id}
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard title="Kullanıcı Adı" value={customerData.username || "-"} />
            <InfoCard title="Hesap Linki" value={customerData.account_link || "-"} />
            <InfoCard title="Hesap Türü" value={customerData.account_type || "-"} />
            <InfoCard title="İçerik Türü" value={customerData.content_type || "-"} />
            <InfoCard
              title="Günlük Paylaşım"
              value={
                customerData.daily_post_count !== null &&
                customerData.daily_post_count !== undefined
                  ? String(customerData.daily_post_count)
                  : "-"
              }
            />
            <InfoCard
              title="İletişim"
              value={`${customerData.contact_type || "-"} / ${customerData.contact_value || "-"}`}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TextCard title="Genel Sorun" value={customerData.main_problem} />
            <TextCard title="En Büyük Eksik" value={customerData.main_missing} />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Analiz Geçmişi</h2>
            <span className="text-sm text-white/45">{analyses.length} kayıt</span>
          </div>

          {analyses.length > 0 ? (
            <div className="grid gap-4">
              {analyses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                      {item.status || "-"}
                    </span>
                    <span className="text-sm text-white/60">
                      {item.package_type || "-"} • {item.package_price ?? "-"} {item.currency || ""}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Kupon: {item.coupon_code || "-"}
                    </span>
                  </div>

                  <p className="text-sm text-white/50">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/50">
              Analiz kaydı yok.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}