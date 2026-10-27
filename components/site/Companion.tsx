"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Mood = "idle" | "happy" | "sleep";

const COMMON_LINES = [
  "今天也写一点吗？",
  "茶还温着。",
  "我在替你看星星。",
  "慢一点也没关系。",
  "要留一句话吗？",
  "记得喝口水。",
];

const NOTE_LINES = [
  "这一段写得很好。",
  "代码块记得标语言。",
  "写累了就看看窗外。",
  "星屿猫在陪你写。",
];

const GUESTBOOK_LINES = [
  "有人来过这里。",
  "要回一句话吗？",
  "这里的声音很轻。",
];

const MOMENT_LINES = [
  "今天的光线不错。",
  "记下这一刻。",
  "我闻到茶香了。",
];

function pickLine(pathname: string): string {
  const pool = pathname.includes("/notes")
    ? NOTE_LINES
    : pathname.includes("/guestbook")
      ? GUESTBOOK_LINES
      : pathname.includes("/moments")
        ? MOMENT_LINES
        : COMMON_LINES;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function Companion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const happyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const [mood, setMood] = useState<Mood>("idle");
  const [bubble, setBubble] = useState<string | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--look-x", `${x * 1.6}px`);
      el.style.setProperty("--look-y", `${y * 1.2}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const scheduleSleep = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setMood("sleep");
        setBubble(null);
      }, 38000);
    };

    scheduleSleep();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (happyTimer.current) clearTimeout(happyTimer.current);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };
  }, []);

  function handleInteract() {
    if (happyTimer.current) clearTimeout(happyTimer.current);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);

    setMood("happy");
    setBubble(pickLine(pathname));

    happyTimer.current = setTimeout(() => setMood("idle"), 900);
    bubbleTimer.current = setTimeout(() => setBubble(null), 4200);
    idleTimer.current = setTimeout(() => {
      setMood("sleep");
      setBubble(null);
    }, 38000);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "companion",
        mood === "happy" && "is-happy",
        mood === "sleep" && "is-sleeping",
      )}
      data-pet="xingyu-cat"
    >
      {bubble ? (
        <div className="pet-bubble" role="status">
          {bubble}
        </div>
      ) : null}

      {mood === "happy" ? (
        <span className="pet-burst" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      ) : null}

      {mood === "sleep" ? (
        <span className="pet-zzz" aria-hidden="true">
          z z
        </span>
      ) : null}

      <button
        type="button"
        className="pet-button"
        onClick={handleInteract}
        aria-label={mood === "sleep" ? "叫醒星屿猫" : "和星屿猫互动"}
        title={mood === "sleep" ? "叫醒星屿猫" : "摸摸星屿猫"}
      >
        <span className="pet-glow" aria-hidden="true" />
        <span className="pet-sprite">
          <svg
            viewBox="0 0 34 38"
            role="img"
            aria-hidden="true"
            shapeRendering="crispEdges"
          >
            <ellipse
              className="pet-shadow"
              cx="17"
              cy="35"
              rx="10"
              ry="2"
              fill="rgba(0,0,0,0.34)"
            />

            <g className="pet-tail">
              <rect x="26" y="23" width="3" height="8" fill="var(--pet-outline)" />
              <rect x="29" y="19" width="3" height="8" fill="var(--pet-outline)" />
              <rect x="31" y="15" width="2" height="6" fill="var(--pet-outline)" />
              <rect x="27" y="24" width="2" height="6" fill="var(--pet-fur-2)" />
              <rect x="30" y="20" width="2" height="6" fill="var(--pet-fur-2)" />
            </g>

            <g className="pet-body">
              <rect x="9" y="21" width="16" height="9" fill="var(--pet-outline)" />
              <rect x="10" y="22" width="14" height="7" fill="var(--pet-fur)" />
              <rect x="13" y="23" width="8" height="5" fill="var(--pet-fur-2)" />
              <rect x="11" y="29" width="5" height="2" fill="var(--pet-outline)" />
              <rect x="19" y="29" width="5" height="2" fill="var(--pet-outline)" />
            </g>

            <g className="pet-head">
              <rect x="5" y="8" width="24" height="15" fill="var(--pet-outline)" />
              <rect x="6" y="9" width="22" height="13" fill="var(--pet-fur)" />
              <rect x="6" y="4" width="5" height="6" fill="var(--pet-outline)" />
              <rect x="7" y="5" width="3" height="4" fill="var(--accent)" />
              <rect x="23" y="4" width="5" height="6" fill="var(--pet-outline)" />
              <rect x="24" y="5" width="3" height="4" fill="var(--accent)" />
              <rect x="8" y="18" width="2" height="1" fill="var(--accent)" opacity="0.75" />
              <rect x="24" y="18" width="2" height="1" fill="var(--accent)" opacity="0.75" />
              <rect x="16" y="19" width="2" height="1" fill="var(--accent)" />
              <rect x="2" y="16" width="3" height="1" fill="var(--pet-outline)" />
              <rect x="2" y="18" width="3" height="1" fill="var(--pet-outline)" />
              <rect x="29" y="16" width="3" height="1" fill="var(--pet-outline)" />
              <rect x="29" y="18" width="3" height="1" fill="var(--pet-outline)" />
            </g>

            <g className="pet-look">
              <g className="pet-eyes">
                <rect x="10" y="14" width="4" height="4" fill="var(--pet-outline)" />
                <rect x="20" y="14" width="4" height="4" fill="var(--pet-outline)" />
                <rect x="11" y="15" width="1" height="1" fill="#ffffff" />
                <rect x="21" y="15" width="1" height="1" fill="#ffffff" />
              </g>
            </g>

            <g className="pet-star">
              <rect x="16" y="6" width="2" height="3" fill="var(--pet-outline)" />
              <path
                d="M17 1l1.7 3.1 3.4.5-2.5 2.4.6 3.4-3.2-1.7-3.2 1.7.6-3.4-2.5-2.4 3.4-.5z"
                fill="var(--accent)"
              />
            </g>
          </svg>
        </span>
      </button>

      <span className="pet-tag">星屿猫</span>
    </div>
  );
}
