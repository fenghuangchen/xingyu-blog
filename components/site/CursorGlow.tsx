"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const node = ref.current;
    if (!node) return;

    const handleMove = (event: PointerEvent) => {
      node.style.setProperty("--glow-x", `${event.clientX}px`);
      node.style.setProperty("--glow-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
