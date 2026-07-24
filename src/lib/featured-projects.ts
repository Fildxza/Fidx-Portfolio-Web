import { FEATURED_REPO_ORDER } from "@/lib/constants";
import type { FeaturedProject, GithubRepo, Project } from "@/lib/types";

/**
 * Builds the curated Featured Projects list in exact FEATURED_REPO_ORDER,
 * preferring live GitHub data (stars, last updated, language) and falling
 * back to manual/admin-authored content for repos that are private or not
 * yet pushed. Repos with no live data AND no manual entry are skipped.
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

    if (!liveRepo && !manual) continue;

    if (liveRepo) {
      projects.push({
        key: name,
        title: manual?.title ?? liveRepo.name,
        description: manual?.description ?? liveRepo.description ?? "No description provided.",
        techStack:
          manual?.tech_stack && manual.tech_stack.length > 0
            ? manual.tech_stack
            : [liveRepo.language, ...liveRepo.topics].filter((v): v is string => Boolean(v)),
        repoUrl: liveRepo.html_url,
        liveUrl: manual?.live_url ?? liveRepo.homepage ?? null,
        imageUrl: manual?.image_url ?? null,
        stars: liveRepo.stargazers_count,
        lastUpdated: liveRepo.pushed_at,
        isPrivate: false,
      });
    } else if (manual) {
      projects.push({
        key: name,
        title: manual.title,
        description: manual.description,
        techStack: manual.tech_stack,
        repoUrl: manual.repo_url,
        liveUrl: manual.live_url,
        imageUrl: manual.image_url,
        stars: null,
        lastUpdated: null,
        isPrivate: true,
      });
    }
  }

  return projects;
}

export function getOtherRepos(repos: GithubRepo[]): GithubRepo[] {
  const featuredNames = new Set(FEATURED_REPO_ORDER.map((n) => n.toLowerCase()));
  return repos.filter((r) => !featuredNames.has(r.name.toLowerCase()));
}
