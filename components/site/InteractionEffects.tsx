"use client";

import { useEffect } from "react";

const SELECTOR =
  "button, a.btn, .icon-btn, .mood-btn, .preset-option, .cover-option, .note-card, .creator-card";

export function InteractionEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups = new Map<HTMLElement, number>();

    const pop = (target: HTMLElement, x?: number, y?: number) => {
      if (
        target.hasAttribute("disabled") ||
        target.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      const previous = cleanups.get(target);
      if (previous) window.clearTimeout(previous);

      target.classList.remove("button-pop");
      // Restart the animation when the same button is pressed quickly.
      void target.offsetWidth;
      target.classList.add("button-pop");

      const timer = window.setTimeout(() => {
        target.classList.remove("button-pop");
        cleanups.delete(target);
      }, 420);
      cleanups.set(target, timer);

      if (x === undefined || y === undefined) return;

      const rect = target.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      if (getComputedStyle(target).position === "static") {
        target.classList.add("has-ripple");
      }

      const size = Math.max(rect.width, rect.height) * 1.45;
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - rect.left}px`;
      ripple.style.top = `${y - rect.top}px`;
      target.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 620);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        SELECTOR,
      );
      if (!element) return;
      pop(element, event.clientX, event.clientY);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        "button, a.btn",
      );
      if (!element) return;
      pop(element);
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      cleanups.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
