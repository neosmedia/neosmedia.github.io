import { pageMeta } from "@/lib/seo";
import { Sections, PageHead, WorkGrid, Archive } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";

export const metadata = pageMeta({
  title: "Work",
  description:
    "Selected product design and UX work by Tyler Lange, 2019 to 2026: AI analytics, industrial software, fintech and consumer apps.",
  path: "/work/",
});

export default function WorkPage() {
  return (
    <main className="page">
      <Sections page>
        <PageHead title="Selected work" lede="Product design, design systems and AI workflow UX, 2019 — 2026." />
        <section className="sec container work-page">
          <WorkGrid internal />
        </section>
        <Archive />
        <SiteFooter />
      </Sections>
    </main>
  );
}
