import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteView } from "@/components/site/NoteView";
import { getViewer } from "@/lib/auth";
import {
  getAdjacentNotes,
  getNoteBySlug,
  getOwnerSite,
  isLikedBy,
} from "@/lib/db";
import { getViewerLikeKey } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = getOwnerSite();
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

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getOwnerSite();
  if (!site) notFound();

  const note = getNoteBySlug(site.id, slug);
  if (!note) notFound();

  const viewer = await getViewer();
  const likeKey = await getViewerLikeKey(viewer);
  const liked = likeKey ? isLikedBy("note", note.id, likeKey) : false;
  const adjacent = getAdjacentNotes(site.id, note.createdAt);

  return (
    <NoteView
      site={site}
      basePath=""
      viewer={viewer}
      note={note}
      adjacent={adjacent}
      liked={liked}
    />
  );
}
