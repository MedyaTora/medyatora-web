import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
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
  created_at: string;
};

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-white">{value || "-"}</div>
    </div>
  );
}

function createSupportMessage(orderNumber: string) {
  return `Merhaba, MedyaTora siparişim hakkında destek almak istiyorum. Sipariş No: ${orderNumber}`;
}

function getDeliverySpeedText(status: string, speed: string | null | undefined) {
  if (status === "pending_payment") {
    return "Ödeme onayı bekleniyor";
  }

  if (status === "pending") {
    return speed && speed.trim() ? speed : "Sipariş sıraya alındı";
  }

  if (status === "processing") {
    return speed && speed.trim() ? speed : "Gönderim hazırlanıyor";
  }

  if (status === "in_progress") {
    return speed && speed.trim() ? speed : "Gönderim devam ediyor";
  }

  if (status === "completed") {
    return speed && speed.trim() ? speed : "Gönderim tamamlandı";
  }

  if (status === "refunded") {
    return "Sipariş tutarı iade edildi";
  }

  if (status === "partial_refunded") {
    return "Kısmi iade yapıldı";
  }

  if (status === "cancelled") {
    return "Sipariş iptal edildi";
  }

  if (status === "failed") {
    return "İşlem başarısız oldu";
  }

  return speed && speed.trim() ? speed : "-";
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

  const supportMessage = createSupportMessage(order.order_number);
  const encodedSupportMessage = encodeURIComponent(supportMessage);

  const telegramUrl = "https://t.me/medyatora";
  const whatsappUrl = `https://wa.me/?text=${encodedSupportMessage}`;

  return (
    <main className="min-h-screen bg-[#050712] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
              Sipariş Merkezi
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              Sipariş Detayı
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Sipariş No:{" "}
              <span className="font-bold text-white">{order.order_number}</span>
            </p>
            <p className="mt-1 text-sm text-white/45">
              {formatOrderDate(order.created_at)}
            </p>
          </div>

          <Link
            href="/hesabim/siparisler"
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Siparişlere Dön
          </Link>
        </div>

        <section className="mb-5 rounded-[32px] border border-white/10 bg-[#111827]/80 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${getOrderStatusClass(
                  order.status
                )}`}
              >
                {getOrderStatusLabel(order.status)}
              </span>

              <h2 className="mt-4 text-2xl font-black text-white">
                {order.service_title}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                {getOrderStatusDescription(order.status)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
              <p className="text-xs text-emerald-200/70">Toplam Tutar</p>
              <p className="mt-1 text-2xl font-black text-white">
                {formatOrderMoney(order.total_price, order.currency)}
              </p>
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

        <section className="mt-5 rounded-[32px] border border-white/10 bg-[#111827]/80 p-5 md:p-6">
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
                    className="break-all text-emerald-200 underline"
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Sipariş Notu
            </p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {order.order_note || "Not eklenmemiş."}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[32px] border border-sky-400/20 bg-sky-400/10 p-5 md:p-6">
          <h2 className="text-xl font-black text-white">Desteğe Ulaş</h2>

          <p className="mt-2 text-sm leading-6 text-white/65">
            Bu siparişle ilgili destek almak istersen aşağıdaki butonlardan bize ulaşabilirsin.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-5 py-3 text-center text-sm font-black text-sky-100 transition hover:bg-sky-300/15"
            >
              Telegram ile Destek Al
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-center text-sm font-black text-emerald-100 transition hover:bg-emerald-300/15"
            >
              WhatsApp ile Destek Al
            </a>
          </div>

          <p className="mt-3 text-xs text-white/40">
            Hazır mesaj: {supportMessage}
          </p>
        </section>
      </div>
    </main>
  );
}