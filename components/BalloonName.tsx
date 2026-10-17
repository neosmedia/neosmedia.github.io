"use client";

/**
 * BalloonName: the interactive TYLER LANGE hero.
 *
 * Owns the <canvas>, pointer handling and the render loop; physics lives in lib/softbody.ts
 * and the colour shader in lib/rainbow.ts.
 *
 * Frame flow: stepWorld() -> (skip paint if the scene is at rest, see `needsPaint`)
 *   -> draw halo + body to the 2D canvas -> draw the body mask -> WebGL shader overlay.
 *
 * Tuning: GROW_*, SHADER_*, CLEAR_SHRINK*, EDGE_PX below; physics constants are in softbody.ts.
 * TODO: pause the loop entirely when the hero is scrolled off-screen (IntersectionObserver).
 * TODO: keyboard alternative for dragging (letters are pointer-only today).
 */

import { useEffect, useRef } from "react";
import {
  buildWorld,
  hitTest,
  setGrowth,
  stepWorld,
  type Letter,
  type World,
} from "@/lib/softbody";
import { createRainbow, type Rainbow } from "@/lib/rainbow";

type Props = {
  /**
   * "fullscreen": fixed behind the page (coming soon).
   * "hero": sits in the page flow and keeps normal touch scrolling.
   */
  mode?: "fullscreen" | "hero";
  /** Push the letters aside to open a clearing in the middle (fullscreen only). */
  clearing?: boolean;
  /** Called when a letter is first grabbed. */
  onGrab?: () => void;
};

// A slow "inflating" effect: letters swell by GROW_BY over GROW_MS, then hold.
const GROW_BY = 0.15; // +15%
const GROW_MS = 15_000; // over 15 seconds

// The shader (rainbow, or blue bubble) is driven by dragging: while a letter is held it
// slowly turns up, and when let go it fades back to the original black / white ink.
const SHADER_RISE_S = 3.5; // seconds of dragging to reach full strength
const SHADER_FALL_S = 2.5; // seconds to fade back after letting go

// How much the letters shrink while the Info clearing is open (0.3 = 30% smaller).
const CLEAR_SHRINK = 0.2;
const CLEAR_SHRINK_MOBILE = 0.32;

// Clear space kept around the letters (also after they have grown).
const EDGE_PX = 16;

// Big 4-way "move" cursors (28px) for hovering and dragging the letters.
const CURSOR_GRAB = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 56 56'%3E%3Cg transform='translate(28 28) scale(1.0) translate(-28 -28)'%3E%3Ccircle cx='28' cy='28' r='27' fill='rgba(255,255,255,0.35)'/%3E%3Cpath d='M28 14 V42 M14 28 H42' stroke='white' stroke-width='7' stroke-linecap='round' fill='none'/%3E%3Cpath d='M28 5 L20 15 H36 Z M28 51 L20 41 H36 Z M5 28 L15 20 V36 Z M51 28 L41 20 V36 Z' fill='white' stroke='white' stroke-width='5' stroke-linejoin='round'/%3E%3Cpath d='M28 14 V42 M14 28 H42' stroke='black' stroke-width='3' stroke-linecap='round' fill='none'/%3E%3Cpath d='M28 5 L20 15 H36 Z M28 51 L20 41 H36 Z M5 28 L15 20 V36 Z M51 28 L41 20 V36 Z' fill='black' stroke='black' stroke-width='1' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 14 14, move`;
const CURSOR_GRABBING = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 56 56'%3E%3Cg transform='translate(28 28) scale(0.78) translate(-28 -28)'%3E%3Ccircle cx='28' cy='28' r='27' fill='rgba(255,255,255,0.65)'/%3E%3Cpath d='M28 14 V42 M14 28 H42' stroke='white' stroke-width='7' stroke-linecap='round' fill='none'/%3E%3Cpath d='M28 5 L20 15 H36 Z M28 51 L20 41 H36 Z M5 28 L15 20 V36 Z M51 28 L41 20 V36 Z' fill='white' stroke='white' stroke-width='5' stroke-linejoin='round'/%3E%3Cpath d='M28 14 V42 M14 28 H42' stroke='black' stroke-width='3' stroke-linecap='round' fill='none'/%3E%3Cpath d='M28 5 L20 15 H36 Z M28 51 L20 41 H36 Z M5 28 L15 20 V36 Z M51 28 L41 20 V36 Z' fill='black' stroke='black' stroke-width='1' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E") 14 14, move`;

// Overall lettering size: 1 = fills the screen as laid out, 0.9 = 10% smaller.
const HERO_SCALE = 1.0;

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

  const P = L.particles;
  for (const chain of L.chains) {
    const last = chain.length - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P[chain[i > 0 ? i - 1 : 0]];
      const p1 = P[chain[i]];
      const p2 = P[chain[i + 1]];
      const p3 = P[chain[i + 2 <= last ? i + 2 : last]];
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
function draw(
  ctx: CanvasRenderingContext2D,
  world: World,
  now: number,
  dark: boolean,
  borderPx = BORDER_PX,
  maskOnly = false // body shapes only, opaque black: the stencil for the rainbow shader
) {
  const mode = dark ? "dark" : "light";
  const step = Math.max(2, world.baseR * 0.11);

  for (const L of world.letters) {
    // staggered pop-in, scaled about the letter's centroid
    const t = Math.min(1, Math.max(0, (now - 150 - L.index * 70) / 800));
    if (t <= 0) continue;
    const sc = easeOutBack(t);

    if (!maskOnly) {
      ctx.beginPath();
      trace(ctx, L, sc, step, borderPx * Math.min(1, sc));
      ctx.fillStyle = BORDER[mode];
      ctx.fill();
    }

    ctx.beginPath();
    trace(ctx, L, sc, step, 0);
    ctx.fillStyle = maskOnly ? "#000" : FILL[mode];
    ctx.fill();
  }
}

export default function BalloonName({ mode = "fullscreen", clearing = false, onGrab }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearingRef = useRef(clearing);
  clearingRef.current = clearing;
  const onGrabRef = useRef(onGrab);
  onGrabRef.current = onGrab;

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

    // Shader overlay (a transparent WebGL canvas on top of the letters). It is created
    // lazily, the first time someone drags a letter, so page load pays nothing for it.
    let rb: Rainbow | null = null;
    let rbTried = false;
    const ensureRainbow = () => {
      if (!rbTried) {
        rbTried = true;
        rb = createRainbow();
        if (rb) {
          stage.appendChild(rb.canvas);
          rb.resize(world.W, world.H, Math.min(dpr, 1.5));
        }
      }
      return rb;
    };
    const maskCanvas = document.createElement("canvas"); // stencil of the letter bodies
    const mctx = maskCanvas.getContext("2d");

    let world: World;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let start = last;
    const growStart = last;
    let visible = true;

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      (rb as Rainbow | null)?.resize(W, H, Math.min(dpr, 1.5));
      // lay out smaller by HERO_SCALE, with room to inflate by GROW_BY
      const headroom = (1 + GROW_BY) / HERO_SCALE;
      world = buildWorld(
        W,
        H,
        hero
          ? { top: 0, bottom: 0, margin: EDGE_PX, headroom }
          : { top: 64, bottom: 72, margin: EDGE_PX, headroom }
      );
      world.calm = reduceMotion;
      // keep the letters clear of the nav photo (top left)
      const av = document.querySelector(".nav .nav-avatar");
      if (!hero && av) {
        const a = av.getBoundingClientRect();
        const b = stage.getBoundingClientRect();
        world.keepOut.push({
          cx: a.left + a.width / 2 - b.left,
          cy: a.top + a.height / 2 - b.top,
          r: a.width / 2 + 10,
        });
      }
    };
    setup();

    let rainbowOn = false;
    let forcePaint = true; // paint at least once, and again after a resize
    let lastGrowth = -1;
    let lastDark: boolean | null = null;
    let shaderMix = 0; // 0 = plain ink, 1 = full shader (rises while dragging)
    const isDark = () => document.documentElement.dataset.theme === "dark";
    const smooth = (x: number) => {
      const t = Math.min(1, Math.max(0, x));
      return t * t * (3 - 2 * t);
    };

    /** Draw the letters, then (once it has faded in) the rainbow on top of them. */
    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, world.W, world.H);
      draw(ctx, world, now - start, isDark());
      if (!mctx) return;
      const since = now - growStart;
      const mixAmt = reduceMotion ? 0 : smooth(shaderMix);
      if (mixAmt <= 0.001) {
        if (rainbowOn) {
          (rb as Rainbow | null)?.clear();
          rainbowOn = false;
        }
        return;
      }
      const shader = ensureRainbow();
      if (!shader) return;
      rainbowOn = true;
      if (maskCanvas.width !== canvas.width || maskCanvas.height !== canvas.height) {
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
      }
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, world.W, world.H);
      draw(mctx, world, now - start, isDark(), 0, true);
      shader.render(maskCanvas, mixAmt, since / 1000, 1.5, Math.max(8, world.baseR * 1.1));
    };

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (visible) {
        world.clearTarget = clearingRef.current ? 1 : 0;
        if (!world.grab || world.clearT > 0.001) {
          const gt = reduceMotion ? 0 : Math.min(1, (now - growStart) / GROW_MS);
          // letters shrink as the Info clearing opens, so they tuck neatly around it
          const shrink = world.W < 700 ? CLEAR_SHRINK_MOBILE : CLEAR_SHRINK;
          setGrowth(world, (1 + GROW_BY * gt) * (1 - shrink * world.clearT));
        }
        stepWorld(world, dt);
        // turn the shader up slowly while a letter is held; fade back when let go
        const dtc = Math.min(dt, 0.05);
        shaderMix = world.grab
          ? Math.min(1, shaderMix + dtc / SHADER_RISE_S)
          : Math.max(0, shaderMix - dtc / SHADER_FALL_S);
        // Repaint only when something visibly changed. A resting scene costs no drawing.
        const dark = isDark();
        const needsPaint =
          forcePaint ||
          world.moved > 0.005 ||
          world.dirty ||
          world.grab !== null ||
          shaderMix > 0.001 ||
          rainbowOn ||
          world.growth !== lastGrowth ||
          dark !== lastDark ||
          now - start < 2600; // the pop-in animation
        if (needsPaint) {
          paint(now);
          forcePaint = false;
          lastGrowth = world.growth;
          lastDark = dark;
          world.dirty = false;
        }
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
      onGrabRef.current?.();
      world.hoverLetter = -1;
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = CURSOR_GRABBING;
      if (!hero) e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      world.pointer = p;
      if (!world.grab && e.pointerType === "mouse") {
        const hit = hitTest(world, p.x, p.y);
        world.hoverLetter = hit ? hit.letter : -1;
        stage.style.cursor = hit ? CURSOR_GRAB : "default";
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

    // Rebuild right away on every resize (once per frame) so the canvas never gets
    // stretched: the letters are re-laid-out at the new size with their true proportions.
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        setup();
        start = performance.now() - 2000; // skip intro on resize
        if (!reduceMotion) setGrowth(world, 1 + GROW_BY * Math.min(1, (performance.now() - growStart) / GROW_MS));
        // setting the canvas size clears it, so repaint straight away (no white flash)
        forcePaint = true;
        paint(performance.now());
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      (rb as Rainbow | null)?.destroy();
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
