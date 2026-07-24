"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const TABLE = "projects";
const PATHS = ["/", "/admin/projects"];

export async function createProject(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}

export async function updateProject(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}

export async function deleteProject(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
