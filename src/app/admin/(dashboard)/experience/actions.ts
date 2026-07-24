"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const TABLE = "experience";
const PATHS = ["/", "/admin/experience", "/resume"];

export async function createExperience(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}

export async function updateExperience(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}

export async function deleteExperience(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
