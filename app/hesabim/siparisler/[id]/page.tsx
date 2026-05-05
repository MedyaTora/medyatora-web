import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";
import {
  formatOrderDate,
  formatOrderMoney,
  getOrderStatusClass,
  getOrderStatusDescription,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/order-status";

type OrderDetailRow = RowDataPacket & {
  id: number;
  order_number: string;
  batch_code: string;
  service_title: string;
  platform: string;
  category: string;
  service_id: number;
  site_code: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  unit_cost_price: string | number;
  total_cost_price: string | number;
  guarantee_label: string;
  speed: string;
  currency: string;
  payment_method: string;
  target_username: string | null;
  target_link: string | null;
  order_note: string | null;
  status: string;
  start_count: number | null;
  end_count: number | null;
  completion_note: string | null;
  admin_note: string | null;
  created_at: string;
};

type RefundSummaryRow = RowDataPacket & {
  refunded_total: string | number | null;
  latest_refund_amount: string | number | null;
  latest_refund_currency: string | null;
  latest_refund_note: string | null;
  latest_refund_created_at: string | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toLocaleString("tr-TR");
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-white">{value || "-"}</div>
    </div>
  );
}

function createSupportMessage(orderNumber: string) {
  return `Merhaba, MedyaTora siparişim hakkında destek almak istiyorum. Sipariş No: ${orderNumber}`;
}

function getCustomerStatusLabel(status: string) {
  if (status === "partial_refunded") return "Kısmi Tamamlandı";
  return getOrderStatusLabel(status);
}

function getCustomerStatusDescription(status: string) {
  if (status === "partial_refunded") {
    return "Siparişinizin büyük kısmı tamamlandı. Teslim edilemeyen kısım için bakiye iadesi yapılmıştır.";
  }

  return getOrderStatusDescription(status);
}

function getDeliverySpeedText(status: string, speed: string | null | undefined) {
  if (status === "pending_payment") return "Ödeme onayı bekleniyor";
  if (status === "pending") return speed && speed.trim() ? speed : "Sipariş sıraya alındı";
  if (status === "processing") return speed && speed.trim() ? speed : "Gönderim hazırlanıyor";
  if (status === "in_progress") return speed && speed.trim() ? speed : "Gönderim devam ediyor";
  if (status === "completed") return speed && speed.trim() ? speed : "Gönderim tamamlandı";
  if (status === "refunded") return "Sipariş tutarı iade edildi";
  if (status === "partial_refunded") return "Sipariş kısmi olarak tamamlandı";
  if (status === "cancelled") return "Sipariş iptal edildi";
  if (status === "failed") return "İşlem başarısız oldu";

  return speed && speed.trim() ? speed : "-";
}

function getRefundBoxText(status: string, refundedTotal: number) {
  if (refundedTotal <= 0) {
    return "Bu sipariş için henüz iade kaydı bulunmuyor.";
  }

  if (status === "refunded") {
    return "Bu sipariş için tam iade kaydı oluşturulmuş.";
  }

  if (status === "partial_refunded") {
    return "Sipariş kısmi olarak tamamlandı ve eksik kalan kısım için iade yapıldı.";
  }

  return "Bu sipariş için iade kaydı bulunuyor.";
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const resolvedParams = await params;
  const orderNumber = decodeURIComponent(resolvedParams.id || "").trim();

  if (!orderNumber) {
    notFound();
  }

  const pool = getMysqlPool();

  const [rows] = await pool.query<OrderDetailRow[]>(
    `
    SELECT
      id,
      order_number,
      batch_code,
      service_title,
      platform,
      category,
      service_id,
      site_code,
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
      completion_note,
      admin_note,
      created_at
    FROM order_requests
    WHERE order_number = ?
      AND user_id = ?
    LIMIT 1
    `,
    [orderNumber, user.id]
  );

  const order = rows[0];

  if (!order) {
    notFound();
  }

  const [refundRows] = await pool.query<RefundSummaryRow[]>(
    `
    SELECT
      totals.refunded_total,
      latest.amount AS latest_refund_amount,
      latest.currency AS latest_refund_currency,
      latest.note AS latest_refund_note,
      latest.created_at AS latest_refund_created_at
    FROM (
      SELECT COALESCE(SUM(amount), 0) AS refunded_total
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
    ) totals
    LEFT JOIN (
      SELECT amount, currency, note, created_at
      FROM order_refund_transactions
      WHERE order_id = ?
        AND currency = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    ) latest ON 1 = 1
    `,
    [order.id, order.currency, order.id, order.currency]
  );

  const refundSummary = refundRows[0];

  const orderTotal = roundMoney(Number(order.total_price || 0));
  const refundedTotal = roundMoney(Number(refundSummary?.refunded_total || 0));
  const remainingRefundable = roundMoney(Math.max(orderTotal - refundedTotal, 0));

  const startCount =
    order.start_count === null || order.start_count === undefined
      ? null
      : Number(order.start_count);

  const endCount =
    order.end_count === null || order.end_count === undefined
      ? null
      : Number(order.end_count);

  const deliveredQuantity =
    startCount !== null && endCount !== null && endCount >= startCount
      ? Math.max(endCount - startCount, 0)
      : null;

  const missingQuantity =
    deliveredQuantity !== null
      ? Math.max(Number(order.quantity || 0) - deliveredQuantity, 0)
      : null;

  const isPartialRefunded = order.status === "partial_refunded";
  const hasRefundNote =
    refundSummary?.latest_refund_note &&
    refundSummary.latest_refund_note.trim().length > 0;

  const supportMessage = createSupportMessage(order.order_number);
  const encodedSupportMessage = encodeURIComponent(supportMessage);

  const telegramUrl = `https://t.me/medyatora?text=${encodedSupportMessage}`;
  const whatsappUrl = `https://wa.me/905530739292?text=${encodedSupportMessage}`;

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
              <div className="text-xs text-white/45">Sipariş detayı</div>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
              <Link
                href="/hesabim"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Hesabım
              </Link>

              <Link
                href="/hesabim/siparisler"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Siparişlerim
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

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  Sipariş Merkezi
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Sipariş Detayı
                </h1>

                <p className="mt-4 text-sm text-white/55">
                  Sipariş No:{" "}
                  <span className="font-bold text-white">{order.order_number}</span>
                </p>

                <p className="mt-1 text-sm text-white/45">
                  {formatOrderDate(order.created_at)}
                </p>

                <div className="mt-5">
                  <span
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${getOrderStatusClass(
                      order.status
                    )}`}
                  >
                    {getCustomerStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                  Toplam Tutar
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {formatOrderMoney(order.total_price, order.currency)}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  Ödeme yöntemi: {getPaymentMethodLabel(order.payment_method)}
                </p>
              </div>
            </div>

            <div className="relative mt-6 max-w-3xl">
              <h2 className="text-2xl font-black text-white">
                {order.service_title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                {getCustomerStatusDescription(order.status)}
              </p>
            </div>
          </div>
        </section>

        {isPartialRefunded && (
          <section className="rounded-[32px] border border-[#6b5b2a]/60 bg-[#211d11]/70 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.25)] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e7d9a4]">
                  Kısmi Tamamlandı
                </p>

                <h2 className="mt-2 text-xl font-black text-white">
                  Siparişinizin teslim edilemeyen kısmı için iade yapıldı.
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  Siparişinizin büyük kısmı tamamlandı. Eksik kalan bölüm için
                  ilgili tutar aynı para birimindeki bakiyenize geri yansıtıldı.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:min-w-[520px]">
                <InfoCard label="Sipariş Miktarı" value={formatQuantity(order.quantity)} />
                <InfoCard label="Teslim Edilen" value={formatQuantity(deliveredQuantity)} />
                <InfoCard label="Eksik Kalan" value={formatQuantity(missingQuantity)} />
                <InfoCard
                  label="İade Edilen Tutar"
                  value={formatOrderMoney(refundedTotal, order.currency)}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                İade Açıklaması
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                {hasRefundNote
                  ? refundSummary.latest_refund_note
                  : "Teslim edilemeyen kısım için ilgili tutar bakiyenize geri yansıtılmıştır."}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                İade Bilgisi
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                {getRefundBoxText(order.status, refundedTotal)}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                İade varsa, iade edilen tutar siparişin para birimiyle gösterilir.
                TL, USD ve RUB bakiyeleri ayrı ayrı tutulur.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:min-w-[520px]">
              <InfoCard
                label="Sipariş Tutarı"
                value={formatOrderMoney(orderTotal, order.currency)}
              />
              <InfoCard
                label="İade Edilen"
                value={formatOrderMoney(refundedTotal, order.currency)}
              />
              <InfoCard
                label="Kalan İade"
                value={formatOrderMoney(remainingRefundable, order.currency)}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Platform" value={order.platform} />
          <InfoCard label="Kategori" value={order.category} />
          <InfoCard label="Ürün Kodu" value={order.site_code} />
          <InfoCard
            label="Miktar"
            value={Number(order.quantity).toLocaleString("tr-TR")}
          />
          <InfoCard
            label="Birim Fiyat"
            value={`${Number(order.unit_price || 0).toFixed(2)} ${
              order.currency
            } / 1000`}
          />
          <InfoCard
            label="Toplam Fiyat"
            value={formatOrderMoney(order.total_price, order.currency)}
          />
          <InfoCard label="Garanti" value={order.guarantee_label || "-"} />
          <InfoCard
            label="Gönderim Hızı"
            value={getDeliverySpeedText(order.status, order.speed)}
          />
          <InfoCard
            label="Ödeme Yöntemi"
            value={getPaymentMethodLabel(order.payment_method)}
          />
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <h2 className="text-xl font-black text-white">Hedef Bilgileri</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoCard label="Hedef Kullanıcı" value={order.target_username || "-"} />

            <InfoCard
              label="Hedef Link"
              value={
                order.target_link ? (
                  <a
                    href={order.target_link}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-white underline underline-offset-4"
                  >
                    {order.target_link}
                  </a>
                ) : (
                  "-"
                )
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Sipariş Notu
            </p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {order.order_note || "Not eklenmemiş."}
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] md:p-6">
          <h2 className="text-xl font-black text-white">Desteğe Ulaş</h2>

          <p className="mt-2 text-sm leading-6 text-white/65">
            Bu siparişle ilgili destek almak istersen aşağıdaki butonlardan bize
            ulaşabilirsin.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/[0.09]"
            >
              Telegram ile Destek Al
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-black transition hover:bg-white/90"
            >
              WhatsApp ile Destek Al
            </a>
          </div>

          <p className="mt-3 text-xs text-white/40">Hazır mesaj: {supportMessage}</p>
        </section>
      </div>
    </main>
  );
}