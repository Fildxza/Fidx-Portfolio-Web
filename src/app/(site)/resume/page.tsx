import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEducation, getExperience, getResumeUrl, getSkillCategories } from "@/lib/queries";
import { getLocalResumeUrl } from "@/lib/local-assets";
import { formatDateRange, formatYearRange } from "@/lib/format";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resume",
  description: `View and download the resume of ${siteConfig.name}.`,
};

export default async function ResumePage() {
  const [experience, education, skillCategories, remoteResumeUrl] = await Promise.all([
    getExperience(),
    getEducation(),
    getSkillCategories(),
    getResumeUrl(),
  ]);
  const resumeUrl = remoteResumeUrl ?? getLocalResumeUrl();

  return (
    <div className="container-page section-y max-w-3xl print:py-0">
      <div className="mb-10 flex flex-col items-center gap-4 text-center print:hidden">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Resume</h1>
        <p className="max-w-xl text-muted-foreground">
          The latest version of my resume, always in sync with what&apos;s shown on this site.
        </p>
        <Button
          render={<a href={resumeUrl ?? "#"} download aria-disabled={!resumeUrl} />}
          size="lg"
          className="rounded-full"
        >
          <Download className="size-4" />
          Download PDF
        </Button>
        {!resumeUrl && (
          <p className="text-xs text-muted-foreground">
            No PDF uploaded yet — add one from the Admin Dashboard to enable downloads.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10 print:rounded-none print:border-none print:p-0">
        <header className="mb-8 border-b border-border/60 pb-6 text-center">
          <h2 className="text-2xl font-semibold">{siteConfig.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {siteConfig.location} • {siteConfig.phone} • {siteConfig.email}
          </p>
        </header>

        <section className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
            Experience
          </h3>
          <div className="space-y-6">
            {experience.map((job) => (
              <div key={job.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <p className="font-medium">{job.role}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDateRange(job.start_date, job.end_date, job.is_current)}
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{job.company}</p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {job.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
            Education
          </h3>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-1">
                <div>
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.credential}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatYearRange(edu.start_date, edu.end_date)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand">
            Technical Skills
          </h3>
          <div className="space-y-3 text-sm">
            {skillCategories.map((category) => (
              <p key={category.id}>
                <span className="font-medium">{category.name}:</span>{" "}
                <span className="text-muted-foreground">
                  {category.skills.map((s) => s.name).join(", ")}
                </span>
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
