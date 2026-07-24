"use client";

import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import type { ActionResult } from "@/lib/admin-actions";
import type { SkillCategory } from "@/lib/types";

type CategoryRow = { id: string; name: string; sort_order: number } & Record<string, unknown>;
type SkillRow = {
  id: string;
  category_id: string;
  name: string;
  proficiency: number | null;
  sort_order: number;
} & Record<string, unknown>;

type Actions = {
  onCreate: (values: Record<string, unknown>) => Promise<ActionResult>;
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
};

export function SkillsManager({
  categories,
  categoryRows,
  skillRows,
  categoryActions,
  skillActions,
}: {
  categories: SkillCategory[];
  categoryRows: CategoryRow[];
  skillRows: SkillRow[];
  categoryActions: Actions;
  skillActions: Actions;
}) {
  const categoryColumns: ColumnConfig<CategoryRow>[] = [
    { key: "name", label: "Category" },
    { key: "sort_order", label: "Order" },
  ];

  const categoryFields: FieldConfig[] = [
    { key: "name", label: "Category Name", type: "text", required: true },
    { key: "sort_order", label: "Sort Order", type: "number" },
  ];

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const skillColumns: ColumnConfig<SkillRow>[] = [
    { key: "name", label: "Skill" },
    {
      key: "category_id",
      label: "Category",
      render: (row) => categories.find((c) => c.id === row.category_id)?.name ?? "—",
    },
    { key: "sort_order", label: "Order" },
  ];

  const skillFields: FieldConfig[] = [
    { key: "name", label: "Skill Name", type: "text", required: true },
    {
      key: "category_id",
      label: "Category",
      type: "select",
      required: true,
      options: categoryOptions,
    },
    { key: "proficiency", label: "Proficiency (0–100)", type: "number" },
    { key: "sort_order", label: "Sort Order", type: "number" },
  ];

  return (
    <div className="space-y-12">
      <CrudManager
        title="Skill Categories"
        description="Group your skills, e.g. Networking, Security & Forensics."
        columns={categoryColumns}
        fields={categoryFields}
        rows={categoryRows}
        onCreate={categoryActions.onCreate}
        onUpdate={categoryActions.onUpdate}
        onDelete={categoryActions.onDelete}
      />

      <CrudManager
        title="Skills"
        description="Individual skills, assigned to a category above."
        columns={skillColumns}
        fields={skillFields}
        rows={skillRows}
        onCreate={skillActions.onCreate}
        onUpdate={skillActions.onUpdate}
        onDelete={skillActions.onDelete}
      />
    </div>
  );
}
