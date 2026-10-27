"use client";

import { useEffect } from "react";

export function ViewPing({ noteId }: { noteId: string }) {
  useEffect(() => {
    const key = `xingyu:viewed:${noteId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage 不可用时仍然记录一次浏览
    }

    const timer = window.setTimeout(() => {
      fetch(`/api/notes/${noteId}/view`, { method: "POST" }).catch(() => {});
    }, 900);

    return () => window.clearTimeout(timer);
  }, [noteId]);

  return null;
}
