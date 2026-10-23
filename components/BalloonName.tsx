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

import { useEffect, useRef, type RefObject } from "react";
import {
  beginGrab,
  createBalloon,
  drawBalloon,
  endGrab,
  hitBalloon,
  moveGrab,
  stepBalloon,
  type Balloon,
} from "@/lib/balloon";
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
  /** Spell "404" instead of the name (404 page). Uses the same balloon letters, physics and shader. */
  word?: "404";
  /** Hero only: add the little drifting info balloon (tied to a string you can pull). */
  balloon?: boolean;
  /** Hero only: the info panel. While `clearing` is on, the letters open a hole sized to it. */
  infoRef?: RefObject<HTMLElement | null>;
  /** Called when the balloon is clicked or tapped (a press that did not drag). */
  onBalloonClick?: () => void;
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

/* ----- press and hold a letter for POP_MS and it pops like a balloon ----- */
const POP_MS = 3000; // how long to hold
const POP_SWELL = 0.16; // how much the letter inflates by the time it pops
const REGROW_MS = 2800; // it comes back (growing in again) this long after popping

type Burst = { x: number; y: number; vx: number; vy: number; r: number; born: number; life: number };
type Ring = { x: number; y: number; r0: number; r1: number; born: number; life: number };
type Fx = {
  swell: number[]; // per letter size multiplier while being held
  shake: [number, number][]; // per letter tremble offset (px)
  born: (number | null)[]; // draw-time at which a regrown letter starts popping in again
  regrowAt: (number | null)[]; // real time at which a popped letter comes back
  bursts: Burst[];
  rings: Ring[];
};
const newFx = (n: number): Fx => ({
  swell: Array(n).fill(1),
  shake: Array.from({ length: n }, () => [0, 0] as [number, number]),
  born: Array(n).fill(null),
  regrowAt: Array(n).fill(null),
  bursts: [],
  rings: [],
});

/** The burst when a letter pops: ink droplets flying out and a quick expanding ring. */
function drawBursts(ctx: CanvasRenderingContext2D, fx: Fx, nowMs: number, dark: boolean, maskOnly = false) {
  const ink = maskOnly ? "#000" : dark ? FILL.dark : FILL.light; // the rainbow shader stencil is plain black
  if (!maskOnly) {
    // (the plain pass runs first and clears out the finished ones)
    fx.rings = fx.rings.filter((r) => nowMs - r.born < r.life);
    fx.bursts = fx.bursts.filter((b) => nowMs - b.born < b.life);
  }
  ctx.save();
  for (const r of fx.rings) {
    const u = (nowMs - r.born) / r.life;
    ctx.globalAlpha = 0.55 * (1 - u);
    ctx.lineWidth = 3 * (1 - u) + 0.5;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * (1 - (1 - u) ** 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = ink;
  for (const b of fx.bursts) {
    const t = (nowMs - b.born) / 1000;
    const u = (nowMs - b.born) / b.life;
    ctx.globalAlpha = 1 - u * u;
    ctx.beginPath();
    ctx.arc(b.x + b.vx * t, b.y + b.vy * t + 700 * t * t, b.r * (1 - 0.6 * u), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draw every letter: a white halo first, then the black body, so each letter has its own border. */
function draw(
  ctx: CanvasRenderingContext2D,
  world: World,
  now: number,
  dark: boolean,
  borderPx = BORDER_PX,
  maskOnly = false, // body shapes only, opaque black: the stencil for the rainbow shader
  fx?: Fx
) {
  const mode = dark ? "dark" : "light";
  const step = Math.max(2, world.baseR * 0.11);

  for (const L of world.letters) {
    if (L.gone) continue; // popped, waiting to grow back
    // staggered pop-in, scaled about the letter's centroid (a regrown letter pops in again on its own)
    const bornAt = fx?.born[L.index];
    const t =
      bornAt != null
        ? Math.min(1, Math.max(0, (now - bornAt) / 800))
        : Math.min(1, Math.max(0, (now - 150 - L.index * 70) / 800));
    if (t <= 0) continue;
    const sc = easeOutBack(t) * (fx?.swell[L.index] ?? 1);
    const [sx, sy] = fx?.shake[L.index] ?? [0, 0];
    ctx.save();
    if (sx || sy) ctx.translate(sx, sy);

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
    ctx.restore();
  }
}

export default function BalloonName({
  mode = "fullscreen",
  clearing = false,
  onGrab,
  word,
  balloon: withBalloon = false,
  infoRef,
  onBalloonClick,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balloonCanvasRef = useRef<HTMLCanvasElement>(null);
  const onBalloonClickRef = useRef(onBalloonClick);
  onBalloonClickRef.current = onBalloonClick;
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
    const bcanvas = hero && withBalloon ? balloonCanvasRef.current : null;
    const bctx = bcanvas ? bcanvas.getContext("2d") : null;
    let bal: Balloon | null = null;
    let balKeep = -1; // index of the balloon's circle in world.keepOut
    let balKind: "body" | "string" = "body";
    let balBorn = performance.now();
    let balGone = false; // popped by the X: it does not come back
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
          // above the balloon layer too, so the balloon gets the shader like the letters
          rb.canvas.style.zIndex = "4";
          rb.canvas.style.pointerEvents = "none";
        }
      }
      return rb;
    };
    const maskCanvas = document.createElement("canvas"); // stencil of the letter bodies
    const mctx = maskCanvas.getContext("2d");

    let world!: World;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let start = last;
    const growStart = last;
    let visible = true;

    let builtW = 0; // stage size the current world was built for
    let builtH = 0;
    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      builtW = W;
      builtH = H;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      (rb as Rainbow | null)?.resize(W, H, Math.min(dpr, 1.5));
      // lay out smaller by HERO_SCALE, with room to inflate by GROW_BY
      const headroom = (1 + GROW_BY) / HERO_SCALE;
      world = buildWorld(
        W,
        H,
        hero
          ? { top: 0, bottom: 0, margin: EDGE_PX, headroom, ...(word ? { letters: word.split("") } : {}) }
          : { top: 64, bottom: 72, margin: EDGE_PX, headroom }
      );
      world.calm = reduceMotion;
      // keep the letters clear of the whole nav: photo, links and icon buttons.
      // Each element becomes a row of keep-out circles (wide links need several).
      if (!hero) {
        const b = stage.getBoundingClientRect();
        document.querySelectorAll(".nav .nav-avatar, .nav-links a, .nav-actions > *").forEach((el) => {
          const a = el.getBoundingClientRect();
          if (!a.width || !a.height) return; // hidden on this screen size
          const r = a.height / 2 + 10;
          const cy = a.top + a.height / 2 - b.top;
          const first = a.left + a.height / 2;
          const last = a.right - a.height / 2;
          const n = Math.max(1, Math.ceil((last - first) / r));
          for (let i = 0; i <= n; i++) {
            const x = n === 0 || last <= first ? a.left + a.width / 2 : first + ((last - first) * i) / n;
            world.keepOut.push({ cx: x - b.left, cy, r });
          }
        });
      }
      // the info balloon: a fresh one for each layout; letters keep out of it
      if (bcanvas && bctx && !balGone) {
        bcanvas.width = Math.round(W * dpr);
        bcanvas.height = Math.round(H * dpr);
        bal = createBalloon(W, H);
        balBorn = performance.now();
        world.keepOut.push({ cx: bal.cx, cy: bal.cy, r: bal.r * 1.1 });
        balKeep = world.keepOut.length - 1;
      }
    };
    setup();


    // press-and-hold pop state (see POP_MS)
    const fx = newFx(world.letters.length);
    const hold = { idx: -1, t0: 0, pointerId: -1 };

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

    /** Size of the balloon while it inflates: 0 -> 1 with a little overshoot, quickly. */
    const inflate = (now: number) => {
      if (reduceMotion) return now - balBorn > 900 ? 1 : 0;
      const t = Math.min(1, Math.max(0, (now - balBorn - 900) / 550));
      return t <= 0 ? 0 : easeOutBack(t);
    };

    /** Draw the letters, then (once it has faded in) the rainbow on top of them. */
    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, world.W, world.H);
      draw(ctx, world, now - start, isDark(), BORDER_PX, false, fx);
      drawBursts(ctx, fx, now, isDark());
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
      draw(mctx, world, now - start, isDark(), 0, true, fx);
      drawBursts(mctx, fx, now, isDark(), true); // the popping droplets get the rainbow too
      if (bal) {
        const g = inflate(now);
        if (g > 0) drawBalloon(mctx, bal, "#000", "#000", clearingRef.current ? "close" : "info", true, g);
      }
      shader.render(maskCanvas, mixAmt, since / 1000, 1.5, Math.max(8, world.baseR * 1.1));
    };

    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (visible) {
        world.clearTarget = clearingRef.current ? 1 : 0;
        // size the hole to the info panel while it is open (kept as-is while it closes)
        const panel = infoRef?.current;
        if (hero && panel && clearingRef.current) {
          world.clear = {
            cx: world.W / 2,
            cy: world.H / 2,
            // a big open middle: the letters get pushed out to the edges, around the text
            rx: Math.max((panel.offsetWidth / 2) * 1.12 + 10, world.W * (world.W < 700 ? 0.3 : 0.19)),
            ry: Math.max((panel.offsetHeight / 2) * 1.12 + 10, world.H * 0.22),
          };
        }
        // the balloon drifts, then is drawn on its own canvas above the letters
        if (bal && bctx && bcanvas) {
          stepBalloon(bal, dt, {
            calm: reduceMotion,
            clear: clearingRef.current || world.clearT > 0.05 ? world.clear : null,
          });
          if (balKeep >= 0 && world.keepOut[balKeep]) {
            world.keepOut[balKeep].cx = bal.cx;
            world.keepOut[balKeep].cy = bal.cy;
          }
          bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          bctx.clearRect(0, 0, world.W, world.H);
          const g = inflate(now); // fills with air shortly after the letters pop in
          if (g > 0) {
            const dk = isDark();
            drawBalloon(bctx, bal, dk ? FILL.dark : FILL.light, dk ? BORDER.dark : BORDER.light, clearingRef.current ? "close" : "info", false, g);
          }
        } else if (bctx && bcanvas && balKeep >= 0 && world.keepOut[balKeep]) {
          if (world.keepOut[balKeep].cx > -1000) bctx.clearRect(0, 0, world.W, world.H);
          world.keepOut[balKeep].cx = -9999; // nothing to keep out of while it is popped
        }
        if (!world.grab || world.clearT > 0.001) {
          const gt = reduceMotion ? 0 : Math.min(1, (now - growStart) / GROW_MS);
          // letters shrink as the Info clearing opens, so they tuck neatly around it
          // (hero: no shrinking, the letters just squish out to the edges)
          const shrink = hero ? 0 : world.W < 700 ? CLEAR_SHRINK_MOBILE : CLEAR_SHRINK;
          setGrowth(world, (1 + GROW_BY * gt) * (1 - shrink * world.clearT));
        }
        // ----- press and hold: swell + tremble, then pop -----
        {
          const held = world.grab ? world.grab.letter : -1;
          if (held >= 0 && hold.idx === held) {
            const p = Math.min(1, (now - hold.t0) / POP_MS);
            fx.swell[held] = 1 + POP_SWELL * p * p;
            const amp = p > 0.5 ? ((p - 0.5) / 0.5) ** 2 * world.baseR * 0.14 : 0;
            fx.shake[held] = [(Math.random() - 0.5) * 2 * amp, (Math.random() - 0.5) * 2 * amp];
            world.dirty = true;
            if (p >= 1) popLetter(held, now);
          }
          // letters that are not being held relax back to normal size
          for (let i = 0; i < fx.swell.length; i++) {
            if (i === held && hold.idx === held) continue;
            if (fx.swell[i] !== 1 || fx.shake[i][0] || fx.shake[i][1]) {
              fx.swell[i] += (1 - fx.swell[i]) * 0.25;
              fx.shake[i] = [0, 0];
              if (Math.abs(fx.swell[i] - 1) < 0.002) fx.swell[i] = 1;
              world.dirty = true;
            }
            // popped letters grow back after a few seconds
            const at = fx.regrowAt[i];
            if (at != null && now >= at) {
              const L = world.letters[i];
              for (const q of L.particles) {
                q.x = q.hx;
                q.y = q.hy;
                q.px = q.hx;
                q.py = q.hy;
              }
              L.gone = false;
              fx.regrowAt[i] = null;
              fx.born[i] = now - start;
              world.dirty = true;
            }
          }
          if (fx.bursts.length || fx.rings.length || fx.born.some((b) => b != null && now - start - b < 900)) world.dirty = true;
        }
        stepWorld(world, dt);
        // turn the shader up slowly while a letter is held; fade back when let go
        const dtc = Math.min(dt, 0.05);
        const popping = fx.bursts.length > 0 || fx.rings.length > 0; // keep the shader on while the pop plays out
        shaderMix = world.grab || bal?.grab || popping
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

    /** Pop a letter: it vanishes in a burst of ink droplets and a ring, then grows back later. */
    const popLetter = (idx: number, now: number) => {
      const L = world.letters[idx];
      let cx = 0;
      let cy = 0;
      for (const q of L.particles) {
        cx += q.x;
        cy += q.y;
      }
      cx /= L.particles.length;
      cy /= L.particles.length;
      if (!reduceMotion) {
        let reach = 0;
        for (const q of L.particles) reach = Math.max(reach, Math.hypot(q.x - cx, q.y - cy));
        fx.rings.push({ x: cx, y: cy, r0: reach * 0.6, r1: reach * 1.6 + world.baseR, born: now, life: 520 });
        for (let i = 0; i < 34; i++) {
          const q = L.particles[Math.floor(Math.random() * L.particles.length)];
          const ang = Math.atan2(q.y - cy, q.x - cx) + (Math.random() - 0.5) * 1.1;
          const sp = 160 + Math.random() * 420;
          fx.bursts.push({
            x: q.x,
            y: q.y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp - 120,
            r: world.baseR * (0.14 + Math.random() * 0.32),
            born: now,
            life: 650 + Math.random() * 450,
          });
        }
      }
      L.gone = true;
      fx.swell[idx] = 1;
      fx.shake[idx] = [0, 0];
      fx.born[idx] = null;
      fx.regrowAt[idx] = now + REGROW_MS;
      world.grab = null;
      hold.idx = -1;
      stage.style.cursor = "default";
      if (hold.pointerId >= 0 && stage.hasPointerCapture(hold.pointerId)) stage.releasePointerCapture(hold.pointerId);
      try {
        navigator.vibrate?.(18);
      } catch {
        /* not supported */
      }
      world.dirty = true;
      forcePaint = true;
    };

    /** Pop the info balloon: droplets + a ring, like a letter; it does not come back. */
    const popBalloon = (now: number) => {
      if (!bal) return;
      const { cx, cy, r, ry } = bal;
      if (!reduceMotion) {
        fx.rings.push({ x: cx, y: cy, r0: r * 0.7, r1: r * 2.6, born: now, life: 520 });
        for (let i = 0; i < 26; i++) {
          const ang = Math.random() * Math.PI * 2;
          const d = Math.random();
          const sp = 110 + Math.random() * 300;
          fx.bursts.push({
            x: cx + Math.cos(ang) * r * 0.8 * d,
            y: cy + Math.sin(ang) * ry * 0.8 * d,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp - 90,
            r: r * (0.12 + Math.random() * 0.22),
            born: now,
            life: 600 + Math.random() * 400,
          });
        }
      }
      bal = null;
      balGone = true;
      stage.style.cursor = "default";
      try {
        navigator.vibrate?.(18);
      } catch {
        /* not supported */
      }
      world.dirty = true;
      forcePaint = true;
    };

    /* ----- pointer: drag a tube by any point ----- */
    const local = (e: PointerEvent) => {
      const b = stage.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };

    const onDown = (e: PointerEvent) => {
      const p = local(e);
      world.pointer = p;
      // the balloon (and its string) sit above the letters
      if (bal && !world.grab) {
        const bh = hitBalloon(bal, p.x, p.y, e.pointerType !== "mouse");
        if (bh) {
          beginGrab(bal, bh, p.x, p.y, e.pointerId, performance.now());
          balKind = bh.kind;
          world.hoverLetter = -1;
          stage.setPointerCapture(e.pointerId);
          stage.style.cursor = CURSOR_GRABBING;
          return;
        }
      }
      const hit = hitTest(world, p.x, p.y);
      if (!hit) return;
      world.grab = hit;
      hold.idx = hit.letter; // start the press-and-hold timer
      hold.t0 = performance.now();
      hold.pointerId = e.pointerId;
      onGrabRef.current?.();
      world.hoverLetter = -1;
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = CURSOR_GRABBING;
      if (!hero) e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      world.pointer = p;
      if (bal?.grab) {
        moveGrab(bal, p.x, p.y);
        return;
      }
      if (!world.grab && e.pointerType === "mouse") {
        const bh = bal ? hitBalloon(bal, p.x, p.y) : null;
        if (bh) {
          world.hoverLetter = -1;
          stage.style.cursor = bh.kind === "body" ? "pointer" : CURSOR_GRAB;
          return;
        }
        const hit = hitTest(world, p.x, p.y);
        world.hoverLetter = hit ? hit.letter : -1;
        stage.style.cursor = hit ? CURSOR_GRAB : "default";
      }
    };
    const onUp = (e: PointerEvent) => {
      if (bal?.grab) {
        const clicked = endGrab(bal, performance.now()) && e.type === "pointerup" && balKind === "body";
        if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
        stage.style.cursor = "default";
        if (clicked) {
          const wasOpen = clearingRef.current;
          onBalloonClickRef.current?.();
          if (wasOpen) popBalloon(performance.now()); // closing with the X pops it
        }
        return;
      }
      if (!world.grab) return;
      world.grab = null;
      hold.idx = -1;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      stage.style.cursor = "default";
    };
    // Touching a letter drags it; touching anywhere else scrolls the page.
    const onTouchStart = (e: TouchEvent) => {
      if (world.grab || bal?.grab) e.preventDefault();
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
        // Phones fire "resize" while scrolling (the address bar slides away). The stage itself is the
        // same size, so rebuilding would only reset the letters: skip it.
        if (stage.clientWidth === builtW && stage.clientHeight === builtH) return;
        setup();
        // keep the pop effects consistent with the new world: letters that are still popped stay hidden,
        // and old "grow back" start times (measured from the old clock) must not hide letters
        for (let i = 0; i < fx.born.length; i++) {
          fx.born[i] = null;
          if (fx.regrowAt[i] != null && world.letters[i]) world.letters[i].gone = true;
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, word, withBalloon]);

  return (
    <div
      ref={stageRef}
      className={`stage ${mode === "hero" ? "stage-hero" : "stage-full"}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
      {mode === "hero" && withBalloon && <canvas ref={balloonCanvasRef} className="balloon-layer" />}
    </div>
  );
}
