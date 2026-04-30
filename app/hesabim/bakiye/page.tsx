import Link from "next/link";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";

type BalanceTransactionRow = RowDataPacket & {
  id: number;
  transaction_type: string;
  currency: string | null;
  amount: string | number | null;
  balance_before: string | number | null;
  balance_after: string | number | null;
  amount_usd: string | number | null;
  balance_before_usd: string | number | null;
  balance_after_usd: string | number | null;
  description: string | null;
  related_order_id: number | null;
  related_analysis_id: number | null;
  created_at: Date | string;
};

const transactionTypeLabels: Record<string, string> = {
  order_payment: "Sipariş Ödemesi",
  order_refund: "Tam İade",
  order_partial_refund: "Kısmi İade",
  welcome_bonus: "Hoş Geldin Bonusu",
  admin_add: "Admin Bakiye Ekleme",
  admin_remove: "Admin Bakiye Düşme",
  analysis_payment: "Analiz Ödemesi",
};

const transactionTypeClasses: Record<string, string> = {
  order_payment: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  order_refund: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  order_partial_refund:
    "border-violet-400/25 bg-violet-400/10 text-violet-200",
  welcome_bonus: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  admin_add: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  admin_remove: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  analysis_payment: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

function normalizeCurrency(value: string | null | undefined) {
  const currency = value?.trim().toUpperCase();

  if (currency === "TRY") return "TL";
  if (currency === "₺") return "TL";
  if (currency === "TL") return "TL";
  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "USD";
}

function formatMoney(value: string | number | null | undefined, currency: string) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  if (currency === "TL") {
    return `${numberValue.toFixed(2)} TL`;
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

function getTransactionLabel(type: string) {
  return transactionTypeLabels[type] || type || "-";
}

function getTransactionClass(type: string) {
  return (
    transactionTypeClasses[type] ||
    "border-white/10 bg-white/[0.06] text-white/70"
  );
}

function getDisplayValues(transaction: BalanceTransactionRow) {
  const currency = normalizeCurrency(transaction.currency);

  const amount =
    transaction.amount !== null && transaction.amount !== undefined
      ? transaction.amount
      : transaction.amount_usd;

  const before =
    transaction.balance_before !== null &&
    transaction.balance_before !== undefined
      ? transaction.balance_before
      : transaction.balance_before_usd;

  const after =
    transaction.balance_after !== null &&
    transaction.balance_after !== undefined
      ? transaction.balance_after
      : transaction.balance_after_usd;

  return {
    currency,
    amount,
    before,
    after,
  };
}

export default async function BalancePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const pool = getMysqlPool();

  const [transactions] = await pool.query<BalanceTransactionRow[]>(
    `
    SELECT
      id,
      transaction_type,
      currency,
      amount,
      balance_before,
      balance_after,
      amount_usd,
      balance_before_usd,
      balance_after_usd,
      description,
      related_order_id,
      related_analysis_id,
      created_at
    FROM balance_transactions
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 100
    `,
    [user.id]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2440_0%,#0a1020_45%,#04070f_100%)] px-4 py-6 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[280px] w-[280px] rounded-full bg-sky-500/12 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 font-black text-black">
              MT
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-white">
                MedyaTora
              </div>
              <div className="text-xs text-white/45">
                Bakiye işlem geçmişi
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/70">
            <Link href="/" className="transition hover:text-white">
              Ana Sayfa
            </Link>
            <Link href="/hesabim" className="transition hover:text-white">
              Hesabım
            </Link>
            <Link href="/smmtora" className="transition hover:text-white">
              SMMTora
            </Link>
          </nav>
        </header>

        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111827]/90 shadow-[0_24px_100px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.03] backdrop-blur-xl">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
                  Bakiye
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  İşlem geçmişi
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                  Bu sayfada hesabına ait bakiye yüklemeleri, sipariş
                  ödemeleri, bonuslar ve iade hareketleri listelenir.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/hesabim"
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white"
                  >
                    Hesabıma Dön
                  </Link>

                  <Link
                    href="/smmtora"
                    className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Yeni Sipariş Oluştur
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    USD Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {Number(user.balance_usd || 0).toFixed(2)} USD
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    TL Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {Number(user.balance_tl || 0).toFixed(2)} TL
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    RUB Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {Number(user.balance_rub || 0).toFixed(2)} RUB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Hareketler
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son bakiye işlemleri
              </h2>
            </div>

            <p className="text-sm text-white/45">
              Son 100 işlem listelenir.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
              <p className="text-lg font-bold text-white">
                Henüz bakiye işlemin yok.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Bakiye yükleme, sipariş ödemesi veya iade oluştuğunda burada
                görünecek.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[0.8fr_0.9fr_0.75fr_0.75fr_0.75fr_1.4fr_0.85fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 xl:grid">
                <div>İşlem</div>
                <div>Para</div>
                <div>Tutar</div>
                <div>Önce</div>
                <div>Sonra</div>
                <div>Açıklama</div>
                <div>Tarih</div>
              </div>

              <div className="divide-y divide-white/10">
                {transactions.map((transaction) => {
                  const display = getDisplayValues(transaction);
                  const isPositive = Number(display.amount || 0) > 0;

                  return (
                    <div
                      key={transaction.id}
                      className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] xl:grid-cols-[0.8fr_0.9fr_0.75fr_0.75fr_0.75fr_1.4fr_0.85fr] xl:items-center"
                    >
                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          İşlem
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getTransactionClass(
                            transaction.transaction_type
                          )}`}
                        >
                          {getTransactionLabel(transaction.transaction_type)}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Para Birimi
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {display.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Tutar
                        </p>
                        <p
                          className={`mt-1 text-sm font-black ${
                            isPositive ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatMoney(display.amount, display.currency)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Önce
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/75">
                          {formatMoney(display.before, display.currency)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Sonra
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/75">
                          {formatMoney(display.after, display.currency)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Açıklama
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/60">
                          {transaction.description || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 xl:hidden">
                          Tarih
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}