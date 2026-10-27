import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { deleteMessage, getMessageById } from "@/lib/db";

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
  const message = getMessageById(id);
  if (!message) {
    return NextResponse.json({ error: "找不到这条留言。" }, { status: 404 });
  }

  const isOwner = message.siteUserId === viewer.id;
  const isAuthor = message.authorUserId === viewer.id;
  if (!isOwner && !isAuthor) {
    return NextResponse.json({ error: "没有权限删除这条留言。" }, { status: 403 });
  }

  deleteMessage(id);
  return NextResponse.json({ ok: true });
}
