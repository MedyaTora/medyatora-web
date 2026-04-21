import { createClient } from '@supabase/supabase-js'

export default async function CustomersPage() {
  const supabase = createClient(
    'https://flmtpjfnmjgvyzgolmug.supabase.co',
    'sb_secret_wORGSS38CpZgtbEG7O_ySA_IMBh4Z1n'
  )

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">MedyaTora</p>
            <h1 className="text-3xl md:text-4xl font-bold">Müşteriler</h1>
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

        {error ? (
          <div className="text-red-400">Hata: {error.message}</div>
        ) : (
          <div className="grid gap-4">
            {data?.map((item: any) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {item.full_name || 'İsimsiz müşteri'}
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={`/admin/customers/${item.id}`}
                    className="inline-block px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold"
                  >
                    Detayı Aç
                  </a>
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-white/50 mb-1">Kullanıcı Adı</p>
                    <p>{item.username || '-'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-white/50 mb-1">Hesap Linki</p>
                    <p className="break-all">{item.account_link || '-'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-white/50 mb-1">Hesap Türü</p>
                    <p>{item.account_type || '-'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-white/50 mb-1">İletişim</p>
                    <p>{item.contact_type || '-'} / {item.contact_value || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}