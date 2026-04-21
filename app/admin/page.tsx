import { createClient } from '@supabase/supabase-js'
import StatusSelect from '../components/status-select'

export default async function AdminPage() {
  const supabase = createClient(
    'https://flmtpjfnmjgvyzgolmug.supabase.co',
    'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
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

  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  if (analysisError) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="text-red-400">Hata: {analysisError.message}</div>
      </main>
    )
  }

  const allItems = analysisData || []

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

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">MedyaTora</p>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="px-4 py-2 rounded-xl border border-white/10 text-white/80 text-sm"
            >
              Başvurular
            </a>
            <a
              href="/admin/customers"
              className="px-4 py-2 rounded-xl border border-white/10 text-white/80 text-sm"
            >
              Müşteriler
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-10">
          <StatCard title="Yeni Başvurular" value={newRequests.length} />
          <StatCard title="İşlemdekiler" value={processingRequests.length} />
          <StatCard title="Tamamlananlar" value={completedRequests.length} />
          <StatCard title="Diğer Paketler" value={otherPackages.length} />
          <StatCard title="Toplam Müşteri" value={customerCount || 0} />
        </div>

        <Section title="Yeni Başvurular" items={newRequests} />
        <Section title="İşlemdekiler" items={processingRequests} />
        <Section title="Tamamlananlar" items={completedRequests} />
        <Section title="Diğer Paketler" items={otherPackages} />
      </div>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-white/50 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm text-white/50">{items.length} kayıt</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/50">
          Kayıt yok
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-white text-black font-semibold">
                      {item.status}
                    </span>
                    <span className="text-sm text-white/60">
                      {item.package_type} • {item.package_price} {item.currency}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold">
                    {item.customers?.full_name || 'İsimsiz başvuru'}
                  </h3>

                  <p className="text-sm text-white/50 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <StatusSelect id={item.id} initialStatus={item.status} />
                  <a
                    href={`/admin/${item.id}`}
                    className="inline-block px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
                  >
                    Detayı Aç
                  </a>
                </div>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-white/50 mb-1">Kullanıcı Adı</p>
                  <p>{item.customers?.username || '-'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-white/50 mb-1">İletişim</p>
                  <p>
                    {item.customers?.contact_type || '-'} / {item.customers?.contact_value || '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}