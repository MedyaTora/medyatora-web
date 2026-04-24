export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@supabase/supabase-js";

type CustomerRow = {
  id: string;
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

const PAGE_SIZE = 20;

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

function includesText(value: unknown, q: string) {
  return String(value || "").toLowerCase().includes(q.toLowerCase());
}

function getPageItems<T>(items: T[], page: number) {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function buildPageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  return `/admin/customers?${params.toString()}`;
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    page?: string;
  };
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <ErrorScreen message="Supabase environment variables eksik." />;
  }

  const q = searchParams?.q?.trim() || "";
  const page = Math.max(Number(searchParams?.page || 1), 1);

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

  const filteredCustomers = customers.filter((item) => {
    if (!q) return true;

    return (
      includesText(item.full_name, q) ||
      includesText(item.username, q) ||
      includesText(item.account_link, q) ||
      includesText(item.account_type, q) ||
      includesText(item.content_type, q) ||
      includesText(item.contact_type, q) ||
      includesText(item.contact_value, q) ||
      includesText(item.main_problem, q) ||
      includesText(item.main_missing, q) ||
      includesText(item.id, q)
    );
  });

  const totalPages = Math.max(Math.ceil(filteredCustomers.length / PAGE_SIZE), 1);
  const pageItems = getPageItems(filteredCustomers, page);

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
                Müşteri kayıtlarını arama ve sayfalama ile daha hızlı takip et.
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

        <form className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
                Müşteri Ara
              </label>
              <input
                name="q"
                defaultValue={q}
                placeholder="İsim, kullanıcı adı, iletişim, hesap linki..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>

            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">
              Ara
            </button>

            <a
              href="/admin/customers"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white/80"
            >
              Temizle
            </a>
          </div>
        </form>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Müşteri Listesi</h2>
            <span className="text-sm text-white/45">
              {filteredCustomers.length} kayıt • Sayfa {page}/{totalPages}
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-3 py-2">Tarih</th>
                  <th className="px-3 py-2">Müşteri</th>
                  <th className="px-3 py-2">Kullanıcı</th>
                  <th className="px-3 py-2">Hesap Türü</th>
                  <th className="px-3 py-2">İçerik</th>
                  <th className="px-3 py-2">İletişim</th>
                  <th className="px-3 py-2">Problem</th>
                  <th className="px-3 py-2">İşlem</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id} className="bg-black/20">
                    <td className="rounded-l-2xl px-3 py-3 text-white/60">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-3 py-3 font-semibold">
                      {item.full_name || "İsimsiz müşteri"}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {item.username || "-"}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {item.account_type || "-"}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {item.content_type || "-"}
                    </td>

                    <td className="px-3 py-3 text-white/70">
                      {item.contact_type || "-"} / {item.contact_value || "-"}
                    </td>

                    <td className="max-w-[260px] truncate px-3 py-3 text-white/70">
                      {item.main_problem || "-"}
                    </td>

                    <td className="rounded-r-2xl px-3 py-3">
                      <a
                        href={`/admin/customers/${item.id}`}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"
                      >
                        Detay
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pageItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/45">
                Kayıt yok
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {page > 1 ? (
              <a
                href={buildPageHref(q, page - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80"
              >
                ← Önceki
              </a>
            ) : null}

            {page < totalPages ? (
              <a
                href={buildPageHref(q, page + 1)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
              >
                Sonraki →
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}