import { getSkillCategories } from "@/lib/queries";
import {
  createSkill,
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  updateSkill,
  updateSkillCategory,
} from "./actions";
import { SkillsManager } from "./skills-manager";
import type { SkillCategory } from "@/lib/types";

export default async function AdminSkillsPage() {
  const categories: SkillCategory[] = await getSkillCategories();

  const categoryRows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    sort_order: c.sort_order,
  }));

  const skillRows = categories.flatMap((c) =>
    c.skills.map((s) => ({
      id: s.id,
      category_id: s.category_id,
      name: s.name,
      proficiency: s.proficiency,
      sort_order: s.sort_order,
    }))
  );

  return (
    <SkillsManager
      categories={categories}
      categoryRows={categoryRows}
      skillRows={skillRows}
      categoryActions={{
        onCreate: createSkillCategory,
        onUpdate: updateSkillCategory,
        onDelete: deleteSkillCategory,
      }}
      skillActions={{ onCreate: createSkill, onUpdate: updateSkill, onDelete: deleteSkill }}
    />
  );
}
