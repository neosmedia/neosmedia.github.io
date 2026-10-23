/**
 * The little info balloon that drifts around the hero.
 *
 * A solid ink balloon with an "i" on it, tied to a string. Everything is plain 2D maths (no DOM):
 *   - the balloon body drifts very slowly towards random spots (see SPEED, PICK_*),
 *   - the string is a verlet chain hanging from the knot (point 0),
 *   - grabbing the string pins that point to the pointer; once the string is pulled taut the balloon
 *     is dragged along behind it (a yank), and it keeps a little momentum when let go,
 *   - grabbing the balloon itself drags it directly; a press that barely moves is a click.
 * BalloonName.tsx owns the canvas, pointer events and the click callback.
 */

export type BPt = { x: number; y: number; px: number; py: number };

export type BalloonGrab = {
  idx: number; // string point being held (0 = the balloon itself)
  ox: number; // pointer offset from that point when grabbed
  oy: number;
  sx: number; // where the press started
  sy: number;
  t0: number; // when it started (ms)
  moved: boolean; // true once it travelled far enough that it is not a click
  pointerId: number;
};

export type Balloon = {
  W: number;
  H: number;
  r: number; // half width of the body
  ry: number; // half height of the body
  knot: number; // length of the tied knot below the body
  len: number; // string length
  seg: number; // rest length of one string segment
  pts: BPt[]; // 0 = the knot, the rest hang from it
  ux: number; // smoothed "up" direction of the body (points away from the string)
  uy: number;
  cx: number; // body centre
  cy: number;
  target: { x: number; y: number }; // where it is slowly drifting to (the knot)
  nextPick: number;
  time: number;
  phase: number;
  pointer: { x: number; y: number };
  grab: BalloonGrab | null;
};

/* ---------- tunables ---------- */
const N = 12; // string segments
const SPEED = 15; // drift speed, px per second (very slow)
const PICK_MIN = 6; // seconds before it picks a new place to drift to...
const PICK_MAX = 13; // ...between these two
const GRAVITY = 300; // string weight, px/s^2
const DAMP_BODY = 0.992; // per substep velocity kept
const DAMP_STRING = 0.994;
const PULL = 0.14; // how hard a taut string drags the balloon
const CLICK_PX = 7; // a press that moves less than this is a click, not a drag

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function createBalloon(W: number, H: number): Balloon {
  const r = clamp(W * 0.04, 28, 50);
  const ry = r * 1.22;
  const knot = r * 0.24;
  const len = r * 3.6;
  const b: Balloon = {
    W,
    H,
    r,
    ry,
    knot,
    len,
    seg: len / N,
    pts: [],
    ux: 0,
    uy: -1,
    cx: 0,
    cy: 0,
    target: { x: W / 2, y: H / 2 },
    nextPick: 2,
    time: 0,
    phase: Math.random() * 6.28,
    pointer: { x: 0, y: 0 },
    grab: null,
  };
  const x = W * (0.2 + Math.random() * 0.6);
  const cy = clamp(H * (0.25 + Math.random() * 0.2), ry + 24, Math.max(ry + 24, H - len - ry));
  const y0 = cy + ry + knot;
  for (let i = 0; i <= N; i++) b.pts.push({ x, y: y0 + i * b.seg, px: x, py: y0 + i * b.seg });
  b.target = { x, y: y0 };
  updateBody(b, 1);
  return b;
}

/** Re-derive the body centre and its (smoothed) up direction from the string. */
function updateBody(b: Balloon, ease: number) {
  const p0 = b.pts[0];
  const p1 = b.pts[1];
  let rx = p0.x - p1.x;
  let ry = p0.y - p1.y;
  const m = Math.hypot(rx, ry);
  if (m > 1e-3) {
    rx /= m;
    ry /= m;
    b.ux += (rx - b.ux) * ease;
    b.uy += (ry - b.uy) * ease;
    const n = Math.hypot(b.ux, b.uy) || 1;
    b.ux /= n;
    b.uy /= n;
  }
  b.cx = p0.x + b.ux * (b.ry + b.knot);
  b.cy = p0.y + b.uy * (b.ry + b.knot);
}

function pickTarget(b: Balloon, clear: Clear | null) {
  for (let tries = 0; tries < 8; tries++) {
    const x = b.r + 24 + Math.random() * Math.max(1, b.W - 2 * (b.r + 24));
    const cyMax = Math.max(b.ry + 24, b.H - b.len - b.ry * 0.4);
    const cy = b.ry + 24 + Math.random() * Math.max(1, cyMax - (b.ry + 24));
    if (clear) {
      // while the info panel is open, stay out of its hole
      const q = ((x - clear.cx) / (clear.rx + b.r)) ** 2 + ((cy - clear.cy) / (clear.ry + b.ry)) ** 2;
      if (q < 1) continue;
    }
    b.target = { x, y: cy + b.ry + b.knot };
    return;
  }
}

export type Clear = { cx: number; cy: number; rx: number; ry: number };

/** Advance the balloon and its string. `calm` = reduced motion: no drifting, but it can still be pulled. */
export function stepBalloon(b: Balloon, dtSeconds: number, opts: { calm: boolean; clear: Clear | null }) {
  const dt = Math.min(dtSeconds, 1 / 30);
  const SUB = 2;
  const h = dt / SUB;
  const { pts, seg } = b;
  const g = b.grab;

  for (let s = 0; s < SUB; s++) {
    b.time += h;
    const p0 = pts[0];

    // ---- balloon body (point 0) ----
    if (!opts.calm && !g && b.time >= b.nextPick) {
      pickTarget(b, opts.clear);
      b.nextPick = b.time + PICK_MIN + Math.random() * (PICK_MAX - PICK_MIN);
    }
    let ax = 0;
    let ay = 0;
    if (!opts.calm && !g) {
      // steer towards the target at a slow, easing speed
      const dx = b.target.x - p0.x;
      const dy = b.target.y - p0.y;
      const d = Math.hypot(dx, dy);
      const sp = Math.min(SPEED, d * 0.4);
      const wx = d > 1 ? (dx / d) * sp : 0;
      const wy = d > 1 ? (dy / d) * sp : 0;
      ax = (wx - (p0.x - p0.px) / h) * 1.4;
      ay = (wy - (p0.y - p0.py) / h) * 1.4;
      // a little bob so it feels like it is floating
      ay += Math.sin(b.time * 0.9 + b.phase) * 5;
      ax += Math.cos(b.time * 0.7 + b.phase) * 3;
    }
    {
      const vx = (p0.x - p0.px) * DAMP_BODY;
      const vy = (p0.y - p0.py) * DAMP_BODY;
      p0.px = p0.x;
      p0.py = p0.y;
      p0.x += vx + ax * h * h;
      p0.y += vy + ay * h * h;
    }

    // ---- string points ----
    for (let i = 1; i <= N; i++) {
      const p = pts[i];
      const vx = (p.x - p.px) * DAMP_STRING;
      const vy = (p.y - p.py) * DAMP_STRING;
      p.px = p.x;
      p.py = p.y;
      const sway = Math.sin(b.time * 1.3 + i * 0.6 + b.phase) * 10 * (i / N);
      p.x += vx + sway * h * h;
      p.y += vy + GRAVITY * h * h;
    }

    // ---- being pulled: a taut string drags the balloon along ----
    if (g) {
      const tx = b.pointer.x - g.ox;
      const ty = b.pointer.y - g.oy;
      if (g.idx === 0) {
        // holding the balloon itself
        p0.x += (tx - p0.x) * 0.35;
        p0.y += (ty - p0.y) * 0.35;
      } else {
        const avail = g.idx * seg * 1.02;
        const dx = tx - p0.x;
        const dy = ty - p0.y;
        const d = Math.hypot(dx, dy);
        if (d > avail) {
          const k = ((d - avail) / d) * PULL;
          p0.x += dx * k;
          p0.y += dy * k;
        }
      }
    }

    // ---- keep the string a fixed length (point 0 never gets pushed by it) ----
    for (let it = 0; it < 6; it++) {
      for (let i = 0; i < N; i++) {
        const a = pts[i];
        const c = pts[i + 1];
        let dx = c.x - a.x;
        let dy = c.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-4;
        const diff = (d - seg) / d;
        dx *= diff;
        dy *= diff;
        if (i === 0) {
          c.x -= dx;
          c.y -= dy;
        } else {
          a.x += dx * 0.5;
          a.y += dy * 0.5;
          c.x -= dx * 0.5;
          c.y -= dy * 0.5;
        }
      }
      if (g && g.idx > 0) {
        const p = pts[g.idx];
        p.x = b.pointer.x - g.ox;
        p.y = b.pointer.y - g.oy;
      }
    }

    // ---- stay inside the hero; stay out of the open info panel ----
    p0.x = clamp(p0.x, b.r + 8, b.W - b.r - 8);
    p0.y = clamp(p0.y, 2 * b.ry + b.knot + 8, b.H - 8);
    if (opts.clear && !g) {
      const c = opts.clear;
      const ex = c.rx + b.r;
      const ey = c.ry + b.ry;
      let dx = b.cx - c.cx;
      let dy = b.cy - c.cy;
      const q = (dx / ex) ** 2 + (dy / ey) ** 2;
      if (q < 1) {
        if (q < 1e-6) {
          dx = 1;
          dy = 0;
        }
        const m = Math.hypot(dx, dy) || 1;
        const push = (1 - Math.sqrt(q)) * 3;
        p0.x += (dx / m) * push;
        p0.y += (dy / m) * push;
      }
    }
    for (let i = 1; i <= N; i++) {
      const p = pts[i];
      p.x = clamp(p.x, 4, b.W - 4);
      p.y = clamp(p.y, 4, b.H - 4);
    }
    updateBody(b, 0.05);
  }
}

/** What is under (x, y)? The balloon body first, otherwise the nearest bit of string. */
export function hitBalloon(b: Balloon, x: number, y: number, touch = false): { idx: number; ox: number; oy: number; kind: "body" | "string" } | null {
  const pad = touch ? 12 : 6;
  const dx = x - b.cx;
  const dy = y - b.cy;
  const along = dx * b.ux + dy * b.uy;
  const across = -dx * b.uy + dy * b.ux;
  if ((across / (b.r + pad)) ** 2 + (along / (b.ry + pad)) ** 2 <= 1) {
    return { idx: 0, ox: x - b.pts[0].x, oy: y - b.pts[0].y, kind: "body" };
  }
  const reach = touch ? 20 : 12;
  let best = -1;
  let bestD = reach;
  for (let i = 0; i < N; i++) {
    const a = b.pts[i];
    const c = b.pts[i + 1];
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const l2 = vx * vx + vy * vy || 1;
    const t = clamp(((x - a.x) * vx + (y - a.y) * vy) / l2, 0, 1);
    const d = Math.hypot(x - (a.x + vx * t), y - (a.y + vy * t));
    if (d < bestD) {
      bestD = d;
      best = t < 0.5 ? i : i + 1;
    }
  }
  if (best < 0) return null;
  if (best === 0) best = 1; // the knot belongs to the balloon, hold the first bit of string instead
  const p = b.pts[best];
  return { idx: best, ox: x - p.x, oy: y - p.y, kind: "string" };
}

export function beginGrab(b: Balloon, hit: { idx: number; ox: number; oy: number }, x: number, y: number, pointerId: number, nowMs: number) {
  b.pointer = { x, y };
  b.grab = { idx: hit.idx, ox: hit.ox, oy: hit.oy, sx: x, sy: y, t0: nowMs, moved: false, pointerId };
}

export function moveGrab(b: Balloon, x: number, y: number) {
  b.pointer = { x, y };
  const g = b.grab;
  if (g && !g.moved && Math.hypot(x - g.sx, y - g.sy) > CLICK_PX) g.moved = true;
}

/** Let go. Returns true if it was a click (a quick press that barely moved). */
export function endGrab(b: Balloon, nowMs: number): boolean {
  const g = b.grab;
  b.grab = null;
  if (!g) return false;
  return !g.moved && nowMs - g.t0 < 600;
}

/**
 * Draw the balloon and its string. `ink` is the balloon colour, `halo` the thin outline around it
 * (and the colour of the "i"), the same pairing the letters use. The caller sets the dpr transform.
 */
export function drawBalloon(ctx: CanvasRenderingContext2D, b: Balloon, ink: string, halo: string) {
  const { pts, r, ry, knot } = b;

  // string
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < N; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[N].x, pts[N].y);
  ctx.strokeStyle = halo;
  ctx.lineWidth = 4.5;
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();

  // body, in a frame where "up" is -y
  ctx.save();
  ctx.translate(b.cx, b.cy);
  ctx.rotate(Math.atan2(b.ux, -b.uy));

  const body = () => {
    ctx.beginPath();
    const steps = 56;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const wob = 1 + 0.02 * Math.sin(3 * th + b.phase);
      const x = r * Math.sin(th) * (1 + 0.07 * Math.cos(th)) * wob; // a touch fuller at the top
      const y = -ry * Math.cos(th) * (1 + 0.015 * Math.sin(2 * th + b.phase));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };
  const tie = () => {
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, ry * 0.96);
    ctx.lineTo(r * 0.14, ry * 0.96);
    ctx.lineTo(0, ry + knot);
    ctx.closePath();
  };

  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = halo;
  tie();
  ctx.stroke();
  body();
  ctx.stroke();
  ctx.fillStyle = ink;
  tie();
  ctx.fill();
  body();
  ctx.fill();

  // soft highlight
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -ry * 0.45, r * 0.15, r * 0.3, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // the "i"
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, -ry * 0.36, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  const sw = r * 0.2;
  const top = -ry * 0.14;
  const bot = ry * 0.4;
  ctx.beginPath();
  ctx.moveTo(-sw / 2 + sw * 0.25, top);
  ctx.arcTo(sw / 2, top, sw / 2, top + sw, sw * 0.4);
  ctx.lineTo(sw / 2, bot - sw * 0.4);
  ctx.arcTo(sw / 2, bot, -sw / 2, bot, sw * 0.4);
  ctx.arcTo(-sw / 2, bot, -sw / 2, top, sw * 0.4);
  ctx.arcTo(-sw / 2, top, sw / 2, top, sw * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
