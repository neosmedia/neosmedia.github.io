import BalloonName from "./BalloonName";
import { Sections, SelectedWork, AboutSection, ExperienceSection, LetsBuild } from "./HomeSections";
import SiteFooter from "./SiteFooter";

export default function Home() {
  return (
    <main className="page">
      <h1 className="sr-only">Tyler Lange — Product Designer &amp; UX Engineer in Vancouver</h1>
      {/* 1 · Hero */}
      <section className="hero">
        <BalloonName mode="hero" />
      </section>

      <Sections>
        <SelectedWork />
      <AboutSection />
      <ExperienceSection />
      <LetsBuild />
      <SiteFooter />
      </Sections>
    </main>
  );
}
