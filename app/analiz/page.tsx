import Link from "next/link";
import AnalysisForm from "@/app/components/analysis-form";
import UserMenu from "@/app/components/auth/UserMenu";
import {
  FaChartLine,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

const platforms: {
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    title: "Instagram",
    description:
      "Reels açılışı, hook yapısı, profil güveni, içerik düzeni ve satış dönüşümü değerlendirilir.",
    icon: FaInstagram,
  },
  {
    title: "TikTok",
    description:
      "İlk saniye etkisi, izlenme akışı, retention gücü, içerik dili ve kitle uyumu incelenir.",
    icon: FaTiktok,
  },
  {
    title: "YouTube",
    description:
      "Shorts yapısı, izleyici tutma gücü, başlık-kapak etkisi ve kanal güveni analiz edilir.",
    icon: FaYoutube,
  },
  {
    title: "X",
    description:
      "Profil konumlandırması, paylaşım dili, etkileşim kalitesi ve görünürlük yapısı değerlendirilir.",
    icon: FaXTwitter,
  },
];

export const metadata = {
  title: "Sosyal Medya Analizi | MedyaTora",
  description:
    "Instagram, TikTok, YouTube ve X hesapları için MedyaTora profesyonel sosyal medya analiz başvuru sayfası.",
};

export default function AnalizPage() {
  return (
    <main className="mt-premium-page">
      <div className="mt-premium-inner mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#080a0d]/92 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.025] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/72 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            ← Ana Sayfa
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/paketler"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Paketler
              </Link>

              <Link
                href="/smmtora"
                className="rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-black text-black shadow-[0_14px_34px_rgba(255,255,255,0.08)] transition hover:bg-white/90"
              >
                SMMTora
              </Link>
            </nav>

            <UserMenu />
          </div>
        </header>

        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.025] backdrop-blur-xl md:p-10">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/72">
              <FaChartLine />
              Profesyonel hesap analizi
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Hesabının neden büyümediğini birlikte netleştirelim.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
              İçerik açılışların, hook gücün, profil güvenin, paylaşım düzenin
              ve dönüşüm akışın profesyonel bir gözle incelenir. Amacımız
              hesabındaki açıkları netleştirmek ve daha güçlü bir sosyal medya
              görünümü için uygulanabilir öneriler sunmaktır.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;

              return (
                <div
                  key={platform.title}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-xl text-white">
                    <Icon />
                  </div>

                  <h2 className="text-lg font-black text-white">
                    {platform.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {platform.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-[30px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:p-6">
            <div className="mb-6">
              <p className="text-sm font-bold text-white">
                Analiz başvuru formu
              </p>

              <p className="mt-2 text-sm leading-7 text-white/65">
                Hesap bilgilerini ve iletişim tercihini doldur. Başvurun
                MedyaTora paneline düşer ve ekibimiz analiz sürecini başlatır.
              </p>
            </div>

            <AnalysisForm />
          </div>
        </section>
      </div>
    </main>
  );
}