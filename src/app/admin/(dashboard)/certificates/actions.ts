"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const TABLE = "certificates";
const PATHS = ["/", "/admin/certificates"];

export async function createCertificate(values: Record<string, unknown>) {
  return createRecord(TABLE, values, PATHS);
}
export async function updateCertificate(id: string, values: Record<string, unknown>) {
  return updateRecord(TABLE, id, values, PATHS);
}
export async function deleteCertificate(id: string) {
  return deleteRecord(TABLE, id, PATHS);
}
