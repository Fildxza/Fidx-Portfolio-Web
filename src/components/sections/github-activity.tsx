import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BookMarked, GitCommitHorizontal, Star, Users } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { CountUp } from "@/components/shared/count-up";
import { getGithubStats, getRecentActivity } from "@/lib/github";
import { getLanguageColor } from "@/lib/language-colors";
import { siteConfig } from "@/lib/constants";

const STAT_ICONS = {
  repos: BookMarked,
  stars: Star,
  followers: Users,
} as const;

export async function GithubActivity() {
  const [stats, activity] = await Promise.all([getGithubStats(), getRecentActivity()]);

  if (!stats) return null;

  const statItems = [
    { icon: STAT_ICONS.repos, label: "Public Repos", value: stats.publicRepos },
    { icon: STAT_ICONS.stars, label: "Total Stars", value: stats.totalStars },
    { icon: STAT_ICONS.followers, label: "Followers", value: stats.followers },
  ];

  const maxLanguageCount = Math.max(...stats.topLanguages.map((l) => l.count), 1);

  return (
    <section id="github" className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="GitHub"
          title="Live from GitHub"
          description="Pulled automatically from the GitHub API — updates whenever my repositories do."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <StaggerGroup className="grid grid-cols-3 gap-4 lg:col-span-3">
            {statItems.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="rounded-2xl border border-border/60 bg-card/50 p-5 text-center"
              >
                <stat.icon className="mx-auto mb-2 size-5 text-brand" />
                <p className="text-2xl font-semibold">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {stats.topLanguages.length > 0 && (
            <Reveal className="rounded-2xl border border-border/60 bg-card/50 p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Top Languages
              </h3>
              <div className="space-y-3">
                {stats.topLanguages.map((lang) => (
                  <div key={lang.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: getLanguageColor(lang.name) }}
                        />
                        {lang.name}
                      </span>
                      <span className="text-muted-foreground">{lang.count} repos</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(lang.count / maxLanguageCount) * 100}%`,
                          backgroundColor: getLanguageColor(lang.name),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.1} className="rounded-2xl border border-border/60 bg-card/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Recent Commits
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent public activity found.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((event) => (
                  <li key={event.id} className="flex gap-3 text-sm">
                    <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <Link
                        href={event.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-brand"
                      >
                        {event.repoName.split("/")[1]}
                      </Link>
                      {event.message && (
                        <p className="truncate text-muted-foreground">{event.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand hover:underline"
          >
            View full GitHub profile →
          </Link>
        </div>
      </div>
    </section>
  );
}
