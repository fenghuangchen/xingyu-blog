import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function uploadDir(): string {
  const base = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
  return path.join(base, "uploads");
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  if (isRateLimited(`upload:${viewer.id}`, 24, 60_000)) {
    return NextResponse.json(
      { error: "上传得有点频繁，稍等一分钟再试。" },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "上传内容无法读取。" }, { status: 400 });
  }

  const uploaded = form.get("file");
  if (!uploaded || typeof uploaded === "string") {
    return NextResponse.json({ error: "没有收到图片文件。" }, { status: 400 });
  }

  const file = uploaded as File;
  const extension = EXT_BY_TYPE[file.type];

  if (!extension) {
    return NextResponse.json(
      { error: "只支持 JPG、PNG、WebP 或 GIF 图片。" },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "图片是空的。" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "图片不能超过 5MB。" },
      { status: 413 },
    );
  }

  try {
    const directory = uploadDir();
    await mkdir(directory, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(directory, filename), buffer);

    return NextResponse.json({
      ok: true,
      url: `/api/uploads/${filename}`,
      size: file.size,
    });
  } catch {
    return NextResponse.json(
      { error: "图片保存失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
