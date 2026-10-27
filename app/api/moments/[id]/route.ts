import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { deleteMoment } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
