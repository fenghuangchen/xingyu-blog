import { NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { getUserByIdentifier } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
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

  const identifier = cleanText(body.identifier, 64);
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "请填写用户名和密码。" },
      { status: 400 },
    );
  }

  const user = getUserByIdentifier(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "用户名或密码不正确。" },
      { status: 401 },
    );
  }

  await startSession(user.id);

  return NextResponse.json({ ok: true, handle: user.handle });
}
