import Link from "next/link";

export const metadata = {
  title: "Gizlilik Politikası | MedyaTora",
  description:
    "MedyaTora gizlilik politikası ve kişisel verilerin korunmasına ilişkin bilgilendirme.",
};

export default function PrivacyPolicyPage() {
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
          Gizlilik Politikası
        </h1>

        <p className="mt-4 text-sm text-white/50">
          Son güncelleme: 04.05.2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/75 md:text-base">
          <p>
            MedyaTora olarak kullanıcılarımızın gizliliğine önem veriyoruz. Bu
            sayfa; sitemizi kullanırken hangi bilgilerin işlenebileceğini, bu
            bilgilerin hangi amaçlarla kullanılabileceğini ve kullanıcıların
            haklarını açıklamak amacıyla hazırlanmıştır.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Toplanan Bilgiler
            </h2>
            <p className="mt-2">
              Site üzerinden ad, soyad, kullanıcı adı, e-posta adresi, telefon
              numarası, sosyal medya hesap bağlantısı, sipariş bilgileri,
              ödeme/bakiye hareketleri ve analiz başvuru cevapları gibi bilgiler
              alınabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Bilgilerin Kullanım Amacı
            </h2>
            <p className="mt-2">
              Bu bilgiler; siparişlerin oluşturulması, kullanıcı hesabının
              yönetilmesi, analiz başvurularının değerlendirilmesi, bakiye ve
              iade süreçlerinin yürütülmesi, güvenlik kontrollerinin yapılması ve
              kullanıcıyla iletişim kurulması amacıyla kullanılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Üçüncü Taraf Hizmetler
            </h2>
            <p className="mt-2">
              Sipariş, bildirim, ödeme, analiz ve teknik altyapı süreçlerinde
              gerekli olduğu ölçüde üçüncü taraf servislerden destek alınabilir.
              Bu servisler yalnızca hizmetin yürütülmesi için gerekli bilgilerle
              sınırlı şekilde kullanılmalıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Verilerin Saklanması
            </h2>
            <p className="mt-2">
              Kullanıcı bilgileri, hizmetin sağlanması ve yasal yükümlülüklerin
              yerine getirilmesi için gerekli süre boyunca saklanabilir. Gereksiz
              hale gelen veriler makul süre içinde silinebilir veya anonim hale
              getirilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Kullanıcı Hakları
            </h2>
            <p className="mt-2">
              Kullanıcılar, kendileriyle ilgili kişisel veriler hakkında bilgi
              talep edebilir, hatalı bilgilerin düzeltilmesini isteyebilir veya
              ilgili mevzuat kapsamında silme taleplerini iletebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. İletişim</h2>
            <p className="mt-2">
              Gizlilik politikasıyla ilgili talepleriniz için MedyaTora iletişim
              kanalları üzerinden bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}