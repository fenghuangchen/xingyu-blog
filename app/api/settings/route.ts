import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import {
  getUserById,
  updateUserProfile,
  updateUserTheme,
} from "@/lib/db";
import { normalizeTheme } from "@/lib/theme";
import type { SocialLink } from "@/lib/types";
import {
  cleanText,
  isImageSource,
  normalizeTags,
} from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSocials(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 6)
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const label = cleanText(record.label, 16);
      const url = cleanText(record.url, 300);
      if (!label || !url) return null;

      try {
        const parsed = new URL(url);
        if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
          return null;
        }
      } catch {
        return null;
      }

      return { label, url };
    })
    .filter((item): item is SocialLink => Boolean(item));
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

  const displayName = cleanText(body.displayName, 24) || user.displayName;
  const siteTitle = cleanText(body.siteTitle, 24) || `${displayName}的小岛`;
  const avatar = cleanText(body.avatar, 300);

  if (avatar && !isImageSource(avatar) && avatar.length > 8) {
    return NextResponse.json(
      { error: "头像请填写图片链接，或者一个不超过 8 个字符的 emoji。" },
      { status: 400 },
    );
  }

  updateUserProfile(viewer.id, {
    displayName,
    siteTitle,
    tagline: cleanText(body.tagline, 120),
    bio: cleanText(body.bio, 1200),
    now: cleanText(body.now, 160),
    location: cleanText(body.location, 30),
    tags: normalizeTags(body.tags, 8),
    avatar,
    socials: parseSocials(body.socials),
  });

  updateUserTheme(viewer.id, normalizeTheme(body.theme));

  return NextResponse.json({ ok: true });
}
