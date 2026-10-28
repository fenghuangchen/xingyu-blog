import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import {
  listFriendState,
  removeFriend,
  respondFriendRequest,
  sendFriendRequest,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  return NextResponse.json(listFriendState(viewer.id));
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  if (body.action === "request") {
    if (typeof body.userId !== "string") {
      return NextResponse.json({ error: "缺少用户。" }, { status: 400 });
    }
    const result = sendFriendRequest(viewer.id, body.userId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (body.action === "accept" || body.action === "decline") {
    if (typeof body.requestId !== "string") {
      return NextResponse.json({ error: "缺少申请。" }, { status: 400 });
    }
    const ok = respondFriendRequest(viewer.id, body.requestId, body.action);
    if (!ok) {
      return NextResponse.json(
        { error: "这条好友申请已经失效。" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove") {
    if (typeof body.userId !== "string") {
      return NextResponse.json({ error: "缺少好友。" }, { status: 400 });
    }
    const ok = removeFriend(viewer.id, body.userId);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "未知操作。" }, { status: 400 });
}
