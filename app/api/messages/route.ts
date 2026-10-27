import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createMessage, getUserById } from "@/lib/db";
import { cleanText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const siteUserId = cleanText(body.siteUserId, 80);
  const site = getUserById(siteUserId);
  if (!site) {
    return NextResponse.json({ error: "找不到这座小岛。" }, { status: 404 });
  }

  const viewer = await getViewer();
  const content = cleanText(body.content, 600);
  const guestName = cleanText(body.authorName, 24);
  const authorName = viewer ? viewer.displayName : guestName;

  if (!authorName) {
    return NextResponse.json({ error: "请留下一个称呼。" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "留言不能是空的。" }, { status: 400 });
  }

  const message = createMessage({
    siteUserId: site.id,
    authorUserId: viewer?.id ?? null,
    authorName,
    content,
  });

  return NextResponse.json({ ok: true, message });
}
