import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutView } from "@/components/site/AboutView";
import { getViewer } from "@/lib/auth";
import { getSite } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const site = getSite(handle);
  return {
    title: site ? `关于 ${site.displayName}` : "关于",
    description: site?.tagline,
  };
}

export default async function UserAboutPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const viewer = await getViewer();

  return (
    <AboutView
      site={site}
      basePath={`/u/${site.handle}`}
      viewer={viewer}
    />
  );
}
