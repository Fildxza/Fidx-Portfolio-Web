import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, Lock } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import { ArchitectureFlow } from "@/components/sections/architecture-flow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCaseStudy,
  publishedCaseStudies,
  type FeatureStatus,
} from "@/lib/project-registry";
import { siteConfig } from "@/lib/constants";

type Params = { slug: string };

// Only slugs in the registry exist; anything else is a plain 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedCaseStudies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Project not found" };
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/projects/${study.slug}` },
    openGraph: { title: `${study.title} — ${siteConfig.shortName}`, description: study.summary, type: "article" },
  };
}

const STATUS_STYLE: Record<FeatureStatus, { label: string; className: string }> = {
  implemented: { label: "Implemented", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  prototype: { label: "Prototype", className: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  experimental: { label: "Experimental", className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  planned: { label: "Planned", className: "border-border bg-muted text-muted-foreground" },
  conceptual: { label: "Conceptual", className: "border-border bg-muted text-muted-foreground" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/60 py-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-brand">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const all = publishedCaseStudies();
  const index = all.findIndex((c) => c.slug === study.slug);
  const next = all[(index + 1) % all.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": study.repoUrl ? "SoftwareSourceCode" : "CreativeWork",
    name: study.title,
    description: study.summary,
    author: { "@type": "Person", name: siteConfig.name },
    ...(study.repoUrl ? { codeRepository: study.repoUrl } : {}),
    keywords: study.stack.join(", "),
  };

  return (
    <div className="container-page section-y">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/#projects"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to projects
      </Link>

      <article className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-widest text-brand">
            Case study · {study.categories.join(" · ")}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{study.title}</h1>
          <p className="text-lg text-muted-foreground">{study.summary}</p>

          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 text-sm sm:grid-cols-4">
            {[
              ["Status", study.status],
              ["Repository", study.visibility === "private" ? "Private" : "Public"],
              ["Owner", study.repoOwner],
              ["My role", study.contributionType === "owner" ? "Repository owner" : "Collaborator"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3">
            {study.repoUrl ? (
              <a
                href={study.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "rounded-full")}
              >
                <GithubIcon className="size-4" />
                View repository
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" />
                Source is private
              </span>
            )}
            {study.liveUrl && (
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
              >
                Live demo
              </a>
            )}
            {study.relatedLab && (
              <Link href="/#labs" className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}>
                {study.relatedLab.label}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </header>

        <Section title="Overview">
          <p className="text-sm leading-relaxed text-muted-foreground">{study.overview}</p>
        </Section>

        <Section title="The problem">
          <p className="text-sm leading-relaxed text-muted-foreground">{study.problem}</p>
        </Section>

        <Section title="Intended users">
          <BulletList items={study.audience} />
        </Section>

        <Section title="My contribution">
          <p className="text-sm leading-relaxed text-muted-foreground">{study.contribution}</p>
        </Section>

        <Section title="Architecture">
          <ArchitectureFlow nodes={study.architecture.nodes} caption={study.architecture.caption} />
        </Section>

        {study.decisions.length > 0 && (
          <Section title="Design decisions">
            <BulletList items={study.decisions} />
          </Section>
        )}

        <Section title="Technology stack">
          <ul className="flex flex-wrap gap-2">
            {study.stack.map((tech) => (
              <li key={tech} className="rounded-full border border-border/70 bg-card/50 px-3 py-1 text-xs">
                {tech}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Features and their status">
          <ul className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/50">
            {study.features.map((f) => {
              const style = STATUS_STYLE[f.status];
              return (
                <li key={f.name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    {f.detail && <p className="text-xs text-muted-foreground">{f.detail}</p>}
                  </div>
                  <span className={`w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium ${style.className}`}>
                    {style.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        {study.security.length > 0 && (
          <Section title="Security and privacy">
            <BulletList items={study.security} />
          </Section>
        )}

        {study.limitations.length > 0 && (
          <Section title="Known limitations">
            <BulletList items={study.limitations} />
          </Section>
        )}

        {study.future.length > 0 && (
          <Section title="Future development">
            <BulletList items={study.future} />
          </Section>
        )}

        <aside className="mt-4 flex gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <p>
              <span className="font-semibold text-foreground">How this page was verified. </span>
              {study.evidence}
            </p>
        </aside>

        <nav aria-label="Next case study" className="mt-10 border-t border-border/60 pt-6">
          <Link
            href={`/projects/${next.slug}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 transition-colors hover:border-brand/40"
          >
            <span>
              <span className="block text-xs text-muted-foreground">Next case study</span>
              <span className="font-medium">{next.title}</span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </nav>
      </article>
    </div>
  );
}
