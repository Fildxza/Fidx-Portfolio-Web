"use client";

import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import type { Project } from "@/lib/types";
import type { ActionResult } from "@/lib/admin-actions";

type Row = Project & Record<string, unknown>;

const columns: ColumnConfig<Row>[] = [
  { key: "title", label: "Title" },
  { key: "is_pinned", label: "Pinned", render: (row) => (row.is_pinned ? "Yes" : "No") },
  { key: "sort_order", label: "Order" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true, placeholder: "my-project" },
  { key: "description", label: "Short Description", type: "textarea", required: true },
  { key: "long_description", label: "Full Description", type: "textarea" },
  { key: "tech_stack", label: "Tech Stack (comma separated)", type: "tags" },
  { key: "repo_url", label: "Repository URL", type: "text" },
  { key: "live_url", label: "Live Demo URL", type: "text" },
  {
    key: "image_url",
    label: "Cover Image",
    type: "upload",
    accept: "image/*",
    uploadFolder: "projects",
  },
  { key: "is_pinned", label: "Pinned", type: "boolean" },
  { key: "is_featured", label: "Featured", type: "boolean" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export function ProjectsManager({
  rows,
  onCreate,
  onUpdate,
  onDelete,
}: {
  rows: Row[];
  onCreate: (values: Record<string, unknown>) => Promise<ActionResult>;
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  return (
    <CrudManager
      title="Projects"
      description="Manage the projects shown on your portfolio."
      columns={columns}
      fields={fields}
      rows={rows}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}
