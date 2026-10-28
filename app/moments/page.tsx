import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MomentsView } from "@/components/site/MomentsView";
import { getViewer } from "@/lib/auth";
import { getOwnerSite, listVisibleMoments } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "动态",
  description: "一些没有被写成文章的碎片。",
};

export default async function MomentsPage() {
  const site = getOwnerSite();
  if (!site) notFound();

  const viewer = await getViewer();
  const moments = listVisibleMoments(site.id, viewer?.id ?? null, 100);

  return (
    <MomentsView
      site={site}
      basePath=""
      viewer={viewer}
      moments={moments}
    />
  );
}
