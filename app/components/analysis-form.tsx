"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCircleQuestion,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

type PlatformSlug = "instagram" | "tiktok" | "youtube" | "x";
type ContactType = "WhatsApp" | "Telegram" | "";
type CurrencyCode = "TL" | "USD" | "RUB";
type PaymentMethod = "turkey_bank" | "support" | "";

type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  email_verified: boolean;
  free_analysis_used: boolean;
};

const ANALYSIS_PRICES: Record<CurrencyCode, number> = {
  TL: 1000,
  USD: 15,
  RUB: 1800,
};

const platforms = [
  {
    slug: "instagram" as const,
    title: "Instagram",
    description: "Reels, profil güveni, reklam dönüşümü ve satış analizi.",
    icon: FaInstagram,
    color: "from-pink-500/20 via-rose-500/10 to-orange-400/10",
  },
  {
    slug: "tiktok" as const,
    title: "TikTok",
    description: "Video tutma gücü, keşfet performansı ve takipçi dönüşümü.",
    icon: FaTiktok,
    color: "from-cyan-400/20 via-pink-500/10 to-white/5",
  },
  {
    slug: "youtube" as const,
    title: "YouTube",
    description: "Shorts, uzun video, izlenme süresi ve abone dönüşümü.",
    icon: FaYoutube,
    color: "from-red-500/20 via-rose-500/10 to-white/5",
  },
  {
    slug: "x" as const,
    title: "X / Twitter",
    description: "Görüntülenme, etkileşim, profil güveni ve DM dönüşümü.",
    icon: FaXTwitter,
    color: "from-white/15 via-sky-400/10 to-white/5",
  },
];

function formatMoney(value: number, currency: CurrencyCode) {
  if (currency === "TL") {
    return `${value.toLocaleString("tr-TR")} TL`;
  }

  if (currency === "RUB") {
    return `${value.toLocaleString("tr-TR")} RUB`;
  }

  return `${value.toFixed(2)} USD`;
}

function getPlatformTitle(slug: PlatformSlug) {
  return platforms.find((item) => item.slug === slug)?.title || slug;
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/85">
        {label}
        {required ? <span className="text-emerald-300"> *</span> : null}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400"
      />
    </label>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/85">
        {label}
        {required ? <span className="text-emerald-300"> *</span> : null}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-emerald-400"
      />
    </label>
  );
}

export default function AnalysisForm() {
  const [step, setStep] = useState(1);
  const [infoOpen, setInfoOpen] = useState(false);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [platform, setPlatform] = useState<PlatformSlug>("instagram");

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    account_link: "",
    target_audience: "",
    account_goal: "",
    monthly_reach: "",
    posting_frequency: "",
    viral_content: "",
    ad_budget: "",
    sales_problem: "",
    ai_content_usage: "",
    competitor_accounts: "",
    main_question: "",
    contact_type: "" as ContactType,
    contact_value: "",
  });

  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasFreeAnalysisRight = Boolean(
    authUser && authUser.email_verified && !authUser.free_analysis_used
  );

  const emailNotVerified = Boolean(authUser && !authUser.email_verified);
  const freeRightUsed = Boolean(authUser && authUser.email_verified && authUser.free_analysis_used);

  const price = ANALYSIS_PRICES[currency];

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (data.ok && data.user) {
          setAuthUser({
            id: Number(data.user.id),
            email: String(data.user.email || ""),
            full_name: data.user.full_name || null,
            email_verified: Boolean(data.user.email_verified),
            free_analysis_used: Boolean(data.user.free_analysis_used),
          });
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      }
    }

    loadAuthUser();
  }, []);

  const canGoStep2 = Boolean(platform);

  const canGoStep3 =
    form.full_name.trim().length >= 2 &&
    (form.username.trim().length >= 2 || form.account_link.trim().length >= 5) &&
    form.target_audience.trim().length >= 3 &&
    form.account_goal.trim().length >= 3;

  const canGoStep4 =
    form.monthly_reach.trim().length >= 2 &&
    form.posting_frequency.trim().length >= 2 &&
    form.sales_problem.trim().length >= 3 &&
    form.main_question.trim().length >= 3;

  const canSubmit =
    form.contact_type &&
    form.contact_value.trim().length >= 3 &&
    (hasFreeAnalysisRight || paymentMethod);

  const progressText = useMemo(() => {
    if (step === 1) return "1 / 4 · Platform";
    if (step === 2) return "2 / 4 · Hesap Bilgileri";
    if (step === 3) return "3 / 4 · Analiz Soruları";
    return "4 / 4 · İletişim ve Onay";
  }, [step]);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function buildMainProblemText() {
    return [
      `Analiz Platformu: ${getPlatformTitle(platform)}`,
      "",
      "HESAP HEDEFİ VE KİTLE",
      `Hedef kitle: ${form.target_audience || "-"}`,
      `Hesabın amacı / satılan ürün-hizmet: ${form.account_goal || "-"}`,
      "",
      "PERFORMANS VE REKLAM",
      `Aylık erişim: ${form.monthly_reach || "-"}`,
      `Paylaşım sıklığı: ${form.posting_frequency || "-"}`,
      `Keşfete düşen / patlayan içerik: ${form.viral_content || "-"}`,
      `Reklam bütçesi: ${form.ad_budget || "-"}`,
      `Reklam / satış dönüşüm problemi: ${form.sales_problem || "-"}`,
      "",
      "İÇERİK VE GÜVEN",
      `AI içerik kullanımı: ${form.ai_content_usage || "-"}`,
      `Rakip / örnek hesaplar: ${form.competitor_accounts || "-"}`,
    ].join("\n");
  }

  function buildMainMissingText() {
    return [
      "ANALİZDEN BEKLENEN CEVAP",
      form.main_question || "-",
      "",
      "ÖZET",
      `${getPlatformTitle(platform)} hesabı için içerik, erişim, reklam dönüşümü, hedef kitle, profil güveni ve satış süreci incelenecek.`,
    ].join("\n");
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/analysis-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: form.full_name,
          username: form.username,
          account_link: form.account_link,
          account_type: getPlatformTitle(platform),
          content_type: form.account_goal,
          daily_post_count: form.posting_frequency,
          coupon_code: "",
          main_problem: buildMainProblemText(),
          main_missing: buildMainMissingText(),
          contact_type: form.contact_type,
          contact_value: form.contact_value,

          analysis_platform: platform,
          analysis_currency: currency,
          payment_method: hasFreeAnalysisRight ? "free_analysis_right" : paymentMethod,
          analysis_price: hasFreeAnalysisRight ? 0 : price,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Analiz başvurusu oluşturulamadı.");
      }

      setMessage(
        "Analiz başvurunuz oluşturuldu. 24 saat içerisinde ekibimiz sizinle iletişime geçecektir."
      );

      setStep(1);
      setForm({
        full_name: "",
        username: "",
        account_link: "",
        target_audience: "",
        account_goal: "",
        monthly_reach: "",
        posting_frequency: "",
        viral_content: "",
        ad_budget: "",
        sales_problem: "",
        ai_content_usage: "",
        competitor_accounts: "",
        main_question: "",
        contact_type: "",
        contact_value: "",
      });
      setPaymentMethod("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-7">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
            Profesyonel Hesap Analizi
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Analize Başla
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            İçeriklerim keşfete düşmüyor, reklam veriyorum ama ürün satamıyorum,
            profilime gelen kişi takip etmiyor veya mesajlar satışa dönüşmüyor
            diyorsan hesabını birlikte inceleyelim.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInfoOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-black text-sky-200 transition hover:bg-sky-400/15"
        >
          <FaCircleQuestion />
          Analizde nelere bakıyoruz?
        </button>
      </div>

      {infoOpen && (
        <div className="mb-6 rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-black text-white">
                Bu analiz özellikle şu problemler için hazırlanır:
              </p>

              <div className="mt-4 grid gap-2">
                {[
                  "İçeriklerim keşfete düşmüyor.",
                  "Reklam alsam bile ürün satamıyorum.",
                  "Profilime giren kişi takip etmiyor.",
                  "Mesaj geliyor ama satın almaya dönüşmüyor.",
                  "Videolar izleniyor ama güven ve satış oluşturmuyor.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-white">
                Ekibimiz hangi alanları inceler?
              </p>

              <p className="mt-4 text-sm leading-7 text-white/70">
                Hedef kitleniz, içerik düzeniniz, reklam bütçeniz, satış
                süreciniz, AI içerik kullanımı, profil güveni ve platform
                algoritmasına uyumunuz değerlendirilir.
              </p>

              <p className="mt-3 text-sm leading-7 text-white/70">
                Analiz şu an <b>Instagram, TikTok, YouTube ve X / Twitter</b>{" "}
                hesapları için hazırlanır. Başvuru ekibimiz tarafından manuel
                incelenir; eksikler, düzeltme önerileri ve gerekirse hesabınıza
                özel ek paket önerileri iletilir.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            Durum
          </p>
          <p className="mt-2 text-sm font-black text-white">{progressText}</p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/70">
            Ücretsiz Hak
          </p>
          <p className="mt-2 text-sm font-black text-white">
            {hasFreeAnalysisRight
              ? "1 ücretsiz analiz hakkınız hazır"
              : emailNotVerified
                ? "E-posta doğrulaması bekleniyor"
                : freeRightUsed
                  ? "Ücretsiz analiz hakkı kullanıldı"
                  : "Üyelik + e-posta doğrulama ile kazanılır"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            Standart Analiz
          </p>
          <p className="mt-2 text-sm font-black text-white">
            1000 TL / 15 USD / 1800 RUB
          </p>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h3 className="mb-4 text-2xl font-black text-white">
            Hangi platformu analiz ettirmek istiyorsunuz?
          </h3>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {platforms.map((item) => {
              const Icon = item.icon;
              const active = platform === item.slug;

              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setPlatform(item.slug)}
                  className={`rounded-3xl border bg-gradient-to-br p-5 text-left transition hover:-translate-y-0.5 ${
                    active
                      ? "border-emerald-400/70 from-emerald-400/20 to-white/[0.04]"
                      : `border-white/10 ${item.color} hover:border-white/20`
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-xl text-white">
                    <Icon />
                  </div>

                  <p className="text-lg font-black text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {item.description}
                  </p>

                  {active && (
                    <span className="mt-4 inline-flex rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-black">
                      Seçili
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="mb-4 text-2xl font-black text-white">
            Hesap bilgilerini yaz
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Ad soyad"
              required
              value={form.full_name}
              onChange={(value) => updateForm("full_name", value)}
              placeholder="Örn: Yusuf Uysal"
            />

            <InputField
              label="Kullanıcı adı"
              required
              value={form.username}
              onChange={(value) => updateForm("username", value)}
              placeholder="@kullaniciadi"
            />

            <InputField
              label="Hesap linki"
              value={form.account_link}
              onChange={(value) => updateForm("account_link", value)}
              placeholder="https://instagram.com/..."
            />

            <InputField
              label="Hedef kitleniz kim?"
              required
              value={form.target_audience}
              onChange={(value) => updateForm("target_audience", value)}
              placeholder="Örn: 20-35 yaş kadın, Türkiye, cilt bakımıyla ilgilenen kitle"
            />
          </div>

          <div className="mt-4">
            <TextAreaField
              label="Hesabın amacı nedir, ne satıyorsunuz veya neyi büyütmek istiyorsunuz?"
              required
              value={form.account_goal}
              onChange={(value) => updateForm("account_goal", value)}
              placeholder="Örn: Cilt bakım ürünleri satıyoruz. Aylık 50 satış hedefliyoruz ama reklamdan gelen kişiler satın almıyor."
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="mb-4 text-2xl font-black text-white">
            Kısa analiz soruları
          </h3>

          <div className="grid gap-4">
            <TextAreaField
              label="Aylık ortalama hesap erişiminiz kaç?"
              required
              value={form.monthly_reach}
              onChange={(value) => updateForm("monthly_reach", value)}
              placeholder="Örn: Son 30 günde yaklaşık 80.000 erişim aldım ama satışa dönüşmüyor."
            />

            <TextAreaField
              label="Günde veya haftada kaç içerik paylaşıyorsunuz?"
              required
              value={form.posting_frequency}
              onChange={(value) => updateForm("posting_frequency", value)}
              placeholder="Örn: Haftada 4 Reels, her gün story, bazen 2-3 gün boş kalıyor."
            />

            <TextAreaField
              label="Hiç keşfete düşen, normalden çok izlenen veya patlayan içeriğiniz oldu mu?"
              value={form.viral_content}
              onChange={(value) => updateForm("viral_content", value)}
              placeholder="Örn: Bir videom 200.000 izlendi ama takipçi ve satış çok az geldi."
            />

            <TextAreaField
              label="Reklama aylık ne kadar bütçe ayırıyorsunuz?"
              value={form.ad_budget}
              onChange={(value) => updateForm("ad_budget", value)}
              placeholder="Örn: Aylık 5.000 TL reklam veriyoruz veya hiç reklam vermiyoruz."
            />

            <TextAreaField
              label="Reklam alsanız bile satış, mesaj veya talep dönüşümünde nerede sorun yaşıyorsunuz?"
              required
              value={form.sales_problem}
              onChange={(value) => updateForm("sales_problem", value)}
              placeholder="Örn: Tıklama geliyor ama WhatsApp’a geçen az oluyor. Mesaj atanlar da fiyat sorup kayboluyor."
            />

            <TextAreaField
              label="Videolarınızda veya görsellerinizde AI içerik kullanıyor musunuz?"
              value={form.ai_content_usage}
              onChange={(value) => updateForm("ai_content_usage", value)}
              placeholder="Örn: AI seslendirme kullanıyorum, bazı videolarda AI görsel var. Doğal durup durmadığından emin değilim."
            />

            <TextAreaField
              label="Rakip veya örnek aldığınız hesap var mı?"
              value={form.competitor_accounts}
              onChange={(value) => updateForm("competitor_accounts", value)}
              placeholder="Örn: Rakip hesap linkleri veya örnek aldığınız 1-3 profil."
            />

            <TextAreaField
              label="Bu analizden sonra en çok hangi konuda net cevap almak istiyorsunuz?"
              required
              value={form.main_question}
              onChange={(value) => updateForm("main_question", value)}
              placeholder="Örn: Neden satış alamıyorum, neden keşfete düşmüyorum, reklam bütçem neden boşa gidiyor?"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="mb-4 text-2xl font-black text-white">
            İletişim ve analiz onayı
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-white/85">
                İletişim kanalı <span className="text-emerald-300">*</span>
              </span>

              <select
                value={form.contact_type}
                onChange={(event) =>
                  updateForm("contact_type", event.target.value as ContactType)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              >
                <option value="" className="bg-[#111827]">
                  WhatsApp veya Telegram seç
                </option>
                <option value="WhatsApp" className="bg-[#111827]">
                  WhatsApp
                </option>
                <option value="Telegram" className="bg-[#111827]">
                  Telegram
                </option>
              </select>
            </label>

            <InputField
              label="İletişim bilginiz"
              required
              value={form.contact_value}
              onChange={(value) => updateForm("contact_value", value)}
              placeholder={
                form.contact_type === "Telegram"
                  ? "@kullaniciadi"
                  : "+90 5xx xxx xx xx"
              }
            />
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            {hasFreeAnalysisRight ? (
              <>
                <p className="text-lg font-black text-white">
                  Ücretsiz analiz hakkınız kullanılacak
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  E-posta doğrulamanız tamamlandığı için hesabınıza tanımlanan
                  1 ücretsiz analiz hakkı bu başvuruda kullanılacaktır.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-black text-white">
                  Standart analiz başvurusu
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  E-posta doğrulaması yapılmış ücretsiz analiz hakkınız yoksa
                  başvuru standart analiz ücretiyle oluşturulur.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(["TL", "USD", "RUB"] as CurrencyCode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrency(item)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        currency === item
                          ? "border-emerald-400 bg-emerald-400/15"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="text-xs font-black text-white/40">{item}</p>
                      <p className="mt-1 text-sm font-black text-white">
                        {formatMoney(ANALYSIS_PRICES[item], item)}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("turkey_bank")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "turkey_bank"
                        ? "border-emerald-400 bg-emerald-400/15"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-black text-white">Havale / EFT</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Ödeme sonrası dekont kontrol edilir.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("support")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "support"
                        ? "border-sky-400 bg-sky-400/15"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-black text-white">
                      Destek ile ödeme
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/55">
                      Alternatif ödeme için ekip sizinle iletişime geçer.
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-50">
            Sipariş oluşturulduktan sonra 24 saat içerisinde ekibimiz sizinle
            iletişime geçecektir.
          </div>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
          disabled={step === 1}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaArrowLeft />
          Geri
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(prev + 1, 4))}
            disabled={
              (step === 1 && !canGoStep2) ||
              (step === 2 && !canGoStep3) ||
              (step === 3 && !canGoStep4)
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Devam Et
            <FaArrowRight />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Analiz Başvurusunu Oluştur"}
            <FaCheck />
          </button>
        )}
      </div>
    </section>
  );
}