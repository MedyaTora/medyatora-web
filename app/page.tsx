import AnalysisForm from './components/analysis-form'
import PackagesSection from './components/packages-section'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-4">
            MedyaTora
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Sosyal medya hesabını analiz et, eksiğini gör, profesyonel büyümeye başla.
          </h1>

          <p className="text-white/70 text-lg md:text-xl mb-8">
            İçerik üreticileri, işletmeler ve büyümek isteyen sayfalar için analiz,
            profil profesyonelleştirme ve büyüme odaklı destek.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#analysis"
              className="px-6 py-3 rounded-2xl bg-white text-black font-semibold"
            >
              Ücretsiz Analiz Al
            </a>

            <a
              href="#packages"
              className="px-6 py-3 rounded-2xl border border-white/20 text-white font-semibold"
            >
              Paketleri İncele
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="text-xl font-semibold mb-2">Hesap Analizi</h3>
            <p className="text-white/70">
              Hesabındaki büyüme sorunlarını, içerik eksiklerini ve görünüm problemlerini tespit ederiz.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="text-xl font-semibold mb-2">Profil Profesyonelleştirme</h3>
            <p className="text-white/70">
              Profilini daha güven veren, daha düzenli ve daha dönüşüm odaklı hale getiririz.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="text-xl font-semibold mb-2">Algoritma İncelemesi</h3>
            <p className="text-white/70">
              Düzen, içerik yapısı ve paylaşım mantığındaki problemleri analiz ederiz.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-3xl font-bold mb-4">Neden MedyaTora?</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="font-semibold mb-2">Sorunu net tespit ederiz</p>
              <p className="text-white/70">
                Hesabındaki büyümeyi durduran asıl eksikleri yüzeysel değil, net şekilde belirleriz.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="font-semibold mb-2">Profesyonel görünüm kurarız</p>
              <p className="text-white/70">
                Profil güven vermiyorsa içerik iyi olsa bile dönüşüm düşer. Bu kısmı güçlendiririz.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="font-semibold mb-2">Satışa ve büyümeye odaklanırız</p>
              <p className="text-white/70">
                Sadece görüntü değil, takip, izlenme ve dönüşüm mantığıyla ilerleyen yapı kurarız.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PackagesSection />

      <section id="analysis" className="px-6 pb-24 max-w-4xl mx-auto">
        <AnalysisForm />
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