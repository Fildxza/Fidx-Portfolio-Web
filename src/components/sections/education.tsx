import { GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { getEducation } from "@/lib/queries";
import { formatYearRange } from "@/lib/format";

export async function Education() {
  const education = await getEducation();

  return (
    <section id="education" className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="Education" title="Academic background" />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-brand/40"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <GraduationCap className="size-5" />
              </div>
              <h3 className="font-semibold leading-snug">{edu.institution}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{edu.credential}</p>
              {edu.field && (
                <p className="text-sm text-muted-foreground">{edu.field}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatYearRange(edu.start_date, edu.end_date)}
                </span>
                {edu.score && (
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 font-medium text-brand">
                    {edu.score}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
