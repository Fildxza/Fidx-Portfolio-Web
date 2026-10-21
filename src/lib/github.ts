import { EXTRA_GITHUB_REPOS, siteConfig } from "@/lib/constants";
import type { GithubRepo, GithubStats } from "@/lib/types";

const GITHUB_API = "https://api.github.com";

export type GithubActivityEvent = {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  pushCount: number;
  message: string | null;
};

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchPinnedRepoNames(username: string): Promise<string[]> {
  const token = process.env.GITHUB_TOKEN;
  // GitHub's GraphQL API (the only way to read pinned repos) always requires auth.
  if (!token) return [];

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($login: String!) {
            user(login: $login) {
              pinnedItems(first: 6, types: [REPOSITORY]) {
                nodes {
                  ... on Repository {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: { login: username },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const json = await res.json();
    const nodes = json?.data?.user?.pinnedItems?.nodes ?? [];
    return nodes.map((n: { name: string }) => n.name);
  } catch {
    return [];
  }
}

const MAX_REPO_PAGES = 5;

/**
 * Fetches every public repo for the user, following pagination. Returns null
 * (not an empty list) when GitHub could not be reached or rate-limited us, so
 * callers can tell "no repos" apart from "no data" instead of showing zeros.
 */
async function fetchAllRepos(username: string): Promise<GithubRepo[] | null> {
  const all: GithubRepo[] = [];
  try {
    for (let page = 1; page <= MAX_REPO_PAGES; page++) {
      const res = await fetch(
        `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated&page=${page}`,
        { headers: authHeaders(), next: { revalidate: 3600 } }
      );
      if (!res.ok) return page === 1 ? null : all;
      const batch = (await res.json()) as GithubRepo[];
      if (!Array.isArray(batch)) return page === 1 ? null : all;
      all.push(...batch);
      if (batch.length < 100) break;
    }
    return all;
  } catch {
    return all.length > 0 ? all : null;
  }
}

/** Single-repo lookup for EXTRA_GITHUB_REPOS; null if it is private, missing or unreachable. */
async function fetchExtraRepo(owner: string, name: string): Promise<GithubRepo | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
      headers: authHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const repo = (await res.json()) as GithubRepo & { private?: boolean };
    return repo.private ? null : repo;
  } catch {
    return null;
  }
}

export async function getGithubRepos(
  username: string = siteConfig.githubUsername
): Promise<GithubRepo[]> {
  const [repos, pinnedNames, extraRepos] = await Promise.all([
    fetchAllRepos(username),
    fetchPinnedRepoNames(username),
    Promise.all(EXTRA_GITHUB_REPOS.map((r) => fetchExtraRepo(r.owner, r.name))),
  ]);
  if (!repos) return [];

  const pinnedSet = new Set(pinnedNames);
  const visible = [...repos, ...extraRepos.filter((r): r is GithubRepo => r !== null)]
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({ ...r, pinned: pinnedSet.has(r.name) }));

  visible.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
  });

  return visible;
}

export async function getGithubStats(
  username: string = siteConfig.githubUsername
): Promise<GithubStats | null> {
  try {
    const [userRes, allRepos] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}`, {
        headers: authHeaders(),
        next: { revalidate: 3600 },
      }),
      fetchAllRepos(username),
    ]);

    if (!userRes.ok) return null;
    const user = await userRes.json();

    // Stars/languages are derived from the repo list; if that request failed
    // they are reported as unavailable (null) rather than as a misleading 0.
    const repos = allRepos?.filter((r) => !r.fork && !r.archived) ?? null;

    const totalStars = repos ? repos.reduce((sum, r) => sum + r.stargazers_count, 0) : null;
    const totalForks = repos ? repos.reduce((sum, r) => sum + r.forks_count, 0) : null;

    const languageCounts = new Map<string, number>();
    for (const repo of repos ?? []) {
      if (!repo.language) continue;
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }

    const totalWithLanguage = Array.from(languageCounts.values()).reduce((a, b) => a + b, 0);
    const topLanguages = Array.from(languageCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalWithLanguage ? Math.round((count / totalWithLanguage) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      publicRepos: typeof user.public_repos === "number" ? user.public_repos : null,
      followers: typeof user.followers === "number" ? user.followers : null,
      following: typeof user.following === "number" ? user.following : null,
      totalStars,
      totalForks,
      topLanguages,
    };
  } catch {
    return null;
  }
}

export async function getRecentActivity(
  username: string = siteConfig.githubUsername
): Promise<GithubActivityEvent[]> {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/events/public?per_page=30`, {
      headers: authHeaders(),
      next: { revalidate: 900 },
    });

    if (!res.ok) return [];
    const events = await res.json();

    // Collapse repeated pushes to the same repo into one row (newest first).
    const byRepo = new Map<string, GithubActivityEvent>();
    for (const e of events as {
      id: string;
      type: string;
      repo: { name: string };
      created_at: string;
      payload: { commits?: { message: string }[] };
    }[]) {
      if (e.type !== "PushEvent") continue;
      const existing = byRepo.get(e.repo.name);
      if (existing) {
        existing.pushCount += 1;
        continue;
      }
      byRepo.set(e.repo.name, {
        id: e.id,
        type: "PushEvent",
        repoName: e.repo.name,
        repoUrl: `https://github.com/${e.repo.name}`,
        createdAt: e.created_at,
        pushCount: 1,
        // GitHub's public events feed often omits commit messages; show one only when present.
        message: e.payload.commits?.[e.payload.commits.length - 1]?.message ?? null,
      });
    }
    return Array.from(byRepo.values()).slice(0, 5);
  } catch {
    return [];
  }
}
