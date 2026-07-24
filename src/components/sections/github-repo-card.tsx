import Link from "next/link";
import { ExternalLink, Pin, Star, GitFork } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import type { GithubRepo } from "@/lib/types";

export function GithubRepoCard({ repo }: { repo: GithubRepo }) {
  return (
    <Link
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <GithubIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{repo.name}</span>
        </div>
        {repo.pinned && <Pin className="size-3.5 shrink-0 text-brand" />}
      </div>

      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {repo.description ?? "No description provided."}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand" />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="size-3.5" /> {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="size-3.5" /> {repo.forks_count}
        </span>
        {repo.homepage && (
          <span className="ml-auto flex items-center gap-1 text-brand">
            <ExternalLink className="size-3.5" /> Live
          </span>
        )}
      </div>
    </Link>
  );
}
