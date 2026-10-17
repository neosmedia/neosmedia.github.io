import Link from "next/link";
import { ABOUT_COPY, Smiley } from "@/components/AboutBand";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import { SERVICES, TOOLS } from "@/lib/site";

export const metadata = { title: "About — Tyler Lange" };

export default function AboutPage() {
  return (
    <main className="page">
      <section className="container page-head">
        <p className="label">A little about me</p>
        <div className="about-body about-body-lg">
          <Smiley />
          <div>
            <h1 className="about-h about-h-lg">Product designer with 18 years experience</h1>
            <p className="about-p">{ABOUT_COPY}</p>
          </div>
        </div>
      </section>

      <section className="container split">
        <p className="label">What I do</p>
        <ul className="service-list">
          {SERVICES.map((s) => (
            <li key={s.name}>
              <h2>{s.name}</h2>
              <p>{s.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container split">
        <p className="label">Tools of the trade</p>
        <ul className="tools tools-lg">
          {TOOLS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="container split">
        <p className="label">Selected work</p>
        <p className="about-p">
          See what I’ve been making lately. <Link className="link" href="/work/">View all work ↗</Link>
        </p>
      </section>

      <ContactSection />
      <SiteFooter />
    </main>
  );
}
