"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MomentVisibility } from "@/lib/types";

const MOODS = ["☕", "🌙", "✨", "🍵", "📖", "🍂"];

export function MomentComposer({
  siteUserId,
  variant = "site",
}: {
  siteUserId: string;
  variant?: "site" | "studio";
}) {
  const router = useRouter();
  const visibilityId = useId();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("☕");
  const [visibility, setVisibility] = useState<MomentVisibility>("public");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || pending) return;

    setPending(true);
    setError("");
    setSent(false);

    try {
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood, visibility }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error || "发布失败，请稍后再试。");
        return;
      }

      setContent("");
      setVisibility("public");
      setSent(true);
      router.refresh();
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className={cn("moment-composer glass", variant === "studio" && "is-studio")}
      onSubmit={handleSubmit}
    >
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="此刻在想什么？写给未来的自己，也写给路过的人。"
        maxLength={500}
        rows={3}
        className="composer-textarea"
        aria-label="动态内容"
      />

      <div className="composer-bar">
        <div className="mood-picker" role="group" aria-label="选择心情">
          {MOODS.map((item) => (
            <button
              key={item}
              type="button"
              className={cn("mood-btn", mood === item && "is-active")}
              aria-pressed={mood === item}
              onClick={() => setMood(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="composer-visibility" htmlFor={visibilityId}>
          <span>可见</span>
          <select
            id={visibilityId}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as MomentVisibility)
            }
            aria-label="动态可见范围"
          >
            <option value="public">共同可见</option>
            <option value="friends">好友可见</option>
            <option value="private">仅自己</option>
          </select>
        </label>

        <div className="composer-actions">
          <span className="composer-count">{content.length}/500</span>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!content.trim() || pending}
          >
            {pending ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Send size={14} />
            )}
            {pending ? "发布中" : "发布动态"}
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {sent ? <p className="form-success">动态已经留在岛上了。</p> : null}
    </form>
  );
}
