import { CAP, GLYPHS, LETTERS, STROKE } from "@/lib/glyphs";

/**
 * Big static "TYLER LANGE" under the footer, drawn from the same balloon letter shapes as the hero
 * (lib/glyphs.ts) but with no animation or interaction. One line, cut off at SHOW (80%) of its height.
 */
const SHOW = 0.8; // how much of the letter height is visible
const GAP = 6; // between letters (glyph units)
const WORD_GAP = 48; // between TYLER and LANGE

const WORDS = [LETTERS.slice(0, 5), LETTERS.slice(5)];

function layout() {
  let x = 0;
  const out: { key: string; x: number; paths: string[] }[] = [];
  WORDS.forEach((word, wi) => {
    if (wi > 0) x += WORD_GAP - GAP;
    word.forEach((ch, i) => {
      const g = GLYPHS[ch];
      out.push({
        key: `${wi}-${i}`,
        x,
        paths: g.strokes.map((st) => st.map(([px, py], j) => `${j ? "L" : "M"}${px} ${py}`).join(" ")),
      });
      x += g.w + GAP;
    });
  });
  return { glyphs: out, width: x - GAP };
}

export default function FooterName() {
  const { glyphs, width } = layout();
  return (
    <div className="footer-name" aria-hidden="true">
      <svg viewBox={`0 0 ${width} ${CAP * SHOW}`} width="100%" role="presentation" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          {glyphs.map((g) => (
            <g key={g.key} transform={`translate(${g.x} 0)`}>
              {g.paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
