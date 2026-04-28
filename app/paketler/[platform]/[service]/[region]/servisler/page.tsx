import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    platform: string;
    service: string;
    region: string;
  }>;
  searchParams?: Promise<{
    country?: string;
  }>;
};

export default async function RegionServicesPage({ params }: Props) {
  const { platform, service, region } = await params;

  const query = new URLSearchParams({
    platform,
    category: service,
    region,
    from: "old-packages",
  });

  redirect(`/smmtora?${query.toString()}`);
}