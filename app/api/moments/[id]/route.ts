import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { deleteMoment, updateMomentVisibility } from "@/lib/db";
import type { MomentVisibility } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const visibility: MomentVisibility | null =
    body?.visibility === "private"
      ? "private"
      : body?.visibility === "friends"
        ? "friends"
        : body?.visibility === "public"
          ? "public"
          : null;

  if (!visibility) {
    return NextResponse.json({ error: "无效的可见范围。" }, { status: 400 });
  }

  const { id } = await params;
  const moment = updateMomentVisibility(viewer.id, id, visibility);
  if (!moment) {
    return NextResponse.json({ error: "找不到这条动态。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, moment });
}

export async function DELETE(_request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const done = deleteMoment(viewer.id, id);
  if (!done) {
    return NextResponse.json({ error: "找不到这条动态。" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
