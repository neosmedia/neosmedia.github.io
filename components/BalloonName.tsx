"use client";

import { useEffect, useRef } from "react";
import {
  buildWorld,
  hitTest,
  setGrowth,
  stepWorld,
  type Letter,
  type World,
} from "@/lib/softbody";

type Props = {
  /**
   * "fullscreen": fixed behind the page (coming soon).
   * "hero": sits in the page flow and keeps normal touch scrolling.
   */
  mode?: "fullscreen" | "hero";
  /** Push the letters aside to open a clearing in the middle (fullscreen only). */
  clearing?: boolean;
};

// A slow "inflating" effect: letters swell by GROW_BY over GROW_MS, then hold.
const GROW_BY = 0.1; // +10%
const GROW_MS = 60_000; // over one minute

// Overall lettering size: 1 = fills the screen as laid out, 0.9 = 10% smaller.
const HERO_SCALE = 0.9;

const easeOutBack = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Light mode: black letters, white border. Dark mode: inverted.
const FILL = { light: "#0a0a0a", dark: "#ffffff" };
const BORDER = { light: "#ffffff", dark: "#000000" };
const BORDER_PX = 1;

/** Trace one letter as a smooth, variable-width tube; `grow` fattens it (for the border). */
function trace(ctx: CanvasRenderingContext2D, L: Letter, sc: number, step: number, grow: number) {
  let cx = 0;
  let cy = 0;
  for (const p of L.particles) {
    cx += p.x;
    cy += p.y;
  }
  cx /= L.particles.length;
  cy /= L.particles.length;

  const X = (p: { x: number }) => cx + (p.x - cx) * sc;
  const Y = (p: { y: number }) => cy + (p.y - cy) * sc;

  for (const chain of L.chains) {
    const pts = chain.map((i) => L.particles[i]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const x0 = X(p0), y0 = Y(p0), x1 = X(p1), y1 = Y(p1);
      const x2 = X(p2), y2 = Y(p2), x3 = X(p3), y3 = Y(p3);
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let k = i === 0 ? 0 : 1; k <= n; k++) {
        const u = k / n;
        const u2 = u * u;
        const u3 = u2 * u;
        // Catmull-Rom
        const x = 0.5 * (2 * x1 + (-x0 + x2) * u + (2 * x0 - 5 * x1 + 4 * x2 - x3) * u2 + (-x0 + 3 * x1 - 3 * x2 + x3) * u3);
        const y = 0.5 * (2 * y1 + (-y0 + y2) * u + (2 * y0 - 5 * y1 + 4 * y2 - y3) * u2 + (-y0 + 3 * y1 - 3 * y2 + y3) * u3);
        const r = (p1.r + (p2.r - p1.r) * u) * sc + grow;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
  }
}

/** Draw every letter: a white halo first, then the black body, so each letter has its own border. */
function draw(ctx: CanvasRenderingContext2D, world: World, now: number, dark: boolean) {
  const mode = dark ? "dark" : "light";
  const step = Math.max(2, world.baseR * 0.11);

  for (const L of world.letters) {
    // staggered pop-in, scaled about the letter's centroid
    const t = Math.min(1, Math.max(0, (now - 150 - L.index * 70) / 800));
    if (t <= 0) continue;
    const sc = easeOutBack(t);

    ctx.beginPath();
    trace(ctx, L, sc, step, BORDER_PX * Math.min(1, sc));
    ctx.fillStyle = BORDER[mode];
    ctx.fill();

    ctx.beginPath();
    trace(ctx, L, sc, step, 0);
    ctx.fillStyle = FILL[mode];
    ctx.fill();
  }
}

export default function BalloonName({ mode = "fullscreen", clearing = false }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearingRef = useRef(clearing);
  clearingRef.current = clearing;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hero = mode === "hero";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let world: World;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let start = last;
    const growStart = last;
    let visible = true;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      // lay out smaller by HERO_SCALE, with room to inflate by GROW_BY
      const headroom = (1 + GROW_BY) / HERO_SCALE;
      world = buildWorld(
        W,
        H,
        hero
          ? { top: 0, bottom: 0, margin: Math.max(12, Math.min(W, H) * 0.03), headroom }
          : { top: 64, bottom: 72, headroom }
      );
      world.calm = reduceMotion;
    };
    setup();

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (visible) {
        world.clearTarget = clearingRef.current ? 1 : 0;
        if (!reduceMotion) {
          const gt = Math.min(1, (now - growStart) / GROW_MS);
          setGrowth(world, 1 + GROW_BY * gt);
        }
        stepWorld(world, dt);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, world.W, world.H);
        draw(ctx, world, now - start, document.documentElement.dataset.theme === "dark");
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Don't burn CPU while the hero is scrolled out of view.
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
          })
        : null;
    io?.observe(stage);

    /* ----- pointer: drag a tube by any point ----- */
    const local = (e: PointerEvent) => {
      const b = stage.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };

    const onDown = (e: PointerEvent) => {
      const p = local(e);
      world.pointer = p;
      const hit = hitTest(world, p.x, p.y);
      if (!hit) return;
      world.grab = hit;
      world.hoverLetter = -1;
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = "grabbing";
      if (!hero) e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      world.pointer = p;
      if (!world.grab && e.pointerType === "mouse") {
        const hit = hitTest(world, p.x, p.y);
        world.hoverLetter = hit ? hit.letter : -1;
        stage.style.cursor = hit ? "grab" : "default";
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!world.grab) return;
      world.grab = null;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      stage.style.cursor = "default";
    };
    // Touching a letter drags it; touching anywhere else scrolls the page.
    const onTouchStart = (e: TouchEvent) => {
      if (world.grab) e.preventDefault();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    const onLeave = () => {
      world.hoverLetter = -1;
    };
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("touchstart", onTouchStart, { passive: false });

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setup();
        start = performance.now() - 2000; // skip intro on resize
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io?.disconnect();
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("touchstart", onTouchStart);
    };
  }, [mode]);

  return (
    <div
      ref={stageRef}
      className={`stage ${mode === "hero" ? "stage-hero" : "stage-full"}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
