"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteMomentButton({ momentId }: { momentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm("删除这条动态？")) return;

    setPending(true);
    try {
      const response = await fetch(`/api/moments/${momentId}`, {
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
      className="icon-btn icon-btn-danger"
      onClick={handleDelete}
      disabled={pending}
      aria-label="删除动态"
    >
      {pending ? (
        <Loader2 size={14} className="spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  );
}
