import { getEducation } from "@/lib/queries";
import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import { createEducation, deleteEducation, updateEducation } from "./actions";
import type { Education } from "@/lib/types";

const columns: ColumnConfig<Education & Record<string, unknown>>[] = [
  { key: "institution", label: "Institution" },
  { key: "credential", label: "Credential" },
  { key: "start_date", label: "Start" },
  { key: "end_date", label: "End" },
];

const fields: FieldConfig[] = [
  { key: "institution", label: "Institution", type: "text", required: true },
  { key: "credential", label: "Credential", type: "text", required: true },
  { key: "field", label: "Field / Mode of Study", type: "text" },
  { key: "start_date", label: "Start Date", type: "date", required: true },
  { key: "end_date", label: "End Date", type: "date" },
  { key: "score", label: "Score / CGPA", type: "text" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default async function AdminEducationPage() {
  const education = await getEducation();

  return (
    <CrudManager
      title="Education"
      description="Manage your academic background."
      columns={columns}
      fields={fields}
      rows={education as (Education & Record<string, unknown>)[]}
      onCreate={createEducation}
      onUpdate={updateEducation}
      onDelete={deleteEducation}
    />
  );
}
