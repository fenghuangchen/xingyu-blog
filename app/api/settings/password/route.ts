import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { getUserById, updateUserPasswordHash } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json(
      { error: "当前密码不正确。" },
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

  updateUserPasswordHash(user.id, hashPassword(newPassword));

  return NextResponse.json({ ok: true });
}
