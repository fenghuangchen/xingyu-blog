import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { searchUsersForFriend } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({
    users: searchUsersForFriend(viewer.id, query),
  });
}
