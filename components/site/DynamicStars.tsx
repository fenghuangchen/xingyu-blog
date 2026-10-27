"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  accent: boolean;
};

type Shooting = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
};

export function DynamicStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const el = canvas;
    const ctx = context;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let nextShootingAt = performance.now() + 5000;
    let frame = 0;
    let starColor = "#ffffff";
    let accentColor = "#e7a9c4";
    let pointerX = 0;
    let pointerY = 0;

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min);

    function readColors() {
      const styles = getComputedStyle(el);
      starColor = styles.getPropertyValue("--ink").trim() || "#ffffff";
      accentColor = styles.getPropertyValue("--accent").trim() || "#e7a9c4";
    }

    function buildStars() {
      const count = Math.min(
        140,
        Math.max(60, Math.round((width * height) / 15000)),
      );

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: random(0.4, 1.45),
        baseAlpha: random(0.18, 0.62),
        phase: Math.random() * Math.PI * 2,
        speed: random(0.25, 0.85),
        driftX: random(-0.01, 0.01),
        driftY: random(-0.007, 0.007),
        accent: Math.random() < 0.08,
      }));
    }

    function paint(time: number, still = false) {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!still) {
          star.x += star.driftX;
          star.y += star.driftY;

          if (star.x < -4) star.x = width + 4;
          if (star.x > width + 4) star.x = -4;
          if (star.y < -4) star.y = height + 4;
          if (star.y > height + 4) star.y = -4;
        }

        const twinkle =
          star.baseAlpha *
          (0.72 + 0.28 * Math.sin(time * 0.001 * star.speed + star.phase));
        const x = star.x + pointerX * (star.r > 1.1 ? 7 : 3);
        const y = star.y + pointerY * (star.r > 1.1 ? 7 : 3);

        ctx.globalAlpha = twinkle;
        ctx.fillStyle = star.accent ? accentColor : starColor;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (star.r > 1.3) {
          ctx.globalAlpha = twinkle * 0.22;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!still && shooting) {
        shooting.life += 1;
        shooting.x += shooting.dx;
        shooting.y += shooting.dy;

        const progress = shooting.life / shooting.maxLife;
        const tailX = shooting.x - shooting.dx * 10;
        const tailY = shooting.y - shooting.dy * 10;
        const gradient = ctx.createLinearGradient(
          tailX,
          tailY,
          shooting.x,
          shooting.y,
        );
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.7, `${accentColor}99`);
        gradient.addColorStop(1, "rgba(255,255,255,0.95)");

        ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.9;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shooting.x, shooting.y);
        ctx.stroke();

        if (shooting.life >= shooting.maxLife) shooting = null;
      }

      ctx.globalAlpha = 1;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = Math.max(1, Math.round(width * dpr));
      el.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      buildStars();
      if (reduceMotion) paint(0, true);
    }

    function spawnShootingStar() {
      const fromLeft = Math.random() > 0.5;
      shooting = {
        x: fromLeft ? random(0, width * 0.45) : random(width * 0.55, width),
        y: random(0, height * 0.45),
        dx: fromLeft ? random(4.5, 8) : random(-8, -4.5),
        dy: random(2.2, 4.2),
        life: 0,
        maxLife: random(48, 82),
      };
    }

    function tick(time: number) {
      if (!shooting && time > nextShootingAt) {
        spawnShootingStar();
        nextShootingAt = time + random(6000, 14000);
      }

      paint(time);
      frame = window.requestAnimationFrame(tick);
    }

    function handlePointer(event: PointerEvent) {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    resize();

    if (!reduceMotion) {
      frame = window.requestAnimationFrame(tick);
      window.addEventListener("pointermove", handlePointer, { passive: true });
    }

    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="stars-canvas" aria-hidden="true" />;
}
