import BalloonName from "./BalloonName";
import ProjectGrid from "./ProjectGrid";
import AboutBand from "./AboutBand";
import ContactSection from "./ContactSection";
import SiteFooter from "./SiteFooter";

export default function Home() {
  return (
    <main className="page">
      <h1 className="sr-only">Tyler Lange</h1>
      <section className="hero">
        <BalloonName mode="hero" />
      </section>

      <div className="container intro">
        <p>Independent product designer</p>
        <p className="muted">Portfolio — 2027</p>
      </div>

      <section className="container works" id="work">
        <div className="section-head">
          <span>Selected works</span>
          <span className="muted">Eight ideas, made real. ↓</span>
        </div>
        <ProjectGrid />
      </section>

      <AboutBand />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
