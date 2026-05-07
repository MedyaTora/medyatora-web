export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMysqlPool } from "@/lib/mysql";

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

type AnalysisRequestDetailRow = {
  id: string;
  coupon_code: string | null;
  package_type: string | null;
  package_price: number | null;
  currency: string | null;
  status: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string | null;
  customers: CustomerInfo | CustomerInfo[] | null;
};

function normalizeCustomer(
  customers: AnalysisRequestDetailRow["customers"]
): CustomerInfo | null {
  if (!customers) return null;
  if (Array.isArray(customers)) return customers[0] ?? null;
  return customers;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("tr-TR");
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

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const analysisId = Number(resolvedParams.id);

  if (!Number.isInteger(analysisId) || analysisId <= 0) {
    return <ErrorScreen message="Geçersiz kayıt id." />;
  }

  const pool = getMysqlPool();

  function toDateValue(value: unknown) {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  let item: AnalysisRequestDetailRow;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.coupon_code,
        a.package_type,
        a.package_price,
        a.currency,
        a.status,
        a.admin_note,
        a.created_at,
        a.updated_at,
        c.full_name,
        c.username,
        c.account_link,
        c.account_type,
        c.content_type,
        c.daily_post_count,
        c.main_problem,
        c.main_missing,
        c.contact_type,
        c.contact_value
      FROM analysis_requests a
      LEFT JOIN customers c ON c.id = a.customer_id
      WHERE a.id = ?
      LIMIT 1
      `,
      [analysisId]
    );

    const row = (rows as any[])[0];

    if (!row) {
      return <ErrorScreen message="Kayıt bulunamadı." />;
    }

    item = {
      id: String(row.id),
      coupon_code: row.coupon_code,
      package_type: row.package_type,
      package_price:
        row.package_price === null ? null : Number(row.package_price),
      currency: row.currency,
      status: row.status,
      admin_note: row.admin_note,
      created_at: toDateValue(row.created_at) || "",
      updated_at: toDateValue(row.updated_at),
      customers: {
        full_name: row.full_name,
        username: row.username,
        account_link: row.account_link,
        account_type: row.account_type,
        content_type: row.content_type,
        daily_post_count: row.daily_post_count,
        main_problem: row.main_problem,
        main_missing: row.main_missing,
        contact_type: row.contact_type,
        contact_value: row.contact_value,
      },
    };
  } catch (error) {
    return (
      <ErrorScreen
        message={
          error instanceof Error
            ? error.message
            : "MySQL analiz detayı okunamadı."
        }
      />
    );
  }

  const customer = normalizeCustomer(item.customers);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
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
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  {item.status || "-"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {item.package_type || "-"} • {item.package_price ?? "-"}{" "}
                  {item.currency || ""}
                </span>

                {item.coupon_code ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Kupon: {item.coupon_code}
                  </span>
                ) : null}
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Analysis Detail
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {customer?.full_name || "İsimsiz başvuru"}
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Oluşturulma: {formatDate(item.created_at)}
              </p>

              <p className="mt-1 text-sm text-white/50">
                Güncellenme: {formatDate(item.updated_at)}
              </p>
            </div>

            <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300">
              ID: {item.id}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              title="Kullanıcı Adı"
              value={customer?.username || "-"}
            />

            <InfoCard
              title="Hesap Linki"
              value={customer?.account_link || "-"}
            />

            <InfoCard
              title="Hesap Türü"
              value={customer?.account_type || "-"}
            />

            <InfoCard
              title="İçerik Türü"
              value={customer?.content_type || "-"}
            />

            <InfoCard
              title="Günlük Paylaşım"
              value={
                customer?.daily_post_count !== null &&
                customer?.daily_post_count !== undefined
                  ? String(customer.daily_post_count)
                  : "-"
              }
            />

            <InfoCard
              title="İletişim"
              value={`${customer?.contact_type || "-"} / ${
                customer?.contact_value || "-"
              }`}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TextCard title="Genel Sorun" value={customer?.main_problem} />
            <TextCard title="En Büyük Eksik" value={customer?.main_missing} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TextCard title="Admin Notu" value={item.admin_note} />
            <TextCard title="Kupon Kodu" value={item.coupon_code} />
          </div>
        </section>
      </div>
    </main>
  );
}