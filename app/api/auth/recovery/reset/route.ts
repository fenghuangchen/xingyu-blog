import { NextResponse } from "next/server";
import {
  deleteSessionsForUser,
  getUserByIdentifier,
  updateUserPasswordHash,
} from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientKey, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  if (isRateLimited(`recovery-r:${clientKey(request)}`, 10, 10 * 60_000)) {
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
  const answer = typeof body?.answer === "string" ? body.answer : "";
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!identifier || !answer) {
    return NextResponse.json(
      { error: "请填写用户名和密保答案。" },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "新密码至少需要 8 个字符。" },
      { status: 400 },
    );
  }

  if (newPassword.length > 72) {
    return NextResponse.json(
      { error: "新密码太长了，请控制在 72 个字符以内。" },
      { status: 400 },
    );
  }

  const user = getUserByIdentifier(identifier);
  if (!user || !user.recoveryQuestion || !user.recoveryAnswerHash) {
    return NextResponse.json(
      { error: "用户名或密保答案不正确。" },
      { status: 400 },
    );
  }

  if (!verifyPassword(normalizeAnswer(answer), user.recoveryAnswerHash)) {
    return NextResponse.json(
      { error: "用户名或密保答案不正确。" },
      { status: 400 },
    );
  }

  updateUserPasswordHash(user.id, hashPassword(newPassword));
  deleteSessionsForUser(user.id);

  return NextResponse.json({ ok: true });
}
