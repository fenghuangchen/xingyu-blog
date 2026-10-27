"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteNoteButton({
  noteId,
  compact = false,
}: {
  noteId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm("删除后无法恢复，确定要删除这篇笔记吗？")) return;

    setPending(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (response.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={compact ? "icon-btn icon-btn-danger" : "btn btn-danger btn-sm"}
      onClick={handleDelete}
      disabled={pending}
      aria-label="删除笔记"
    >
      {pending ? (
        <Loader2 size={14} className="spin" />
      ) : (
        <Trash2 size={14} />
      )}
      {compact ? null : "删除"}
    </button>
  );
}
