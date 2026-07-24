import { getExperience } from "@/lib/queries";
import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import { createExperience, deleteExperience, updateExperience } from "./actions";
import type { Experience } from "@/lib/types";

const columns: ColumnConfig<Experience & Record<string, unknown>>[] = [
  { key: "role", label: "Role" },
  { key: "company", label: "Company" },
  { key: "start_date", label: "Start" },
  { key: "end_date", label: "End" },
];

const fields: FieldConfig[] = [
  { key: "role", label: "Role", type: "text", required: true },
  { key: "company", label: "Company", type: "text", required: true },
  { key: "location", label: "Location", type: "text" },
  { key: "start_date", label: "Start Date", type: "date", required: true },
  { key: "end_date", label: "End Date", type: "date" },
  { key: "is_current", label: "Current Role", type: "boolean" },
  { key: "bullets", label: "Highlights", type: "lines" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default async function AdminExperiencePage() {
  const experience = await getExperience();

  return (
    <CrudManager
      title="Experience"
      description="Manage your work history."
      columns={columns}
      fields={fields}
      rows={experience as (Experience & Record<string, unknown>)[]}
      onCreate={createExperience}
      onUpdate={updateExperience}
      onDelete={deleteExperience}
    />
  );
}
