"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LikeButton({
  noteId,
  initialLiked,
  initialCount,
}: {
  noteId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "note", targetId: noteId }),
      });

      if (!response.ok) return;
      const data = (await response.json()) as {
        liked?: boolean;
        count?: number;
      };

      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.count === "number") setCount(data.count);
    } catch {
      // 保持原状态，下一次点击再试
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={cn("like-btn", liked && "is-liked")}
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "取消点赞" : "点赞这篇笔记"}
      title={liked ? "取消点赞" : "点赞"}
    >
      {pending ? (
        <Loader2 size={14} className="spin" />
      ) : (
        <Heart size={15} fill={liked ? "currentColor" : "none"} />
      )}
      <span>{count}</span>
    </button>
  );
}
