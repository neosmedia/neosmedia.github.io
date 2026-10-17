import type { ReactNode } from "react";
import ShaderText from "./ShaderText";
import Link from "next/link";
import Toolbox from "./Toolbox";
import {
  ABOUT_HEADLINE,
  ABOUT_PILLARS,
  BOOKING_URL,
  CTA_STATUS,
  EMAIL,
  EXPERIENCE,
  EXPERIENCE_HEADLINE,
  LINKEDIN_URL,
  WORK_LINKS,
} from "@/lib/site";

/** Warm editorial wrapper for sections 2-5 + footer (styled after tyl.framer.website). */
export function Sections({ children }: { children: ReactNode }) {
  return <div className="fx">{children}</div>;
}

function PillarIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 30,
    height: 30,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "Design")
    return (
      <svg {...common}>
        <path d="m12 19 7-7 3 3-7 7-3-3Z" />
        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" />
        <path d="m2 2 7.6 7.6" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    );
  if (name === "Engineer")
    return (
      <svg {...common}>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/** Section 2 */
export function SelectedWork() {
  return (
    <section className="sec container" id="work">
      <div className="sec-head">
        <span className="mono">Selected work</span>
        <span className="mono">2020 — 2026</span>
      </div>
      <ul className="links">
        {WORK_LINKS.map((w) => (
          <li key={w.url}>
            <a href={w.url} target="_blank" rel="noreferrer">
              <span className="links-title">{w.title}</span>
              {w.subtitle && <span className="links-sub">{w.subtitle}</span>}
              <span className="mono links-url">{w.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
              <span className="links-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="work-note mono">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v5.5" />
          <circle cx="12" cy="7.6" r="0.6" fill="currentColor" />
        </svg>
        Case studies coming soon
      </p>
    </section>
  );
}

/** Section 3 */
export function AboutSection() {
  return (
    <section className="sec container" id="about">
      <div className="sec-head">
        <span className="mono">About</span>
      </div>
      <h2 className="about-lead">{ABOUT_HEADLINE}</h2>
      <ul className="pillars">
        {ABOUT_PILLARS.map((p, i) => (
          <li key={p.name} className="pillar">
            <span className={`pillar-icon${i === ABOUT_PILLARS.length - 1 ? " accent" : ""}`} aria-hidden="true">
              <PillarIcon name={p.name} />
            </span>
            <h3>{p.name}</h3>
            <p>{p.blurb}</p>
          </li>
        ))}
      </ul>
      <div className="about-tools">
        <Toolbox />
      </div>
    </section>
  );
}

/** Section 4 */
export function ExperienceSection() {
  return (
    <section className="sec container" id="experience">
      <div className="sec-head">
        <span className="mono">Experience</span>
      </div>
      <h2 className="sec-title">{EXPERIENCE_HEADLINE}</h2>
      <ul className="exp">
        {EXPERIENCE.map((e) => (
          <li key={e.company} className="exp-row">
            <span className="exp-main">
              <span className="exp-top">
                <span className="exp-company">{e.company}</span>
                {e.now && (
                  <span className="exp-now mono">
                    <i aria-hidden="true" />
                    Now
                  </span>
                )}
              </span>
              <span className="exp-role">{e.role}</span>
            </span>
            <span className="exp-years mono">{e.years}</span>
          </li>
        ))}
      </ul>
      <div className="exp-cta">
        <a className="btn btn-outline" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          Full resume on LinkedIn <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

/** Section 5 (above the footer) */
export function LetsBuild() {
  return (
    <section className="sec build container" id="contact">
      <p className="avail">
        <span className="dot" aria-hidden="true" />
        {CTA_STATUS}
      </p>
      <h2 className="build-title">
        Let’s build something{" "}
        <em>
          <ShaderText>good</ShaderText>
        </em>
      </h2>
      <div className="build-actions">
        <a className="btn btn-solid" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <a className="btn btn-outline" href={BOOKING_URL}>
          Book a call <span aria-hidden="true">↗</span>
        </a>
        <a className="btn btn-outline" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
        <Link className="btn btn-outline" href="/contact/">
          Send a message
        </Link>
      </div>
    </section>
  );
}
