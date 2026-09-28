import { Trophy } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { getAchievements } from "@/lib/queries";
import { formatMonthYear } from "@/lib/format";

export async function Achievements() {
  const achievements = await getAchievements();
  if (achievements.length === 0) return null;

  return (
    <section id="achievements" className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="Achievements" title="Recognition along the way" />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Trophy className="size-5" />
              </div>
              <div>
                <h3 className="font-medium">{achievement.title}</h3>
                {achievement.description && (
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                )}
                {achievement.date && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatMonthYear(achievement.date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
