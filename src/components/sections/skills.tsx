import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { getSkillCategories } from "@/lib/queries";

export async function Skills() {
  const categories = await getSkillCategories();

  return (
    <section id="skills" className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="Skills" title="Tools & technologies I work with" />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-border/60 bg-card/50 p-6"
            >
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-brand">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="rounded-full border-border/70 px-3 py-1 font-normal"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
