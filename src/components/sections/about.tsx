import { GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { ABOUT_TEXT } from "@/lib/resume-data";
import { siteConfig } from "@/lib/constants";

const FACTS = [
  { icon: MapPin, label: "Based in", value: siteConfig.location },
  { icon: GraduationCap, label: "Studying", value: "B.IT (Computer Forensics), UNIRAZAK" },
  { icon: ShieldCheck, label: "Certified", value: "CompTIA Security+" },
];

export function About() {
  return (
    <section id="about" className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="About" title="A bit about my path into IT" />

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5 text-balance leading-relaxed text-muted-foreground">
            {ABOUT_TEXT.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/50 p-5"
              >
                <div className="rounded-xl bg-brand/10 p-2.5 text-brand">
                  <fact.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {fact.label}
                  </p>
                  <p className="font-medium">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
