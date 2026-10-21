import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BookMarked, GitCommitHorizontal, Star, Users } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { CountUp } from "@/components/shared/count-up";
import { LanguageDonut } from "@/components/sections/language-donut";
import { getGithubStats, getRecentActivity } from "@/lib/github";
import { siteConfig } from "@/lib/constants";

export async function GithubActivity() {
  const [stats, activity] = await Promise.all([getGithubStats(), getRecentActivity()]);

  if (!stats) return null;

  // Metrics GitHub did not return are left out entirely rather than shown as 0.
  const statItems = [
    { icon: BookMarked, label: "Public Repos", value: stats.publicRepos },
    { icon: Star, label: "Stars on Own Repos", value: stats.totalStars },
    { icon: Users, label: "Followers", value: stats.followers },
  ].filter((s): s is typeof s & { value: number } => s.value !== null);

  return (
    <section id="github" className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="GitHub"
          title="Live from GitHub"
          description="Pulled from the public GitHub API and refreshed hourly. Private repositories and activity are never shown."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {statItems.length > 0 && (
            <StaggerGroup className="lg:col-span-3">
              {/* Column count follows however many metrics were actually available. */}
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${statItems.length}, minmax(0, 1fr))` }}
              >
                {statItems.map((stat) => (
                  <StaggerItem
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card/50 p-5 text-center"
                  >
                    <stat.icon className="mx-auto mb-2 size-5 text-brand" aria-hidden="true" />
                    <p className="text-2xl font-semibold">
                      <CountUp value={stat.value} />
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          )}

          {stats.topLanguages.length > 0 && (
            <Reveal className="rounded-2xl border border-border/60 bg-card/50 p-6 lg:col-span-2">
              <h3 className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Primary Languages
              </h3>
              <p className="mb-5 text-xs text-muted-foreground">
                Counted by each repository&apos;s main language — not lines of code.
              </p>
              <LanguageDonut languages={stats.topLanguages} />
            </Reveal>
          )}

          <Reveal delay={0.1} className="rounded-2xl border border-border/60 bg-card/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Recent Activity
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent public activity found.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((event) => (
                  <li key={event.id} className="flex gap-3 text-sm">
                    <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
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
                        {event.pushCount > 1 ? `${event.pushCount} pushes · latest ` : "Pushed "}
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
