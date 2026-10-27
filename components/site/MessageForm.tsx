"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function MessageForm({
  siteUserId,
  viewerName,
}: {
  siteUserId: string;
  viewerName: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(viewerName || "");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || pending) return;

    if (!viewerName && !name.trim()) {
      setError("留下一个称呼吧，方便我记得你。");
      return;
    }

    setPending(true);
    setError("");
    setSent(false);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUserId,
          authorName: name,
          content,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error || "留言没有送达，请稍后再试。");
        return;
      }

      setContent("");
      setSent(true);
      router.refresh();
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="guest-name">你的称呼</label>
        <input
          id="guest-name"
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="怎么称呼你？"
          maxLength={24}
          readOnly={Boolean(viewerName)}
          required={!viewerName}
        />
        {viewerName ? (
          <span className="field-hint">
            已以登录身份留言，署名会自动使用你的昵称。
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="guest-content">想说的话</label>
        <textarea
          id="guest-content"
          className="textarea"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="留下一个脚印，或者一句想说的话……"
          rows={5}
          maxLength={600}
          required
        />
        <span className="field-hint field-hint-right">
          {content.length}/600
        </span>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {sent ? (
        <p className="form-success">留言已送达，谢谢你来到这座小岛。</p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={pending || !content.trim()}
      >
        {pending ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
        {pending ? "正在送达" : "留下这句话"}
      </button>

      <p className="form-note">
        留言不需要注册。注册一个账号，你也能拥有自己的小岛。
      </p>
    </form>
  );
}
