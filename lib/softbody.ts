import { CAP, GLYPHS, LETTERS, STROKE } from "./glyphs";

/**
 * Soft "inner tube" letters.
 *
 * Each letter is a chain of particles (a tube centerline) with a variable
 * radius. Particles are held together by distance constraints and gently
 * pulled back to their rest shape (shape matching), so grabbing one point
 * makes the tube bend, trail and slither instead of moving as a rigid block.
 * Letters push each other apart through particle-vs-particle collisions.
 */

export type Particle = {
  x: number;
  y: number;
  px: number; // previous position (verlet)
  py: number;
  hx: number; // home position
  hy: number;
  r: number; // tube radius at this point
  qx: number; // rest offset from letter centroid
  qy: number;
  phase: number;
  letter: number;
};

type Constraint = { a: number; b: number; rest: number; k: number };

export type Letter = {
  index: number;
  particles: Particle[];
  chains: number[][]; // indices into particles, in drawing order
  constraints: Constraint[];
  homeCx: number;
  homeCy: number;
  phase: number;
  /** current hover nudge applied to the whole letter (px) */
  hov: { x: number; y: number };
  /** popped (press-and-hold): hidden, no collisions, can't be grabbed, until it grows back */
  gone: boolean;
  /** start time (world.time) of this letter's current random jiggle, or -1 */
  jigStart: number;
  /** drag stretch: current length factor along (sdx, sdy), 1 = relaxed */
  stretch: number;
  sdx: number;
  sdy: number;
  stretched: boolean; // constraints currently hold stretched rest lengths
  ang: number; // last fitted rotation of the letter
  sq: number[]; // scratch: stretched rest offsets (x, y pairs)
};

export type Grab = { letter: number; particle: number; ox: number; oy: number };

export type World = {
  W: number;
  H: number;
  baseR: number;
  letters: Letter[];
  all: Particle[];
  grab: Grab | null;
  pointer: { x: number; y: number };
  time: number;
  calm: boolean;
  /** The "Info" clearing: an ellipse in the middle the letters are pushed out of. */
  clear: Clearing;
  clearTarget: 0 | 1; // set to 1 to open, 0 to close
  clearT: number; // eased 0..1
  prevTarget: 0 | 1;
  boost: number; // seconds of faster return-home after closing
  /** Circles letters can't enter (e.g. the nav photo). Set by the renderer. */
  keepOut: { cx: number; cy: number; r: number }[];
  /** Slow "inflating" effect: everything scales about (growCx, growCy). */
  growth: number; // current scale, 1 = as laid out
  growCx: number;
  growCy: number;
  /** index of the letter under the (mouse) cursor, or -1 */
  hoverLetter: number;
  /** world.time at which the next random jiggle fires */
  nextJiggle: number;
  /** Biggest distance any point moved in the last step (px). ~0 means the scene is at rest. */
  moved: number;
  /** Set when something visible changed without particle velocity (e.g. hover nudge). */
  dirty: boolean;
};

export type Clearing = { cx: number; cy: number; rx: number; ry: number };

/** Size of the middle clearing for a given stage size (also used to size the text). */
export function clearingFor(W: number, H: number): Clearing {
  const narrow = W < 700;
  return {
    cx: W / 2,
    cy: H / 2,
    rx: narrow ? W * 0.36 : Math.min(W * 0.25, 380),
    ry: Math.min(Math.max(H * 0.24, 140), 240),
  };
}

/* ---------- tunables ---------- */

const WIDE_LINES = [5, 5]; // TYLER / LANGE
const TALL_LINES = [3, 3, 4]; // mobile: TYL / ERL / ANGE
const WIDE_LINE_SCALE = [1, 1];
const TALL_LINE_SCALE = [1.1, 1.1, 0.8]; // mobile: top two rows 10% larger, bottom row 20% smaller
const GAP = 4;
const LINE_GAP = 8;
// Deliberately uneven: each gap is randomly tighter or looser (the line width is kept),
// and each letter sits a little higher or lower than its neighbours.
const UNEVEN_GAP = [0.8, 1.4]; // multiplier range for each gap
const UNEVEN_Y = 3; // max vertical offset (glyph units)
// Letters never touch the screen edge: they keep this many px clear, even after growing.
const EDGE = 16;

const SIZE_MIN = 0.88; // each letter is randomly a touch smaller / bigger
const SIZE_MAX = 1.08;
const FIRST_SIZE = 1.14; // the opening T is always the biggest letter
const LAST_SIZE = 0.9; // the closing E is a touch smaller
// The first E (index 3) is a bit smaller and not as fat as the other letters.
const FIRST_E = { index: 3, size: 0.91, thickness: 0.87 };

// Dragging pulls a letter longer, along the direction of the pull.
const STRETCH_MAX = 0.55; // up to +55% longer
const STRETCH_REF = 10; // pull distance (in tube radii) that gives the full stretch
const STRETCH_EASE = 0.1; // how quickly it stretches out / springs back

const HOVER_FOLLOW = 0.06; // hovered letter drifts this fraction toward the cursor...
const HOVER_MAX = 0.18; // ...up to this many tube-radii
const HOVER_EASE = 0.12; // how quickly it follows / returns
const IDLE_SECONDS = 3; // the idle jiggle fades out and letters come to rest by now
// Every 5 or 10 seconds a few random letters jiggle for a moment.
const nextGap = () => (Math.random() < 0.5 ? 5 : 10);
const JIGGLE_SECONDS = 2.6; // each letter's jiggle swells in and eases out over this long
const JIGGLE_STAGGER = 0.7; // letters start up to this many seconds apart (a soft ripple)
const JIGGLE_STRENGTH = 0.42; // wobble amplitude of a random jiggle
const JIGGLE_KICK = 0; // optional little shove, in tube radii (0 = none, just a soft wobble)
const SHAPE_K = 0.03; // how hard letters try to keep their shape (lower = floppier)
const HOME_K = 0.0007; // soft spring back to place: lower = slower, floppier (0 = stay where dropped)
const DAMPING = 0.96; // air drag per substep (higher = more glide)
const SUBSTEPS = 2;
const ITER = 3;
const MAX_V = 46;

// Little resting tilt per letter (degrees): hand-set, not typeset.
const TILT = [-4, 3.5, -3, 4, -3.5, 3, -4.5, 3.5, -3, 4];

/* ---------- helpers ---------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polyLength(pts: [number, number][]) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return L;
}

/** Point + tangent at arclength `d` along a polyline. */
function along(pts: [number, number][], d: number) {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const len = Math.hypot(dx, dy);
    if (acc + len >= d || i === pts.length - 1) {
      const t = len > 0 ? Math.min(1, Math.max(0, (d - acc) / len)) : 0;
      return {
        x: pts[i - 1][0] + dx * t,
        y: pts[i - 1][1] + dy * t,
        tx: len > 0 ? dx / len : 1,
        ty: len > 0 ? dy / len : 0,
      };
    }
    acc += len;
  }
  const p = pts[pts.length - 1];
  return { x: p[0], y: p[1], tx: 1, ty: 0 };
}

/* ---------- build ---------- */

export type LayoutOpts = {
  /** px reserved above / below the lettering (nav, footer) */
  top?: number;
  bottom?: number;
  /** side + edge margin in px; defaults to 5% of the short side */
  margin?: number;
  /** Lay letters out this much smaller, leaving room to inflate (e.g. 1.1). */
  headroom?: number;
  /** Spell something else (e.g. "404" on the 404 page): glyph keys in reading order. Default: TYLER LANGE. */
  letters?: string[];
  /** Letters per line for `letters` (default: one line). */
  lines?: number[];
};

export function buildWorld(W: number, H: number, opts: LayoutOpts = {}): World {
  const reserveTop = opts.top ?? 0;
  const reserveBottom = opts.bottom ?? 0;
  const custom = !!opts.letters;
  const word = opts.letters ?? LETTERS;
  const tall = !custom && (W < 700 || H > W * 1.1);
  const counts = custom ? (opts.lines ?? [word.length]) : tall ? TALL_LINES : WIDE_LINES;

  let cursor = 0;
  const lines = counts.map((n) => {
    const line = word.slice(cursor, cursor + n);
    cursor += n;
    return line;
  });
  const lk = custom ? counts.map(() => 1) : tall ? TALL_LINE_SCALE : WIDE_LINE_SCALE; // per-line size
  const sumW = lines.map((l) => l.reduce((a, ch) => a + GLYPHS[ch].w, 0));
  const natural = lines.map((l, i) => (sumW[i] + GAP * (l.length - 1)) * lk[i]);
  const target = Math.max(...natural);
  const totalH =
    lk.reduce((a, k) => a + CAP * k, 0) + (lines.length - 1) * LINE_GAP;

  const margin = opts.margin ?? Math.max(16, Math.min(W, H) * 0.05);
  const availW = W - margin * 2;
  const availH = H - margin * 2 - reserveTop - reserveBottom;
  const s = Math.min(availW / target, availH / totalH) / (opts.headroom ?? 1); // px per glyph unit
  const top = margin + reserveTop + (availH - totalH * s) / 2;

  const baseR = (STROKE / 2) * s;
  const spacing = baseR * 0.55;

  const world: World = {
    W,
    H,
    baseR,
    letters: [],
    all: [],
    grab: null,
    pointer: { x: 0, y: 0 },
    time: 0,
    calm: false,
    clear: clearingFor(W, H),
    clearTarget: 0,
    keepOut: [],
    clearT: 0,
    prevTarget: 0,
    boost: 0,
    growth: 1,
    growCx: W / 2,
    growCy: top + (totalH * s) / 2,
    hoverLetter: -1,
    nextJiggle: IDLE_SECONDS + nextGap(),
    moved: 0,
    dirty: false,
  };

  let k = 0;
  lines.forEach((line, li) => {
    const lineSum = line.reduce((a, ch) => a + GLYPHS[ch].w, 0);
    const kk = lk[li];
    const sl = s * kk; // px per glyph unit on this line
    const gap =
      line.length > 1
        ? Math.min((target / kk - lineSum) / (line.length - 1), GAP * 2.2)
        : 0;
    const lineW = lineSum + gap * (line.length - 1);
    let ox = (W - lineW * sl) / 2;
    let above = 0;
    for (let j = 0; j < li; j++) above += CAP * lk[j] + LINE_GAP;
    const oy = top + above * s;

    const mults = line.map(
      (_, i) => UNEVEN_GAP[0] + rng(7000 + li * 31 + i * 13)() * (UNEVEN_GAP[1] - UNEVEN_GAP[0])
    );
    const msum = mults.slice(0, line.length - 1).reduce((a, b) => a + b, 0) || 1;
    const gaps = mults.map((m) => (gap * m * (line.length - 1)) / msum);

    line.forEach((ch, idx) => {
      const g = GLYPHS[ch];
      const oyL = oy + (rng(9000 + k * 17)() - 0.5) * 2 * UNEVEN_Y * sl;
      const rand = rng(1000 + k * 77);
      const letter: Letter = {
        index: k,
        particles: [],
        chains: [],
        constraints: [],
        homeCx: 0,
        homeCy: 0,
        phase: rand() * 6.28,
        hov: { x: 0, y: 0 },
        gone: false,
        jigStart: -1,
        stretch: 1,
        sdx: 0,
        sdy: 1,
        stretched: false,
        ang: 0,
        sq: [],
      };

      const sizeRand = rng(5000 + k * 131);
      const ls = custom
        ? 0.94 + sizeRand() * 0.14
        : k === 0
          ? FIRST_SIZE
          : k === LETTERS.length - 1
            ? LAST_SIZE
            : k === FIRST_E.index
              ? FIRST_E.size
              : SIZE_MIN + sizeRand() * (SIZE_MAX - SIZE_MIN);

      const tilt = (TILT[k % TILT.length] * Math.PI) / 180;
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      const boxCx = ox + (g.w * sl) / 2;
      const boxCy = oyL + (CAP * sl) / 2;

      for (const stroke of g.strokes) {
        // Work in glyph units, then scale. Hand-drawn wobble: low-frequency
        // sideways drift and slightly uneven thickness along the stroke.
        const L = polyLength(stroke);
        const n = Math.max(1, Math.round((L * sl) / spacing));
        const A1 = 1.0 + rand() * 0.9; // wobble of the line, like a hand-held marker
        const l1 = 34 + rand() * 26;
        const p1 = rand() * 6.28;
        const A2 = 0.3 + rand() * 0.35;
        const l2 = 20 + rand() * 14;
        const p2 = rand() * 6.28;
        const rA = 0.06 + rand() * 0.04; // uneven ink thickness
        const strokeK = 0.95 + rand() * 0.1; // each pen stroke a touch fatter or thinner
        const rl = 38 + rand() * 26;
        const rp = rand() * 6.28;

        const chain: number[] = [];
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          const d = u * L;
          const pt = along(stroke, d);
          const env = Math.sin(Math.PI * u); // ends stay put so joints meet
          const off =
            env * (A1 * Math.sin((2 * Math.PI * d) / l1 + p1) +
              A2 * Math.sin((2 * Math.PI * d) / l2 + p2));
          const ux = pt.x - pt.ty * off;
          const uy = pt.y + pt.tx * off;

          // to px, then apply resting tilt about the glyph box centre
          let x = ox + ux * sl;
          let y = oyL + uy * sl;
          const dx = (x - boxCx) * ls;
          const dy = (y - boxCy) * ls;
          x = boxCx + dx * cos - dy * sin;
          y = boxCy + dx * sin + dy * cos;

          const r =
            baseR *
            kk *
            ls *
            strokeK *
            (!custom && k === FIRST_E.index ? FIRST_E.thickness : 1) *
            (1 + rA * Math.sin((2 * Math.PI * d) / rl + rp)) *
            (1 + 0.07 * (1 - u) ** 3) * // ink pools where the marker lands
            (i === n ? 1.05 : 1); // and a soft bulb where it lifts

          chain.push(letter.particles.length);
          letter.particles.push({
            x, y, px: x, py: y, hx: x, hy: y, r,
            qx: 0, qy: 0, phase: letter.phase + (letter.chains.length * 2 + i) * 0.35, letter: k,
          });
        }
        letter.chains.push(chain);
      }

      // rest offsets from centroid
      const ps = letter.particles;
      let cx = 0;
      let cy = 0;
      ps.forEach((p) => { cx += p.x; cy += p.y; });
      cx /= ps.length;
      cy /= ps.length;
      letter.homeCx = cx;
      letter.homeCy = cy;
      ps.forEach((p) => { p.qx = p.x - cx; p.qy = p.y - cy; });

      // constraints: tube links, soft bending links, and joint glue
      const have = new Set<string>();
      const add = (a: number, b: number, kk: number) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (a === b || have.has(key)) return;
        have.add(key);
        const rest = Math.hypot(ps[a].x - ps[b].x, ps[a].y - ps[b].y);
        letter.constraints.push({ a, b, rest, k: kk });
      };
      for (const chain of letter.chains) {
        for (let i = 0; i + 1 < chain.length; i++) add(chain[i], chain[i + 1], 0.9);
        for (let i = 0; i + 2 < chain.length; i++) add(chain[i], chain[i + 2], 0.3);
      }
      for (let a = 0; a < ps.length; a++) {
        for (let b = a + 1; b < ps.length; b++) {
          const d = Math.hypot(ps[a].x - ps[b].x, ps[a].y - ps[b].y);
          if (d < spacing * 1.3) add(a, b, 0.5);
        }
      }

      world.letters.push(letter);
      world.all.push(...ps);
      ox += (g.w + gaps[idx]) * sl;
      k++;
    });
  });

  return world;
}

/* ---------- simulation ---------- */

function shapeMatch(world: World, L: Letter) {
  const ps = L.particles;
  const n = ps.length;
  let cx = 0;
  let cy = 0;
  for (const p of ps) { cx += p.x; cy += p.y; }
  cx /= n;
  cy /= n;

  // ---- drag stretch ----
  const g = world.grab;
  let target = 1;
  if (g && g.letter === L.index) {
    const gp = ps[g.particle];
    // how far the held point has been pulled from its resting place
    const ex = world.pointer.x - g.ox - gp.hx;
    const ey = world.pointer.y - g.oy - gp.hy;
    const m = Math.hypot(ex, ey);
    if (m > 1e-3) {
      const nx = L.sdx + (ex / m - L.sdx) * 0.25;
      const ny = L.sdy + (ey / m - L.sdy) * 0.25;
      const nn = Math.hypot(nx, ny) || 1;
      L.sdx = nx / nn;
      L.sdy = ny / nn;
    }
    const f = Math.min(1, m / (world.baseR * STRETCH_REF));
    target = 1 + STRETCH_MAX * f * f * (3 - 2 * f);
  }
  L.stretch += (target - L.stretch) * STRETCH_EASE;
  if (target === 1 && Math.abs(L.stretch - 1) < 0.002) L.stretch = 1;

  const sq = L.sq;
  if (L.stretch !== 1 || L.stretched) {
    // stretch the rest shape along the pull direction (in the letter's own frame)
    const c0 = Math.cos(L.ang);
    const s0 = Math.sin(L.ang);
    const ulx = c0 * L.sdx + s0 * L.sdy;
    const uly = -s0 * L.sdx + c0 * L.sdy;
    const K1 = L.stretch - 1;
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      const dp = p.qx * ulx + p.qy * uly;
      sq[2 * i] = p.qx + K1 * dp * ulx;
      sq[2 * i + 1] = p.qy + K1 * dp * uly;
    }
    for (const cn of L.constraints) {
      cn.rest = Math.hypot(sq[2 * cn.b] - sq[2 * cn.a], sq[2 * cn.b + 1] - sq[2 * cn.a + 1]);
    }
    L.stretched = L.stretch !== 1;
  } else {
    for (let i = 0; i < n; i++) {
      sq[2 * i] = ps[i].qx;
      sq[2 * i + 1] = ps[i].qy;
    }
  }

  let dotS = 0;
  let crossS = 0;
  for (let i = 0; i < n; i++) {
    const p = ps[i];
    const dx = p.x - cx;
    const dy = p.y - cy;
    dotS += sq[2 * i] * dx + sq[2 * i + 1] * dy;
    crossS += sq[2 * i] * dy - sq[2 * i + 1] * dx;
  }
  const t = world.time;
  const ang = Math.atan2(crossS, dotS);
  L.ang = ang;
  // Idle jiggle fades out smoothly over IDLE_SECONDS, then letters sit still.
  const u = Math.min(1, world.time / IDLE_SECONDS);
  const idle = 1 - u * u * (3 - 2 * u);
  let pulse = 0;
  if (L.jigStart >= 0) {
    const ju = (world.time - L.jigStart) / JIGGLE_SECONDS;
    if (ju >= 1) L.jigStart = -1;
    else if (ju > 0) pulse = Math.sin(Math.PI * ju) ** 2;
  }
  const jiggle = world.calm ? 0 : Math.max(idle, pulse * JIGGLE_STRENGTH);
  const sc = 1 + 0.02 * jiggle * Math.sin(t * 1.3 + L.phase * 2);
  const c = Math.cos(ang) * sc;
  const s = Math.sin(ang) * sc;
  const wob = world.baseR * 0.06 * jiggle;

  for (let i = 0; i < n; i++) {
    const p = ps[i];
    const qx = sq[2 * i];
    const qy = sq[2 * i + 1];
    let gx = cx + qx * c - qy * s;
    let gy = cy + qx * s + qy * c;
    if (wob) {
      gx += wob * Math.sin(t * 1.7 + p.phase);
      gy += wob * Math.cos(t * 1.4 + p.phase * 1.3);
    }
    p.x += (gx - p.x) * SHAPE_K;
    p.y += (gy - p.y) * SHAPE_K;
  }
}

function solveConstraints(L: Letter) {
  const ps = L.particles;
  for (const c of L.constraints) {
    const a = ps[c.a];
    const b = ps[c.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1e-6;
    const diff = ((d - c.rest) / d) * 0.5 * c.k;
    a.x += dx * diff;
    a.y += dy * diff;
    b.x -= dx * diff;
    b.y -= dy * diff;
  }
}

// scratch buffer for collide(): 4 numbers (minX, minY, maxX, maxY) per letter, reused every call
const bounds: number[] = new Array(64).fill(0);

function collide(world: World) {
  const ls = world.letters;
  const n = ls.length;

  // Cheap broad phase: a bounding box per letter (grown by the tube radius).
  // Only letter pairs whose boxes overlap get the point-by-point check.
  const b = bounds;
  for (let i = 0; i < n; i++) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const p of ls[i].particles) {
      if (p.x - p.r < x0) x0 = p.x - p.r;
      if (p.y - p.r < y0) y0 = p.y - p.r;
      if (p.x + p.r > x1) x1 = p.x + p.r;
      if (p.y + p.r > y1) y1 = p.y + p.r;
    }
    b[i * 4] = x0;
    b[i * 4 + 1] = y0;
    b[i * 4 + 2] = x1;
    b[i * 4 + 3] = y1;
  }

  for (let i = 0; i < n; i++) {
    if (ls[i].gone) continue;
    for (let j = i + 1; j < n; j++) {
      if (ls[j].gone) continue;
      if (b[i * 4 + 2] < b[j * 4] || b[j * 4 + 2] < b[i * 4]) continue;
      if (b[i * 4 + 3] < b[j * 4 + 1] || b[j * 4 + 3] < b[i * 4 + 1]) continue;
      for (const a of ls[i].particles) {
        for (const c of ls[j].particles) {
          const min = a.r + c.r;
          const dx = c.x - a.x;
          if (dx > min || dx < -min) continue;
          const dy = c.y - a.y;
          if (dy > min || dy < -min) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2);
          const push = ((min - d) / d) * 0.5 * 0.85;
          a.x -= dx * push;
          a.y -= dy * push;
          c.x += dx * push;
          c.y += dy * push;
        }
      }
    }
  }
}

/** Every 5 or 10 seconds, give a few random letters a short jiggle (with a little kick). */
function triggerJiggle(world: World) {
  if (world.calm || world.clearTarget === 1 || world.time < world.nextJiggle) return;
  world.nextJiggle = world.time + nextGap();
  for (const idx of world.letters.map((L) => L.index)) {
    const L = world.letters[idx];
    if (world.grab && world.grab.letter === idx) continue;
    L.jigStart = world.time + Math.random() * JIGGLE_STAGGER;
    // a small random shove so it visibly wobbles even when the pulse is subtle
    const a = Math.random() * Math.PI * 2;
    const kick = world.baseR * JIGGLE_KICK;
    for (const p of L.particles) {
      p.px -= Math.cos(a) * kick;
      p.py -= Math.sin(a) * kick;
    }
  }
}

/**
 * Hovering a letter (mouse only) makes it lean a tiny bit toward the cursor;
 * moving away eases it back. The whole letter shifts, so its shape is kept.
 */
function hoverNudge(world: World, grabbed: Letter | null) {
  for (const L of world.letters) {
    let tx = 0;
    let ty = 0;
    if (!world.calm && world.hoverLetter === L.index && L !== grabbed) {
      let cx = 0;
      let cy = 0;
      for (const p of L.particles) {
        cx += p.x;
        cy += p.y;
      }
      cx = cx / L.particles.length - L.hov.x; // where the letter would be un-nudged
      cy = cy / L.particles.length - L.hov.y;
      const max = world.baseR * HOVER_MAX;
      tx = (world.pointer.x - cx) * HOVER_FOLLOW;
      ty = (world.pointer.y - cy) * HOVER_FOLLOW;
      const m = Math.hypot(tx, ty);
      if (m > max) {
        tx = (tx / m) * max;
        ty = (ty / m) * max;
      }
    }
    const dx = (tx - L.hov.x) * HOVER_EASE;
    const dy = (ty - L.hov.y) * HOVER_EASE;
    if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) continue;
    for (const p of L.particles) {
      // move the previous position too, so the nudge adds no momentum
      p.x += dx;
      p.y += dy;
      p.px += dx;
      p.py += dy;
    }
    L.hov.x += dx;
    L.hov.y += dy;
    world.dirty = true; // a hover nudge moves points without velocity, so flag it for repaint
  }
}

/**
 * Move whole letters out of the clearing (rigidly, so they keep their shape instead of
 * smearing around the edge of the ellipse into a ring).
 */
function shoveLettersOut(world: World) {
  const t = world.clearT;
  if (t < 0.01) return;
  const c = world.clear;
  const rx = c.rx * t;
  const ry = c.ry * t;
  for (const L of world.letters) {
    if (world.grab && world.grab.letter === L.index) continue;
    let cx = 0;
    let cy = 0;
    for (const p of L.particles) {
      cx += p.x;
      cy += p.y;
    }
    cx /= L.particles.length;
    cy /= L.particles.length;

    // deepest point inside the ellipse
    let qMin = Infinity;
    let er = 0;
    for (const p of L.particles) {
      const ex = rx + p.r;
      const ey = ry + p.r;
      const q = ((p.x - c.cx) / ex) ** 2 + ((p.y - c.cy) / ey) ** 2;
      if (q < qMin) {
        qMin = q;
        er = (ex + ey) / 2;
      }
    }
    if (qMin >= 1) continue;

    // push straight away from the middle (letters sitting dead centre go up or down)
    let ux = cx - c.cx;
    let uy = cy - c.cy;
    const m = Math.hypot(ux, uy);
    if (m < 6) {
      ux = 0;
      uy = 1;
    } else {
      ux /= m;
      uy /= m;
    }
    const d = (1 - Math.sqrt(qMin)) * er * 0.1;
    for (const p of L.particles) {
      p.x += ux * d;
      p.y += uy * d;
      p.px += ux * d * 0.85; // a little carried momentum, so it glides
      p.py += uy * d * 0.85;
    }
  }
}

/** Keep the middle clearing free: shove any tube point outside the ellipse. */
function pushOut(world: World) {
  const t = world.clearT;
  if (t < 0.01) return;
  const c = world.clear;
  const rx = c.rx * t;
  const ry = c.ry * t;
  for (const p of world.all) {
    const ex = rx + p.r;
    const ey = ry + p.r;
    let dx = p.x - c.cx;
    let dy = p.y - c.cy;
    let q = (dx / ex) ** 2 + (dy / ey) ** 2;
    if (q >= 1) continue;
    if (q < 1e-6) {
      dx = 1e-3;
      dy = -1e-3;
      q = (dx / ex) ** 2 + (dy / ey) ** 2;
    }
    const k = 1 / Math.sqrt(q);
    p.x += (c.cx + dx * k - p.x) * 0.1;
    p.y += (c.cy + dy * k - p.y) * 0.1;
  }
}

/** Gently shove tube points out of the keep-out circles (the nav photo). */
function pushOutCircles(world: World) {
  for (const o of world.keepOut) {
    for (const p of world.all) {
      const min = o.r + p.r;
      const dx = p.x - o.cx;
      const dy = p.y - o.cy;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min) continue;
      const d = Math.sqrt(d2) || 1e-3;
      const k = (min - d) / d;
      p.x += dx * k * 0.35;
      p.y += dy * k * 0.35;
    }
  }
}

function step(world: World, dt: number) {
  const { W, H } = world;
  const g = world.grab;
  const grabbed = g ? world.letters[g.letter] : null;

  // integrate
  for (const p of world.all) {
    let vx = (p.x - p.px) * DAMPING;
    let vy = (p.y - p.py) * DAMPING;
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_V) {
      vx = (vx / sp) * MAX_V;
      vy = (vy / sp) * MAX_V;
    }
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy;
  }

  // gentle drift home (not while being held)
  const homeK =
    world.clearTarget === 1 ? 0 : world.boost > 0 ? HOME_K * 3 : HOME_K;
  if (homeK > 0) {
    for (const L of world.letters) {
      if (L === grabbed) continue;
      for (const p of L.particles) {
        // home plus the current hover nudge, so the pull doesn't fight it
        // a spring (acceleration, not a snap): eases in, glides, overshoots a touch, settles
        const ax = (p.hx + L.hov.x - p.x) * homeK;
        const ay = (p.hy + L.hov.y - p.y) * homeK;
        p.x += ax;
        p.y += ay;
        p.px -= ax;
        p.py -= ay;
      }
    }
  }

  triggerJiggle(world);
  hoverNudge(world, grabbed);

  for (const L of world.letters) shapeMatch(world, L);

  for (let it = 0; it < ITER; it++) {
    for (const L of world.letters) solveConstraints(L);

    // the held point follows the pointer, dragging the tube behind it
    if (g && grabbed) {
      const p = grabbed.particles[g.particle];
      p.x += (world.pointer.x - g.ox - p.x) * 0.7;
      p.y += (world.pointer.y - g.oy - p.y) * 0.7;
    }
    collide(world);
    shoveLettersOut(world);
    pushOut(world);
    pushOutCircles(world);
  }

  // walls
  for (const p of world.all) {
    const m = p.r + EDGE;
    if (p.x < m) p.x = m;
    else if (p.x > W - m) p.x = W - m;
    if (p.y < m) p.y = m;
    else if (p.y > H - m) p.y = H - m;
  }

  world.clearT += (world.clearTarget - world.clearT) * 0.07;
  if (world.boost > 0) world.boost -= dt;
  world.time += dt;
}

// scratch buffer for stepWorld(): point positions at the start of the frame
let snap = new Float64Array(0);

export function stepWorld(world: World, dtSeconds: number) {
  if (world.prevTarget === 1 && world.clearTarget === 0) world.boost = 3.5;
  world.prevTarget = world.clearTarget;
  const dt = Math.min(dtSeconds, 1 / 30) / SUBSTEPS;

  // remember where everything was, so we can tell how far it really moved this frame
  // (constraints can push points back and forth without a net change, which costs no repaint)
  const all = world.all;
  if (snap.length < all.length * 2) snap = new Float64Array(all.length * 2);
  for (let i = 0; i < all.length; i++) {
    snap[2 * i] = all[i].x;
    snap[2 * i + 1] = all[i].y;
  }

  for (let i = 0; i < SUBSTEPS; i++) step(world, dt);

  let moved = 0;
  for (let i = 0; i < all.length; i++) {
    const m = Math.abs(all[i].x - snap[2 * i]) + Math.abs(all[i].y - snap[2 * i + 1]);
    if (m > moved) moved = m;
  }
  world.moved = moved;
}

/* ---------- interaction ---------- */

export function hitTest(world: World, x: number, y: number): Grab | null {
  let best: Grab | null = null;
  let bestD = Infinity;
  for (const L of world.letters) {
    if (L.gone) continue;
    L.particles.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < p.r + 6 && d < bestD) {
        bestD = d;
        best = { letter: L.index, particle: i, ox: x - p.x, oy: y - p.y };
      }
    });
  }
  return best;
}

/**
 * Inflate (or deflate) the whole scene to scale `g` (1 = original size),
 * keeping every letter in proportion. Called each frame with a tiny change,
 * so letters simply swell in place and nudge each other like real balloons.
 */
export function setGrowth(world: World, g: number) {
  const k = g / world.growth;
  if (Math.abs(k - 1) < 1e-7) return;
  const { growCx: cx, growCy: cy } = world;
  const about = (v: number, c: number) => c + (v - c) * k;
  for (const p of world.all) {
    p.x = about(p.x, cx);
    p.y = about(p.y, cy);
    p.px = about(p.px, cx);
    p.py = about(p.py, cy);
    p.hx = about(p.hx, cx);
    p.hy = about(p.hy, cy);
    p.qx *= k;
    p.qy *= k;
    p.r *= k;
  }
  for (const L of world.letters) for (const c of L.constraints) c.rest *= k;
  world.baseR *= k;
  world.growth = g;
}
