"use client";

import { useEffect, useMemo, useState } from "react";

type CurrencyCode = "TL" | "USD" | "RUB";
type ContactType = "Telegram" | "WhatsApp" | "Instagram" | "E-posta" | "";

type AuthUser = {
  id: number;
  email: string;
  full_name: string | null;
  email_verified: boolean;
  free_analysis_used: boolean;
};

const analysisPrices: Record<CurrencyCode, number> = {
  TL: 1000,
  USD: 15,
  RUB: 1800,
};

function formatMoney(value: number, currency: CurrencyCode) {
  if (currency === "TL" || currency === "RUB") {
    return `${Math.round(value).toLocaleString("tr-TR")} ${currency}`;
  }

  return `${value.toFixed(2)} ${currency}`;
}

export default function AnalysisForm() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    account_link: "",
    account_type: "",
    content_type: "",
    daily_post_count: "",
    main_problem: "",
    main_missing: "",
    contact_type: "" as ContactType,
    contact_value: "",
    currency: "TL" as CurrencyCode,
  });

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const hasFreeAnalysisRight = Boolean(
    authUser && authUser.email_verified && !authUser.free_analysis_used
  );

  const selectedPrice = analysisPrices[form.currency];

  const priceText = useMemo(() => {
    if (hasFreeAnalysisRight) return "Ücretsiz analiz hakkınız aktif";
    return formatMoney(selectedPrice, form.currency);
  }, [hasFreeAnalysisRight, selectedPrice, form.currency]);

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
            email: data.user.email,
            full_name: data.user.full_name,
            email_verified: Boolean(data.user.email_verified),
            free_analysis_used: Boolean(data.user.free_analysis_used),
          });
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadAuthUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/analysis-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Bir hata oluştu");
      }

      setMessage(
        result.message ||
          "Başvurunuz alındı. Analiz ekibimiz sizinle iletişime geçecektir."
      );

      setForm({
        full_name: "",
        username: "",
        account_link: "",
        account_type: "",
        content_type: "",
        daily_post_count: "",
        main_problem: "",
        main_missing: "",
        contact_type: "",
        contact_value: "",
        currency: form.currency,
      });

      if (result.freeAnalysisUsed && authUser) {
        setAuthUser({
          ...authUser,
          free_analysis_used: true,
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur md:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Profesyonel hesap analizi
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black text-white">
              Hesabını analiz ettir
            </h2>

            <button
              type="button"
              onClick={() => setInfoOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/25 bg-sky-400/10 text-sm font-black text-sky-200 transition hover:bg-sky-400/15"
              aria-label="Analiz hakkında bilgi"
            >
              ?
            </button>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            E-posta adresini doğrulayan kullanıcılar 1 defaya mahsus ücretsiz
            analiz hakkı kazanır. Ücretsiz hakkı olmayan kullanıcılar ücretli
            analiz talebi bırakabilir.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 md:min-w-[230px]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100/70">
            Analiz fiyatı
          </p>

          <p className="mt-2 text-2xl font-black text-white">{priceText}</p>

          {!hasFreeAnalysisRight ? (
            <p className="mt-2 text-xs leading-5 text-white/55">
              Normal fiyat: 1000 TL / 15 USD / 1800 RUB
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-white/55">
              Bu hak yalnızca 1 kez kullanılabilir.
            </p>
          )}
        </div>
      </div>

      {infoOpen ? (
        <div className="mb-6 rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/12 via-emerald-400/8 to-white/[0.04] p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-200">
            Analizde nelere bakıyoruz?
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">Hesabınız neden ilerlemiyor?</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Profil düzeni, güven algısı, takipçi/etkileşim dengesi,
                içerik ritmi ve hesabın ilk bakışta verdiği profesyonel izlenim
                incelenir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">Reklam neden talep getirmiyor?</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Reklamdan gelen kişinin profilde neden kalmadığı, neden mesaj
                atmadığı veya neden satın alma isteğine dönüşmediği
                değerlendirilir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">İçerikler neden tutmuyor?</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                İlk saniye dikkat gücü, içerik kalitesi, paylaşım düzeni,
                hedef kitle uyumu ve Instagram algoritmasının temel görünürlük
                mantığına göre eksikler belirlenir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">Sonuçta ne veriyoruz?</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Ekibimiz hesabınızı inceler; sonuçlar, düzeltme önerileri ve
                uygulanabilir gelişim adımları size iletilir. İsteğe göre
                hesabınıza özel ek paket veya profesyonelleştirme önerileri de
                sunulabilir.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-6 rounded-3xl border border-white/10 bg-black/20 p-4">
        {authLoading ? (
          <p className="text-sm text-white/55">Hesap durumu kontrol ediliyor...</p>
        ) : authUser ? (
          authUser.email_verified ? (
            authUser.free_analysis_used ? (
              <p className="text-sm leading-6 text-amber-100">
                E-postanız doğrulanmış, ancak ücretsiz analiz hakkınız daha önce
                kullanılmış. Dilerseniz ücretli analiz talebi oluşturabilirsiniz.
              </p>
            ) : (
              <p className="text-sm leading-6 text-emerald-100">
                E-postanız doğrulanmış. 1 defalık ücretsiz analiz hakkınız aktif.
              </p>
            )
          ) : (
            <p className="text-sm leading-6 text-amber-100">
              Ücretsiz analiz hakkı için e-posta adresinizi doğrulamalısınız.
              Doğrulama yapmadan da ücretli analiz talebi oluşturabilirsiniz.
            </p>
          )
        ) : (
          <p className="text-sm leading-6 text-white/60">
            Ücretsiz analiz hakkı için giriş yapıp e-posta adresinizi doğrulayın.
            Üyeliksiz başvurular ücretli analiz olarak alınır.
          </p>
        )}
      </div>

      {!hasFreeAnalysisRight ? (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/40">
            Ödeme para birimi
          </label>

          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
          >
            <option value="TL" className="bg-[#121826]">
              TL — 1000 TL
            </option>
            <option value="USD" className="bg-[#121826]">
              USD — 15 USD
            </option>
            <option value="RUB" className="bg-[#121826]">
              RUB — 1800 RUB
            </option>
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="Ad soyad"
        />

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="Instagram kullanıcı adınız"
        />

        <input
          name="account_link"
          value={form.account_link}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="Hesap linkiniz"
        />

        <input
          name="account_type"
          value={form.account_type}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="Hesap türünüz: kişisel / işletme / butik..."
        />

        <input
          name="content_type"
          value={form.content_type}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="İçerik türünüz"
        />

        <input
          name="daily_post_count"
          value={form.daily_post_count}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="Günlük kaç paylaşım yapıyorsunuz?"
          inputMode="numeric"
        />

        <select
          name="contact_type"
          value={form.contact_type}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
        >
          <option value="" className="bg-[#121826]">
            İletişim türü seçin
          </option>
          <option value="Telegram" className="bg-[#121826]">
            Telegram
          </option>
          <option value="Instagram" className="bg-[#121826]">
            Instagram
          </option>
          <option value="E-posta" className="bg-[#121826]">
            E-posta
          </option>
          <option value="WhatsApp" className="bg-[#121826]">
            WhatsApp
          </option>
        </select>

        <input
          name="contact_value"
          value={form.contact_value}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
          placeholder="İletişim bilginiz"
        />
      </div>

      <textarea
        name="main_problem"
        value={form.main_problem}
        onChange={handleChange}
        className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
        placeholder="Genel sorununuz nedir? Örn: reklam veriyorum ama mesaj gelmiyor, içerikler izlenmiyor..."
      />

      <textarea
        name="main_missing"
        value={form.main_missing}
        onChange={handleChange}
        className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 transition focus:border-emerald-400"
        placeholder="Sizce en büyük eksiğiniz nedir?"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-2xl bg-emerald-400 px-6 py-3 font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Gönderiliyor..."
          : hasFreeAnalysisRight
            ? "Ücretsiz Analiz Hakkımı Kullan"
            : `Analiz Başvurusu Gönder — ${formatMoney(selectedPrice, form.currency)}`}
      </button>

      {message ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white/80">
          {message}
        </div>
      ) : null}
    </form>
  );
}