import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

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

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 100000) {
    return NextResponse.json(
      { error: "预览内容过长。" },
      { status: 413 },
    );
  }

  const rendered = renderMarkdown(content);
  return NextResponse.json(rendered);
}
