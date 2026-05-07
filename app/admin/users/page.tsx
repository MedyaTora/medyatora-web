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
      `(email LIKE ? OR full_name LIKE ? OR username LIKE ? OR phone_number LIKE ? OR id = ?)`
    );

    queryParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, Number(q) || 0);
  }

  if (emailStatus === "verified") {
    whereParts.push(`email_verified = 1`);
  }

  if (emailStatus === "unverified") {
    whereParts.push(`email_verified = 0`);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  const [rows] = await pool.query<UserRow[]>(
    `
    SELECT
      id,
      email,
      full_name,
      username,
      phone_number,
      email_verified,
      email_verified_at,
      balance_tl,
      balance_usd,
      balance_rub,
      preferred_currency,
      free_analysis_used,
      welcome_bonus_claimed,
      is_active,
      is_admin,
      auth_provider,
      created_at,
      last_login_at
    FROM users
    ${whereSql}
    ORDER BY id DESC
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
                Sisteme kayıt olan kullanıcıları, e-posta doğrulama durumlarını,
                bakiyelerini ve son giriş bilgilerini buradan takip edebilirsin.
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
                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.75fr]">
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
                          <p>
                            TL:{" "}
                            <span className="font-black text-white">
                              {formatMoney(user.balance_tl, "TL")}
                            </span>
                          </p>
                          <p>
                            USD:{" "}
                            <span className="font-black text-white">
                              {formatMoney(user.balance_usd, "USD")}
                            </span>
                          </p>
                          <p>
                            RUB:{" "}
                            <span className="font-black text-white">
                              {formatMoney(user.balance_rub, "RUB")}
                            </span>
                          </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/55">
                          Tercih: {user.preferred_currency || "TL"}
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}