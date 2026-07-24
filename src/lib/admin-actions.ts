"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: boolean; error?: string };

async function requireClient() {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return supabase;
}

export async function createRecord(
  table: string,
  values: Record<string, unknown>,
  revalidatePaths: string[]
): Promise<ActionResult> {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated or Supabase not configured." };

  const { error } = await supabase.from(table).insert(values);
  if (error) return { success: false, error: error.message };

  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function updateRecord(
  table: string,
  id: string,
  values: Record<string, unknown>,
  revalidatePaths: string[]
): Promise<ActionResult> {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated or Supabase not configured." };

  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function deleteRecord(
  table: string,
  id: string,
  revalidatePaths: string[]
): Promise<ActionResult> {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated or Supabase not configured." };

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePaths.forEach((p) => revalidatePath(p));
  return { success: true };
}

export async function upsertSetting(key: string, value: string): Promise<ActionResult> {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated or Supabase not configured." };

  const { error } = await supabase.from("site_settings").upsert({ key, value });
  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin/settings");
  return { success: true };
}
