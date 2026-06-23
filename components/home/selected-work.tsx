import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/content/projects";

type Props = {
  projects: Project[];
  lang: Locale;
  eyebrow: string;
};

const STATUS_WORD: Record<Project["visibility"], string> = {
  public: "public",
  live: "live",
  private: "private",
};

function linkHints(links: Project["links"]): string[] {
  const hints: string[] = [];
  if (links.live) hints.push("talk to agent ↗");
  if (links.demo) hints.push("live demo ↗");
  if (links.repo) hints.push("repo ↗");
  return hints;
}

export function SelectedWork({ projects, lang, eyebrow }: Props) {
  return (
    <section id="work" className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">{eyebrow}</p>

      <div className="mt-8 border-b border-hairline">
        {projects.map((project, i) => {
          const index = String(i + 1).padStart(2, "0");
          const meta = [
            ...project.tags.slice(0, 2),
            STATUS_WORD[project.visibility],
            ...linkHints(project.links),
          ];
          return (
            <Link
              key={project.id}
              href={`/${lang}/work/${project.id}`}
              className={`grid grid-cols-1 gap-x-6 gap-y-3 border-t border-hairline transition-[padding] hover:pl-2 md:grid-cols-[3rem_1fr_auto] ${
                project.flagship ? "py-8 md:py-10" : "py-6"
              }`}
            >
              <span className="font-mono text-sm text-ink-subtle">{index}</span>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3
                    className={`tracking-tight text-ink ${
                      project.flagship ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
                    }`}
                  >
                    {project.name}
                  </h3>
                  {project.flagship ? (
                    <span className="font-mono text-xs text-accent">FLAGSHIP</span>
                  ) : null}
                </div>
                <p className="max-w-prose text-ink-muted">{project.summary[lang]}</p>
              </div>

              <p className="font-mono text-xs text-ink-subtle md:text-right">
                {meta.join(" · ")}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
