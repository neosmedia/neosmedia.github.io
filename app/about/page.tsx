import { pageMeta, pageJsonLd } from "@/lib/seo";
import { Sections, AboutSection, AboutDetails, Principles, ExperienceSection, LetsBuild } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";

export const metadata = pageMeta({
  title: "About: Product Designer & UX Engineer",
  description:
    "About Tyler Lange: a UX design engineer in Vancouver with 18+ years of experience in product design, design systems and AI workflow UX.",
  path: "/about/",
});

const ABOUT_JSON_LD = pageJsonLd(
  "ProfilePage",
  "/about/",
  "About Tyler Lange",
  "Tyler Lange is a product designer and UX engineer in Vancouver with 18+ years of experience."
);

export default function AboutPage() {
  return (
    <main className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_JSON_LD) }} />
      <Sections page>
        <h1 className="sr-only">About Tyler Lange, UX Design Engineer in Vancouver</h1>
        <AboutSection label={false} portrait />
        <AboutDetails />
        <Principles />
        <ExperienceSection />
        <LetsBuild />
        <SiteFooter />
      </Sections>
    </main>
  );
}
