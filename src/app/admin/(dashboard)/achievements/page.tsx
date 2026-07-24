import { getAchievements } from "@/lib/queries";
import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import { createAchievement, deleteAchievement, updateAchievement } from "./actions";
import type { Achievement } from "@/lib/types";

const columns: ColumnConfig<Achievement & Record<string, unknown>>[] = [
  { key: "title", label: "Title" },
  { key: "date", label: "Date" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "date", label: "Date", type: "date" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default async function AdminAchievementsPage() {
  const achievements = await getAchievements();

  return (
    <CrudManager
      title="Achievements"
      description="Manage awards and recognitions shown on your portfolio."
      columns={columns}
      fields={fields}
      rows={achievements as (Achievement & Record<string, unknown>)[]}
      onCreate={createAchievement}
      onUpdate={updateAchievement}
      onDelete={deleteAchievement}
    />
  );
}
