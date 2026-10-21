import Link from "next/link";
import { Award, Briefcase, FlaskConical, FolderGit2, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/shared/count-up";
import { getCertificates, getExperience } from "@/lib/queries";
import { publishedCaseStudies } from "@/lib/project-registry";

const LAB_COUNT = 4;

type Item = { icon: LucideIcon; label: string; href: string; value: number | string };

/** Recruiter-oriented snapshot. Every figure is counted from site data, never typed in by hand. */
export async function HeroGlance() {
  const [experience, certificates] = await Promise.all([getExperience(), getCertificates()]);

  const items: Item[] = [
    { icon: Briefcase, label: "Hands-on IT roles", href: "#experience", value: experience.length },
    { icon: FolderGit2, label: "Project case studies", href: "#projects", value: publishedCaseStudies().length },
    { icon: FlaskConical, label: "Interactive labs", href: "#labs", value: LAB_COUNT },
    {
      icon: Award,
      label: certificates.length === 1 ? "Certification" : "Certifications",
      href: "#certifications",
      value: certificates.length === 1 ? certificates[0].title : certificates.length,
    },
  ];

  return (
    <div className="container-page pb-16">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 motion-reduce:animate-none">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold leading-tight">
                    {typeof item.value === "number" ? <CountUp value={item.value} /> : item.value}
                  </span>
                  <span className="block text-xs text-muted-foreground">{item.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 hidden text-center text-xs text-muted-foreground lg:block">
          Tip: press <kbd className="rounded border border-border px-1.5 py-0.5 text-[0.7rem]">Ctrl</kbd>{" "}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[0.7rem]">K</kbd> to jump to any section or open a lab.
        </p>
      </div>
    </div>
  );
}
