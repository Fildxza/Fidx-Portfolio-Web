"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const TABLE = "education";
const PATHS = ["/", "/admin/education", "/resume"];

export async function createEducation(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}

export async function updateEducation(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}

export async function deleteEducation(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
