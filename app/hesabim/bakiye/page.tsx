import Link from "next/link";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMysqlPool } from "@/lib/mysql";
import UserMenu from "@/app/components/auth/UserMenu";

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
  welcome_google_bonus: "Google Kayıt Bonusu",
  contact_verification_bonus: "Hesap Bonusu",
  email_verification_bonus: "E-posta Doğrulama Bonusu",
  admin_add: "Admin Bakiye Ekleme",
  admin_remove: "Admin Bakiye Düşme",
  analysis_payment: "Analiz Ödemesi",
};

const transactionTypeClasses: Record<string, string> = {
  order_payment: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
  order_refund: "border-white/18 bg-white/[0.08] text-white",
  order_partial_refund: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  welcome_bonus: "border-white/12 bg-white/[0.06] text-white/72",
  welcome_google_bonus: "border-white/12 bg-white/[0.06] text-white/72",
  contact_verification_bonus: "border-white/12 bg-white/[0.06] text-white/72",
  email_verification_bonus: "border-white/12 bg-white/[0.06] text-white/72",
  admin_add: "border-white/18 bg-white/[0.08] text-white",
  admin_remove: "border-[#6b5b2a]/60 bg-[#211d11]/70 text-[#e7d9a4]",
  analysis_payment: "border-[#6b2232] bg-[#31101b]/70 text-[#f2c7d1]",
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
    return `0,00 ${currency}`;
  }

  return `${numberValue.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatSignedMoney(
  value: string | number | null | undefined,
  currency: string
) {
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

function getAmountClass(value: string | number | null | undefined) {
  const numberValue = Number(value || 0);

  if (numberValue > 0) return "text-white";
  if (numberValue < 0) return "text-[#f2c7d1]";

  return "text-white/70";
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
              <div className="text-xs text-white/45">
                Bakiye işlem geçmişi
              </div>
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

            <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
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
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Yeni Sipariş Oluştur
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    TL Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {formatMoney(user.balance_tl || 0, "TL")}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    USD Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {formatMoney(user.balance_usd || 0, "USD")}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    RUB Bakiye
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {formatMoney(user.balance_rub || 0, "RUB")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#080a0d]/92 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                Hareketler
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Son bakiye işlemleri
              </h2>
            </div>

            <p className="text-sm text-white/45">Son 100 işlem listelenir.</p>
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
              <div className="hidden grid-cols-[0.8fr_0.75fr_0.85fr_0.85fr_0.85fr_1.4fr_0.9fr] gap-4 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40 xl:grid">
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

                  return (
                    <div
                      key={transaction.id}
                      className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.035] xl:grid-cols-[0.8fr_0.75fr_0.85fr_0.85fr_0.85fr_1.4fr_0.9fr] xl:items-center"
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
                          className={`mt-1 text-sm font-black ${getAmountClass(
                            display.amount
                          )}`}
                        >
                          {formatSignedMoney(display.amount, display.currency)}
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