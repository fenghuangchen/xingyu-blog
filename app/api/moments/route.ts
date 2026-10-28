import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createMoment, deleteMoment } from "@/lib/db";
import type { MomentVisibility } from "@/lib/types";
import { cleanText } from "@/lib/utils";

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

  const content = cleanText(body.content, 500);
  const mood = cleanText(body.mood, 8);
  const visibility: MomentVisibility =
    body.visibility === "private"
      ? "private"
      : body.visibility === "friends"
        ? "friends"
        : "public";

  if (!content) {
    return NextResponse.json({ error: "写点什么再发布吧。" }, { status: 400 });
  }

  const moment = createMoment(viewer.id, { content, mood, visibility });
  return NextResponse.json({ ok: true, moment });
}

export async function DELETE(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "缺少动态编号。" }, { status: 400 });
  }

  const done = deleteMoment(viewer.id, id);
  if (!done) {
    return NextResponse.json({ error: "找不到这条动态。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
