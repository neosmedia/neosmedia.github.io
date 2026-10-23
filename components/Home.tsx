import Hero from "./Hero";
import { Sections, SelectedWork, AboutSection, ExperienceSection, LetsBuild } from "./HomeSections";
import SiteFooter from "./SiteFooter";

export default function Home() {
  return (
    <main className="page">
      <h1 className="sr-only">Tyler Lange — Product Designer &amp; UX Engineer in Vancouver</h1>
      {/* 1 · Hero */}
      <Hero />

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
