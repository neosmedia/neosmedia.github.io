import { buildWorld } from "@/lib/softbody";

/**
 * Big static "TYLER LANGE" under the footer, at 10% opacity.
 *
 * The letters are the hero's exact letters: it builds the same world as the home hero (same sizes,
 * tilts, wobble and thickness per letter, see lib/softbody.ts) and draws each letter's resting
 * shape. Nothing moves and nothing is interactive. The hero's two lines are placed on one line, and
 * only the top SHOW (80%) of the letters is visible.
 */
const SHOW = 0.8; // how much of the letter height is visible
const OPACITY = 0.1;
const GAP_R = 0.45; // gap between letters, in tube radii
const WORD_GAP_R = 3.2; // gap between TYLER and LANGE, in tube radii
const f = (n: number) => +n.toFixed(1);

function layout() {
  // same call as the hero uses on a wide screen
  const world = buildWorld(1400, 760, { top: 0, bottom: 0, margin: 16 });
  const R = world.baseR;

  // each letter: bounding box (ink included) and which hero line it sits on
  const info = world.letters.map((L, i) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of L.particles) {
      x0 = Math.min(x0, p.hx - p.r);
      x1 = Math.max(x1, p.hx + p.r);
      y0 = Math.min(y0, p.hy - p.r);
      y1 = Math.max(y1, p.hy + p.r);
    }
    return { L, i, x0, x1, y0, y1, line: i < 5 ? 0 : 1 };
  });

  // keep each letter's own up/down offset relative to its line, then put both lines on one baseline
  const lineMid = [0, 1].map((ln) => {
    const mids = info.filter((a) => a.line === ln).map((a) => (a.y0 + a.y1) / 2);
    return mids.reduce((a, b) => a + b, 0) / mids.length;
  });

  let cursor = 0;
  let top = Infinity;
  let bottom = -Infinity;
  const letters = info.map((a) => {
    if (a.i === 5) cursor += R * WORD_GAP_R - R * GAP_R; // extra space between the words
    const dx = cursor - a.x0;
    const dy = -lineMid[a.line];
    cursor += a.x1 - a.x0 + R * GAP_R;
    top = Math.min(top, a.y0 + dy);
    bottom = Math.max(bottom, a.y1 + dy);
    // each pen stroke becomes short round-capped runs of the real centerline; every run takes the
    // local tube thickness, so the ink keeps its uneven hand-drawn width but the edges stay smooth
    const runs: { d: string; w: number }[] = [];
    const RUN = 5;
    for (const chain of a.L.chains) {
      for (let s0 = 0; s0 < chain.length - 1; s0 += RUN) {
        const idx = chain.slice(s0, Math.min(chain.length, s0 + RUN + 1));
        const pts = idx.map((k) => a.L.particles[k]);
        const w = (pts.reduce((t, p) => t + p.r, 0) / pts.length) * 2;
        runs.push({ d: pts.map((p, j) => `${j ? "L" : "M"}${f(p.hx + dx)} ${f(p.hy + dy)}`).join(""), w: f(w) });
      }
    }
    return { i: a.i, runs };
  });

  return { letters, width: cursor - R * GAP_R, top, height: (bottom - top) * SHOW };
}

export default function FooterName() {
  const { letters, width, top, height } = layout();
  return (
    <div className="footer-name" aria-hidden="true">
      <svg viewBox={`0 ${f(top)} ${f(width)} ${f(height)}`} width="100%" role="presentation" focusable="false">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" opacity={OPACITY}>
          {letters.map((l) =>
            l.runs.map((r, j) => <path key={`${l.i}-${j}`} d={r.d} strokeWidth={r.w} />)
          )}
        </g>
      </svg>
    </div>
  );
}
