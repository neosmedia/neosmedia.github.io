import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import ProjectCover from "./ProjectCover";

export default function ProjectGrid() {
  return (
    <ul className="grid">
      {PROJECTS.map((p) => (
        <li key={p.slug}>
          <Link href={`/work/${p.slug}/`} className="card">
            <ProjectCover project={p} />
            <div className="card-meta">
              <span className="card-title">{p.title}</span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </div>
            <p className="card-sub">
              {p.tagline} · {p.category}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
