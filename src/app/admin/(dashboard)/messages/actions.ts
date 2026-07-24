"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireClient() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function markMessageRead(id: string, isRead: boolean) {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = await requireClient();
  if (!supabase) return { success: false, error: "Not authenticated." };

  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/messages");
  return { success: true };
}
