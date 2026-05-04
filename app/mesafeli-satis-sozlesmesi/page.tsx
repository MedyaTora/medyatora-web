import Link from "next/link";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | MedyaTora",
  description: "MedyaTora mesafeli satış sözleşmesi.",
};

export default function DistanceSalesAgreementPage() {
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
          Mesafeli Satış Sözleşmesi
        </h1>

        <p className="mt-4 text-sm text-white/50">
          Son güncelleme: 04.05.2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/75 md:text-base">
          <p>
            Bu mesafeli satış sözleşmesi, MedyaTora üzerinden elektronik ortamda
            sunulan dijital hizmetlerin satın alınmasına ilişkin genel hükümleri
            düzenler.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white">1. Taraflar</h2>
            <p className="mt-2">
              İşbu sözleşme, MedyaTora hizmetlerini sunan satıcı/hizmet sağlayıcı
              ile site üzerinden hizmet satın alan kullanıcı arasında elektronik
              ortamda kurulmuş kabul edilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Sözleşmenin Konusu
            </h2>
            <p className="mt-2">
              Sözleşmenin konusu; kullanıcının MedyaTora üzerinden seçtiği sosyal
              medya analiz, danışmanlık, dijital görünürlük veya paket bazlı
              hizmetlerin sunulmasına ilişkin hak ve yükümlülüklerdir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Hizmet Bilgileri
            </h2>
            <p className="mt-2">
              Hizmetin türü, fiyatı, kapsamı, tahmini başlangıç süresi, varsa
              garanti bilgisi ve diğer detayları satın alma ekranında veya ilgili
              ürün açıklamasında kullanıcıya gösterilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Ödeme ve Teslimat
            </h2>
            <p className="mt-2">
              Dijital hizmetlerde teslimat, siparişin sisteme alınması ve ilgili
              hizmet sürecinin başlatılmasıyla gerçekleşir. Ödeme tamamlanmadan
              hizmetin başlatılması zorunlu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Cayma ve İade
            </h2>
            <p className="mt-2">
              Kullanıcının onayıyla başlatılan dijital hizmetlerde cayma hakkı,
              hizmetin niteliği gereği sınırlı olabilir. Başlamamış, teknik olarak
              tamamlanamamış veya kısmen tamamlanmış işlemlerde iade politikası
              hükümleri uygulanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              6. Uyuşmazlıklar
            </h2>
            <p className="mt-2">
              Taraflar arasında doğabilecek uyuşmazlıklarda öncelikle iyi niyetli
              çözüm yolu aranır. Gerekli hallerde ilgili mevzuat ve yetkili
              merciler kapsamında işlem yapılır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Kabul</h2>
            <p className="mt-2">
              Kullanıcı, satın alma işlemini tamamlamadan önce ilgili politika ve
              sözleşme metinlerini okuyup kabul ettiğini beyan eder.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}