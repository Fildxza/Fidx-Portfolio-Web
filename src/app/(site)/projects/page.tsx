import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GithubRepoCard } from "@/components/sections/github-repo-card";
import { getGithubRepos } from "@/lib/github";
import { getOtherRepos } from "@/lib/featured-projects";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "More Projects",
  description: `Every public GitHub repository from ${siteConfig.name}.`,
};

export default async function MoreProjectsPage() {
  const repos = await getGithubRepos();
  const otherRepos = getOtherRepos(repos);

  return (
    <div className="container-page section-y">
      <Link
        href="/#projects"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Featured Projects
      </Link>

      <div className="mb-12 flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-widest text-brand">
          More Projects
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Every repository, straight from GitHub
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Beyond the featured work, here&apos;s everything else that&apos;s public on{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2"
          >
            github.com/{siteConfig.githubUsername}
          </a>
          .
        </p>
      </div>

      {otherRepos.length === 0 ? (
        <p className="text-muted-foreground">No additional public repositories right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherRepos.map((repo) => (
            <GithubRepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
