import Link from "next/link";

export const metadata = {
  title: "İade Politikası | MedyaTora",
  description: "MedyaTora iade, bakiye iadesi ve kısmi iade koşulları.",
};

export default function RefundPolicyPage() {
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
          İade Politikası
        </h1>

        <p className="mt-4 text-sm text-white/50">
          Son güncelleme: 04.05.2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/75 md:text-base">
          <p>
            Bu politika; MedyaTora üzerinden alınan hizmetlerde iade, kısmi iade,
            bakiye iadesi ve garanti/dolum süreçlerinin genel esaslarını açıklar.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Başlamayan Siparişler
            </h2>
            <p className="mt-2">
              Henüz işleme alınmamış veya teknik sebeplerle başlatılamayan
              siparişler iptal edilebilir ve ilgili tutar kullanıcı bakiyesine
              iade edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Başlamış Siparişler
            </h2>
            <p className="mt-2">
              İşleme alınmış veya gönderimi başlamış siparişlerde doğrudan iptal
              her zaman mümkün olmayabilir. Bu durumda siparişin mevcut durumu
              incelenir ve uygun çözüm uygulanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Kısmi İade
            </h2>
            <p className="mt-2">
              Siparişin bir kısmı tamamlanmış, bir kısmı teknik veya hizmet
              sağlayıcı kaynaklı sebeplerle iletilememişse, eksik kalan miktara
              karşılık gelen tutar kullanıcı bakiyesine iade edilebilir.
            </p>

            <p className="mt-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-100">
              Örnek: 15.000 adetlik bir siparişte 14.000 adet tamamlanırsa,
              iletilemeyen 1.000 adetlik tutar kullanıcı hesabına bakiye olarak
              yansıtılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Garanti ve Dolum
            </h2>
            <p className="mt-2">
              Garantili hizmetlerde düşüş yaşanması halinde, ürün açıklamasında
              belirtilen garanti süresi ve koşulları kapsamında dolum talebi
              değerlendirilebilir. Garanti süresi dışında kalan talepler için
              dolum zorunluluğu bulunmayabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Kullanıcı Kaynaklı Hatalar
            </h2>
            <p className="mt-2">
              Yanlış kullanıcı adı, kapalı hesap, silinen içerik, değiştirilen
              bağlantı, kısıtlanan profil veya sipariş sırasında yapılan hesap
              değişiklikleri nedeniyle oluşan sorunlarda iade veya dolum hakkı
              sınırlı olabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Bakiye İadesi
            </h2>
            <p className="mt-2">
              Uygun görülen iadeler öncelikle kullanıcı hesabına bakiye olarak
              yansıtılır. Harici ödeme kanalına iade talepleri, ödeme yöntemi ve
              işlem durumuna göre ayrıca değerlendirilir.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}