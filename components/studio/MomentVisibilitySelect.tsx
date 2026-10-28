"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MomentVisibility } from "@/lib/types";

const LABELS: Record<MomentVisibility, string> = {
  public: "共同可见",
  friends: "好友可见",
  private: "仅自己",
};

export function MomentVisibilitySelect({
  momentId,
  visibility,
}: {
  momentId: string;
  visibility: MomentVisibility;
}) {
  const router = useRouter();
  const [value, setValue] = useState(visibility);
  const [saving, setSaving] = useState(false);

  async function update(next: MomentVisibility) {
    const previous = value;
    setValue(next);
    setSaving(true);
    try {
      const response = await fetch(`/api/moments/${momentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      if (!response.ok) {
        setValue(previous);
        return;
      }
      router.refresh();
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      className="moment-visibility-select"
      value={value}
      onChange={(event) =>
        void update(event.target.value as MomentVisibility)
      }
      disabled={saving}
      aria-label="动态可见范围"
      title="修改动态可见范围"
    >
      {(Object.keys(LABELS) as MomentVisibility[]).map((key) => (
        <option key={key} value={key}>
          {LABELS[key]}
        </option>
      ))}
    </select>
  );
}
