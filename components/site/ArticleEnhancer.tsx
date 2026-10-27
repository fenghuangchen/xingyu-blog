"use client";

import { useEffect, useState } from "react";

export function ArticleEnhancer() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>(".prose figure.code-shell"),
    );

    figures.forEach((figure) => {
      if (figure.querySelector(".code-copy")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "复制";
      button.addEventListener("click", async () => {
        const code = figure.querySelector("code")?.innerText ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "已复制";
          window.setTimeout(() => {
            button.textContent = "复制";
          }, 1600);
        } catch {
          button.textContent = "复制失败";
        }
      });

      figure.querySelector("figcaption")?.appendChild(button);
    });
  }, []);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]"),
    );
    const links = Array.from(
      document.querySelectorAll<HTMLElement>(".toc a[href^='#']"),
    );

    if (!headings.length || !links.length) return;

    const linkMap = new Map<string, HTMLElement>();
    links.forEach((link) => {
      const key = decodeURIComponent(
        (link.getAttribute("href") || "").replace(/^#/, ""),
      );
      linkMap.set(key, link);
    });

    const setActive = (id: string) => {
      links.forEach((link) => link.classList.remove("is-active"));
      const link = linkMap.get(id);
      if (link) link.classList.add("is-active");
    };

    const updateActive = () => {
      let current = "";
      for (const heading of headings) {
        const top = heading.getBoundingClientRect().top;
        if (top <= 240) current = heading.id;
        else break;
      }
      if (current) setActive(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}
