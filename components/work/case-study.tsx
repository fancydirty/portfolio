import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Project, FiveSection } from "@/lib/content/projects";
import { diagramFor } from "@/components/diagrams/registry";

type WorkSlice = {
  backToWork: string;
  sections: {
    whatItIs: string;
    inputsOutputs: string;
    whatMadeItHard: string;
    whatIDecided: string;
    whatChanged: string;
  };
};

type Props = {
  project: Project;
  lang: Locale;
  work: WorkSlice;
};

const STATUS_WORD: Record<Project["visibility"], string> = {
  public: "public",
  live: "live",
  private: "private",
};

function linkLabel(kind: "repo" | "demo" | "live"): string {
  if (kind === "repo") return "repo ↗";
  if (kind === "demo") return "live demo ↗";
  return "live ↗";
}

const SECTION_ORDER: (keyof FiveSection)[] = [
  "whatItIs",
  "inputsOutputs",
  "whatMadeItHard",
  "whatIDecided",
  "whatChanged",
];

export function CaseStudy({ project, lang, work }: Props) {
  const statusLine = [STATUS_WORD[project.visibility], ...project.tags].join(" · ");
  const links = (["repo", "demo", "live"] as const).filter((k) => project.links[k]);
  const content = project.content[lang];
  const diagram = diagramFor(project.id);

  return (
    <article>
      <Link
        href={`/${lang}`}
        className="font-mono text-xs text-ink-subtle transition-colors hover:text-ink"
      >
        {work.backToWork}
      </Link>

      <header className="mt-8">
        <h1 className="text-4xl tracking-tight text-ink md:text-5xl">{project.name}</h1>
        <p className="mt-3 font-mono text-xs text-ink-subtle">{statusLine}</p>

        {links.length > 0 ? (
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
            {links.map((kind) => (
              <a
                key={kind}
                href={project.links[kind]}
                target="_blank"
                rel="noreferrer"
                className="text-accent transition-colors hover:text-ink"
              >
                {linkLabel(kind)}
              </a>
            ))}
          </p>
        ) : null}
      </header>

      {project.flagship && project.metrics ? (
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-hairline pt-6">
          {project.metrics.map((m) => (
            <div key={`${m.value}-${m.key}`} className="flex flex-col gap-1">
              <dt className="font-mono text-lg text-ink">{m.value}</dt>
              <dd className="text-sm text-ink-subtle">{m.key}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {diagram ? <div className="mt-12">{diagram}</div> : null}

      <div className="mt-12">
        {SECTION_ORDER.map((key) => (
          <section key={key} className="border-t border-hairline py-10 first:border-t-0">
            <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
              {work.sections[key]}
            </p>
            <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">{content[key]}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
