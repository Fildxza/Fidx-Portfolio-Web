"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const TABLE = "achievements";
const PATHS = ["/", "/admin/achievements"];

export async function createAchievement(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}
export async function updateAchievement(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}
export async function deleteAchievement(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
