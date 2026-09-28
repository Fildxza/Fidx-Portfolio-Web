import { Code2, Laptop, Network, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SkillBar, SkillCategoryCard } from "@/components/sections/skills-motion";
import { getSkillCategories } from "@/lib/queries";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "IT Support & Infrastructure": Laptop,
  Networking: Network,
  "Security & Forensics": ShieldCheck,
  Development: Code2,
};

export async function Skills() {
  const categories = await getSkillCategories();

  return (
    <section id="skills" className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="Skills" title="Tools & technologies I work with" />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.name] ?? Sparkles;
            return (
              <SkillCategoryCard key={category.id} index={index}>
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-wide text-brand">
                    {category.name}
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {category.skills.map((skill) => (
                    <div key={skill.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        {skill.proficiency !== null && (
                          <span className="text-xs text-muted-foreground">
                            {skill.proficiency}%
                          </span>
                        )}
                      </div>
                      {skill.proficiency !== null && <SkillBar value={skill.proficiency} />}
                    </div>
                  ))}
                </div>
              </SkillCategoryCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
