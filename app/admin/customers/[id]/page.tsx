export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createClient(
    'https://flmtpjfnmjgvyzgolmug.supabase.co',
    'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
  )

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  const { data: analysisList } = await supabase
    .from('analysis_requests')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (customerError || !customer) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <div className="text-red-400">Müşteri bulunamadı</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <a
          href="/admin/customers"
          className="inline-block mb-6 px-4 py-2 rounded-xl border border-white/10 text-white/80"
        >
          ← Müşterilere Dön
        </a>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {customer.full_name || 'İsimsiz müşteri'}
          </h1>
          <p className="text-white/50 mb-6">
            Oluşturulma: {new Date(customer.created_at).toLocaleString()}
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <InfoCard title="Kullanıcı Adı" value={customer.username} />
            <InfoCard title="Hesap Linki" value={customer.account_link} />
            <InfoCard title="Hesap Türü" value={customer.account_type} />
            <InfoCard title="İçerik Türü" value={customer.content_type} />
            <InfoCard title="Günlük Video" value={String(customer.daily_post_count || 0)} />
            <InfoCard
              title="İletişim"
              value={`${customer.contact_type || '-'} / ${customer.contact_value || '-'}`}
            />
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <TextCard title="Genel Sorun" value={customer.main_problem} />
            <TextCard title="En Büyük Eksik" value={customer.main_missing} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-bold mb-4">Analiz Geçmişi</h2>

          {analysisList && analysisList.length > 0 ? (
            <div className="grid gap-4">
              {analysisList.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-semibold">
                      {item.status}
                    </span>
                    <span className="text-sm text-white/60">
                      {item.package_type} • {item.package_price} {item.currency}
                    </span>
                  </div>

                  <p className="text-sm text-white/50">
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <div className="mt-2 text-sm text-white/70">
                    Kupon: {item.coupon_code || '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/50">Analiz kaydı yok</div>
          )}
        </div>
      </div>
    </main>
  )
}

function InfoCard({ title, value }: { title: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-white/50 mb-1">{title}</p>
      <p className="break-all">{value || '-'}</p>
    </div>
  )
}

function TextCard({ title, value }: { title: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-white/50 mb-2">{title}</p>
      <p className="text-white/85 leading-7">{value || '-'}</p>
    </div>
  )
}