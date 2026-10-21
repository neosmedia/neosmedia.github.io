import Link from "next/link";
import { notFound } from "next/navigation";
import { Sections } from "@/components/HomeSections";
import SiteFooter from "@/components/SiteFooter";
import { CASE_STUDY_AI, CASE_STUDY_DETAILS, CASE_STUDY_HEADINGS, CASE_STUDY_PARAGRAPHS } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { NAME, SITE_URL } from "@/lib/site";
import { PROJECTS, getProject, neighbours } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Work" };
  return pageMeta({
    title: `${p.title} case study`,
    description: `${p.title}: ${p.subtitle ?? "product design case study"}. A product design and UX case study by Tyler Lange.`,
    path: `/work/${p.slug}/`,
    image: p.image,
    type: "article",
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { prev, next } = neighbours(slug);
  const st = project.study;
  const details = st ? [{ label: "Role", value: st.role }, { label: "Year", value: st.year }] : CASE_STUDY_DETAILS;
  const headings = st?.headings ?? CASE_STUDY_HEADINGS;
  const paragraphs = st?.paragraphs ?? CASE_STUDY_PARAGRAPHS;
  const ai = st?.ai ?? CASE_STUDY_AI;
  const coverSrc = project.cover ?? project.image;
  const url = `${SITE_URL}/work/${project.slug}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: `${project.title} case study`,
        description: project.subtitle,
        url,
        image: coverSrc ? `${SITE_URL}${coverSrc}` : undefined,
        creator: { "@id": `${SITE_URL}/#person` },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: NAME, item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/work/` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Sections page>
        <div className="container back-row">
          <Link href="/work/" className="btn btn-outline back-btn">
            <span aria-hidden="true">←</span> All Work
          </Link>
        </div>
        <header className="container project-head">
          <h1 className="project-title">{project.title}</h1>
          {project.subtitle && <p className="project-sub">{project.subtitle}</p>}
        </header>

        <section className="container project-body">
          {project.gallery && !project.galleryBelow ? (
            <div className={`project-bento bento-n${project.gallery.length}`}>
              {project.gallery.map((src, i) => (
                <div key={src} className={`bento-tile bento-${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
                  <img src={src} alt={`${project.title} design ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
                </div>
              ))}
            </div>
          ) : (
            <div className="project-cover">
              {coverSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
                <img src={coverSrc} alt={`${project.title} design work`} decoding="async" />
              ) : (
                <span className="project-cover-name" aria-hidden="true">{project.title}</span>
              )}
            </div>
          )}

          {project.gallery && project.galleryBelow && (
            <div className={`project-bento bento-n${project.gallery.length}`}>
              {project.gallery.map((src, i) => (
                <div key={src} className={`bento-tile bento-${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
                  <img src={src} alt={`${project.title} design ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
                </div>
              ))}
            </div>
          )}

          {/* TODO: replace the placeholder details and copy (lib/site.ts CASE_STUDY_*) with real case-study content. */}
          <div className="project-cols">
          <div className="project-facts" aria-label="Project details">
            <span className="mono project-facts-label">Project details</span>
            <dl>
              <div>
                <dt className="mono">Client</dt>
                <dd>{project.title}</dd>
              </div>
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="mono">{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
            <a className="btn btn-outline" href={project.url} target="_blank" rel="noreferrer">
              Website <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="project-copy">
            {paragraphs.map((t, i) => (
              <section key={i}>
                {i === 0 ? <h2>{headings[i]}</h2> : <h3 className="h3">{headings[i]}</h3>}
                <p>{t}</p>
              </section>
            ))}
            <section>
              <h3 className="h3">How AI was used</h3>
              <p>{ai}</p>
            </section>
          </div>
          </div>
        </section>

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
      </Sections>
    </main>
  );
}
