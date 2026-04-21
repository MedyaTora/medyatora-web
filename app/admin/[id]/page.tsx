import { createClient } from '@supabase/supabase-js'

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createClient(
    'https://flmtpjfnmjgvyzgolmug.supabase.co',
    'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
  )

  const { data, error } = await supabase
    .from('analysis_requests')
    .select(`
      id,
      coupon_code,
      package_type,
      package_price,
      currency,
      status,
      admin_note,
      created_at,
      updated_at,
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
    .eq('id', id)
    .single()

  const item: any = data

  if (error || !item) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <div className="text-red-400">Kayıt bulunamadı</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <a
          href="/admin"
          className="inline-block mb-6 px-4 py-2 rounded-xl border border-white/10 text-white/80"
        >
          ← Admin’e Dön
        </a>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-white text-black text-sm font-semibold">
              {item.status}
            </span>
            <span className="text-sm text-white/60">
              {item.package_type} • {item.package_price} {item.currency}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {item.customers?.full_name || 'İsimsiz başvuru'}
          </h1>

          <p className="text-white/50 mb-8">
            Oluşturulma: {new Date(item.created_at).toLocaleString()}
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">Kullanıcı Adı</p>
              <p>{item.customers?.username || '-'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">Hesap Linki</p>
              <p className="break-all">{item.customers?.account_link || '-'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">Hesap Türü</p>
              <p>{item.customers?.account_type || '-'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">İçerik Türü</p>
              <p>{item.customers?.content_type || '-'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">Günlük Video</p>
              <p>{item.customers?.daily_post_count || 0}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-1">İletişim</p>
              <p>
                {item.customers?.contact_type || '-'} / {item.customers?.contact_value || '-'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-2">Genel Sorun</p>
              <p className="text-white/85 leading-7">{item.customers?.main_problem || '-'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/50 mb-2">En Büyük Eksik</p>
              <p className="text-white/85 leading-7">{item.customers?.main_missing || '-'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-white/50 mb-2">Kupon Kodu</p>
            <p>{item.coupon_code || '-'}</p>
          </div>
        </div>
      </div>
    </main>
  )
}