import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createNote } from "@/lib/db";
import { excerptFromMarkdown } from "@/lib/markdown";
import type { NoteStatus } from "@/lib/types";
import { cleanText, isCoverId, normalizeTags } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const title = cleanText(body.title, 120);
  const content = typeof body.content === "string" ? body.content : "";
  const status: NoteStatus = body.status === "draft" ? "draft" : "published";

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

  const summary =
    cleanText(body.summary, 200) ||
    excerptFromMarkdown(content, 120) ||
    "一篇新的笔记。";
  const category = cleanText(body.category, 24);
  const tags = normalizeTags(body.tags);
  const cover = isCoverId(body.cover) ? String(body.cover) : "orbit";
  const pinned = Boolean(body.pinned);

  try {
    const note = createNote(viewer.id, {
      title,
      summary,
      content,
      category,
      tags,
      cover,
      pinned,
      status,
    });

    return NextResponse.json({ ok: true, note });
  } catch {
    return NextResponse.json(
      { error: "保存失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
