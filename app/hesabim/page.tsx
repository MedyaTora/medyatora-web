import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

type OrderRow = RowDataPacket & {
  id: number;
  order_number: string;
  batch_code: string | null;
  service_title: string;
  platform: string;
  category: string;
  quantity: number;
  total_price: string | number;
  currency: string;
  status: string;
  payment_method: string | null;
  target_username: string | null;
  created_at: Date | string;
};

type AnalysisRow = RowDataPacket & {
  id: number;
  coupon_code: string | null;
  package_price: string | number;
  currency: string;
  status: string;
  is_free_analysis: number;
  analysis_price_usd: string | number;
  created_at: Date | string;
  customer_full_name: string | null;
  username: string | null;
  account_link: string | null;
  account_type: string | null;
  content_type: string | null;
};

const statusLabels: Record<string, string> = {
  pending_payment: "Ödeme Bekliyor",
  pending: "Beklemede",
  processing: "İşlemde",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
  failed: "Başarısız",
};

const statusClasses: Record<string, string> = {
  pending_payment: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  pending: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  processing: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  refunded: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  failed: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

function formatMoney(value: string | number, currency: string) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0 ${currency}`;
  }

  if (currency === "TL") {
    return `${Math.round(numberValue).toLocaleString("tr-TR")} TL`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function formatDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  return statusLabels[status] || status;
}

function getStatusClass(status: string) {
  return (
    statusClasses[status] ||
    "border-white/10 bg-white/[0.06] text-white/70"
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const pool = getMysqlPool();

  const [orders] = await pool.query<OrderRow[]>(
    `
    SELECT
      id,
      order_number,
      batch_code,
      service_title,
      platform,
      category,
      quantity,
      total_price,
      currency,
      status,
      payment_method,
      target_username,
      created_at
    FROM order_requests
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 20
    `,
    [user.id]
  );

  const [analysisRequests] = await pool.query<AnalysisRow[]>(
    `
    SELECT
      analysis_requests.id,
      analysis_requests.coupon_code,
      analysis_requests.package_price,
      analysis_requests.currency,
      analysis_requests.status,
      analysis_requests.is_free_analysis,
      analysis_requests.analysis_price_usd,
      analysis_requests.created_at,
      customers.full_name AS customer_full_name,
      customers.username,
      customers.account_link,
      customers.account_type,
      customers.content_type
    FROM analysis_requests
    INNER JOIN customers ON customers.id = analysis_requests.customer_id
    WHERE analysis_requests.user_id = ?
    ORDER BY analysis_requests.id DESC
    LIMIT 10
    `,
    [user.id]
  );

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const activeOrders = orders.filter((order) =>
    ["pending_payment", "pending", "processing"].includes(order.status)
  ).length;

  const totalAnalysisRequests = analysisRequests.length;
  const pendingAnalysisRequests = analysisRequests.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2440_0%,#0a1020_45%,#04070f_100%)] px-4 py-6 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[280px] w-[280px] rounded-full bg-sky-500/12 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 font-black text-black">
              MT
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-white">
                MedyaTora
              </div>
              <div className="text-xs text-white/45">Kullanıcı hesabı</div>
            </div>
          </a>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/70">
            <a href="/" className="transition hover:text-white">
              Ana Sayfa
            </a>
            <a href="/smmtora" className="transition hover:text-white">
              SMMTora
            </a>
            <a href="/#analysis" className="transition hover:text-white">
              Analiz
            </a>
            <a href="/paketler" className="transition hover:text-white">
              Paketler
            </a>
          </nav>
        </header>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111827]/90 shadow-[0_24px_100px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.03] backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
                  Hesabım
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Hoş geldin, {user.full_name || user.email}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                  Bu alanda bakiye durumunu, analiz hakkını, telefon doğrulama
                  durumunu ve hesabına bağlı son siparişleri takip edebilirsin.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/smmtora"
                    className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Yeni Sipariş Oluştur
                  </a>

                  <a
                    href="/#analysis"
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
                  >
                    Analiz Talebi Bırak
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
                    Bakiye
                  </p>
                  <p className="mt-3 text-3xl font-black text-white">
                    {Number(user.balance_usd || 0).toFixed(2)} USD
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Bakiye ile ödeme sistemi sonraki aşamada aktif edilecek.
                  </p>
                </div>

                <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/75">
                    Analiz hakkı
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {user.free_analysis_used ? "Kullanıldı" : "Aktif"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Ücretsiz analiz hesabına bağlanacak.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    E-posta
                  </p>
                  <p className="mt-3 break-all text-sm font-bold text-white">
                    {user.email}
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    {user.email_verified ? "Doğrulandı" : "Henüz doğrulanmadı"}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    Telefon
                  </p>
                  <p className="mt-3 text-sm font-bold text-white">
                    {user.phone_number || "Eklenmedi"}
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    {user.phone_verified
                      ? "Doğrulandı"
                      : "Doğrulama sonrası 1$ bonus aktif edilecek"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Toplam sipariş
            </p>
            <p className="mt-3 text-3xl font-black text-white">{totalOrders}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Aktif işlem
            </p>
            <p className="mt-3 text-3xl font-black text-white">{activeOrders}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Tamamlanan
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Analiz talebi
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {totalAnalysisRequests}
            </p>
            <p className="mt-2 text-sm text-white/45">
              Bekleyen: {pendingAnalysisRequests}
            </p>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Analiz geçmişi
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Analiz taleplerin
              </h2>
            </div>

            <p className="text-sm text-white/45">
              Son 10 analiz talebi listelenir.
            </p>
          </div>

          {analysisRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz hesabına bağlı analiz talebi yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Giriş yapmış halde analiz talebi bıraktığında burada görünecek.
              </p>
              <a
                href="/#analysis"
                className="mt-5 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Analiz Talebi Bırak
              </a>
            </div>
          ) : (
            <div className="grid gap-3">
              {analysisRequests.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-white">
                          Analiz #{item.id}
                        </p>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>

                        {Boolean(item.is_free_analysis) && (
                          <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                            Ücretsiz
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-1 text-sm text-white/55">
                        <p>
                          Kullanıcı: {item.username || item.account_link || "-"}
                        </p>
                        <p>
                          Hesap türü: {item.account_type || "-"} · İçerik:{" "}
                          {item.content_type || "-"}
                        </p>
                        <p>
                          Kupon: {item.coupon_code || "-"} · Tarih:{" "}
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <p className="text-xs text-white/40">Analiz fiyatı</p>
                      <p className="mt-1 text-lg font-black text-emerald-300">
                        {formatMoney(item.package_price, item.currency || "USD")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Sipariş geçmişi
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son siparişlerin
              </h2>
            </div>

            <p className="text-sm text-white/45">
              Son 20 sipariş listelenir.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz hesabına bağlı sipariş yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Giriş yapmış halde sipariş oluşturduğunda burada görünecek.
              </p>
              <a
                href="/smmtora"
                className="mt-5 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                İlk Siparişi Oluştur
              </a>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[1.1fr_1.5fr_0.7fr_0.8fr_0.9fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 lg:grid">
                <div>Sipariş</div>
                <div>Hizmet</div>
                <div>Tutar</div>
                <div>Durum</div>
                <div>Tarih</div>
              </div>

              <div className="divide-y divide-white/10">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] lg:grid-cols-[1.1fr_1.5fr_0.7fr_0.8fr_0.9fr] lg:items-center"
                  >
                    <div>
                      <p className="text-xs text-white/40">Sipariş No</p>
                      <p className="mt-1 font-bold text-white">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Hedef: {order.target_username || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="line-clamp-2 text-sm font-bold text-white">
                        {order.service_title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {order.platform} / {order.category} · {order.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-black text-emerald-300">
                        {formatMoney(order.total_price, order.currency)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-white/60">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}