import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/studio/NoteEditor";
import { requireViewer } from "@/lib/auth";
import { getNoteById } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑笔记",
};

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireViewer();
  const { id } = await params;
  const note = getNoteById(id);

  if (!note || note.userId !== viewer.id) notFound();

  return <NoteEditor initial={note} publicBase={`/u/${viewer.handle}`} />;
}
