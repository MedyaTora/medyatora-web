import Link from "next/link";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";
import ContactVerificationCard from "@/app/components/auth/ContactVerificationCard";

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

type BalanceTransactionRow = RowDataPacket & {
  id: number;
  transaction_type: string;
  currency: string;
  amount: string | number;
  balance_before: string | number;
  balance_after: string | number;
  description: string | null;
  related_order_id: number | null;
  created_at: Date | string;
};

type OrderStatsRow = RowDataPacket & {
  total_orders: string | number;
  completed_orders: string | number;
  active_orders: string | number;
};

type AnalysisStatsRow = RowDataPacket & {
  total_analysis_requests: string | number;
  pending_analysis_requests: string | number;
};

const statusLabels: Record<string, string> = {
  pending_payment: "Ödeme Onaylanıyor",
  pending: "Sipariş Alındı",
  processing: "İşleme Alındı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
  partial_refunded: "Kısmi Tamamlandı",
  failed: "Başarısız",
};

const statusClasses: Record<string, string> = {
  pending_payment: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  pending: "border-white/12 bg-white/[0.06] text-white/72",
  processing: "border-white/12 bg-white/[0.06] text-white/72",
  in_progress: "border-white/12 bg-white/[0.06] text-white/72",
  completed: "border-white/18 bg-white/[0.08] text-white",
  cancelled: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
  refunded: "border-white/12 bg-white/[0.06] text-white/72",
  partial_refunded: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  failed: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
};

const transactionTypeLabels: Record<string, string> = {
  topup: "Bakiye Yükleme",
  balance_topup: "Bakiye Yükleme",
  order_payment: "Sipariş Ödemesi",
  order_refund: "Sipariş İadesi",
  order_partial_refund: "Kısmi İade",
  welcome_bonus: "Hoş Geldin Bonusu",
  welcome_google_bonus: "Google Kayıt Bonusu",
  contact_verification_bonus: "İletişim Doğrulama Bonusu",
  email_verification_bonus: "E-posta Doğrulama Bonusu",
};

function formatMoney(value: string | number, currency: string) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0,00 ${currency}`;
  }

  return `${numberValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatSignedMoney(value: string | number, currency: string) {
  const numberValue = Number(value || 0);
  const sign = numberValue > 0 ? "+" : "";

  return `${sign}${formatMoney(numberValue, currency)}`;
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
    statusClasses[status] || "border-white/10 bg-white/[0.06] text-white/70"
  );
}

function getTransactionTypeLabel(type: string | null | undefined) {
  if (!type) return "-";
  return transactionTypeLabels[type] || type;
}

function getTransactionAmountClass(value: string | number) {
  const numberValue = Number(value || 0);

  if (numberValue > 0) return "text-white";
  if (numberValue < 0) return "text-[#f2c7d1]";

  return "text-white/70";
}

function VerificationCard({
  title,
  description,
  status,
  reward,
  actionLabel,
}: {
  title: string;
  description: string;
  status: "verified" | "pending";
  reward: string;
  actionLabel: string;
}) {
  const verified = status === "verified";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
            {title}
          </p>

          <p className="mt-3 text-sm leading-6 text-white/58">
            {description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black ${
            verified
              ? "border-white/18 bg-white/[0.08] text-white"
              : "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]"
          }`}
        >
          {verified ? "Doğrulandı" : "Bekliyor"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/38">
          Kazanım
        </p>
        <p className="mt-2 text-sm font-bold text-white">{reward}</p>
      </div>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-black text-white/42"
      >
        {verified ? "Tamamlandı" : actionLabel}
      </button>

      {!verified && (
        <p className="mt-3 text-xs leading-5 text-white/38">
          Kod gönderme ve doğrulama route’ları bir sonraki aşamada bağlanacak.
          Bu alan deploy öncesi arayüz olarak hazırlandı.
        </p>
      )}
    </div>
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
    LIMIT 5
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
    LIMIT 5
    `,
    [user.id]
  );

  const [balanceTransactions] = await pool.query<BalanceTransactionRow[]>(
    `
    SELECT
      id,
      transaction_type,
      currency,
      amount,
      balance_before,
      balance_after,
      description,
      related_order_id,
      created_at
    FROM balance_transactions
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 5
    `,
    [user.id]
  );

  const [orderStatsRows] = await pool.query<OrderStatsRow[]>(
    `
    SELECT
      COUNT(*) AS total_orders,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
      SUM(
        CASE
          WHEN status IN ('pending_payment', 'pending', 'processing', 'in_progress')
          THEN 1
          ELSE 0
        END
      ) AS active_orders
    FROM order_requests
    WHERE user_id = ?
    `,
    [user.id]
  );

  const [analysisStatsRows] = await pool.query<AnalysisStatsRow[]>(
    `
    SELECT
      COUNT(*) AS total_analysis_requests,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_analysis_requests
    FROM analysis_requests
    WHERE user_id = ?
    `,
    [user.id]
  );

  const orderStats = orderStatsRows[0];
  const analysisStats = analysisStatsRows[0];

  const totalOrders = Number(orderStats?.total_orders || 0);
  const completedOrders = Number(orderStats?.completed_orders || 0);
  const activeOrders = Number(orderStats?.active_orders || 0);

  const totalAnalysisRequests = Number(
    analysisStats?.total_analysis_requests || 0
  );
  const pendingAnalysisRequests = Number(
    analysisStats?.pending_analysis_requests || 0
  );

  const anyUser = user as any;

  const emailVerified = Boolean(
    anyUser.email_verified || anyUser.email_verified_at
  );

  const contactVerified = Boolean(
    anyUser.phone_verified ||
      anyUser.whatsapp_verified_at ||
      anyUser.telegram_verified_at
  );

  const freeAnalysisGranted = Boolean(
    anyUser.free_analysis_granted_at || !user.free_analysis_used
  );

  const contactBonusGranted = Boolean(
    anyUser.contact_bonus_granted_at || user.welcome_bonus_claimed
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
              <div className="text-xs text-white/45">Kullanıcı hesabı</div>
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
                href="/analiz"
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Analiz
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

            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  Hesabım
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Hoş geldin, {user.full_name || user.email}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                  Bu alanda bakiyelerini, ücretsiz analiz hakkını, doğrulama
                  durumunu, siparişlerini, analiz taleplerini ve son bakiye
                  hareketlerini takip edebilirsin.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/smmtora"
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Yeni Sipariş Oluştur
                  </Link>

                  <Link
                    href="/analiz"
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
                  >
                    Analiz Talebi Bırak
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:col-span-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                        Cüzdan Bakiyeleri
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        TL, USD ve RUB bakiyeleri ayrı tutulur. Sipariş hangi
                        para birimiyle oluşturulursa ödeme o cüzdandan düşer.
                      </p>
                    </div>

                    <Link
                      href="/smmtora"
                      className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                    >
                      Bakiye ile alışveriş
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        TL Cüzdanı
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_tl, "TL")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        TL ile verilen siparişlerde kullanılır.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        USD Cüzdanı
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_usd, "USD")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        USD ile verilen siparişlerde kullanılır.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
                        RUB Cüzdanı
                      </div>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(user.balance_rub, "RUB")}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/45">
                        RUB ile verilen siparişlerde kullanılır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Ücretsiz analiz hakkı
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {freeAnalysisGranted && !user.free_analysis_used
                      ? "Aktif"
                      : user.free_analysis_used
                        ? "Kullanıldı"
                        : "Bekliyor"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    E-posta doğrulaması tamamlanınca 1 ücretsiz analiz hakkı
                    tanımlanır.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    İletişim bonusu
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {contactBonusGranted ? "Tanımlandı" : "Bekliyor"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    WhatsApp veya Telegram doğrulamasından biri yeterlidir.
                    Bonus yalnızca 1 kez verilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <VerificationCard
            title="E-posta doğrulama"
            description={`Kayıtlı e-posta: ${user.email}`}
            status={emailVerified ? "verified" : "pending"}
            reward="1 ücretsiz analiz hakkı"
            actionLabel="Kod Gönder"
          />

          <VerificationCard
            title="WhatsApp doğrulama"
            description={user.phone_number || "Telefon numarası henüz eklenmedi."}
            status={contactVerified ? "verified" : "pending"}
            reward="1 USD bakiye bonusu"
            actionLabel="WhatsApp ile Doğrula"
          />

          <VerificationCard
            title="Telegram doğrulama"
            description="Telegram bot doğrulaması webhook aşamasında bağlanacak."
            status={contactVerified ? "verified" : "pending"}
            reward="WhatsApp doğrulandıysa tekrar bonus verilmez"
            actionLabel="Telegram ile Doğrula"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Toplam sipariş
            </p>
            <p className="mt-3 text-3xl font-black text-white">{totalOrders}</p>
            <p className="mt-2 text-sm text-white/45">
              Ana ekranda son 5 sipariş görünür.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Aktif işlem
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {activeOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
              Tamamlanan
            </p>
            <p className="mt-3 text-3xl font-black text-white">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
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

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
              Bakiye hareketleri
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Son bakiye işlemleri
            </h2>
            <p className="mt-2 text-sm text-white/45">
              Bu alanda sadece son 5 bakiye hareketi gösterilir.
            </p>
          </div>

          {balanceTransactions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz bakiye hareketi yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Bakiye yükleme, sipariş ödemesi veya iade işlemleri olduğunda
                burada görünecek.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {balanceTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-white md:text-base">
                          {getTransactionTypeLabel(
                            transaction.transaction_type
                          )}
                        </p>

                        <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/55">
                          {transaction.currency}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {transaction.description || "Açıklama yok."}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <p className="text-xs text-white/40">Tutar</p>
                      <p
                        className={`mt-1 text-lg font-black ${getTransactionAmountClass(
                          transaction.amount
                        )}`}
                      >
                        {formatSignedMoney(
                          transaction.amount,
                          transaction.currency
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Son bakiye:{" "}
                        {formatMoney(
                          transaction.balance_after,
                          transaction.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                Analiz geçmişi
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Analiz taleplerin
              </h2>
              <p className="mt-2 text-sm text-white/45">
                Bu alanda son 5 analiz talebi gösterilir.
              </p>
            </div>

            <Link
              href="/analiz"
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            >
              Yeni Analiz Talebi
            </Link>
          </div>

          {analysisRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz hesabına bağlı analiz talebi yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Giriş yapmış halde analiz talebi bıraktığında burada görünecek.
              </p>
              <Link
                href="/analiz"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Analiz Talebi Bırak
              </Link>
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
                          <span className="inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/72">
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
                        <p>Tarih: {formatDate(item.created_at)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                      <p className="text-xs text-white/40">Analiz fiyatı</p>
                      <p className="mt-1 text-lg font-black text-white">
                        {formatMoney(item.package_price, item.currency || "USD")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                Sipariş geçmişi
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son siparişlerin
              </h2>
              <p className="mt-2 text-sm text-white/45">
                Bu alanda son 5 sipariş görünür. Eski siparişlerini tüm
                siparişler sayfasından görebilirsin.
              </p>
            </div>

            <Link
              href="/hesabim/siparisler"
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            >
              Tüm Siparişleri Gör
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz hesabına bağlı sipariş yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Giriş yapmış halde sipariş oluşturduğunda burada görünecek.
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
              <div className="hidden grid-cols-[1.1fr_1.5fr_0.75fr_0.85fr_0.9fr_0.55fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 lg:grid">
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
                    className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] lg:grid-cols-[1.1fr_1.5fr_0.75fr_0.85fr_0.9fr_0.55fr] lg:items-center"
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
                        {order.platform} / {order.category} ·{" "}
                        {Number(order.quantity).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">
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
        </section>
      </div>
    </main>
  );
}