import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectCover from "@/components/ProjectCover";
import SiteFooter from "@/components/SiteFooter";
import { PROJECTS, getProject, neighbours } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p ? `${p.title} — Tyler Lange` : "Work — Tyler Lange" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { prev, next } = neighbours(slug);

  return (
    <main className="page">
      <article>
        <header className="container project-head">
          <Link href="/work/" className="back">← All work</Link>
          <h1 className="project-title">{project.title}</h1>
          <p className="project-tagline">{project.tagline}</p>
        </header>

        <section className="container">
          <ProjectCover project={project} large />
        </section>

        <section className="container project-meta">
          <div>
            <p className="label">Category</p>
            <p>{project.category}</p>
          </div>
          <div>
            <p className="label">Year</p>
            <p>{project.year}</p>
          </div>
          <div>
            <p className="label">Role</p>
            <p>{project.role}</p>
          </div>
          <div>
            <p className="label">Tools</p>
            <p>Figma</p>
          </div>
        </section>

        {/* Template sections: replace the copy and gallery as case studies are written. */}
        <section className="container split">
          <p className="label">Overview</p>
          <p className="about-p">
            Case study coming soon. This page is a template: swap in the story behind {project.title}, the problem it set out to solve, and what changed because of it.
          </p>
        </section>

        <section className="container split">
          <p className="label">Approach</p>
          <p className="about-p">
            Research, key decisions, and the design process, with plenty of room for sketches, flows and screens below.
          </p>
        </section>

        <section className="container gallery">
          <ProjectCover project={project} />
          <ProjectCover project={project} />
          <ProjectCover project={project} large />
        </section>

        <section className="container split">
          <p className="label">Outcome</p>
          <p className="about-p">Results, learnings, and what came next.</p>
        </section>
      </article>

      <nav className="container pager" aria-label="More work">
        <Link href={`/work/${prev.slug}/`}>
          <span className="label">Previous</span>
          <span className="pager-title">← {prev.title}</span>
        </Link>
        <Link href={`/work/${next.slug}/`} className="pager-next">
          <span className="label">Next</span>
          <span className="pager-title">{next.title} →</span>
        </Link>
      </nav>
      <SiteFooter />
    </main>
  );
}
