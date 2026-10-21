import { FEATURED_REPO_ORDER } from "@/lib/constants";
import { getCaseStudyByRepo } from "@/lib/project-registry";
import type { FeaturedProject, GithubRepo, Project } from "@/lib/types";

/**
 * Builds the Featured Projects list in exact FEATURED_REPO_ORDER.
 *
 * Three sources are merged per project:
 *  - the curated case-study registry (narrative: summary, stack, status),
 *  - live GitHub data (stars, last push, repo URL) when the repo is public,
 *  - manual/admin content (image, live demo URL) as a fallback.
 * A repo with no live data, no registry entry and no manual entry is skipped.
 */
export function buildFeaturedProjects(
  manualProjects: Project[],
  repos: GithubRepo[]
): FeaturedProject[] {
  const projects: FeaturedProject[] = [];

  for (const name of FEATURED_REPO_ORDER) {
    const liveRepo = repos.find((r) => r.name.toLowerCase() === name.toLowerCase());
    const manual = manualProjects.find(
      (p) => p.github_repo_name?.toLowerCase() === name.toLowerCase()
    );
    const study = getCaseStudyByRepo(name);

    if (!liveRepo && !manual && !study) continue;

    // A repo that is not visible through the public API is treated as private,
    // and its URL is never linked (it would 404 for visitors). Making a repo public
    // on GitHub is therefore enough: no registry edit is needed.
    const isPrivate = !liveRepo;

    projects.push({
      key: name,
      title: study?.title ?? manual?.title ?? liveRepo?.name ?? name,
      description:
        study?.summary ?? manual?.description ?? liveRepo?.description ?? "No description provided.",
      techStack:
        study?.stack ??
        (manual?.tech_stack && manual.tech_stack.length > 0
          ? manual.tech_stack
          : [liveRepo?.language, ...(liveRepo?.topics ?? [])].filter((v): v is string => Boolean(v))),
      repoUrl: isPrivate ? null : (liveRepo?.html_url ?? manual?.repo_url ?? null),
      liveUrl: study?.liveUrl ?? manual?.live_url ?? liveRepo?.homepage ?? null,
      imageUrl: study?.cover?.src ?? manual?.image_url ?? null,
      stars: liveRepo ? liveRepo.stargazers_count : null,
      lastUpdated: liveRepo?.pushed_at ?? null,
      isPrivate,
      slug: study?.slug ?? null,
      categories: study?.categories ?? [],
      status: study?.status ?? null,
    });
  }

  return projects;
}

export function getOtherRepos(repos: GithubRepo[]): GithubRepo[] {
  const featuredNames = new Set(FEATURED_REPO_ORDER.map((n) => n.toLowerCase()));
  return repos.filter((r) => !featuredNames.has(r.name.toLowerCase()));
}
