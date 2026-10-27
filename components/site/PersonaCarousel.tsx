"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";

type Persona = {
  src: string;
  label: string;
  ai: boolean;
};

const AI_PERSONAS: Persona[] = [
  { src: "/personas/xingyu.webp", label: "星屿", ai: true },
  { src: "/personas/chayan.webp", label: "茶烟", ai: true },
];

export function PersonaCarousel({
  avatar,
  name,
}: {
  avatar: string;
  name: string;
}) {
  const slides = useMemo<Persona[]>(
    () => [
      { src: avatar, label: "本尊", ai: false },
      ...AI_PERSONAS,
    ],
    [avatar],
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    for (const persona of AI_PERSONAS) {
      const image = new Image();
      image.src = persona.src;
    }
  }, []);

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, reduced, slides.length]);

  const current = slides[active];

  return (
    <div
      className="persona-carousel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`avatar-frame persona-frame${current.ai ? " is-ai" : ""}`}>
        <span className="avatar-halo" aria-hidden="true" />
        <div className="persona-slide" key={`${current.src}-${active}`}>
          <Avatar
            src={current.src}
            name={current.ai ? `${name} · ${current.label}` : name}
            size={104}
            eager={active === 0}
          />
        </div>
        <span className="status-dot" title="在岛上" />
        {current.ai ? (
          <span className="persona-badge" aria-label="AI 形象">
            AI
          </span>
        ) : null}
      </div>

      <div className="persona-dots" role="tablist" aria-label="切换形象">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={index === active ? "is-active" : ""}
            onClick={() => {
              setActive(index);
              setPaused(true);
            }}
            aria-label={`切换到${slide.label}`}
            aria-pressed={index === active}
            title={slide.label}
            style={
              slide.src.startsWith("/")
                ? { backgroundImage: `url("${slide.src}")` }
                : undefined
            }
          />
        ))}
      </div>

      <span className="persona-name">{current.label}</span>
    </div>
  );
}
