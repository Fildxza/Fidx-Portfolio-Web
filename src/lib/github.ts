import { siteConfig } from "@/lib/constants";
import type { GithubRepo, GithubStats } from "@/lib/types";

const GITHUB_API = "https://api.github.com";

export type GithubActivityEvent = {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  commitCount: number;
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

export async function getGithubRepos(
  username: string = siteConfig.githubUsername
): Promise<GithubRepo[]> {
  try {
    const [reposRes, pinnedNames] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, {
        headers: authHeaders(),
        next: { revalidate: 3600 },
      }),
      fetchPinnedRepoNames(username),
    ]);

    if (!reposRes.ok) return [];

    const repos = (await reposRes.json()) as GithubRepo[];
    const pinnedSet = new Set(pinnedNames);

    const visible = repos
      .filter((r) => !r.fork && !r.archived)
      .map((r) => ({ ...r, pinned: pinnedSet.has(r.name) }));

    visible.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });

    return visible;
  } catch {
    return [];
  }
}

export async function getGithubStats(
  username: string = siteConfig.githubUsername
): Promise<GithubStats | null> {
  try {
    const [userRes, repos] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}`, {
        headers: authHeaders(),
        next: { revalidate: 3600 },
      }),
      getGithubRepos(username),
    ]);

    if (!userRes.ok) return null;
    const user = await userRes.json();

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    const languageCounts = new Map<string, number>();
    for (const repo of repos) {
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
      publicRepos: user.public_repos ?? repos.length,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
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

    return events
      .filter((e: { type: string }) => e.type === "PushEvent")
      .slice(0, 5)
      .map((e: {
        id: string;
        repo: { name: string };
        created_at: string;
        payload: { commits?: { message: string }[] };
      }) => ({
        id: e.id,
        type: "PushEvent",
        repoName: e.repo.name,
        repoUrl: `https://github.com/${e.repo.name}`,
        createdAt: e.created_at,
        commitCount: e.payload.commits?.length ?? 0,
        message: e.payload.commits?.[e.payload.commits.length - 1]?.message ?? null,
      }));
  } catch {
    return [];
  }
}
