import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeView } from "@/components/site/HomeView";
import { getViewer } from "@/lib/auth";
import {
  getSite,
  listMessages,
  listMoments,
  listPublishedNotes,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) return {};
  return {
    title: `${site.displayName}的小岛`,
    description: site.tagline,
  };
}

export default async function UserHomePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const viewer = await getViewer();
  const notes = listPublishedNotes(site.id, 7);
  const moments = listMoments(site.id, 6);
  const messages = listMessages(site.id, 4);
  const basePath = `/u/${site.handle}`;

  return (
    <HomeView
      site={site}
      basePath={basePath}
      viewer={viewer}
      notes={notes}
      moments={moments}
      messages={messages}
    />
  );
}
