"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCheck,
  FaCircleQuestion,
  FaInstagram,
  FaPaperPlane,
  FaTiktok,
  FaUserTie,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

type PlatformKey = "instagram" | "tiktok" | "youtube" | "x";
type ContactType = "WhatsApp" | "Telegram" | "Instagram" | "E-posta" | "";
type CurrencyCode = "TL" | "USD" | "RUB";

type OptionCard = {
  value: string;
  title: string;
  description: string;
  icon?: IconType;
};

type PlatformOption = {
  key: PlatformKey;
  title: string;
  description: string;
  icon: IconType;
};

const ANALYSIS_PAYMENT_PATH = "/analiz/odeme";

const platformOptions: PlatformOption[] = [
  {
    key: "instagram",
    title: "Instagram",
    description:
      "Profil güveni, Reels düzeni, içerik dili, DM ve satış dönüşümü incelenir.",
    icon: FaInstagram,
  },
  {
    key: "tiktok",
    title: "TikTok",
    description:
      "İlk saniye etkisi, video akışı, izlenme potansiyeli ve takipçi dönüşümü incelenir.",
    icon: FaTiktok,
  },
  {
    key: "youtube",
    title: "YouTube",
    description:
      "Kanal görünümü, başlıklar, kapaklar, Shorts yapısı, izlenme süresi ve abone dönüşümü incelenir.",
    icon: FaYoutube,
  },
  {
    key: "x",
    title: "X / Twitter",
    description:
      "Profil algısı, paylaşım dili, görünürlük, etkileşim ve yönlendirme gücü incelenir.",
    icon: FaXTwitter,
  },
];

const accountTypeOptions: OptionCard[] = [
  {
    value: "İşletme / Marka Hesabı",
    title: "İşletme / Marka",
    description:
      "Ürün, hizmet veya marka güveni oluşturmak isteyen hesaplar için uygundur.",
    icon: FaBuilding,
  },
  {
    value: "E-ticaret / Satış Hesabı",
    title: "E-ticaret / Satış",
    description:
      "Ürün satışı, reklam dönüşümü, DM siparişi veya site trafiği hedefleyen hesaplar için.",
  },
  {
    value: "İçerik Üretici / Kişisel Marka",
    title: "Kişisel Marka / Creator",
    description:
      "Uzmanlık, görünürlük, takipçi büyümesi ve içerik disiplini hedefleyen hesaplar için.",
    icon: FaUserTie,
  },
  {
    value: "Hizmet Sağlayıcı / Uzman Hesabı",
    title: "Uzman / Hizmet",
    description:
      "Danışmanlık, klinik, emlak, güzellik, ajans, eğitim veya profesyonel hizmet sunan hesaplar için.",
  },
  {
    value: "Medya / Haber / Eğlence Kanalı",
    title: "Medya / Kanal",
    description:
      "Film, haber, mizah, bilgi, içerik derleme, Reels veya Shorts temelli sayfalar için.",
  },
  {
    value: "Topluluk / Proje / Organizasyon",
    title: "Topluluk / Proje",
    description:
      "Etkinlik, topluluk, organizasyon, kulüp veya proje hesabı olarak kullanılan yapılar için.",
  },
  {
    value: "Yeni Açılmış Hesap",
    title: "Yeni Hesap",
    description:
      "Henüz düzeni oturmamış, doğru başlangıç ve sağlam kurulum isteyen hesaplar için.",
  },
  {
    value: "Diğer",
    title: "Diğer",
    description:
      "Yukarıdakilere tam uymuyorsa bu seçeneği seçip detayları not alanında belirtebilirsiniz.",
  },
];

const goalOptions: OptionCard[] = [
  {
    value: "Profil güveni ve profesyonel görünüm kazanmak",
    title: "Profil güveni",
    description:
      "Hesabımın ilk bakışta daha güçlü, düzenli ve güven veren bir yapıya kavuşmasını istiyorum.",
  },
  {
    value: "Daha fazla görünürlük ve erişim elde etmek",
    title: "Görünürlük",
    description:
      "Paylaşımlarımın daha çok kişiye ulaşmasını ve keşfet / önerilen alanlarda güçlenmesini istiyorum.",
  },
  {
    value: "Takipçi, abone veya topluluk büyümesini artırmak",
    title: "Büyüme",
    description:
      "Hesabın kitlesini daha sağlıklı ve daha istikrarlı biçimde büyütmek istiyorum.",
  },
  {
    value: "Satış, mesaj veya müşteri dönüşümünü iyileştirmek",
    title: "Dönüşüm",
    description:
      "İzlenme veya trafik geliyor ama mesaj, satış ya da müşteri dönüşümü yeterli değil.",
  },
  {
    value: "İçerik düzeni ve paylaşım stratejisi oluşturmak",
    title: "İçerik düzeni",
    description:
      "Ne paylaşacağımı, hangi formatta ilerleyeceğimi ve nasıl bir sistem kuracağımı netleştirmek istiyorum.",
  },
  {
    value: "Reklam performansını destekleyecek hesap yapısı kurmak",
    title: "Reklam desteği",
    description:
      "Reklam veriyorum veya vermeyi düşünüyorum; önce hesabımın buna ne kadar hazır olduğunu görmek istiyorum.",
  },
  {
    value: "Hesabımdaki açıkları profesyonel analizle görmek",
    title: "Genel analiz",
    description:
      "Profil, içerik, güven algısı, dönüşüm ve büyüme tarafındaki açıkları görmek istiyorum.",
  },
];

const currentStatusOptions = [
  "Yeni başladım, hesabın temel düzenini doğru kurmak istiyorum",
  "Hesabım aktif ama profesyonel görünmediğini düşünüyorum",
  "Düzenli paylaşım yapıyorum fakat büyüme zayıf ilerliyor",
  "İçerik üretiyorum ama beklediğim görünürlüğü alamıyorum",
  "İzlenme alıyorum ancak etkileşim düşük kalıyor",
  "Mesaj geliyor ama satışa ya da müşteriye dönüşmüyor",
  "Reklam veriyorum ama sonuçlardan memnun değilim",
  "Hesapta neyin eksik olduğunu net göremiyorum",
  "Marka / işletme hesabım var ama güven algısını güçlendirmek istiyorum",
];

const contentStyleOptions = [
  "Ürün / hizmet tanıtımı içerikleri",
  "Reels / Shorts / kısa video ağırlıklı içerikler",
  "Bilgilendirici / eğitici içerikler",
  "Kişisel marka / uzmanlık içerikleri",
  "Kampanya / satış / reklam odaklı içerikler",
  "Hikâye anlatımı / vlog / yaşam tarzı içerikleri",
  "Medya / haber / eğlence içerikleri",
  "Karışık içerik yapısı",
  "Henüz net bir içerik düzenim yok",
];

const problemOptions = [
  "Profil ilk bakışta yeterince güven vermiyor",
  "İçerikler dikkat çekmiyor veya ilk saniyede kullanıcıyı tutmuyor",
  "Paylaşımlar düzenli olsa da görünürlük zayıf kalıyor",
  "Takipçi / abone artışı yavaş ilerliyor",
  "İzlenme geliyor ama etkileşim düşük",
  "Etkileşim geliyor ama satış / mesaj / müşteri dönüşümü düşük",
  "Reklam veriyorum ama dönüşler tatmin etmiyor",
  "Marka dili, görsel düzen veya içerik yapısı dağınık duruyor",
  "Hesapta neyin eksik olduğunu bilmiyorum, profesyonel yorum istiyorum",
];

const contactTypes: ContactType[] = [
  "WhatsApp",
  "Telegram",
  "Instagram",
  "E-posta",
];

const priceMap: Record<CurrencyCode, string> = {
  TL: "1000 TL",
  USD: "15 USD",
  RUB: "1800 RUB",
};

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-white/42">
      {children}
      {required && <span className="ml-1 text-white/70">*</span>}
    </label>
  );
}

function PremiumInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/28 transition focus:border-white/25 focus:bg-white/[0.065]"
    />
  );
}

function PremiumTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="min-h-[130px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm font-semibold leading-7 text-white outline-none placeholder:text-white/28 transition focus:border-white/25 focus:bg-white/[0.065]"
    />
  );
}

function PremiumSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-[#111318] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-white/25 focus:bg-[#151820]"
    >
      {children}
    </select>
  );
}

function ChoiceCard({
  title,
  description,
  active,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  icon?: IconType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[26px] border p-5 text-left transition hover:-translate-y-0.5 ${
        active
          ? "border-white/24 bg-white/[0.095] text-white shadow-[0_18px_40px_rgba(0,0,0,0.32)]"
          : "border-white/10 bg-white/[0.035] text-white hover:border-white/18 hover:bg-white/[0.055]"
      }`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border text-base ${
          active
            ? "border-white/18 bg-black/45 text-white"
            : "border-white/10 bg-black/25 text-white/82"
        }`}
      >
        {Icon ? <Icon /> : <FaCircleQuestion />}
      </div>

      <h4 className="text-lg font-black">{title}</h4>

      <p
        className={`mt-2 text-sm leading-6 ${
          active ? "text-white/74" : "text-white/58"
        }`}
      >
        {description}
      </p>

      {active && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-xs font-black text-white">
          Seçili <FaCheck />
        </div>
      )}
    </button>
  );
}

function StepPill({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const active = currentStep === step;
  const done = currentStep > step;

  return (
    <div
      className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition ${
        active
          ? "border-white/28 bg-white/[0.12] text-white"
          : done
            ? "border-white/18 bg-white/[0.07] text-white"
            : "border-white/10 bg-white/[0.03] text-white/38"
      }`}
    >
      {step}. {label}
    </div>
  );
}

function MiniInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/38">
        {label}
      </p>
      <p className="mt-2 text-lg font-black leading-7 text-white">{value}</p>
    </div>
  );
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export default function AnalysisForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformKey>("instagram");
  const [accountType, setAccountType] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  const [accountUsername, setAccountUsername] = useState("");
  const [accountLink, setAccountLink] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [contentStyle, setContentStyle] = useState("");
  const [mainProblem, setMainProblem] = useState("");
  const [extraNote, setExtraNote] = useState("");

  const [fullName, setFullName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("WhatsApp");
  const [contactValue, setContactValue] = useState("");

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("TL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPlatformTitle = useMemo(() => {
    return (
      platformOptions.find((platform) => platform.key === selectedPlatform)
        ?.title || "Instagram"
    );
  }, [selectedPlatform]);

  const currentPrice = priceMap[selectedCurrency];

  function nextStep() {
    setError("");

    if (step === 1 && !selectedPlatform) {
      setError("Lütfen analiz edilecek platformu seçin.");
      return;
    }

    if (step === 2 && (!accountType || !mainGoal)) {
      setError("Lütfen hesap tipini ve analizden beklentinizi seçin.");
      return;
    }

    if (
      step === 3 &&
      (!accountUsername.trim() ||
        !currentStatus ||
        !contentStyle ||
        !mainProblem)
    ) {
      setError(
        "Lütfen hesap bilgisi, mevcut durum, içerik yapısı ve ana sorun alanlarını doldurun."
      );
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
  }

  function previousStep() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function submitAnalysisAndGoToPayment() {
    setError("");

    if (!fullName.trim()) {
      setError("Ad soyad boş bırakılamaz.");
      return;
    }

    if (!contactType || !contactValue.trim()) {
      setError("İletişim kanalı ve iletişim bilginiz gereklidir.");
      return;
    }

    if (!accountUsername.trim()) {
      setError("Kullanıcı adı veya hesap bilgisi gereklidir.");
      return;
    }

    setLoading(true);

    try {
      const analysisNote = [
        `Platform: ${selectedPlatformTitle}`,
        `Hesap tipi: ${accountType}`,
        `Analizde beklenen: ${mainGoal}`,
        `Kullanıcı adı / hesap adı: ${accountUsername.trim()}`,
        accountLink.trim() ? `Hesap linki: ${accountLink.trim()}` : "",
        `Mevcut durum: ${currentStatus}`,
        `İçerik yapısı: ${contentStyle}`,
        `Ana sorun: ${mainProblem}`,
        extraNote.trim() ? `Ek not: ${extraNote.trim()}` : "",
        `Seçilen para birimi: ${selectedCurrency}`,
        `Analiz fiyat etiketi: ${currentPrice}`,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/analysis-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName.trim(),
          contact_type: contactType,
          contact_value: contactValue.trim(),

          platform: selectedPlatform,
          account_username: accountUsername.trim(),
          account_link: accountLink.trim(),

          account_type: accountType,
          content_type: contentStyle,
          daily_post_count: currentStatus,
          main_problem: mainProblem,
          main_missing: analysisNote,

          goal: mainGoal,
          extra_note: extraNote.trim(),
          selected_currency: selectedCurrency,
          selected_price: currentPrice,
        }),
      });

      const text = await res.text();
      const data = safeJsonParse<{
        success?: boolean;
        error?: string;
        requestId?: string | number;
        analysisRequestId?: string | number;
        analysis_request_id?: string | number;
        id?: string | number;
      }>(text);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.error || "Analiz başvurusu oluşturulamadı."
        );
      }

      const requestId =
        data?.requestId ||
        data?.analysisRequestId ||
        data?.analysis_request_id ||
        data?.id ||
        "";

      const params = new URLSearchParams({
        source: "analysis",
        currency: selectedCurrency,
        price: currentPrice,
        platform: selectedPlatformTitle,
      });

      if (requestId) {
        params.set("request_id", String(requestId));
      }

      router.push(`${ANALYSIS_PAYMENT_PATH}?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Başvuru oluşturulurken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080a0d] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.025] md:p-7">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/[0.03] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-white/[0.025] blur-[100px]" />

      <div className="relative">
        <div className="mb-6 flex flex-wrap gap-2">
          <StepPill step={1} currentStep={step} label="Platform" />
          <StepPill step={2} currentStep={step} label="Hedef" />
          <StepPill step={3} currentStep={step} label="Detay" />
          <StepPill step={4} currentStep={step} label="Onay" />
        </div>

        <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/72">
              <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
              Profesyonel Hesap Analizi
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Analize Başla
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/64 md:text-base">
              Sosyal medya hesabınızın neden yeterli büyüme, güven veya dönüşüm
              sağlayamadığını profesyonel bakışla inceliyoruz. Profil görünümü,
              içerik düzeni, ilk saniye etkisi, anlatım dili, hedef kitle uyumu
              ve satışa giden akış birlikte değerlendirilir.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <MiniInfoCard
                label="Odak"
                value="Profil, içerik, güven ve dönüşüm"
              />
              <MiniInfoCard
                label="Süreç"
                value="Form alınır, ekip inceler, analiz hazırlanır"
              />
              <MiniInfoCard
                label="Sonuç"
                value="Eksikler ve iyileştirme alanları paylaşılır"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white">
              <FaCircleQuestion />
            </div>

            <h3 className="text-xl font-black text-white">
              Analizde neleri inceliyoruz?
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-white/62">
              <p>• Profilinizin ilk bakışta ne kadar güven verdiğini</p>
              <p>• İçeriklerinizin kullanıcıyı ilk saniyede yakalayıp yakalamadığını</p>
              <p>• Video, görsel ve açıklama dilinizin hedef kitleyle uyumunu</p>
              <p>• Paylaşım düzeninizin büyüme açısından yeterli olup olmadığını</p>
              <p>• Reklam, DM, web sitesi veya satış akışında kopma yaşanan noktaları</p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
              Platform seçimi
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              Hangi platformu analiz ettirmek istiyorsunuz?
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {platformOptions.map((platform) => (
                <ChoiceCard
                  key={platform.key}
                  title={platform.title}
                  description={platform.description}
                  icon={platform.icon}
                  active={selectedPlatform === platform.key}
                  onClick={() => setSelectedPlatform(platform.key)}
                />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
              Hesap türü
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              Hesabınız ne için kullanılıyor?
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              Hesabınız işletme, marka, içerik sayfası, proje, medya kanalı,
              e-ticaret veya kişisel marka olabilir. Size en yakın yapıyı seçin.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {accountTypeOptions.map((option) => (
                <ChoiceCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  active={accountType === option.value}
                  onClick={() => setAccountType(option.value)}
                />
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
                Analizde ne bekliyorsunuz?
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                Bu analizden asıl beklentiniz nedir?
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {goalOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    active={mainGoal === option.value}
                    onClick={() => setMainGoal(option.value)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
              Profil / hesap linki
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              Hesabınızı daha iyi anlayalım
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel required>Kullanıcı adı veya hesap adı</FieldLabel>
                <PremiumInput
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  placeholder="@kullaniciadi veya hesap adı"
                />
              </div>

              <div>
                <FieldLabel>Profil / hesap linki</FieldLabel>
                <PremiumInput
                  value={accountLink}
                  onChange={(e) => setAccountLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <FieldLabel required>Mevcut durum</FieldLabel>
                <PremiumSelect
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <option value="">Mevcut durumu seçin</option>
                  {currentStatusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div>
                <FieldLabel required>İçerik yapısı</FieldLabel>
                <PremiumSelect
                  value={contentStyle}
                  onChange={(e) => setContentStyle(e.target.value)}
                >
                  <option value="">İçerik yapısını seçin</option>
                  {contentStyleOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div className="md:col-span-2">
                <FieldLabel required>Ana sorun alanı</FieldLabel>
                <PremiumSelect
                  value={mainProblem}
                  onChange={(e) => setMainProblem(e.target.value)}
                >
                  <option value="">Ana sorunu seçin</option>
                  {problemOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </PremiumSelect>
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Ek not</FieldLabel>
                <PremiumTextarea
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  placeholder="Özellikle bakılmasını istediğiniz bir konu varsa buraya yazabilirsiniz."
                />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">
              İletişim ve onay
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              Başvuruyu tamamla ve ödemeye geç
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
              Başvurunuz oluşturulduktan sonra ödeme ekranına yönlendirilirsiniz.
              Ödeme tamamlandığında analiz talebiniz ekip tarafından incelenir.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MiniInfoCard label="Platform" value={selectedPlatformTitle} />
              <MiniInfoCard label="Hesap tipi" value={accountType || "-"} />
              <MiniInfoCard label="Beklenti" value={mainGoal || "-"} />
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <h4 className="text-2xl font-black text-white">
                İletişim bilgileri
              </h4>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <FieldLabel required>Ad soyad</FieldLabel>
                  <PremiumInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <FieldLabel required>İletişim kanalı</FieldLabel>
                  <PremiumSelect
                    value={contactType}
                    onChange={(e) =>
                      setContactType(e.target.value as ContactType)
                    }
                  >
                    <option value="">İletişim kanalı seçin</option>
                    {contactTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </PremiumSelect>
                </div>

                <div>
                  <FieldLabel required>İletişim bilginiz</FieldLabel>
                  <PremiumInput
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="+90 5xx..., @kullanici veya e-posta"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">
                    Ödeme bilgisi
                  </p>

                  <h4 className="mt-2 text-2xl font-black text-white">
                    Para birimini seçin
                  </h4>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
                    Sonraki ekranda analiz talebi numarası, seçilen para birimi
                    ve ödeme bilgileri gösterilecek.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">
                    Seçili tutar
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    {currentPrice}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {(["TL", "USD", "RUB"] as CurrencyCode[]).map((currency) => {
                  const active = selectedCurrency === currency;

                  return (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setSelectedCurrency(currency)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                        active
                          ? "border-white/28 bg-white/[0.13] text-white"
                          : "border-white/10 bg-white/[0.035] text-white/72 hover:border-white/18 hover:bg-white/[0.055]"
                      }`}
                    >
                      {priceMap[currency]}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#6b2232] bg-[#31101b]/70 px-4 py-3 text-sm font-semibold text-[#f2c7d1]">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 1 || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaArrowLeft />
            Geri
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-6 py-3 text-sm font-black text-black transition hover:bg-white"
            >
              Devam Et
              <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitAnalysisAndGoToPayment}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.92] px-6 py-3 text-sm font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Analiz oluşturuluyor..."
                : "Analizi Bitir ve Ödemeye Geç"}
              {loading ? <FaPaperPlane /> : <FaCheck />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}