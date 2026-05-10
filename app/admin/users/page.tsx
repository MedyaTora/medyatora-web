export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { getMysqlPool } from "@/lib/mysql";

type SearchParams = {
  q?: string;
  emailStatus?: string;
};

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email_verified: number;
  email_verified_at: Date | string | null;
  balance_tl: string | number;
  balance_usd: string | number;
  balance_rub: string | number;
  preferred_currency: string | null;
  free_analysis_used: number;
  welcome_bonus_claimed: number;
  is_active: number;
  is_admin: number;
  auth_provider: string | null;
  created_at: Date | string | null;
  last_login_at: Date | string | null;

  total_topup_tl: string | number;
  total_topup_usd: string | number;
  total_topup_rub: string | number;

  total_orders: string | number;
  total_spent_tl: string | number;
  total_spent_usd: string | number;
  total_spent_rub: string | number;
  last_order_at: Date | string | null;
};

function normalizeEmailStatus(value: unknown) {
  const status = String(value || "").trim().toLowerCase();

  if (status === "verified") return "verified";
  if (status === "unverified") return "unverified";

  return "all";
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

function formatNumber(value: string | number | null | undefined) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) return "0";

  return numberValue.toLocaleString("tr-TR");
}

function getEmailStatusLabel(user: UserRow) {
  if (Boolean(user.email_verified)) return "Doğrulandı";
  return "Doğrulanmadı";
}

function getEmailStatusClass(user: UserRow) {
  if (Boolean(user.email_verified)) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  return "border-amber-400/25 bg-amber-400/10 text-amber-200";
}

function getProviderLabel(provider: string | null) {
  const value = String(provider || "").trim().toLowerCase();

  if (value === "google") return "Google";
  if (value === "email") return "E-posta";

  return provider || "E-posta";
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

function MoneyLine({
  label,
  value,
  currency,
}: {
  label: string;
  value: string | number;
  currency: string;
}) {
  return (
    <p>
      {label}:{" "}
      <span className="font-black text-white">
        {formatMoney(value, currency)}
      </span>
    </p>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const q = String(params.q || "").trim();
  const emailStatus = normalizeEmailStatus(params.emailStatus);

  const pool = getMysqlPool();

  const queryParams: unknown[] = [];
  const whereParts: string[] = [];

  if (q) {
    whereParts.push(
      `(u.email LIKE ? OR u.full_name LIKE ? OR u.username LIKE ? OR u.phone_number LIKE ? OR u.id = ?)`
    );

    queryParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, Number(q) || 0);
  }

  if (emailStatus === "verified") {
    whereParts.push(`u.email_verified = 1`);
  }

  if (emailStatus === "unverified") {
    whereParts.push(`u.email_verified = 0`);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  const [rows] = await pool.query<UserRow[]>(
    `
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.username,
      u.phone_number,
      u.email_verified,
      u.email_verified_at,
      u.balance_tl,
      u.balance_usd,
      u.balance_rub,
      u.preferred_currency,
      u.free_analysis_used,
      u.welcome_bonus_claimed,
      u.is_active,
      u.is_admin,
      u.auth_provider,
      u.created_at,
      u.last_login_at,

      COALESCE(topup.total_topup_tl, 0) AS total_topup_tl,
      COALESCE(topup.total_topup_usd, 0) AS total_topup_usd,
      COALESCE(topup.total_topup_rub, 0) AS total_topup_rub,

      COALESCE(orders.total_orders, 0) AS total_orders,
      COALESCE(orders.total_spent_tl, 0) AS total_spent_tl,
      COALESCE(orders.total_spent_usd, 0) AS total_spent_usd,
      COALESCE(orders.total_spent_rub, 0) AS total_spent_rub,
      orders.last_order_at

    FROM users u

    LEFT JOIN (
      SELECT
        user_id,
        SUM(CASE WHEN currency = 'TL' AND status = 'approved' THEN amount ELSE 0 END) AS total_topup_tl,
        SUM(CASE WHEN currency = 'USD' AND status = 'approved' THEN amount ELSE 0 END) AS total_topup_usd,
        SUM(CASE WHEN currency = 'RUB' AND status = 'approved' THEN amount ELSE 0 END) AS total_topup_rub
      FROM balance_topup_requests
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    ) topup ON topup.user_id = u.id

    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) AS total_orders,
        SUM(CASE WHEN currency = 'TL' THEN total_price ELSE 0 END) AS total_spent_tl,
        SUM(CASE WHEN currency = 'USD' THEN total_price ELSE 0 END) AS total_spent_usd,
        SUM(CASE WHEN currency = 'RUB' THEN total_price ELSE 0 END) AS total_spent_rub,
        MAX(created_at) AS last_order_at
      FROM order_requests
      WHERE user_id IS NOT NULL
      GROUP BY user_id
    ) orders ON orders.user_id = u.id

    ${whereSql}
    ORDER BY u.id DESC
    LIMIT 300
    `,
    queryParams
  );

  const [statRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      COUNT(*) AS total_count,
      SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) AS verified_count,
      SUM(CASE WHEN email_verified = 0 THEN 1 ELSE 0 END) AS unverified_count,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_count,
      SUM(CASE WHEN auth_provider = 'google' THEN 1 ELSE 0 END) AS google_count
    FROM users
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
                MedyaTora Kullanıcı Yönetimi
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Kayıtlı Kullanıcılar
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                Sisteme kayıt olan kullanıcıları, doğrulama durumlarını,
                bakiyelerini, toplam yatırımlarını ve sipariş özetlerini buradan
                takip edebilirsin.
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
                href="/admin/balance-topups"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
              >
                Yatırımlar
              </Link>

              <Link
                href="/admin/profit"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
              >
                Kâr Paneli
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <StatCard
            title="Toplam"
            value={Number(stats.total_count || 0)}
            subtitle="Kayıtlı kullanıcı"
          />
          <StatCard
            title="Doğrulandı"
            value={Number(stats.verified_count || 0)}
            subtitle="E-postası aktif"
          />
          <StatCard
            title="Doğrulanmadı"
            value={Number(stats.unverified_count || 0)}
            subtitle="Kod bekleyen"
          />
          <StatCard
            title="Aktif"
            value={Number(stats.active_count || 0)}
            subtitle="Aktif hesap"
          />
          <StatCard
            title="Google"
            value={Number(stats.google_count || 0)}
            subtitle="Google kayıt"
          />
        </section>

        <form className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_260px_auto_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Arama
              </label>

              <input
                name="q"
                defaultValue={q}
                placeholder="Ad, e-posta, kullanıcı adı, telefon veya ID ara..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/40">
                E-posta Durumu
              </label>

              <select
                name="emailStatus"
                defaultValue={emailStatus}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white outline-none"
              >
                <option value="all" className="bg-[#111827]">
                  Tümü
                </option>
                <option value="verified" className="bg-[#111827]">
                  E-posta doğrulandı
                </option>
                <option value="unverified" className="bg-[#111827]">
                  E-posta doğrulanmadı
                </option>
              </select>
            </div>

            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black">
              Filtrele
            </button>

            <Link
              href="/admin/users"
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
                Kullanıcı Listesi
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son 300 kayıt
              </h2>
            </div>

            <p className="text-sm text-white/45">{rows.length} kayıt</p>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Bu filtreye uygun kullanıcı yok.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition hover:bg-white/[0.04] md:p-5"
                >
                  <div className="grid gap-5 xl:grid-cols-[1.05fr_0.78fr_0.88fr_0.78fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-white">
                          {user.full_name || user.email}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getEmailStatusClass(
                            user
                          )}`}
                        >
                          {getEmailStatusLabel(user)}
                        </span>

                        {Boolean(user.is_admin) && (
                          <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/70">
                            Admin
                          </span>
                        )}

                        {!Boolean(user.is_active) && (
                          <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-200">
                            Pasif
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-1 text-sm leading-6 text-white/58">
                        <p>
                          <span className="font-bold text-white/80">ID:</span>{" "}
                          {user.id}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            E-posta:
                          </span>{" "}
                          {user.email}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            Kullanıcı adı:
                          </span>{" "}
                          {user.username || "-"}
                        </p>

                        <p>
                          <span className="font-bold text-white/80">
                            Telefon:
                          </span>{" "}
                          {user.phone_number || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Bakiyeler
                        </p>

                        <div className="mt-3 grid gap-2 text-sm leading-6 text-white/65">
                          <MoneyLine
                            label="TL"
                            value={user.balance_tl}
                            currency="TL"
                          />
                          <MoneyLine
                            label="USD"
                            value={user.balance_usd}
                            currency="USD"
                          />
                          <MoneyLine
                            label="RUB"
                            value={user.balance_rub}
                            currency="RUB"
                          />
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/55">
                          Tercih: {user.preferred_currency || "TL"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/55">
                          Ticari Özet
                        </p>

                        <div className="mt-3 grid gap-2 text-sm leading-6 text-white/68">
                          <p>
                            Toplam sipariş:{" "}
                            <span className="font-black text-white">
                              {formatNumber(user.total_orders)}
                            </span>
                          </p>

                          <p>
                            Son sipariş:{" "}
                            <span className="font-bold text-white/85">
                              {formatDate(user.last_order_at)}
                            </span>
                          </p>

                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                              Toplam Yatırım
                            </p>
                            <MoneyLine
                              label="TL"
                              value={user.total_topup_tl}
                              currency="TL"
                            />
                            <MoneyLine
                              label="USD"
                              value={user.total_topup_usd}
                              currency="USD"
                            />
                            <MoneyLine
                              label="RUB"
                              value={user.total_topup_rub}
                              currency="RUB"
                            />
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                              Toplam Harcama
                            </p>
                            <MoneyLine
                              label="TL"
                              value={user.total_spent_tl}
                              currency="TL"
                            />
                            <MoneyLine
                              label="USD"
                              value={user.total_spent_usd}
                              currency="USD"
                            />
                            <MoneyLine
                              label="RUB"
                              value={user.total_spent_rub}
                              currency="RUB"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Hesap Bilgileri
                        </p>

                        <div className="mt-3 grid gap-2 text-sm leading-6 text-white/58">
                          <p>
                            Kayıt yöntemi:{" "}
                            <span className="font-bold text-white/80">
                              {getProviderLabel(user.auth_provider)}
                            </span>
                          </p>

                          <p>Doğrulama: {formatDate(user.email_verified_at)}</p>
                          <p>Kayıt: {formatDate(user.created_at)}</p>
                          <p>Son giriş: {formatDate(user.last_login_at)}</p>
                          <p>
                            Ücretsiz analiz:{" "}
                            {Boolean(user.free_analysis_used)
                              ? "Kullanıldı"
                              : "Bekliyor / Aktif"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/[0.08]"
                    >
                      Detay
                    </Link>

                    <Link
                      href={`/admin?q=${encodeURIComponent(user.email)}`}
                      className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-white/90"
                    >
                      Sipariş / Başvuru Ara
                    </Link>
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