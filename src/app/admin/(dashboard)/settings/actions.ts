"use server";

import { createRecord, deleteRecord, updateRecord, upsertSetting } from "@/lib/admin-actions";

export { upsertSetting };

const TABLE = "social_links";
const PATHS = ["/", "/admin/settings"];

export async function createSocialLink(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}
export async function updateSocialLink(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}
export async function deleteSocialLink(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
