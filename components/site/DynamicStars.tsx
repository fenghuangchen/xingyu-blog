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

type Dust = {
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  accent: boolean;
  teal: boolean;
};

type Meteor = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  trail: number;
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
    let dust: Dust[] = [];
    let meteors: Meteor[] = [];
    let nextMeteorAt = performance.now() + 700;
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

    function buildParticles() {
      const starCount = Math.min(
        190,
        Math.max(80, Math.round((width * height) / 11000)),
      );
      const dustCount = Math.min(
        40,
        Math.max(16, Math.round((width * height) / 65000)),
      );

      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: random(0.45, 1.7),
        baseAlpha: random(0.22, 0.78),
        phase: Math.random() * Math.PI * 2,
        speed: random(0.25, 0.9),
        driftX: random(-0.035, 0.035),
        driftY: random(-0.022, 0.022),
        accent: Math.random() < 0.1,
      }));

      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: random(1.4, 4.2),
        alpha: random(0.07, 0.2),
        phase: Math.random() * Math.PI * 2,
        speed: random(0.12, 0.4),
        driftX: random(-0.08, 0.08),
        driftY: random(-0.09, -0.03),
        accent: Math.random() < 0.35,
        teal: Math.random() < 0.35,
      }));
    }

    function spawnMeteor() {
      const fromLeft = Math.random() > 0.5;
      meteors.push({
        x: fromLeft ? random(0, width * 0.4) : random(width * 0.6, width),
        y: random(0, height * 0.35),
        dx: fromLeft ? random(6, 10) : random(-10, -6),
        dy: random(2.5, 4.8),
        life: 0,
        maxLife: random(60, 100),
        trail: random(18, 30),
      });
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

        if (star.r > 1.45) {
          ctx.globalAlpha = twinkle * 0.28;
          ctx.strokeStyle = star.accent ? accentColor : starColor;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(x - star.r * 5, y);
          ctx.lineTo(x + star.r * 5, y);
          ctx.moveTo(x, y - star.r * 5);
          ctx.lineTo(x, y + star.r * 5);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "lighter";

      const brightStars = stars.filter((star) => star.r > 1.15).slice(0, 34);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 0.55;
      for (let first = 0; first < brightStars.length; first += 1) {
        const a = brightStars[first];
        for (let second = first + 1; second < brightStars.length; second += 1) {
          const b = brightStars[second];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 130) {
            ctx.globalAlpha = 0.045 * (1 - distance / 130);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const particle of dust) {
        if (!still) {
          particle.x += particle.driftX;
          particle.y += particle.driftY;

          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;
          if (particle.y < -10) {
            particle.y = height + 10;
            particle.x = Math.random() * width;
          }
          if (particle.y > height + 10) particle.y = -10;
        }

        const pulse =
          0.7 + 0.3 * Math.sin(time * 0.0006 * particle.speed + particle.phase);
        const x = particle.x + pointerX * 12;
        const y = particle.y + pointerY * 8;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, particle.r * 4);
        glow.addColorStop(
          0,
          particle.accent
            ? accentColor
            : particle.teal
              ? "#7fe3d2"
              : starColor,
        );
        glow.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalAlpha = particle.alpha * pulse;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, particle.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!still) {
        if (meteors.length < 3 && time > nextMeteorAt) {
          spawnMeteor();
          nextMeteorAt = time + random(1800, 4200);
        }

        for (let index = meteors.length - 1; index >= 0; index -= 1) {
          const meteor = meteors[index];
          meteor.life += 1;
          meteor.x += meteor.dx;
          meteor.y += meteor.dy;

          const progress = meteor.life / meteor.maxLife;
          const tailX = meteor.x - meteor.dx * meteor.trail;
          const tailY = meteor.y - meteor.dy * meteor.trail;
          const gradient = ctx.createLinearGradient(
            tailX,
            tailY,
            meteor.x,
            meteor.y,
          );
          gradient.addColorStop(0, "rgba(255,255,255,0)");
          gradient.addColorStop(0.55, `${accentColor}66`);
          gradient.addColorStop(0.9, "rgba(255,255,255,0.85)");
          gradient.addColorStop(1, "rgba(255,255,255,0.98)");

          ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.95;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.9;
          ctx.shadowBlur = 16;
          ctx.shadowColor = accentColor;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(meteor.x, meteor.y);
          ctx.stroke();

          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y, 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (
            meteor.life >= meteor.maxLife ||
            meteor.y > height + 60 ||
            meteor.x < -80 ||
            meteor.x > width + 80
          ) {
            meteors.splice(index, 1);
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
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
      buildParticles();
      if (reduceMotion) paint(0, true);
    }

    function tick(time: number) {
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
