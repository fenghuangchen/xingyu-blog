import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesView } from "@/components/site/NotesView";
import { getViewer } from "@/lib/auth";
import {
  getCategories,
  getSite,
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
  return {
    title: site ? `${site.displayName}的学习笔记` : "学习笔记",
    description: site?.tagline,
  };
}

export default async function UserNotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const { category } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;

  const viewer = await getViewer();
  const notes = listPublishedNotes(site.id, 100, activeCategory);
  const categories = getCategories(site.id);

  return (
    <NotesView
      site={site}
      basePath={`/u/${site.handle}`}
      viewer={viewer}
      notes={notes}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
}
