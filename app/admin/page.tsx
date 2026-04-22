export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import StatusSelect from '../components/status-select'
import OrderStatusCardActions from '../components/order-status-card-actions'

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: analysisData, error: analysisError } = await supabase
    .from('analysis_requests')
    .select(`
      id,
      coupon_code,
      package_type,
      package_price,
      currency,
      status,
      created_at,
      customers (
        full_name,
        username,
        account_link,
        account_type,
        content_type,
        daily_post_count,
        main_problem,
        main_missing,
        contact_type,
        contact_value
      )
    `)
    .order('created_at', { ascending: false })

  const { data: orderData, error: orderError } = await supabase
    .from('order_requests')
    .select(`
      id,
      created_at,
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
      target_username,
      target_link,
      order_note,
      status,
      start_count,
      end_count,
      completion_note
    `)
    .order('created_at', { ascending: false })

  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  if (analysisError) {
    return (
      <main className="min-h-screen bg-[#050505] p-8 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
          Hata: {analysisError.message}
        </div>
      </main>
    )
  }

  if (orderError) {
    return (
      <main className="min-h-screen bg-[#050505] p-8 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
          Hata: {orderError.message}
        </div>
      </main>
    )
  }

  const allItems = analysisData || []
  const allOrders = orderData || []

  const newRequests = allItems.filter(
    (item: any) => item.package_type === 'analysis' && item.status === 'pending'
  )

  const processingRequests = allItems.filter(
    (item: any) =>
      item.package_type === 'analysis' &&
      (item.status === 'in_review' || item.status === 'contacted')
  )

  const completedRequests = allItems.filter(
    (item: any) => item.package_type === 'analysis' && item.status === 'completed'
  )

  const otherPackages = allItems.filter(
    (item: any) => item.package_type !== 'analysis'
  )

  const pendingOrders = allOrders.filter((item: any) => item.status === 'pending')
  const processedOrders = allOrders.filter((item: any) => item.status !== 'pending')

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#171717_0%,#090909_55%,#050505_100%)] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                MedyaTora Yönetim
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Admin Panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Başvuruları, siparişleri ve müşteri hareketlerini tek ekrandan takip et.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Başvurular
              </a>
              <a
                href="/admin/customers"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
              >
                Müşteriler
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Yeni Başvurular" value={newRequests.length} accent="emerald" />
          <StatCard title="İşlemdekiler" value={processingRequests.length} accent="amber" />
          <StatCard title="Tamamlananlar" value={completedRequests.length} accent="sky" />
          <StatCard title="Diğer Paketler" value={otherPackages.length} accent="violet" />
          <StatCard title="Yeni Siparişler" value={pendingOrders.length} accent="pink" />
          <StatCard title="Toplam Müşteri" value={customerCount || 0} accent="white" />
        </section>

        <Section title="Yeni Başvurular" items={newRequests} />
        <Section title="İşlemdekiler" items={processingRequests} />
        <Section title="Tamamlananlar" items={completedRequests} />
        <Section title="Diğer Paketler" items={otherPackages} />

        <OrderSection title="Yeni Siparişler" items={pendingOrders} />
        <OrderSection title="Diğer Siparişler" items={processedOrders} />
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  accent,
}: {
  title: string
  value: number
  accent: 'emerald' | 'amber' | 'sky' | 'violet' | 'pink' | 'white'
}) {
  const accentMap: Record<string, string> = {
    emerald: 'from-emerald-400/20 to-emerald-500/5 text-emerald-300',
    amber: 'from-amber-400/20 to-amber-500/5 text-amber-300',
    sky: 'from-sky-400/20 to-sky-500/5 text-sky-300',
    violet: 'from-violet-400/20 to-violet-500/5 text-violet-300',
    pink: 'from-pink-400/20 to-pink-500/5 text-pink-300',
    white: 'from-white/15 to-white/5 text-white',
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div
        className={`mb-4 inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${accentMap[accent]}`}
      >
        {title}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <span className="text-sm text-white/45">{items.length} kayıt</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-white/45">
          Kayıt yok
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:p-6"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                      {item.status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                      {item.package_type} • {item.package_price} {item.currency}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.customers?.full_name || 'İsimsiz başvuru'}
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <StatusSelect id={item.id} initialStatus={item.status} />
                  <a
                    href={`/admin/${item.id}`}
                    className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Detayı Aç
                  </a>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoBox label="Kullanıcı Adı" value={item.customers?.username || '-'} />
                <InfoBox
                  label="İletişim"
                  value={`${item.customers?.contact_type || '-'} / ${
                    item.customers?.contact_value || '-'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function OrderSection({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <span className="text-sm text-white/45">{items.length} kayıt</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-white/45">
          Kayıt yok
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] md:p-6"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black">
                      {item.status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                      {item.platform} • {item.category}
                    </span>
                    <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                      {item.batch_code || '-'}
                    </span>
                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                      {item.order_number || '-'}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.full_name || 'İsimsiz sipariş'}
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoBox label="Sipariş No" value={item.order_number || '-'} />
                <InfoBox label="Batch Kodu" value={item.batch_code || '-'} />
                <InfoBox label="Telefon" value={item.phone_number || '-'} />
                <InfoBox label="İletişim Türü" value={item.contact_type || '-'} />
                <InfoBox label="İletişim Bilgisi" value={item.contact_value || '-'} />
                <InfoBox label="Ürün" value={item.service_title || '-'} />
                <InfoBox label="Servis No" value={item.site_code || '-'} />
                <InfoBox label="Hedef Kullanıcı" value={item.target_username || '-'} />
                <InfoBox label="Hedef Link" value={item.target_link || '-'} />
                <InfoBox label="Sipariş Notu" value={item.order_note || '-'} />
                <InfoBox label="Miktar" value={item.quantity || '-'} />
                <InfoBox label="Para Birimi" value={item.currency || '-'} />
                <InfoBox
                  label="1000 Adet Alış"
                  value={`${item.unit_cost_price || 0} ${item.currency || ''}`}
                />
                <InfoBox
                  label="1000 Adet Satış"
                  value={`${item.unit_price || 0} ${item.currency || ''}`}
                />
                <InfoBox
                  label="Toplam Alış"
                  value={`${item.total_cost_price || 0} ${item.currency || ''}`}
                />
                <InfoBox
                  label="Toplam Satış"
                  value={`${item.total_price || 0} ${item.currency || ''}`}
                />
                <InfoBox label="Garanti" value={item.guarantee_label || '-'} />
                <InfoBox label="Hız" value={item.speed || '-'} />
                <InfoBox label="Başlangıç" value={item.start_count || '-'} />
                <InfoBox label="Bitiş" value={item.end_count || '-'} />
                <InfoBox label="Not" value={item.completion_note || '-'} />
              </div>

              <OrderStatusCardActions
                id={item.id}
                initialStatus={item.status}
                initialStartCount={item.start_count}
                initialEndCount={item.end_count}
                initialCompletionNote={item.completion_note}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="break-words text-sm text-white/90">{value}</p>
    </div>
  )
}