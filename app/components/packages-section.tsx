import { createClient } from '@supabase/supabase-js'

type PackageItem = {
  id: string
  name: string
  description: string | null
  price_usd: number | null
  price_try: number | null
  price_rub: number | null
}

export default async function PackagesSection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return (
      <section id="packages" className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          Supabase env ayarları eksik.
        </div>
      </section>
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data, error } = await supabase
    .from('packages')
    .select('id, name, description, price_usd, price_try, price_rub')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    return (
      <section id="packages" className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          Paketler yüklenemedi.
        </div>
      </section>
    )
  }

  const packages = (data ?? []) as PackageItem[]

  return (
    <section id="packages" className="px-6 pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-2">
            Paketler
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            İhtiyacına uygun destek paketlerini incele
          </h2>
          <p className="text-white/70">
            Otomatik hizmetler ve profesyonel destek tarafında sana uygun yapıyı seç,
            hesabın için daha güçlü bir başlangıç yap.
          </p>
        </div>

        <a
          href="#analysis"
          className="inline-flex px-4 py-2 rounded-xl border border-white/15 text-sm text-white/80 hover:text-white"
        >
          Önce analiz gönder
        </a>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white/70">
          Şu anda aktif paket görünmüyor.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                <p className="text-white/70 min-h-[72px]">
                  {item.description || 'Bu paket için açıklama yakında güncellenecek.'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 mb-6">
                <p className="text-sm uppercase tracking-[0.18em] text-white/40 mb-3">
                  Fiyatlar
                </p>

                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {item.price_usd != null ? `$${item.price_usd}` : '—'}
                  </p>
                  <p className="text-sm text-white/55">
                    {item.price_try != null ? `₺${item.price_try}` : '₺—'}
                  </p>
                  <p className="text-sm text-white/55">
                    {item.price_rub != null ? `₽${item.price_rub}` : '₽—'}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <a
                  href="#analysis"
                  className="inline-flex justify-center px-5 py-3 rounded-2xl bg-white text-black font-semibold"
                >
                  İncele
                </a>

                <a
                  href="/paketler"
                  className="inline-flex justify-center px-5 py-3 rounded-2xl border border-white/15 text-white font-semibold"
                >
                  Tüm hizmetler
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}