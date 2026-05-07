export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";
import AdminBalanceTopupActions from "@/app/components/admin-balance-topup-actions";

type TopupStatus = "pending" | "approved" | "rejected" | string;

type BalanceTopupRow = RowDataPacket & {
  id: number;
  user_id: number;
  request_number: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  currency: string;
  amount: string | number;
  payment_method: string | null;
  support_channel: string | null;
  status: TopupStatus;
  user_note: string | null;
  admin_note: string | null;
  receipt_sent: number;
  receipt_sent_at: Date | string | null;
  approved_at: Date | string | null;
  rejected_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type SearchParams = {
  status?: string;
};

function normalizeStatus(value: string | undefined) {
  const status = String(value || "").trim().toLowerCase();

  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "all") return "all";

  return "pending";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Onay Bekliyor",
    approved: "Onaylandı",
    rejected: "Reddedildi",
  };

  return map[status] || status || "-";
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    pending: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    rejected: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  };

  return map[status] || "border-white/10 bg-white/[0.06] text-white/70";
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-white/45">{subtitle}</p>}
    </div>
  );
}

export default async function AdminBalanceTopupsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const selectedStatus = normalizeStatus(params.status);

  const pool = getMysqlPool();

  const queryParams: unknown[] = [];
  let statusCondition = "";

  if (selectedStatus !== "all") {
    statusCondition = "WHERE status = ?";
    queryParams.push(selectedStatus);
  }

  const [rows] = await pool.query<BalanceTopupRow[]>(
    `
    SELECT
      id,
      user_id,
      request_number,
      full_name,
      email,
      phone_number,
      currency,
      amount,
      payment_method,
      support_channel,
      status,
      user_note,
      admin_note,
      receipt_sent,
      receipt_sent_at,
      approved_at,
      rejected_at,
      created_at,
      updated_at
    FROM balance_topup_requests
    ${statusCondition}
    ORDER BY id DESC
    LIMIT 200
    `,
    queryParams
  );

  const [statRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
      COUNT(*) AS total_count
    FROM balance_topup_requests
    `
  );

  const stats = statRows[0] || {};

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                MedyaTora Finans
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Yatırım / Bakiye Yükleme Talepleri
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                Kullanıcıların para yükleme talepleri burada görünür. Dekontu
                kontrol ettikten sonra onay verirsen ilgili TL, USD veya RUB
                bakiyesi kullanıcının hesabına eklenecek.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
              >
                Admin Panel
              </Link>

              <Link
                href="/admin/profit"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
              >
                Kâr Paneli
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
              >
                Siparişler
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Bekleyen"
            value={Number(stats.pending_count || 0)}
            subtitle="Admin onayı bekler"
          />
          <StatCard
            title="Onaylanan"
            value={Number(stats.approved_count || 0)}
            subtitle="Bakiyeye işlenmiş"
          />
          <StatCard
            title="Reddedilen"
            value={Number(stats.rejected_count || 0)}
            subtitle="Geçersiz / iptal"
          />
          <StatCard
            title="Toplam"
            value={Number(stats.total_count || 0)}
            subtitle="Tüm yatırım kayıtları"
          />
        </section>

        <form className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-72">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Durum
              </label>

              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white outline-none"
              >
                <option value="pending" className="bg-[#111827]">
                  Onay Bekleyen
                </option>
                <option value="approved" className="bg-[#111827]">
                  Onaylanan
                </option>
                <option value="rejected" className="bg-[#111827]">
                  Reddedilen
                </option>
                <option value="all" className="bg-[#111827]">
                  Tümü
                </option>
              </select>
            </div>

            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black">
              Filtrele
            </button>

            <Link
              href="/admin/balance-topups"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-bold text-white/75"
            >
              Temizle
            </Link>
          </div>
        </form>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.30)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                Yatırım Talepleri
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son 200 kayıt
              </h2>
            </div>

            <p className="text-sm text-white/45">{rows.length} kayıt</p>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Bu filtreye uygun yatırım talebi yok.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:bg-white/[0.04] md:p-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-white">
                          {row.request_number}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(
                            row.status
                          )}`}
                        >
                          {getStatusLabel(row.status)}
                        </span>

                        {Boolean(row.receipt_sent) && (
                          <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/70">
                            Dekont bildirildi
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-1 text-sm leading-6 text-white/58">
                        <p>
                          <span className="font-bold text-white/80">
                            Kullanıcı ID:
                          </span>{" "}
                          {row.user_id}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            Ad Soyad:
                          </span>{" "}
                          {row.full_name || "-"}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            E-posta:
                          </span>{" "}
                          {row.email || "-"}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            Telefon:
                          </span>{" "}
                          {row.phone_number || "-"}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            Destek kanalı:
                          </span>{" "}
                          {row.support_channel || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Yükleme Tutarı
                        </p>

                        <p className="mt-2 text-3xl font-black text-white">
                          {formatMoney(row.amount, row.currency)}
                        </p>

                        <div className="mt-4 grid gap-1 text-sm leading-6 text-white/50">
                          <p>Para birimi: {row.currency}</p>
                          <p>Yöntem: {row.payment_method || "-"}</p>
                          <p>Oluşturma: {formatDate(row.created_at)}</p>
                          <p>Dekont: {formatDate(row.receipt_sent_at)}</p>
                          <p>Onay: {formatDate(row.approved_at)}</p>
                          <p>Red: {formatDate(row.rejected_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Kullanıcı Notu
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/60">
                          {row.user_note || "-"}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Admin İşlemi
                        </p>

                        {row.status === "pending" ? (
                          <div className="mt-3">
<AdminBalanceTopupActions
  requestId={row.id}
  requestNumber={row.request_number}
  amount={row.amount}
  currency={row.currency}
/>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm leading-6 text-white/60">
                            Bu talep için işlem tamamlanmış.
                          </p>
                        )}

                        {row.admin_note && (
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/50">
                            {row.admin_note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}