import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { listFriendMessages, sendFriendMessage } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const messages = listFriendMessages(viewer.id, id);
  if (!messages) {
    return NextResponse.json(
      { error: "只有好友之间才能聊天。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: Params) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  if (isRateLimited(`friend-chat:${viewer.id}`, 40, 60_000)) {
    return NextResponse.json(
      { error: "发得太快了，稍微慢一点。" },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "先写点什么。" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json(
      { error: "一条消息最多 2000 个字符。" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const message = sendFriendMessage(viewer.id, id, content);
  if (!message) {
    return NextResponse.json(
      { error: "只有好友之间才能聊天。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, message });
}
