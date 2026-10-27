import { NextResponse } from "next/server";
import { getUserByIdentifier } from "@/lib/db";
import { clientKey, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isRateLimited(`recovery-q:${clientKey(request)}`, 20, 5 * 60_000)) {
    return NextResponse.json(
      { error: "尝试得有点频繁，请稍后再试。" },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const identifier =
    typeof body?.identifier === "string" ? body.identifier.trim() : "";

  if (!identifier) {
    return NextResponse.json({ error: "请输入用户名。" }, { status: 400 });
  }

  const user = getUserByIdentifier(identifier);

  return NextResponse.json({
    ok: true,
    question: user?.recoveryQuestion || "",
  });
}
