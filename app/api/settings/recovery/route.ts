import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { getUserById, updateUserRecovery } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { cleanText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function PATCH(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const user = getUserById(viewer.id);
  if (!user) {
    return NextResponse.json({ error: "账号不存在。" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json(
      { error: "当前密码不正确。" },
      { status: 400 },
    );
  }

  const question = cleanText(body.question, 120);
  const answer = cleanText(body.answer, 120);

  if (!question && !answer) {
    updateUserRecovery(user.id, "", "");
    return NextResponse.json({ ok: true, cleared: true });
  }

  if (!question || !answer) {
    return NextResponse.json(
      { error: "密保问题和答案需要同时填写。" },
      { status: 400 },
    );
  }

  updateUserRecovery(
    user.id,
    question,
    hashPassword(normalizeAnswer(answer)),
  );

  return NextResponse.json({ ok: true });
}
