import { pageMeta } from "@/lib/seo";
import { Sections, AboutSection, ExperienceSection, LetsBuild } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";

export const metadata = pageMeta({
  title: "About",
  description:
    "About Tyler Lange: a UX design engineer in Vancouver with 18+ years of experience in product design, design systems and AI workflow UX.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <main className="page">
      <Sections page>
        <h1 className="sr-only">About Tyler Lange, UX Design Engineer in Vancouver</h1>
        <AboutSection label={false} portrait />
        <ExperienceSection />
        <LetsBuild />
        <SiteFooter />
      </Sections>
    </main>
  );
}
