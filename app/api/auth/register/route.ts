import { NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { createUser, getUserByHandle } from "@/lib/db";
import {
  cleanText,
  isValidHandle,
  normalizeHandle,
} from "@/lib/utils";

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

  const displayName = cleanText(body.displayName, 24);
  const handle = normalizeHandle(body.handle);
  const password = typeof body.password === "string" ? body.password : "";

  if (!displayName) {
    return NextResponse.json({ error: "请填写一个昵称。" }, { status: 400 });
  }

  if (!isValidHandle(handle)) {
    return NextResponse.json(
      { error: "用户名需为 3–20 位小写字母、数字或短横线。" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "密码至少需要 8 个字符。" },
      { status: 400 },
    );
  }

  if (password.length > 72) {
    return NextResponse.json(
      { error: "密码太长了，请控制在 72 个字符以内。" },
      { status: 400 },
    );
  }

  if (getUserByHandle(handle)) {
    return NextResponse.json(
      { error: "这个用户名已经被使用了，换一个试试。" },
      { status: 409 },
    );
  }

  try {
    const user = createUser({
      handle,
      displayName,
      password,
    });

    await startSession(user.id);

    return NextResponse.json({ ok: true, handle: user.handle });
  } catch {
    return NextResponse.json(
      { error: "注册没有完成，请稍后再试。" },
      { status: 500 },
    );
  }
}
