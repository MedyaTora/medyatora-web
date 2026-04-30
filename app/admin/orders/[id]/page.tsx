export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMysqlPool } from "@/lib/mysql";
import OrderStatusCardActions from "@/app/components/order-status-card-actions";
import AdminBalanceRefundCard from "@/app/components/admin-balance-refund-card";

type OrderDetailRow = {
  id: number;
  user_id: number | null;
  created_at: string;
  updated_at: string | null;
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
  payment_method: string | null;
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
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return "-";
  }
}

function normalizeCurrency(currency: string | null | undefined) {
  const value = currency?.trim().toUpperCase();

  if (value === "TRY") return "TL";
  if (value === "₺") return "TL";
  if (value === "TL") return "TL";
  if (value === "USD") return "USD";
  if (value === "RUB") return "RUB";

  return "TL";
}

function formatMoney(value: number | null | undefined, currency?: string | null) {
  const safeValue = typeof value === "number" ? value : 0;
  return `${safeValue} ${normalizeCurrency(currency)}`.trim();
}

function calculateProfit(order: OrderDetailRow) {
  const sale = typeof order.total_price === "number" ? order.total_price : 0;
  const cost =
    typeof order.total_cost_price === "number" ? order.total_cost_price : 0;

  return sale - cost;
}

function getOrderStatusLabel(status: string | null | undefined) {
  const map: Record<string, string> = {
    pending_payment: "Ödeme Bekliyor",
    pending: "Bekliyor",
    processing: "İşlemde",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
    partial_refunded: "Kısmi İade Edildi",
    failed: "Başarısız",
  };

  return map[status || ""] || status || "-";
}

function getOrderStatusBadgeClass(status: string | null | undefined) {
  const map: Record<string, string> = {
    pending_payment: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    processing: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cancelled: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    refunded: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    partial_refunded: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    failed: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return map[status || ""] || "border-white/10 bg-white/[0.04] text-white/60";
}

function getPaymentMethodLabel(method: string | null | undefined) {
  const map: Record<string, string> = {
    turkey_bank: "Türkiye Banka Havalesi / EFT",
    support: "Destek ile İletişime Geçilecek",
    balance: "MedyaTora Bakiyesi",
  };

  return map[method || ""] || method || "-";
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
      <p className="break-words text-sm font-semibold text-white/90">
        {value || "-"}
      </p>
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
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const orderId = Number(resolvedParams.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <ErrorScreen message="Geçersiz sipariş id." />;
  }

  const pool = getMysqlPool();

  function toDateValue(value: unknown) {
    if (!value) return "";
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  let order: OrderDetailRow;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        user_id,
        created_at,
        updated_at,
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
        payment_method,
        target_username,
        target_link,
        order_note,
        status,
        start_count,
        end_count,
        completion_note
      FROM order_requests
      WHERE id = ?
      LIMIT 1
      `,
      [orderId]
    );

    const row = (rows as any[])[0];

    if (!row) {
      return <ErrorScreen message="Sipariş bulunamadı." />;
    }

    order = {
      id: Number(row.id),
      user_id: row.user_id === null ? null : Number(row.user_id),
      created_at: toDateValue(row.created_at),
      updated_at: row.updated_at ? toDateValue(row.updated_at) : null,
      batch_code: row.batch_code,
      order_number: row.order_number,
      full_name: row.full_name,
      phone_number: row.phone_number,
      contact_type: row.contact_type,
      contact_value: row.contact_value,
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
      guarantee_label: row.guarantee_label,
      speed: row.speed,
      currency: normalizeCurrency(row.currency),
      payment_method: row.payment_method,
      target_username: row.target_username,
      target_link: row.target_link,
      order_note: row.order_note,
      status: row.status,
      start_count: row.start_count === null ? null : Number(row.start_count),
      end_count: row.end_count === null ? null : Number(row.end_count),
      completion_note: row.completion_note,
    };
  } catch (error) {
    return (
      <ErrorScreen
        message={
          error instanceof Error
            ? error.message
            : "MySQL sipariş detayı okunamadı."
        }
      />
    );
  }

  const displayCurrency = normalizeCurrency(order.currency);

  let alreadyRefunded = 0;

  try {
    const [refundRows] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS refunded_total
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
      `,
      [order.id, displayCurrency]
    );

    const refundRow = (refundRows as any[])[0];
    alreadyRefunded = Number(refundRow?.refunded_total || 0);
  } catch {
    alreadyRefunded = 0;
  }

  const orderTotalForRefund =
    typeof order.total_price === "number" ? order.total_price : 0;

  const remainingRefundable = Math.max(
    0,
    Math.round(
      (orderTotalForRefund - alreadyRefunded + Number.EPSILON) * 100
    ) / 100
  );

  const profit = calculateProfit(order);
  const profitRate =
    typeof order.total_price === "number" && order.total_price > 0
      ? Math.round((profit / order.total_price) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/admin"
            className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
          >
            ← Admin’e Dön
          </a>

          <a
            href={`/admin?orderStatus=${encodeURIComponent(
              order.status || "all"
            )}`}
            className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
          >
            Aynı Durumdaki Siparişler
          </a>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {getOrderStatusLabel(order.status)}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {order.platform || "-"} • {order.category || "-"}
                </span>

                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                  {displayCurrency}
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {getPaymentMethodLabel(order.payment_method)}
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Sipariş Detayı
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-4xl">
                {order.order_number || "Sipariş Detayı"}
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Oluşturulma: {formatDate(order.created_at)}
              </p>

              <p className="mt-1 text-sm text-white/50">
                Son Güncelleme: {formatDate(order.updated_at)}
              </p>

              <p className="mt-1 text-sm text-white/50">
                Batch: {order.batch_code || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300">
              DB ID: {order.id}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-xl font-bold">Sipariş Bilgileri</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextCard title="Hizmet Adı" value={order.service_title} />
                <TextCard title="Hedef Link" value={order.target_link} />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard title="Miktar" value={order.quantity ?? "-"} />
                <InfoCard title="Garanti" value={order.guarantee_label || "-"} />
                <InfoCard title="Hız" value={order.speed || "-"} />
                <InfoCard
                  title="Durum"
                  value={getOrderStatusLabel(order.status)}
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-xl font-bold">Müşteri Bilgileri</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard title="Müşteri" value={order.full_name || "-"} />
                <InfoCard title="Telefon" value={order.phone_number || "-"} />
                <InfoCard
                  title="İletişim"
                  value={`${order.contact_type || "-"} / ${
                    order.contact_value || "-"
                  }`}
                />
                <InfoCard
                  title="Hedef Kullanıcı"
                  value={order.target_username || "-"}
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-xl font-bold">Fiyat ve Kâr</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <InfoCard
                  title="Birim Alış"
                  value={`${order.unit_cost_price ?? 0} ${displayCurrency} / 1000`}
                />
                <InfoCard
                  title="Birim Satış"
                  value={`${order.unit_price ?? 0} ${displayCurrency} / 1000`}
                />
                <InfoCard
                  title="Toplam Alış"
                  value={formatMoney(order.total_cost_price, displayCurrency)}
                />
                <InfoCard
                  title="Toplam Satış"
                  value={formatMoney(order.total_price, displayCurrency)}
                />
                <InfoCard
                  title="Tahmini Kâr"
                  value={`${formatMoney(profit, displayCurrency)} (${profitRate}%)`}
                  highlight
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-xl font-bold">İşlem Sonucu</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InfoCard
                  title="Başlangıç Sayısı"
                  value={order.start_count ?? "-"}
                />
                <InfoCard title="Bitiş Sayısı" value={order.end_count ?? "-"} />
                <InfoCard
                  title="Fark"
                  value={
                    typeof order.start_count === "number" &&
                    typeof order.end_count === "number"
                      ? order.end_count - order.start_count
                      : "-"
                  }
                  highlight={
                    typeof order.start_count === "number" &&
                    typeof order.end_count === "number" &&
                    order.end_count - order.start_count > 0
                  }
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextCard title="Sipariş Notu" value={order.order_note} />
                <TextCard
                  title="Admin / İşlem Notu"
                  value={order.completion_note}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <AdminBalanceRefundCard
              orderId={order.id}
              orderNumber={order.order_number}
              userId={order.user_id}
              paymentMethod={order.payment_method}
              currency={displayCurrency}
              totalPrice={order.total_price}
              alreadyRefunded={alreadyRefunded}
              remainingRefundable={remainingRefundable}
              status={order.status}
            />

            <OrderStatusCardActions
              id={order.id}
              initialStatus={order.status || "pending"}
              initialStartCount={order.start_count}
              initialEndCount={order.end_count}
              initialCompletionNote={order.completion_note}
              orderNumber={order.order_number}
              fullName={order.full_name}
              contactType={order.contact_type}
              contactValue={order.contact_value}
              serviceTitle={order.service_title}
              targetUsername={order.target_username}
            />

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-xl font-bold">Hızlı Kontrol</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
                <p>
                  <span className="font-semibold text-white">Sipariş No:</span>{" "}
                  {order.order_number || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Panel ID:</span>{" "}
                  {order.service_id || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Ürün Kodu:</span>{" "}
                  {order.site_code || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Hedef:</span>{" "}
                  {order.target_username || order.target_link || "-"}
                </p>
                <p>
                  <span className="font-semibold text-white">Ödeme:</span>{" "}
                  {getPaymentMethodLabel(order.payment_method)}
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}