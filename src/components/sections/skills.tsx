import { SectionHeading } from "@/components/shared/section-heading";
import { SkillsExplorer } from "@/components/sections/skills-explorer";
import { getSkillCategories } from "@/lib/queries";

export async function Skills() {
  const categories = await getSkillCategories();

  return (
    <section id="skills" className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Skills"
          title="Tools & technologies I work with"
          description="No self-scored percentages. Each skill is tied to where it was actually used — explore the map to see the connections."
        />
        <SkillsExplorer categories={categories} />
      </div>
    </section>
  );
}
