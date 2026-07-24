"use server";

import { createRecord, deleteRecord, updateRecord } from "@/lib/admin-actions";

const PATHS = ["/", "/admin/skills", "/resume"];

export async function createSkillCategory(values: Record<string, unknown>) {
  return createRecord("skill_categories", values, PATHS);
}
export async function updateSkillCategory(id: string, values: Record<string, unknown>) {
  return updateRecord("skill_categories", id, values, PATHS);
}
export async function deleteSkillCategory(id: string) {
  return deleteRecord("skill_categories", id, PATHS);
}

export async function createSkill(values: Record<string, unknown>) {
  return createRecord("skills", values, PATHS);
}
export async function updateSkill(id: string, values: Record<string, unknown>) {
  return updateRecord("skills", id, values, PATHS);
}
export async function deleteSkill(id: string) {
  return deleteRecord("skills", id, PATHS);
}
