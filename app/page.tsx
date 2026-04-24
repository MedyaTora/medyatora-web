import AnalysisForm from './components/analysis-form'
import PackagesSection from './components/packages-section'
import { getFeaturedPlatforms } from '@/lib/platforms'
import { CONTACT, getWhatsappLink } from '@/lib/contact'

const featuredPlatforms = getFeaturedPlatforms()

const automaticServices = [
  {
    title: 'Takipçi ve sosyal kanıt',
    description:
      'Profilin ilk bakışta daha güçlü ve güven veren görünmesi için platform bazlı takipçi destekleri.',
  },
  {
    title: 'Beğeni ve etkileşim',
    description:
      'Gönderilerinin daha dolu görünmesini ve ilk izlenimin daha güçlü oluşmasını destekleyen etkileşim servisleri.',
  },
  {
    title: 'İzlenme ve görüntülenme',
    description:
      'Reels, video, story ve içeriklerinde daha canlı bir vitrin etkisi oluşturmak için izlenme odaklı destekler.',
  },
]

const premiumServices = [
  {
    title: 'Hesap analizi',
    description:
      'Profilindeki güven, görünüm, içerik düzeni ve büyüme problemlerini net şekilde tespit ederiz.',
  },
  {
    title: 'Profil profesyonelleştirme',
    description:
      'Bio, profil düzeni, öne çıkanlar, görsel algı ve dönüşüm tarafını daha profesyonel hale getiririz.',
  },
  {
    title: 'İçerik ve algoritma incelemesi',
    description:
      'İlk saniye etkisi, paylaşım düzeni, içerik dili ve hesabı aşağı çeken yapısal sorunları inceleriz.',
  },
]

const steps = [
  {
    title: 'Platformunu seç',
    description:
      'Instagram, TikTok, YouTube, Telegram ve diğer platformlar arasından ihtiyacına uygun alanı seç.',
  },
  {
    title: 'Hizmetini belirle',
    description:
      'İstersen otomatik servisleri incele, istersen önce ücretsiz analiz talebi gönder.',
  },
  {
    title: 'Bilgilerini gir',
    description:
      'Hedef kullanıcı adı, link, miktar ve iletişim bilgilerini net şekilde ilet.',
  },
  {
    title: 'Süreç başlasın',
    description:
      'Talebin sisteme düşer, takip edilir ve gerekli yönlendirmeler sana iletilir.',
  },
]

const reasons = [
  {
    title: 'Net analiz',
    description:
      'Hesabındaki problemi tahminle değil, görünüm ve içerik yapısına bakarak netleştiririz.',
  },
  {
    title: 'Güven veren vitrin',
    description:
      'Profilin daha düzenli, daha profesyonel ve daha ikna edici görünmesi için yapı kurarız.',
  },
  {
    title: 'Çoklu platform desteği',
    description:
      'Tek bir platforma bağlı kalmadan farklı sosyal medya kanalları için çözüm sunarız.',
  },
  {
    title: 'Tek panelden süreç',
    description:
      'Analiz, sipariş, takip ve destek sürecini daha düzenli bir operasyonla yürütürüz.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#151b2c_0%,#070b12_48%,#020308_100%)] text-white">
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sosyal medya danışmanlığı ve büyüme desteği
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Sosyal medya hesabını daha güven veren, daha profesyonel ve daha güçlü hale getir.
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
              MedyaTora; içerik üreticileri, markalar ve işletmeler için otomatik sosyal medya
              servisleri, ücretsiz hesap analizi ve profil profesyonelleştirme desteğini tek yapıda toplar.
            </p>

            <div className="mb-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#packages"
                className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
              >
                Paketleri İncele
              </a>

              <a
                href="#analysis"
                className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Ücretsiz Analiz Al
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-1 text-2xl font-semibold">7/24</p>
                <p className="text-sm text-white/60">Sipariş sistemi ve otomatik servis akışı.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-1 text-2xl font-semibold">Çoklu</p>
                <p className="text-sm text-white/60">Instagram, TikTok, YouTube, Telegram ve fazlası.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-1 text-2xl font-semibold">Analiz</p>
                <p className="text-sm text-white/60">Profil, içerik ve güven algısı incelemesi.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/50">
              MedyaTora sistemi
            </p>

            <div className="space-y-4">
              {[
                ['Otomatik servisler', 'Takipçi, beğeni, izlenme, yorum ve platforma göre değişen hızlı destekler.'],
                ['Premium destek', 'Hesap analizi, profil düzenleme, içerik ve büyüme yönlendirmesi.'],
                ['Operasyon takibi', 'Sipariş ve analiz taleplerini daha düzenli şekilde takip eden yönetim yapısı.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
              Öne çıkan platformlar
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">
              Ana hizmet platformları
            </h2>
          </div>

          <a
            href="#packages"
            className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white md:inline-flex"
          >
            Paketleri gör
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPlatforms.map((platform) => (
            <a
              key={platform.slug}
              href="/paketler"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              <div className="mb-4 text-3xl">{platform.emoji}</div>
              <h3 className="mb-2 text-xl font-semibold">{platform.title}</h3>
              <p className="mb-4 text-sm leading-6 text-white/65">
                {platform.description}
              </p>
              <span className="text-sm font-medium text-white">
                Paketleri incele →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <ServiceBlock
            eyebrow="Otomatik servisler"
            title="Hızlı görünüm ve sosyal kanıt desteği"
            description="Hesabının vitrinini daha güçlü göstermek için platform bazlı otomatik servis altyapısı."
            items={automaticServices}
          />

          <ServiceBlock
            eyebrow="Premium hizmetler"
            title="Daha profesyonel hesap yapısı"
            description="Sadece sayı değil; görünüm, güven, içerik düzeni ve dönüşüm tarafını güçlendiren destekler."
            items={premiumServices}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
            Nasıl çalışır?
          </p>
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">
            Süreci sade ve net tutuyoruz
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="mb-3 text-sm text-white/40">0{index + 1}</div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm leading-6 text-white/65">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="mb-4 text-3xl font-bold">Neden MedyaTora?</h2>
          <p className="mb-8 max-w-3xl leading-7 text-white/70">
            Amacımız sadece servis sunmak değil; hesabını daha güven veren, daha düzenli
            ve daha güçlü bir vitrine dönüştürmek.
          </p>

          <div className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
            {reasons.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="mb-2 font-semibold">{item.title}</p>
                <p className="leading-6 text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PackagesSection />

      <section id="analysis" className="mx-auto max-w-4xl px-6 pb-16">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
            Ücretsiz analiz
          </p>
          <h2 className="mb-3 text-3xl font-bold">
            Hesabındaki eksikleri öğren, daha doğru ilerle
          </h2>
          <p className="leading-7 text-white/70">
            Profil görünümü, içerik yapısı, güven algısı ve büyümeyi yavaşlatan noktalar için
            analiz talebini bırak. Ekibimiz sana dönüş sağlasın.
          </p>
        </div>

        <AnalysisForm />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              MedyaTora ile başla
            </p>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Hesabını daha güçlü göstermek için ilk adımı at
            </h2>
            <p className="leading-7 text-white/70">
              Paketleri inceleyebilir veya önce ücretsiz analiz talebi göndererek hesabındaki
              eksikleri net şekilde öğrenebilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#packages" className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90">
              Paketleri İncele
            </a>
            <a href="#analysis" className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10">
              Analiz Gönder
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
  <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
    <div>
      <div className="font-semibold text-white">© MedyaTora</div>
      <div>Sosyal medya danışmanlığı • Analiz • Profesyonelleştirme</div>
    </div>

    <div className="flex flex-wrap gap-4">
      <a
        href={getWhatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        WhatsApp
      </a>

      <a
        href={CONTACT.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        Telegram
      </a>

      <a
        href={CONTACT.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        Instagram
      </a>

      <a
        href={`mailto:${CONTACT.email}`}
        className="transition hover:text-white"
      >
        E-posta
      </a>
    </div>
  </div>
</footer>
    </main>
  )
}

function ServiceBlock({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string
  title: string
  description: string
  items: { title: string; description: string }[]
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
        {eyebrow}
      </p>
      <h2 className="mb-4 text-3xl font-bold">{title}</h2>
      <p className="mb-6 leading-7 text-white/70">{description}</p>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <h3 className="mb-2 font-semibold">{item.title}</h3>
            <p className="text-sm leading-6 text-white/65">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}