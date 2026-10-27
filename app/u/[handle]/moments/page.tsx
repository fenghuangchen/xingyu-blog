import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MomentsView } from "@/components/site/MomentsView";
import { getViewer } from "@/lib/auth";
import { getSite, listMoments } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const site = getSite(handle);
  return {
    title: site ? `${site.displayName}的动态` : "动态",
    description: site?.tagline,
  };
}

export default async function UserMomentsPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const viewer = await getViewer();
  const moments = listMoments(site.id, 100);

  return (
    <MomentsView
      site={site}
      basePath={`/u/${site.handle}`}
      viewer={viewer}
      moments={moments}
    />
  );
}
