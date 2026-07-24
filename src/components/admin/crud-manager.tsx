"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadToStorage } from "@/lib/storage-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "tags"
  | "lines"
  | "select"
  | "upload";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  uploadFolder?: string;
  accept?: string;
};

export type ColumnConfig<T> = {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type Row = Record<string, unknown> & { id: string };

export function CrudManager<T extends Row>({
  title,
  description,
  columns,
  fields,
  rows,
  onCreate,
  onUpdate,
  onDelete,
}: {
  title: string;
  description?: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  rows: T[];
  onCreate: (values: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    values: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function handleFileUpload(field: FieldConfig, file: File | undefined) {
    if (!file) return;
    setUploadingKey(field.key);
    const url = await uploadToStorage(file, field.uploadFolder ?? "uploads");
    setUploadingKey(null);

    if (!url) {
      toast.error("Upload failed. Check your Supabase Storage configuration.");
      return;
    }
    setValues((v) => ({ ...v, [field.key]: url }));
    toast.success("File uploaded.");
  }

  function openCreate() {
    setEditing(null);
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => {
      defaults[f.key] = f.type === "boolean" ? false : "";
    });
    setValues(defaults);
    setOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    const initial: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = row[f.key];
      if (f.type === "tags" && Array.isArray(v)) {
        initial[f.key] = (v as string[]).join(", ");
      } else if (f.type === "lines" && Array.isArray(v)) {
        initial[f.key] = (v as string[]).join("\n");
      } else {
        initial[f.key] = v;
      }
    });
    setValues(initial);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.key];
      if (field.type === "tags") {
        payload[field.key] = typeof raw === "string"
          ? raw.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
      } else if (field.type === "lines") {
        payload[field.key] = typeof raw === "string"
          ? raw.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];
      } else if (field.type === "number") {
        payload[field.key] = raw === "" || raw === undefined ? null : Number(raw);
      } else if (field.type === "date") {
        payload[field.key] = raw || null;
      } else {
        payload[field.key] = raw;
      }
    }

    const result = editing ? await onUpdate(editing.id, payload) : await onCreate(payload);
    setPending(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(editing ? "Updated successfully." : "Created successfully.");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await onDelete(id);
    setDeletingId(null);

    if (!result.success) {
      toast.error(result.error ?? "Couldn't delete this item.");
      return;
    }

    toast.success("Deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.label}</TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground">
                  No records yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render ? col.render(row) : String(row[col.key as string] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                      >
                        {deletingId === row.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>

                {field.type === "textarea" || field.type === "lines" ? (
                  <Textarea
                    id={field.key}
                    required={field.required}
                    placeholder={
                      field.type === "lines" ? "One item per line" : field.placeholder
                    }
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    rows={field.type === "lines" ? 6 : 4}
                  />
                ) : field.type === "boolean" ? (
                  <Switch
                    id={field.key}
                    checked={Boolean(values[field.key])}
                    onCheckedChange={(checked) =>
                      setValues((v) => ({ ...v, [field.key]: checked }))
                    }
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={(values[field.key] as string) ?? ""}
                    onValueChange={(value) => setValues((v) => ({ ...v, [field.key]: value }))}
                  >
                    <SelectTrigger id={field.key} className="w-full">
                      <SelectValue placeholder={field.placeholder ?? "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "upload" ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      id={field.key}
                      type="file"
                      accept={field.accept}
                      onChange={(e) => handleFileUpload(field, e.target.files?.[0])}
                      disabled={uploadingKey === field.key}
                    />
                    {uploadingKey === field.key && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" /> Uploading...
                      </p>
                    )}
                    {Boolean(values[field.key]) && (
                      <a
                        href={values[field.key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs text-brand hover:underline"
                      >
                        {values[field.key] as string}
                      </a>
                    )}
                  </div>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={(values[field.key] as string) ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            <DialogFooter>
              <Button type="submit" disabled={pending} className="rounded-full">
                {pending && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
