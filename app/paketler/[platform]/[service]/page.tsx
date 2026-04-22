import Link from "next/link";

type Props = {
  params: Promise<{ platform: string; service: string }>;
};

type RegionItem = {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
};

const regions: RegionItem[] = [
  {
    slug: "turk",
    title: "Türk",
    subtitle: "Türkiye hedefli servisler",
    emoji: "🇹🇷",
    color: "from-red-500 to-rose-600",
  },
  {
    slug: "rus",
    title: "Rus",
    subtitle: "Rusya hedefli servisler",
    emoji: "🇷🇺",
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "yabanci",
    title: "Yabancı",
    subtitle: "Diğer ülke hedefli servisler",
    emoji: "🌍",
    color: "from-emerald-500 to-green-600",
  },
];

function formatPlatform(platform: string) {
  const map: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    x: "X / Twitter",
    telegram: "Telegram",
    spotify: "Spotify",
    facebook: "Facebook",
  };
  return map[platform] || platform;
}

function formatService(service: string) {
  const map: Record<string, string> = {
    takipci: "Takipçi",
    begeni: "Beğeni",
    izlenme: "İzlenme",
    kaydetme: "Kaydetme",
    paylasim: "Paylaşım",
    yorum: "Yorum",
    etkilesim: "Etkileşim",
    "canli-yayin": "Canlı Yayın",
    bahsetme: "Bahsetme",
    paketler: "Paketler",
  };
  return map[service] || service;
}

export default async function ServicePage({ params }: Props) {
  const { platform, service } = await params;

  const platformTitle = formatPlatform(platform);
  const serviceTitle = formatService(service);

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-700 text-2xl text-white shadow-sm">
                🧭
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {platformTitle} / {serviceTitle}
                </h1>
                <p className="text-sm text-gray-500">
                  Hangi ülkeden istediğini seç
                </p>
              </div>
            </div>

            <Link
              href={`/paketler/${platform}`}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Geri
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {regions.map((item) => (
                <Link
                  key={item.slug}
                  href={`/paketler/${platform}/${service}/${item.slug}`}
                  className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br ${item.color} p-6 text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white" />
                    <div className="absolute bottom-2 right-2 h-16 w-16 rounded-full border border-white/40" />
                  </div>

                  <div className="relative flex min-h-[190px] flex-col justify-between">
                    <div className="text-5xl">{item.emoji}</div>

                    <div>
                      <h2 className="text-2xl font-extrabold uppercase tracking-wide">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm text-white/90">{item.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}