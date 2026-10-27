import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesView } from "@/components/site/NotesView";
import { getViewer } from "@/lib/auth";
import {
  getCategories,
  getOwnerSite,
  listPublishedNotes,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "学习笔记",
  description: "Agent、AI、代码、阅读与生活里的一些慢功夫。",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const site = getOwnerSite();
  if (!site) notFound();

  const { category } = await searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;

  const [viewer] = await Promise.all([getViewer()]);
  const notes = listPublishedNotes(site.id, 100, activeCategory);
  const categories = getCategories(site.id);

  return (
    <NotesView
      site={site}
      basePath=""
      viewer={viewer}
      notes={notes}
      categories={categories}
      activeCategory={activeCategory}
    />
  );
}
