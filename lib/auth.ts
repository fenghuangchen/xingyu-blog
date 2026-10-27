import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  createSessionRow,
  deleteSessionRow,
  getSessionUser,
} from "./db";
import type { Viewer } from "./types";

export const SESSION_COOKIE = "xingyu_session";
const SESSION_DAYS = 30;

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const user = getSessionUser(token);
  if (!user) return null;

  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    avatar: user.avatar,
    theme: user.theme,
  };
});

export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);

  createSessionRow(token, userId, expiresAt.toISOString());

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) deleteSessionRow(token);
  store.delete(SESSION_COOKIE);
}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}
