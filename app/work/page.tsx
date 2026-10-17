import ProjectGrid from "@/components/ProjectGrid";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <main className="page">
      <section className="container page-head">
        <h1 className="page-title">Work</h1>
        <p className="page-lede">Eight ideas, made real.</p>
      </section>
      <section className="container works">
        <ProjectGrid />
      </section>
      <SiteFooter />
    </main>
  );
}
