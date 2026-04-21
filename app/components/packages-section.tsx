import { createClient } from '@supabase/supabase-js'

export default async function PackagesSection() {
  const supabase = createClient(
    'https://flmtpjfnmjgvyzgolmug.supabase.co',
    'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
  )

  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="text-red-400">Paketler yüklenemedi</div>
  }

  return (
    <section id="packages" className="px-6 pb-16 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Paketler</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {data?.map((item: any) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 p-6 bg-white/5"
          >
            <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
            <p className="text-white/70 mb-4">{item.description}</p>

            <div className="space-y-1 mb-6">
              <p className="text-3xl font-bold">${item.price_usd}</p>
              <p className="text-sm text-white/50">₺{item.price_try}</p>
              <p className="text-sm text-white/50">₽{item.price_rub}</p>
            </div>

            <a
              href="#analysis"
              className="inline-block px-5 py-3 rounded-xl bg-white text-black font-semibold"
            >
              İncele
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}