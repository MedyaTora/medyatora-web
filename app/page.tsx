import AnalysisForm from "./components/analysis-form";
import { getFeaturedPlatforms } from "@/lib/platforms";
import { CONTACT, getWhatsappLink } from "@/lib/contact";

const featuredPlatforms = getFeaturedPlatforms();

const solutionCards = [
  {
    title: "Ücretsiz Profil Analizi",
    tag: "MedyaTora Analiz",
    description:
      "Profil görünümü, içerik düzeni, güven algısı ve büyümeni yavaşlatan noktalar için analiz talebi oluştur.",
    href: "#analysis",
    cta: "Analiz Al",
  },
  {
    title: "SMMTora Sosyal Destek",
    tag: "SMMTora",
    description:
      "Takipçi, beğeni, izlenme, kaydetme ve hazır hesap destek paketleri için ayrı sosyal destek alanı.",
    href: "/smmtora",
    cta: "SMMTora’ya Git",
  },
  {
    title: "Reklam ve Görünürlük Desteği",
    tag: "Yakında",
    description:
      "Hesabını veya markanı reklamlarla daha doğru kitlelere ulaştırmak için planlanacak destek alanı.",
    href: "#contact",
    cta: "Bilgi Al",
  },
  {
    title: "AI Asistan ve İçerik Desteği",
    tag: "Yakında",
    description:
      "İçerik fikirleri, açıklama metinleri, kampanya dili ve sosyal medya akışı için yapay zeka destekli sistem.",
    href: "#contact",
    cta: "Bilgi Al",
  },
];

const steps = [
  {
    title: "İhtiyacını seç",
    description:
      "Analiz, SMMTora, reklam desteği veya içerik desteği alanlarından sana uygun bölümü seç.",
  },
  {
    title: "Bilgilerini ilet",
    description:
      "Hesap linki, kullanıcı adı, hedef ve iletişim bilgilerini net şekilde gönder.",
  },
  {
    title: "Süreç takip edilsin",
    description:
      "Talebin sisteme düşer, admin panelde takip edilir ve gerekli yönlendirmeler sana iletilir.",
  },
  {
    title: "Sonucu yönet",
    description:
      "Sipariş, analiz, destek ve bilgilendirme sürecini MedyaTora yapısı içinde takip ederiz.",
  },
];

const reasons = [
  {
    title: "Tek işe sıkışmayan yapı",
    description:
      "MedyaTora sadece SMM değil; analiz, reklam, içerik ve sosyal medya destek alanlarını bir arada toplar.",
  },
  {
    title: "SMMTora ayrımı",
    description:
      "Takipçi, beğeni ve hazır destek paketleri SMMTora altında ayrı ve daha düzenli sunulur.",
  },
  {
    title: "Güven veren vitrin",
    description:
      "Profilinin daha düzenli, profesyonel ve güçlü görünmesi için görünüm odaklı destek sağlanır.",
  },
  {
    title: "Operasyon takibi",
    description:
      "Analiz, sipariş ve destek talepleri daha düzenli bir yönetim paneli üzerinden takip edilir.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen scroll-smooth bg-[radial-gradient(circle_at_top,#1b2440_0%,#070b12_48%,#020308_100%)] text-white">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-0 top-32 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[340px] w-[340px] rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sosyal medya destek ekibi ve medya operasyon sistemi
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Sosyal medya hesabını daha güven veren, daha profesyonel ve daha güçlü hale getir.
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                MedyaTora; analiz, sosyal medya destek hizmetleri, reklam görünürlüğü ve içerik
                desteğini tek çatı altında toplar. SMM hizmetleri ise SMMTora alanında daha düzenli
                şekilde sunulur.
              </p>

              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/smmtora"
                  className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
                >
                  SMMTora’yı İncele
                </a>

                <a
                  href="#analysis"
                  className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Ücretsiz Analiz Al
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <p className="mb-1 text-2xl font-semibold">Medya</p>
                  <p className="text-sm text-white/60">
                    Analiz, görünüm ve hesap profesyonelleştirme.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <p className="mb-1 text-2xl font-semibold">SMM</p>
                  <p className="text-sm text-white/60">
                    SMMTora ile sosyal destek ve hazır paketler.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <p className="mb-1 text-2xl font-semibold">Destek</p>
                  <p className="text-sm text-white/60">
                    Sipariş, analiz ve iletişim süreci tek akışta.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/50">
                MedyaTora yapısı
              </p>

              <div className="space-y-4">
                {[
                  [
                    "MedyaTora",
                    "Ana çatı marka. Analiz, danışmanlık, görünüm, reklam ve içerik destek sistemi.",
                  ],
                  [
                    "SMMTora",
                    "Takipçi, beğeni, izlenme, kaydetme ve hazır hesap destek paketleri.",
                  ],
                  [
                    "Gelecek modüller",
                    "AI asistan, reklam desteği, üyelik, bakiye ve referans sistemi.",
                  ],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-sm leading-6 text-white/70">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/50">
            MedyaTora çözümleri
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            İhtiyacına göre doğru bölüme geç
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-white/65">
            MedyaTora doğrudan tek bir SMM paneli gibi değil; sosyal medya operasyonu için farklı
            destek alanlarını bir araya getiren bir sistem olarak çalışır.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {solutionCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/55">
                {card.tag}
              </div>

              <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
              <p className="mb-5 text-sm leading-6 text-white/65">{card.description}</p>

              <span className="text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                {card.cta} →
              </span>
            </a>
          ))}
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
            href="/smmtora"
            className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white md:inline-flex"
          >
            SMMTora’ya git
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPlatforms.map((platform) => (
            <a
              key={platform.slug}
              href="/smmtora"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl">
                {platform.emoji}
              </div>

              <h3 className="mb-2 text-xl font-semibold">{platform.title}</h3>

              <p className="mb-4 text-sm leading-6 text-white/65">
                {platform.description}
              </p>

              <span className="text-sm font-medium text-white">
                SMMTora’da incele →
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-white/[0.03] p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                SMMTora
              </p>

              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Hazır sosyal destek paketleri ve tekli hizmetler
              </h2>

              <p className="max-w-2xl leading-7 text-white/70">
                Takipçi, beğeni, izlenme, kaydetme ve hazır hesap destek paketleri SMMTora
                bölümünde ayrı sunulur. Böylece MedyaTora ana marka olarak medya destek ekibi
                kimliğini korur.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
              <div className="mb-4 grid gap-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  Mini / Orta / Mega hazır paketler
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  365 gün garantili destek seçenekleri
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  Tekli servis seçimi ve özel sipariş akışı
                </div>
              </div>

              <a
                href="/smmtora"
                className="block rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
              >
                SMMTora Alanına Git
              </a>
            </div>
          </div>
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
            ve daha güçlü bir vitrine dönüştürmek için farklı destek alanlarını tek çatı altında toplamak.
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

      <section id="analysis" className="mx-auto max-w-4xl px-6 pb-16 scroll-mt-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
            Ücretsiz analiz
          </p>

          <h2 className="mb-3 text-3xl font-bold">
            Hesabındaki eksikleri öğren, daha doğru ilerle
          </h2>

          <p className="leading-7 text-white/70">
            Profil görünümü, içerik yapısı, güven algısı ve büyümeyi yavaşlatan noktalar için
            analiz talebini bırak. Üyelik sistemi aktif olduğunda analiz hakkı ve başlangıç bonusları
            hesabına bağlanabilecek.
          </p>
        </div>

        <AnalysisForm />
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              MedyaTora ile başla
            </p>

            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Hesabını daha güçlü göstermek için ilk adımı at
            </h2>

            <p className="leading-7 text-white/70">
              SMMTora alanına geçebilir veya önce ücretsiz analiz talebi göndererek hesabındaki
              eksikleri net şekilde öğrenebilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/smmtora"
              className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-white/90"
            >
              SMMTora’ya Git
            </a>

            <a
              href="#analysis"
              className="rounded-2xl border border-white/20 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
            >
              Analiz Gönder
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">© MedyaTora</div>
            <div>Sosyal medya danışmanlığı • Analiz • Profesyonelleştirme • SMMTora</div>
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

            <a href={`mailto:${CONTACT.email}`} className="transition hover:text-white">
              E-posta
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}