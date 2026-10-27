import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { Viewer } from "./types";

export const VISITOR_COOKIE = "xingyu_visitor";

/** Stable key for "has this visitor liked this thing". */
export async function getViewerLikeKey(
  viewer: Viewer | null,
): Promise<string | null> {
  if (viewer) return `u:${viewer.id}`;

  const store = await cookies();
  return store.get(VISITOR_COOKIE)?.value ?? null;
}

/** Called from route handlers so guests can like without an account. */
export async function ensureGuestVisitorKey(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const key = `g:${randomUUID()}`;
  store.set(VISITOR_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.COOKIE_SECURE === "true",
  });
  return key;
}
