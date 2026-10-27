import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const SAFE_NAME = /^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  if (!SAFE_NAME.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = name.split(".").pop()?.toLowerCase() || "";
  const base = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");

  try {
    const data = await readFile(path.join(base, "uploads", name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[extension] || "application/octet-stream",
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
