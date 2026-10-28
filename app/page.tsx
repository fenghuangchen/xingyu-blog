import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeView } from "@/components/site/HomeView";
import { getViewer } from "@/lib/auth";
import {
  getOwnerSite,
  listMessages,
  listPublishedNotes,
  listVisibleMoments,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = getOwnerSite();
  if (!site) return {};
  return {
    title: `${site.siteTitle} · ${site.displayName}的小岛`,
    description: site.tagline,
  };
}

export default async function HomePage() {
  const site = getOwnerSite();
  if (!site) notFound();

  const viewer = await getViewer();
  const notes = listPublishedNotes(site.id, 7);
  const moments = listVisibleMoments(site.id, viewer?.id ?? null, 6);
  const messages = listMessages(site.id, 4);

  return (
    <HomeView
      site={site}
      basePath=""
      viewer={viewer}
      notes={notes}
      moments={moments}
      messages={messages}
    />
  );
}
