import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { getNoteById, toggleLike } from "@/lib/db";
import { ensureGuestVisitorKey } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body || body.targetType !== "note") {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const targetId = typeof body.targetId === "string" ? body.targetId : "";
  const note = getNoteById(targetId);

  if (!note || note.status !== "published") {
    return NextResponse.json({ error: "找不到这篇笔记。" }, { status: 404 });
  }

  const viewer = await getViewer();
  const visitorKey = viewer
    ? `u:${viewer.id}`
    : await ensureGuestVisitorKey();

  const result = toggleLike("note", note.id, visitorKey);
  return NextResponse.json({ ok: true, ...result });
}
