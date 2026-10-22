/**
 * Home page sections below the hero (shared by Home and ComingSoon):
 * SelectedWork, AboutSection, ExperienceSection, LetsBuild. Content comes from lib/site.ts.
 * Styles: the scoped `.fx` block in app/globals.css (colour vars --bg/--ink/--muted/--line/--surface).
 */
import type { ReactNode } from "react";
import ShaderText from "./ShaderText";
import Link from "next/link";
import Toolbox from "./Toolbox";
import NameChip from "./NameChip";
import Button from "./Button";
import {
  ABOUT_BIO,
  ABOUT_DETAILS,
  ABOUT_HEADLINE,
  PRINCIPLES,
  ABOUT_PILLARS,
  CTA_STATUS,
  EMAIL,
  EXPERIENCE,
  EXPERIENCE_HEADLINE,
  LINKEDIN_URL,
  ARCHIVE,
  WORK_LINKS,
} from "@/lib/site";

/** Warm editorial wrapper for sections 2-5 + footer (styled after tyl.framer.website). */
export function Sections({ children, page = false }: { children: ReactNode; page?: boolean }) {
  // `page`: inner pages have no hero above, so the sheet is flat and clears the nav bar
  return <div className={page ? "fx fx-page" : "fx"}>{children}</div>;
}

/** Centered title block at the top of inner pages (Work, Contact, project pages). */
/** `cardTitle`: set the title in the project-card title style (case study pages). */
export function PageHead({ title, lede, cardTitle = false }: { title: string; lede?: string; cardTitle?: boolean }) {
  return (
    <section className="sec container page-intro">
      <h1 className={cardTitle ? "sec-title page-title-card" : "sec-title"}>{title}</h1>
      {lede && <p className="page-intro-lede">{lede}</p>}
    </section>
  );
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

/** The project cards. `internal` links to the case-study pages instead of the live sites. */
export function WorkGrid({ internal = false }: { internal?: boolean }) {
  return (
    <ul className="links">
      {WORK_LINKS.map((w) => {
        const inner = (
          <>
            {w.image && (
              // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
              <img className="links-cover" src={w.image} alt="" loading="lazy" decoding="async" />
            )}
            <span className="links-title">{w.title}</span>
            {w.subtitle && <span className="links-sub">{w.subtitle}</span>}
            <span className="mono links-url">{w.label ?? w.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
            <span className="links-arrow" aria-hidden="true">↗</span>
          </>
        );
        const cls = w.image ? "has-cover" : undefined;
        return (
          <li key={w.slug}>
            {internal ? (
              <Link href={`/work/${w.slug}/`} className={cls}>{inner}</Link>
            ) : (
              <a href={w.url} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Older projects as a list (name, year, blurb, pill button). Placeholder content for now. */
export function Archive() {
  return (
    <section className="sec container archive" id="archive">
      <div className="sec-head">
        <span className="mono">Work Archive</span>
      </div>
      {/* same tray + row cards as the Experience list; inside each row: name/year, blurb, button */}
      <ul className="exp">
        {ARCHIVE.map((a) => (
          <li key={a.name} className="exp-row archive-row">
            <div className="archive-main">
              <span className={`archive-icon${a.iconFill ? " fill" : ""}${a.iconRound ? " round" : ""}`} style={{ background: a.color, color: a.fg }} aria-hidden="true">
                {a.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
                  <img src={a.icon} alt="" loading="lazy" decoding="async" />
                ) : (
                  a.initials
                )}
              </span>
              <div className="archive-text">
                <h3 className="exp-company">{a.name}</h3>
                {a.year && <span className="archive-year mono">{a.year}</span>}
              </div>
            </div>
            <p className="archive-blurb">{a.blurb}</p>
            {a.url ? (
              <a className="btn btn-outline archive-btn" href={a.url} target="_blank" rel="noreferrer">
                Website <span aria-hidden="true">↗</span>
              </a>
            ) : (
              // TODO: add `url` to the ARCHIVE entry in lib/site.ts to make this a live link
              <span className="btn btn-outline archive-btn" aria-disabled="true">
                Website <span aria-hidden="true">↗</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Section 2 */
export function SelectedWork() {
  return (
    <section className="sec container" id="work">
      <div className="sec-head">
        <span className="mono">Selected work</span>
        <span className="mono">2019 — 2026</span>
      </div>
      <WorkGrid internal />
      <div className="work-more">
        <Link className="btn btn-outline" href="/work/">
          View all work <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

/** Section 3 */
/**
 * `label`: the small "About" text above the headline (hidden on the About page itself).
 * `portrait`: centered round photo above the headline (About page); black & white on hover.
 */
/** About page: "Dive into my work" colour cards, each with a handwritten side note and arrow. */
export function Principles() {
  return (
    <section className="sec container principles" aria-labelledby="principles-title">
      <div className="sec-head">
        <span className="mono" id="principles-title">Dive into my work</span>
      </div>
      <ul className="principle-list">
        {PRINCIPLES.map((p, i) => (
          <li key={p.title} className={`principle ${i % 2 ? "principle-right" : "principle-left"}`}>
            <article className="principle-card" style={{ background: p.color }}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
            <div className="principle-note" aria-hidden="true">
              <svg viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6c30 2 62 8 100 22" />
                <path d="M92 17l12 11-16 5" />
              </svg>
              <span>{p.note}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** About page extras: short bio, philosophy, specialties and availability (from the old site). */
export function AboutDetails() {
  return (
    <section className="sec container about-more">
      <div className="about-bio">
        {ABOUT_BIO.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
      <ul className="pillars">
        {ABOUT_DETAILS.map((d) => (
          <li key={d.title} className="pillar">
            <h3>{d.title}</h3>
            {"text" in d && d.text ? <p>{d.text}</p> : null}
            {"list" in d && d.list ? (
              <ul className="about-list">
                {d.list.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutSection({ label = true, portrait = false }: { label?: boolean; portrait?: boolean }) {
  return (
    <section className="sec container" id="about">
      {portrait && (
        <div className="about-portrait">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
          <img className="portrait-color" src="/ty-color.jpg" alt="Tyler Lange" width={192} height={192} decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="portrait-bw" src="/ty-bw.jpg" alt="" aria-hidden="true" width={192} height={192} decoding="async" />
        </div>
      )}
      {portrait && <NameChip />}
      {label && (
        <div className="sec-head">
          <span className="mono">About</span>
        </div>
      )}
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
        <Button href={`mailto:${EMAIL}`} iconLeft="mail">
          {EMAIL}
        </Button>
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
