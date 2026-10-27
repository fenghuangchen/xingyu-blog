import { NextResponse } from "next/server";
import { getNoteById, incrementNoteViews } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const note = getNoteById(id);

  if (!note || note.status !== "published") {
    return NextResponse.json({ error: "找不到这篇笔记。" }, { status: 404 });
  }

  incrementNoteViews(note.id);
  return NextResponse.json({ ok: true });
}
