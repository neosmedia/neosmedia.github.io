import { pageMeta, pageJsonLd } from "@/lib/seo";
import { WORK_LINKS, SITE_URL } from "@/lib/site";
import { Sections, PageHead, WorkGrid, Archive } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";

export const metadata = pageMeta({
  title: "Work: Product Design & UX Case Studies",
  description:
    "Selected product design and UX work by Tyler Lange, 2019 to 2026: AI analytics, industrial software, fintech and consumer apps.",
  path: "/work/",
});

const WORK_JSON_LD = pageJsonLd(
  "CollectionPage",
  "/work/",
  "Work: Product Design & UX Case Studies",
  "Selected product design and UX work by Tyler Lange.",
  {
    mainEntity: {
      "@type": "ItemList",
      itemListElement: WORK_LINKS.map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: w.title,
        url: `${SITE_URL}/work/${w.slug}/`,
      })),
    },
  }
);

export default function WorkPage() {
  return (
    <main className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WORK_JSON_LD) }} />
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
