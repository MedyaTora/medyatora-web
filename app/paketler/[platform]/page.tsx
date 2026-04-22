import Link from "next/link";

type Props = {
  params: Promise<{ platform: string }>;
};

type ServiceItem = {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
};

const instagramServices: ServiceItem[] = [
  {
    slug: "takipci",
    title: "Takipçi",
    subtitle: "Standart, gerçek, VIP",
    emoji: "👥",
    color: "from-pink-500 to-rose-500",
  },
  {
    slug: "begeni",
    title: "Beğeni",
    subtitle: "Standart, gerçek, kaliteli",
    emoji: "❤️",
    color: "from-rose-500 to-red-500",
  },
  {
    slug: "izlenme",
    title: "İzlenme",
    subtitle: "Video, reels, hikaye",
    emoji: "▶️",
    color: "from-orange-500 to-amber-500",
  },
  {
    slug: "kaydetme",
    title: "Kaydetme",
    subtitle: "Post ve reels kaydetme",
    emoji: "🔖",
    color: "from-yellow-500 to-orange-500",
  },
  {
    slug: "paylasim",
    title: "Paylaşım",
    subtitle: "Post ve reels paylaşımı",
    emoji: "📤",
    color: "from-green-500 to-emerald-500",
  },
  {
    slug: "yorum",
    title: "Yorum",
    subtitle: "Rastgele, özel, İngilizce",
    emoji: "💬",
    color: "from-cyan-500 to-sky-500",
  },
  {
    slug: "etkilesim",
    title: "Etkileşim",
    subtitle: "Erişim, gösterim, karışık",
    emoji: "⚡",
    color: "from-violet-500 to-purple-500",
  },
  {
    slug: "canli-yayin",
    title: "Canlı Yayın",
    subtitle: "İzlenme, yorum, tepki",
    emoji: "📡",
    color: "from-red-500 to-pink-600",
  },
  {
    slug: "bahsetme",
    title: "Bahsetme",
    subtitle: "Mention ve özel liste",
    emoji: "@",
    color: "from-blue-500 to-indigo-500",
  },
  {
    slug: "paketler",
    title: "Paketler",
    subtitle: "Büyüme ve kombin paketler",
    emoji: "📦",
    color: "from-slate-700 to-slate-900",
  },
];

function getPlatformTitle(slug: string) {
  switch (slug) {
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "x":
      return "X / Twitter";
    case "telegram":
      return "Telegram";
    case "spotify":
      return "Spotify";
    case "facebook":
      return "Facebook";
    default:
      return slug;
  }
}

export default async function PlatformPage({ params }: Props) {
  const { platform } = await params;

  const platformTitle = getPlatformTitle(platform);

  if (platform !== "instagram") {
    return (
      <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <Link
              href="/paketler"
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              ← Geri Dön
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{platformTitle}</h1>
          <p className="mt-2 text-gray-600">
            Bu platformun detay ekranı birazdan hazırlanacak.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-2xl text-white shadow-sm">
                📸
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Instagram
                </h1>
                <p className="text-sm text-gray-500">Ne istediğini seç</p>
              </div>
            </div>

            <Link
              href="/paketler"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Geri
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {instagramServices.map((item) => (
                <Link
                  key={item.slug}
                  href={`/paketler/${platform}/${item.slug}`}
                  className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br ${item.color} p-5 text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white" />
                    <div className="absolute bottom-2 right-2 h-16 w-16 rounded-full border border-white/40" />
                  </div>

                  <div className="relative flex min-h-[170px] flex-col justify-between">
                    <div className="text-4xl">{item.emoji}</div>

                    <div>
                      <h2 className="text-xl font-extrabold uppercase tracking-wide">
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