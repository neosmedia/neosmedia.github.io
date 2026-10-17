import Link from "next/link";
import { SERVICES } from "@/lib/site";

export function Smiley() {
  return (
    <svg className="smiley" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M40 6c19 0 33 14 33 33 0 20-14 34-33 34C21 73 6 59 7 39 8 20 21 6 40 6Z" />
      <path d="M29 30c0 4 .3 7 .6 10M51 30c0 4-.3 7-.6 10" />
      <path d="M24 51c6 9 26 10 33-1" />
    </svg>
  );
}

export const ABOUT_COPY =
  "I turn complex problems into simple, thoughtful digital experiences. From the first sketch to the last pixel, I bring equal parts curiosity, craft, and a little play to everything I make.";

export default function AboutBand() {
  return (
    <section className="about-band container">
      <p className="label">A little about me</p>
      <div className="about-body">
        <Smiley />
        <div>
          <h2 className="about-h">
            Product designer with 18 years experience
          </h2>
          <p className="about-p">{ABOUT_COPY}</p>
          <ul className="tags">
            {SERVICES.map((s) => (
              <li key={s.name}>
                <Link href="/about/">
                  {s.name} <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
