import { TOOLBOX } from "@/lib/toolbox";

export default function Toolbox() {
  return (
    <section className="toolbox" aria-label="Daily toolbox">
      <p className="toolbox-label">Daily toolbox</p>
      <ul className="toolbox-row">
        {TOOLBOX.map((t) => (
          <li key={t.name} className="tool" data-name={t.name}>
            <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={t.name}>
              <path d={t.d} />
            </svg>
          </li>
        ))}
      </ul>
    </section>
  );
}
