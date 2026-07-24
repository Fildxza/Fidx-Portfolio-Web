import { Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { getExperience } from "@/lib/queries";
import { formatDateRange } from "@/lib/format";

export async function Experience() {
  const experience = await getExperience();

  return (
    <section id="experience" className="section-y bg-muted/30">
      <div className="container-page">
        <SectionHeading
          eyebrow="Experience"
          title="Where I've worked"
          description="From field technical support to internal IT helpdesk operations."
        />

        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 hidden w-px bg-border sm:block"
          />

          <ol className="flex flex-col gap-10">
            {experience.map((job) => (
              <li key={job.id} className="relative flex gap-6">
                <div className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-brand">
                  <Briefcase className="size-4.5" />
                </div>

                <div className="flex-1 rounded-2xl border border-border/60 bg-card/50 p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-semibold">{job.role}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDateRange(job.start_date, job.end_date, job.is_current)}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-brand">{job.company}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {job.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
