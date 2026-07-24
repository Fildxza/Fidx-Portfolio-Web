import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Lock, Star } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import { Badge } from "@/components/ui/badge";
import type { FeaturedProject } from "@/lib/types";

export function ProjectCard({ project }: { project: FeaturedProject }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-brand/15 to-transparent">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-brand/30">
            {project.title.slice(0, 2).toUpperCase()}
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
                <Star className="size-3" /> {project.stars}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
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
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
