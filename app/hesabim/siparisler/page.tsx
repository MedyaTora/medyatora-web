import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
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
    <main className="min-h-screen bg-[#050712] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/35">
              Hesabım
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              Siparişlerim
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Tüm siparişlerini buradan sayfa sayfa görüntüleyebilirsin.
            </p>
          </div>

          <Link
            href="/hesabim"
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Hesabıma Dön
          </Link>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-4 shadow-[0_20px_90px_rgba(0,0,0,0.32)] md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/55">
              Toplam sipariş:{" "}
              <span className="font-bold text-white">{totalOrders}</span>
            </p>
            <p className="text-sm text-white/45">
              Sayfa {page} / {totalPages}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/55">
              Henüz siparişin yok.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="text-xs text-white/40">Sipariş No</p>
                    <p className="mt-1 font-black text-white">
                      {order.order_number}
                    </p>
                    <p className="mt-2 line-clamp-1 text-sm text-white/60">
                      {order.service_title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-xs text-white/35">Tutar</p>
                      <p className="mt-1 font-bold text-white">
                        {formatOrderMoney(order.total_price, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/35">Tarih</p>
                      <p className="mt-1 font-bold text-white">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/35">Durum</p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/hesabim/siparisler/${order.order_number}`}
                    className="rounded-2xl bg-emerald-400 px-5 py-3 text-center text-sm font-black text-black transition hover:bg-emerald-300"
                  >
                    Detay
                  </Link>
                </div>
              ))}
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