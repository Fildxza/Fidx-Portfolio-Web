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
          description="No self-scored percentages. Each skill shows where it comes from — work, a project, a certification, coursework or my resume. Explore the map to see the connections."
        />
        <SkillsExplorer categories={categories} />
      </div>
    </section>
  );
}
