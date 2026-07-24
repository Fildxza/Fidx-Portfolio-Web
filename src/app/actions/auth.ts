"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { success: boolean; error?: string };

export async function signIn(email: string, password: string): Promise<AuthActionState> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase isn't configured yet — add your project credentials to .env.local.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
