import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteView } from "@/components/site/NoteView";
import { getViewer } from "@/lib/auth";
import {
  getAdjacentNotes,
  getNoteBySlug,
  getSite,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}): Promise<Metadata> {
  const { handle, slug } = await params;
  const site = getSite(handle);
  if (!site) return {};

  const note = getNoteBySlug(site.id, slug);
  if (!note) return {};

  return {
    title: note.title,
    description: note.summary,
    openGraph: {
      title: note.title,
      description: note.summary,
      type: "article",
    },
  };
}

export default async function UserNotePage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const note = getNoteBySlug(site.id, slug);
  if (!note) notFound();

  const viewer = await getViewer();
  const adjacent = getAdjacentNotes(site.id, note.createdAt);

  return (
    <NoteView
      site={site}
      basePath={`/u/${site.handle}`}
      viewer={viewer}
      note={note}
      adjacent={adjacent}
    />
  );
}
