import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { deleteNote, getNoteById, updateNote } from "@/lib/db";
import { excerptFromMarkdown } from "@/lib/markdown";
import type { NoteStatus } from "@/lib/types";
import { cleanText, isCoverId, normalizeTags } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const existing = getNoteById(id);
  if (!existing || existing.userId !== viewer.id) {
    return NextResponse.json({ error: "找不到这篇笔记。" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const title = cleanText(body.title, 120) || existing.title;
  const content =
    typeof body.content === "string" ? body.content : existing.content;
  const status: NoteStatus =
    body.status === "draft"
      ? "draft"
      : body.status === "published"
        ? "published"
        : existing.status;

  if (!title) {
    return NextResponse.json({ error: "先给笔记一个标题。" }, { status: 400 });
  }

  if (content.length > 200000) {
    return NextResponse.json(
      { error: "正文太长了，请控制在 20 万字符以内。" },
      { status: 400 },
    );
  }

  if (status === "published" && !content.trim()) {
    return NextResponse.json(
      { error: "发布的笔记需要一些正文。" },
      { status: 400 },
    );
  }

  const note = updateNote(viewer.id, id, {
    title,
    summary:
      cleanText(body.summary, 200) ||
      existing.summary ||
      excerptFromMarkdown(content, 120),
    content,
    category: cleanText(body.category, 24),
    tags: normalizeTags(body.tags),
    cover: isCoverId(body.cover) ? String(body.cover) : existing.cover,
    pinned: Boolean(body.pinned),
    status,
  });

  if (!note) {
    return NextResponse.json({ error: "保存失败。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note });
}

export async function DELETE(_request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const done = deleteNote(viewer.id, id);
  if (!done) {
    return NextResponse.json({ error: "找不到这篇笔记。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
