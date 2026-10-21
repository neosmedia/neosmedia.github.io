/**
 * Balloon letterforms, drawn as thick round-capped centerline strokes.
 *
 * Every glyph lives in a box that is CAP units tall and `w` units wide.
 * Strokes are inset by half the stroke width so the rendered ink exactly
 * fills the box. The same centerlines are used both for rendering (SVG
 * polylines) and for physics (capsule colliders), so what you see is
 * exactly what collides.
 */

export type Pt = [number, number];
export type Glyph = { w: number; strokes: Pt[][] };

// Letters are drawn in a "design space" (100 tall, 28 stroke), then reshaped
// below: fatter strokes, a bit wider, a bit shorter.
const RAW_CAP = 100;
const RAW_STROKE = 28;
const H = RAW_STROKE / 2; // 14: inset so ink stays inside the box
const TOP = H;
const BOT = RAW_CAP - H;

/** Reshape knobs */
export const STROKE = 28.5; // stroke thickness (fatter = bigger)
const SX = 1.1; // horizontal stretch of the centerlines
const SY = 0.88; // vertical squash of the centerlines

/** Glyph height after reshaping (ink box). */
export const CAP = (RAW_CAP - RAW_STROKE) * SY + STROKE;

/** Sample an elliptical arc. Angles in degrees, screen coordinates (y down). */
function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps = 14
): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    pts.push([
      +(cx + rx * Math.cos(a)).toFixed(2),
      +(cy + ry * Math.sin(a)).toFixed(2),
    ]);
  }
  return pts;
}

const RAW_GLYPHS: Record<string, Glyph> = {
  T: {
    w: 70,
    strokes: [
      [[H, TOP], [70 - H, TOP]],
      // start a little below the bar so the stem's round cap hides inside it
      [[35, TOP + 6], [35, BOT]],
    ],
  },
  Y: {
    w: 76,
    strokes: [
      [[H, TOP], [38, 50], [38, BOT]],
      [[76 - H, TOP], [38, 50]],
    ],
  },
  L: {
    w: 58,
    strokes: [[[H, TOP], [H, BOT], [58 - H, BOT]]],
  },
  E: {
    w: 62,
    strokes: [
      [[H, TOP], [H, BOT]],
      [[H, TOP], [62 - H, TOP]],
      [[H, 50], [62 - 18, 50]],
      [[H, BOT], [62 - H, BOT]],
    ],
  },
  // Alternate E for the last letter: slightly different arm lengths and a
  // middle arm sitting a touch higher, so the two Es aren't twins.
  e: {
    w: 64,
    strokes: [
      [[H, TOP], [H, BOT]],
      [[H, TOP], [64 - H + 1, TOP]],
      [[H, 48], [64 - 26, 48]],
      [[H, BOT], [64 - H - 3, BOT]],
    ],
  },
  R: {
    w: 74,
    strokes: [
      [[H, TOP], [H, BOT]],
      [[H, TOP], [38, TOP], ...arc(38, 35, 22, 21, -90, 90), [H, 56]],
      [[40, 58], [58, BOT]],
    ],
  },
  A: {
    w: 76,
    strokes: [
      [[H, BOT], [H, 38], ...arc(38, 38, 24, 24, 180, 360), [76 - H, BOT]],
      [[H, 64], [76 - H, 64]],
    ],
  },
  N: {
    w: 78,
    strokes: [[[H, BOT], [H, TOP], [78 - H, BOT], [78 - H, TOP]]],
  },
  // Numerals for the 404 page (same stroke width and shaping as the letters)
  "0": {
    w: 82,
    strokes: [arc(41, 50, 27, 36, -90, 270, 30)],
  },
  "4": {
    w: 92,
    strokes: [
      [[68, TOP], [H, 66], [92 - H, 66]],
      [[68, TOP + 4], [68, BOT]],
    ],
  },
  G: {
    w: 88,
    strokes: [
      // open "C" arc that curls in to a short bar, so the counter stays readable
      [...arc(44, 50, 30, 36, -45, -345, 22), [50, 59.3]],
    ],
  },
};

function reshape(g: Glyph): Glyph {
  const half = STROKE / 2;
  const mapPt = ([x, y]: Pt): Pt => [
    +(half + (x - H) * SX).toFixed(2),
    +(half + (y - H) * SY).toFixed(2),
  ];
  return {
    w: (g.w - RAW_STROKE) * SX + STROKE,
    strokes: g.strokes.map((st) => st.map(mapPt)),
  };
}

export const GLYPHS: Record<string, Glyph> = Object.fromEntries(
  Object.entries(RAW_GLYPHS).map(([k, g]) => [k, reshape(g)])
);

/** Letters in reading order: TYLER LANGE */
// (the final "e" is the alternate E shape)
export const LETTERS = "TYLERLANGe".split("");
