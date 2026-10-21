import type { Metadata } from "next";
import { ResumeActions } from "@/components/sections/resume-actions";
import {
  getCertificates,
  getEducation,
  getExperience,
  getResumeUrl,
  getSkillCategories,
} from "@/lib/queries";
import { getLocalResumeUrl } from "@/lib/local-assets";
import { formatCertDate, formatDateRange, formatYearRange } from "@/lib/format";
import { publishedCaseStudies } from "@/lib/project-registry";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${siteConfig.name}: IT support, networking, cybersecurity and computer forensics. Download the PDF or print this page.`,
  alternates: { canonical: "/resume" },
};

/** Summary sentences are drawn only from facts already stated on the resume and About section. */
const SUMMARY =
  "IT student completing a Bachelor of Information Technology (Computer Forensics, CGPA 3.85) at UNIRAZAK, with hands-on experience in IT helpdesk support, building-automation systems and field technical support, plus a CompTIA Security+ certification. Built BocorCheck, an OSINT-based personal-data-exposure monitoring system, as a final year project. Currently undergoing industrial training to build on infrastructure, networking and security fundamentals.";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 border-b border-border/60 pb-1 text-xs print:mb-1.5 print:pb-0.5 font-semibold uppercase tracking-widest text-brand print:text-black">
    {children}
  </h3>
);

export default async function ResumePage() {
  const [experience, education, skillCategories, certificates, remoteResumeUrl] = await Promise.all([
    getExperience(),
    getEducation(),
    getSkillCategories(),
    getCertificates(),
    getResumeUrl(),
  ]);
  const pdfUrl = remoteResumeUrl ?? getLocalResumeUrl();
  const projects = publishedCaseStudies().slice(0, 3);
  const githubLabel = siteConfig.links.github.replace("https://", "");
  const linkedinLabel = siteConfig.links.linkedin.replace("https://www.", "").replace(/\/$/, "");

  return (
    <div className="container-page section-y max-w-3xl print:max-w-none print:p-0! print:py-0!">
      <div className="mb-10 flex flex-col items-center gap-4 text-center print:hidden">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Resume</h1>
        <p className="max-w-xl text-muted-foreground">
          The same content as the site, laid out for recruiters and applicant-tracking systems. Download the PDF or print this
          page.
        </p>
        <ResumeActions pdfUrl={pdfUrl} />
      </div>

      <article className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10 print:rounded-none print:border-none print:bg-transparent print:p-0 print:text-[10pt] print:leading-tight">
        <header className="mb-6 text-center print:mb-2">
          <h2 className="text-2xl font-semibold">{siteConfig.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground print:text-black">
            {siteConfig.location} • {siteConfig.phone} •{" "}
            <a href={siteConfig.links.email} className="underline-offset-2 hover:underline">
              {siteConfig.email}
            </a>
          </p>
          <p className="text-sm text-muted-foreground print:text-black">
            <a href={siteConfig.links.github} className="underline-offset-2 hover:underline">
              {githubLabel}
            </a>{" "}
            •{" "}
            <a href={siteConfig.links.linkedin} className="underline-offset-2 hover:underline">
              {linkedinLabel}
            </a>
          </p>
        </header>

        <section className="mb-6 print:mb-2">
          <SectionTitle>Professional summary</SectionTitle>
          <p className="text-sm leading-relaxed text-muted-foreground print:text-black">{SUMMARY}</p>
        </section>

        <section className="mb-6 print:mb-2">
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-5 print:space-y-1.5">
            {experience.map((job) => (
              <div key={job.id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <p className="font-medium">{job.role}</p>
                  <span className="text-xs text-muted-foreground print:text-black">
                    {formatDateRange(job.start_date, job.end_date, job.is_current)}
                  </span>
                </div>
                <p className="mb-1.5 text-sm text-muted-foreground print:text-black">
                  {job.company}
                  {job.location ? `, ${job.location}` : ""}
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground print:space-y-0 print:text-black">
                  {job.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 break-inside-avoid print:mb-2">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-3 print:space-y-1">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-1">
                <div>
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground print:text-black">
                    {edu.credential}
                    {edu.field ? ` — ${edu.field}` : ""}
                  </p>
                  {edu.score && <p className="text-sm text-muted-foreground print:text-black">{edu.score}</p>}
                </div>
                <span className="text-xs text-muted-foreground print:text-black">
                  {formatYearRange(edu.start_date, edu.end_date)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {certificates.length > 0 && (
          <section className="mb-6 break-inside-avoid print:mb-2">
            <SectionTitle>Certifications</SectionTitle>
            <ul className="space-y-1 text-sm">
              {certificates.map((cert) => (
                <li key={cert.id}>
                  <span className="font-medium">{cert.title}</span>
                  <span className="text-muted-foreground print:text-black">
                    {cert.issuer ? ` — ${cert.issuer}` : ""}
                    {cert.issue_date ? ` (${formatCertDate(cert.issue_date)})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-6 break-inside-avoid print:mb-2">
          <SectionTitle>Technical skills</SectionTitle>
          <div className="space-y-2 text-sm">
            {skillCategories.map((category) => (
              <p key={category.id}>
                <span className="font-medium">{category.name}:</span>{" "}
                <span className="text-muted-foreground print:text-black">
                  {category.skills.map((s) => s.name).join(", ")}
                </span>
              </p>
            ))}
          </div>
        </section>

        <section className="mb-6 break-inside-avoid print:mb-2">
          <SectionTitle>Languages</SectionTitle>
          <p className="text-sm text-muted-foreground print:text-black">
            Bahasa Malaysia (Native) • English (Professional Writing, Conversational Speaking)
          </p>
        </section>

        <section className="break-inside-avoid">
          <SectionTitle>Selected projects</SectionTitle>
          <ul className="space-y-3 text-sm print:space-y-1.5">
            {projects.map((project) => (
              <li key={project.slug}>
                <p>
                  <span className="font-medium">{project.title}</span>
                  <span className="text-muted-foreground print:text-black"> — {project.status}</span>
                </p>
                <p className="text-muted-foreground print:hidden">{project.summary}</p>
                <p className="text-xs text-muted-foreground print:text-black">
                  {project.stack.join(", ")}
                  {project.repoUrl ? ` • ${project.repoUrl.replace("https://", "")}` : " • Private repository"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
