import AnalysisForm from './components/analysis-form'
import PackagesSection from './components/packages-section'
import { getFeaturedPlatforms } from '@/lib/platforms'

const featuredPlatforms = getFeaturedPlatforms()

const automaticServices = [
  {
    title: 'Takipçi ve sosyal kanıt',
    description:
      'Profilini daha güçlü ve daha güven veren göstermek için takipçi tabanını destekleyen hizmetler.',
  },
  {
    title: 'Beğeni ve etkileşim',
    description:
      'Gönderilerinde daha dolu bir görünüm oluşturmak ve ilk izlenimi güçlendirmek için etkileşim destekleri.',
  },
  {
    title: 'İzlenme ve görüntülenme',
    description:
      'Video ve içeriklerinde daha canlı bir vitrin etkisi oluşturmak için görüntülenme odaklı servisler.',
  },
]

const premiumServices = [
  {
    title: 'Hesap analizi',
    description:
      'Büyümeyi yavaşlatan görünüm, içerik düzeni ve güven problemlerini net şekilde tespit ederiz.',
  },
  {
    title: 'Profil profesyonelleştirme',
    description:
      'Biondan görsel dile kadar hesabını daha düzenli, daha profesyonel ve daha dönüşüm odaklı hale getiririz.',
  },
  {
    title: 'İçerik ve algoritma incelemesi',
    description:
      'İlk saniye etkisi, paylaşım yapısı ve içerik yönünde seni aşağı çeken sorunları belirleriz.',
  },
]

const steps = [
  {
    title: 'Platformunu seç',
    description:
      'Instagram, TikTok, YouTube, Telegram ve diğer platformlar için uygun hizmet alanına gir.',
  },
  {
    title: 'Hizmetini belirle',
    description:
      'Otomatik servisleri incele ya da premium destek tarafına geçerek analiz talebi bırak.',
  },
  {
    title: 'Talebini gönder',
    description:
      'Sipariş veya analiz formunu doldur, ihtiyaç duyduğun alanı net şekilde ilet.',
  },
  {
    title: 'Süreç başlasın',
    description:
      'Siparişin sisteme düşer, operasyon başlar ve gerekli yönlendirmeler tarafına iletilir.',
  },
]

const reasons = [
  {
    title: 'Sorunu net tespit ederiz',
    description:
      'Hesabındaki büyümeyi durduran eksikleri yüzeysel değil, net ve uygulanabilir şekilde belirleriz.',
  },
  {
    title: 'Profesyonel görünüm kurarız',
    description:
      'Profil güven vermiyorsa içerik iyi olsa bile dönüşüm düşer. Bu görünüm tarafını güçlendiririz.',
  },
  {
    title: 'Sadece görünüm değil yapı kurarız',
    description:
      'Amaç sadece servis sunmak değil; hesabı daha düzenli, daha güçlü ve daha güven veren hale getirmektir.',
  },
  {
    title: 'Otomatik ve premium hizmet aynı çatı altında',
    description:
      'Hızlı servis ihtiyaçları ile analiz ve profesyonelleştirme desteğini tek yapıda toplarsın.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-white/50 mb-4">
              MedyaTora
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Sosyal medya hesabını daha profesyonel göster, eksiklerini gör, büyüme sürecini güçlendir.
            </h1>

            <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl">
              İçerik üreticileri, markalar, işletmeler ve büyümek isteyen sayfalar için
              otomatik servisler, hesap analizi ve profesyonelleştirme desteği.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#packages"
                className="px-6 py-3 rounded-2xl bg-white text-black font-semibold text-center"
              >
                Paketleri İncele
              </a>

              <a
                href="#analysis"
                className="px-6 py-3 rounded-2xl border border-white/20 text-white font-semibold text-center"
              >
                Ücretsiz Analiz Al
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-semibold mb-1">Canlı sistem</p>
                <p className="text-sm text-white/60">
                  Sipariş, veri akışı ve operasyon tek yapı içinde çalışır.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-semibold mb-1">Çoklu platform</p>
                <p className="text-sm text-white/60">
                  Farklı platformlar için modüler hizmet mimarisi sunar.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-2xl font-semibold mb-1">Vitrin + analiz</p>
                <p className="text-sm text-white/60">
                  Sadece servis değil, görünüm ve yapı tarafı da güçlenir.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-4">
              Ne sunuyoruz?
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-lg font-semibold mb-2">Otomatik servisler</h3>
                <p className="text-white/70 text-sm">
                  Takipçi, beğeni, izlenme, yorum ve platforma göre değişen hızlı servis destekleri.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-lg font-semibold mb-2">Premium destek</h3>
                <p className="text-white/70 text-sm">
                  Analiz, profil profesyonelleştirme, içerik düzeni ve büyüme mantığını güçlendiren destekler.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-lg font-semibold mb-2">Operasyonel akış</h3>
                <p className="text-white/70 text-sm">
                  Siparişin sisteme düşer, yönetilir ve süreç daha düzenli bir yapı üzerinden ilerler.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-2">
              Öne çıkan platformlar
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Hizmet verdiğimiz ana platformlar
            </h2>
          </div>
          <a
            href="#packages"
            className="hidden md:inline-flex px-4 py-2 rounded-xl border border-white/15 text-sm text-white/80 hover:text-white"
          >
            Tüm paketleri gör
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPlatforms.map((platform) => (
            <a
              key={platform.slug}
              href="/paketler"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition"
            >
              <div className="text-3xl mb-4">{platform.emoji}</div>
              <h3 className="text-xl font-semibold mb-2">{platform.title}</h3>
              <p className="text-sm text-white/65 mb-4">
                {platform.description}
              </p>
              <span className="text-sm text-white font-medium">
                Paketleri incele →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">
              Otomatik servisler
            </p>
            <h2 className="text-3xl font-bold mb-4">
              Hızlı destek isteyenler için
            </h2>
            <p className="text-white/70 mb-6">
              Hesabının görünümünü ve sosyal kanıt tarafını daha güçlü göstermek için
              platform bazlı otomatik servis altyapısı.
            </p>

            <div className="space-y-4">
              {automaticServices.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/25 p-5"
                >
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/65">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">
              Premium hizmetler
            </p>
            <h2 className="text-3xl font-bold mb-4">
              Daha profesyonel görünmek isteyenler için
            </h2>
            <p className="text-white/70 mb-6">
              Sadece sayı değil; görünüm, güven, içerik düzeni ve dönüşüm tarafını
              güçlendiren danışmanlık odaklı destekler.
            </p>

            <div className="space-y-4">
              {premiumServices.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/25 p-5"
                >
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/65">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">
            Nasıl çalışır?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Süreci sade ve net tutuyoruz
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-black/25 p-5"
              >
                <div className="text-sm text-white/40 mb-3">
                  0{index + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/65">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-3xl font-bold mb-4">Neden MedyaTora?</h2>
          <p className="text-white/70 mb-8 max-w-3xl">
            Amaç sadece servis sunmak değil; hesabını daha güven veren, daha düzenli
            ve daha güçlü bir vitrine dönüştürmek.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
            {reasons.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="font-semibold mb-2">{item.title}</p>
                <p className="text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PackagesSection />

      <section id="analysis" className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">
            Ücretsiz analiz
          </p>
          <h2 className="text-3xl font-bold mb-3">
            Hesabındaki eksikleri öğren, daha doğru ilerle
          </h2>
          <p className="text-white/70">
            Profil görünümü, içerik yapısı ve büyümeyi yavaşlatan noktalar için analiz
            talebini bırak. Uygun yapı üzerinden sana dönüş sağlansın.
          </p>
        </div>

        <AnalysisForm />
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 md:p-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50 mb-3">
              MedyaTora ile başla
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Hesabını daha güçlü göstermek için ilk adımı at
            </h2>
            <p className="text-white/70">
              İstersen doğrudan paketleri incele, istersen önce analiz talebi göndererek
              hesabının eksiklerini net şekilde öğren.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#packages"
              className="px-6 py-3 rounded-2xl bg-white text-black font-semibold text-center"
            >
              Paketleri İncele
            </a>
            <a
              href="#analysis"
              className="px-6 py-3 rounded-2xl border border-white/20 text-white font-semibold text-center"
            >
              Analiz Gönder
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm text-white/50">
          <div>© MedyaTora</div>
          <div>Sosyal medya danışmanlığı • Analiz • Profesyonelleştirme</div>
        </div>
      </footer>
    </main>
  )
}