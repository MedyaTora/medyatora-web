import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ platform: string; service: string; region: string }>;
};

export default async function RegionPage({ params }: Props) {
  const { platform, service, region } = await params;

  redirect(`/paketler/${platform}/${service}/${region}/servisler`);
}