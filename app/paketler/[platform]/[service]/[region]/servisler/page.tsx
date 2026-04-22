import Link from "next/link";
import { getInstagramServices, type ServiceCardItem } from "@/lib/services";
import ServicesClient from "./ServicesClient";

type Props = {
  params: Promise<{
    platform: string;
    service: string;
    region: "turk" | "rus" | "yabanci";
  }>;
  searchParams: Promise<{
    country?: string;
  }>;
};

const foreignCountries = [
  { slug: "all", title: "Tümü" },
  { slug: "abd", title: "ABD" },
  { slug: "almanya", title: "Almanya" },
  { slug: "fransa", title: "Fransa" },
  { slug: "hindistan", title: "Hindistan" },
  { slug: "italya", title: "İtalya" },
  { slug: "kanada", title: "Kanada" },
  { slug: "brezilya", title: "Brezilya" },
  { slug: "arap", title: "Arap" },
  { slug: "avrupa", title: "Avrupa" },
  { slug: "pakistan", title: "Pakistan" },
  { slug: "iran", title: "İran" },
  { slug: "ispanya", title: "İspanya" },
  { slug: "avustralya", title: "Avustralya" },
  { slug: "azerbaycan", title: "Azerbaycan" },
];

function formatValue(value: string) {
  const map: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    x: "X / Twitter",
    telegram: "Telegram",
    spotify: "Spotify",
    facebook: "Facebook",

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

    turk: "Türk",
    rus: "Rus",
    yabanci: "Yabancı",
  };

  return map[value] || value;
}

export default async function RegionServicesPage({
  params,
  searchParams,
}: Props) {
  const { platform, service, region } = await params;
  const { country } = await searchParams;

  const selectedCountry =
    region === "yabanci" && country && country !== "all" ? country : undefined;

  const items: ServiceCardItem[] =
    platform === "instagram"
      ? getInstagramServices({
          serviceSlug: service,
          region,
          country: selectedCountry,
        })
      : [];

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formatValue(platform)} / {formatValue(service)} / {formatValue(region)}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {items.length} servis bulundu
              </p>
            </div>

            <Link
              href={`/paketler/${platform}/${service}`}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Geri
            </Link>
          </div>
        </div>

        {region === "yabanci" && (
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Ülke Seçenekleri</h2>

            <div className="flex flex-wrap gap-3">
              {foreignCountries.map((item) => {
                const active =
                  (country || "all") === item.slug ||
                  (!country && item.slug === "all");

                return (
                  <Link
                    key={item.slug}
                    href={`/paketler/${platform}/${service}/${region}/servisler${
                      item.slug === "all" ? "" : `?country=${item.slug}`
                    }`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <ServicesClient
          items={items}
          meta={{
            platform,
            service,
            region,
            country: selectedCountry || "",
          }}
        />
      </div>
    </main>
  );
}