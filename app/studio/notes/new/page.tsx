import type { Metadata } from "next";
import { NoteEditor } from "@/components/studio/NoteEditor";
import { requireViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "写新笔记",
};

export default async function NewNotePage() {
  const viewer = await requireViewer();

  return <NoteEditor initial={null} publicBase={`/u/${viewer.handle}`} />;
}
