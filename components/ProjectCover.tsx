import type { Project } from "@/lib/projects";

/** Placeholder cover art: swap for a real <Image> once you have project shots. */
export default function ProjectCover({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div
      className={`cover${large ? " cover-large" : ""}`}
      style={{ background: project.bg, color: project.fg }}
      role="img"
      aria-label={`${project.title} cover`}
    >
      <span className="cover-title">{project.title}</span>
    </div>
  );
}
