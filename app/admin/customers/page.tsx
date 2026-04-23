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

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="break-words text-sm text-white/90">{value}</p>
    </div>
  );
}

export default async function CustomersPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorScreen message={error.message} />;
  }

  const customers = (data || []) as CustomerRow[];

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
                Customers
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Müşteriler
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Müşteri kayıtlarını, iletişim bilgilerini ve temel hesap verilerini tek ekrandan takip et.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Başvurular
              </a>
              <a
                href="/admin/customers"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Müşteriler
              </a>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Müşteri Listesi</h2>
          <span className="text-sm text-white/45">{customers.length} kayıt</span>
        </section>

        {customers.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-white/45">
            Kayıt yok
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((item) => (
              <div
                key={item.id}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {item.full_name || "İsimsiz müşteri"}
                    </h3>
                    <p className="mt-1 text-sm text-white/45">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <a
                    href={`/admin/customers/${item.id}`}
                    className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Detayı Aç
                  </a>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <InfoBox label="Kullanıcı Adı" value={item.username || "-"} />
                  <InfoBox label="Hesap Linki" value={item.account_link || "-"} />
                  <InfoBox label="Hesap Türü" value={item.account_type || "-"} />
                  <InfoBox label="İçerik Türü" value={item.content_type || "-"} />
                  <InfoBox
                    label="Günlük Paylaşım"
                    value={
                      item.daily_post_count !== null && item.daily_post_count !== undefined
                        ? String(item.daily_post_count)
                        : "-"
                    }
                  />
                  <InfoBox
                    label="İletişim"
                    value={`${item.contact_type || "-"} / ${item.contact_value || "-"}`}
                  />
                  <InfoBox label="Ana Problem" value={item.main_problem || "-"} />
                  <InfoBox label="Ana Eksik" value={item.main_missing || "-"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}