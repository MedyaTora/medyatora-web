import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";
import {
  formatOrderDate,
  formatOrderMoney,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/order-status";

type OrderRow = RowDataPacket & {
  id: number;
  order_number: string;
  service_title: string;
  platform: string;
  category: string;
  quantity: number;
  total_price: string | number;
  currency: string;
  status: string;
  created_at: string;
};

const PAGE_SIZE = 10;

function getPageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw || 1);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const page = getPageNumber(resolvedSearchParams?.page);
  const offset = (page - 1) * PAGE_SIZE;

  const pool = getMysqlPool();

  const [countRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS total
    FROM order_requests
    WHERE user_id = ?
    `,
    [user.id]
  );

  const totalOrders = Number(countRows[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));

  const [orders] = await pool.query<OrderRow[]>(
    `
    SELECT
      id,
      order_number,
      service_title,
      platform,
      category,
      quantity,
      total_price,
      currency,
      status,
      created_at
    FROM order_requests
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    `,
    [user.id, PAGE_SIZE, offset]
  );

  return (
    <main className="mt-premium-page px-4 py-6 text-white sm:px-6">
      <div className="mt-top-fade" />
      <div className="mt-bottom-fade" />

      <div className="mt-premium-inner mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.025] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] font-black text-white">
              MT
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-white">
                MedyaTora
              </div>
              <div className="text-xs text-white/45">Sipariş geçmişi</div>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Ana Sayfa
              </Link>

              <Link
                href="/hesabim"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Hesabım
              </Link>

              <Link
                href="/paketler"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Paketler
              </Link>

              <Link
                href="/smmtora"
                className="rounded-full border border-white/12 bg-white px-3 py-2 font-black text-black transition hover:bg-white/90"
              >
                SMMTora
              </Link>
            </nav>

            <UserMenu />
          </div>
        </header>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#080a0d]/92 shadow-[0_24px_100px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.03] backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.035] blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  Hesabım
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Siparişlerim
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                  Tüm siparişlerini, durumlarını, tarihlerini ve detay
                  bağlantılarını bu alandan takip edebilirsin.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Toplam sipariş
                  </p>
                  <p className="mt-3 text-3xl font-black text-white">
                    {totalOrders}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Sayfa
                  </p>
                  <p className="mt-3 text-3xl font-black text-white">
                    {page} / {totalPages}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-3">
              <Link
                href="/hesabim"
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
              >
                Hesabıma Dön
              </Link>

              <Link
                href="/smmtora"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Yeni Sipariş Oluştur
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz siparişin yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                SMMTora veya paketler sayfasından giriş yapmış halde sipariş
                oluşturduğunda burada görünecek.
              </p>
              <Link
                href="/smmtora"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                İlk Siparişi Oluştur
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[1.1fr_1.55fr_0.8fr_0.85fr_0.9fr_0.6fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 lg:grid">
                <div>Sipariş</div>
                <div>Hizmet</div>
                <div>Tutar</div>
                <div>Durum</div>
                <div>Tarih</div>
                <div>Detay</div>
              </div>

              <div className="divide-y divide-white/10">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] lg:grid-cols-[1.1fr_1.55fr_0.8fr_0.85fr_0.9fr_0.6fr] lg:items-center"
                  >
                    <div>
                      <p className="text-xs text-white/40">Sipariş No</p>
                      <p className="mt-1 font-black text-white">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        ID: {order.id}
                      </p>
                    </div>

                    <div>
                      <p className="line-clamp-2 text-sm font-bold text-white">
                        {order.service_title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {order.platform} / {order.category} ·{" "}
                        {Number(order.quantity).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 lg:hidden">Tutar</p>
                      <p className="mt-1 text-sm font-black text-white">
                        {formatOrderMoney(order.total_price, order.currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 lg:hidden">Durum</p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 lg:hidden">Tarih</p>
                      <p className="mt-1 text-sm text-white/60">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>

                    <div>
                      <Link
                        href={`/hesabim/siparisler/${order.order_number}`}
                        className="inline-flex rounded-2xl bg-white px-4 py-2 text-center text-xs font-black text-black transition hover:bg-white/90"
                      >
                        Detay
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link
                href={`/hesabim/siparisler?page=${page - 1}`}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                Önceki
              </Link>
            ) : (
              <span />
            )}

            {page < totalPages ? (
              <Link
                href={`/hesabim/siparisler?page=${page + 1}`}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                Sonraki
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}