import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ExternalLink, Lock, Star } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import { Badge } from "@/components/ui/badge";
import { ProjectThumb } from "@/components/sections/project-thumb";
import { getCaseStudy } from "@/lib/project-registry";
import type { FeaturedProject } from "@/lib/types";

export function ProjectCard({ project }: { project: FeaturedProject }) {
  const study = project.slug ? getCaseStudy(project.slug) : undefined;
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 border-t-2 border-t-transparent bg-card/50 transition-all hover:-translate-y-1 hover:border-brand/40 hover:border-t-brand hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-brand/15 to-transparent">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : study ? (
          <ProjectThumb nodes={study.architecture.nodes} category={project.categories[0]} />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-brand/30">
            {project.title.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {project.status && (
          <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {project.status}
          </div>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {project.isPrivate ? (
            <div className="flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
              <Lock className="size-3" /> Private
            </div>
          ) : (
            project.stars !== null && (
              <div className="flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
                <Star className="size-3 fill-brand text-brand" /> {project.stars}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {project.categories.length > 0 && (
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            {project.categories.join(" · ")}
          </p>
        )}
        <h3 className="font-semibold leading-snug">{project.title}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{project.description}</p>

        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="rounded-full font-normal">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {project.slug && (
          <Link
            href={`/projects/${project.slug}`}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Read case study
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}

        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4">
            {project.repoUrl && (
              <Link
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="size-4" /> Code
              </Link>
            )}
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-4" /> Live Demo
              </Link>
            )}
          </div>

          {project.lastUpdated && (
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
