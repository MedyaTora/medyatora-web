import Link from "next/link";

export const metadata = {
  title: "Kullanım Şartları | MedyaTora",
  description: "MedyaTora kullanım şartları ve hizmet koşulları.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 md:p-10">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-yellow-300 hover:text-yellow-200"
        >
          ← Ana sayfaya dön
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Kullanım Şartları
        </h1>

        <p className="mt-4 text-sm text-white/50">
          Son güncelleme: 04.05.2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/75 md:text-base">
          <p>
            MedyaTora’yı kullanan her kullanıcı, bu kullanım şartlarını okumuş ve
            kabul etmiş sayılır. Bu şartlar; site kullanımı, sipariş süreçleri,
            analiz başvuruları ve kullanıcı hesabı işlemlerini kapsar.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white">1. Hizmetin Kapsamı</h2>
            <p className="mt-2">
              MedyaTora; sosyal medya hesap analizi, hesap geliştirme danışmanlığı,
              dijital görünürlük desteği ve paket bazlı sosyal medya hizmetleri
              sunabilir. Hizmet kapsamı, ilgili ürün veya paket açıklamasında
              belirtilen bilgilerle sınırlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Kullanıcı Sorumlulukları</h2>
            <p className="mt-2">
              Kullanıcı, sipariş verirken doğru hesap bağlantısı, kullanıcı adı,
              iletişim bilgisi ve gerekli diğer bilgileri sağlamakla yükümlüdür.
              Yanlış veya eksik bilgi nedeniyle oluşabilecek gecikmelerden
              MedyaTora sorumlu tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Sosyal Medya Hesap Durumu</h2>
            <p className="mt-2">
              Sipariş verilen hesapların herkese açık olması, kullanıcı adının
              değiştirilmemesi ve sipariş tamamlanana kadar ilgili içeriklerin
              silinmemesi gerekir. Aksi durumda hizmetin başlamaması, gecikmesi
              veya eksik tamamlanması mümkündür.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Hizmet Süreleri</h2>
            <p className="mt-2">
              Başlangıç ve tamamlanma süreleri ürün açıklamalarında tahmini olarak
              belirtilir. Yoğunluk, platform güncellemeleri, hesap durumu veya
              teknik sebeplerle sürelerde değişiklik olabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Yasaklı Kullanım</h2>
            <p className="mt-2">
              Hukuka aykırı, yanıltıcı, dolandırıcılık içeren, nefret söylemi
              barındıran veya üçüncü kişilerin haklarını ihlal eden hesaplar ve
              içerikler için hizmet verilmesi reddedilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Değişiklik Hakkı</h2>
            <p className="mt-2">
              MedyaTora, hizmet içeriklerinde, fiyatlarda ve kullanım şartlarında
              gerekli gördüğü durumlarda güncelleme yapma hakkını saklı tutar.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}