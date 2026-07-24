"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";

export type ContactActionState = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  values: ContactFormValues
): Promise<ContactActionState> {
  const parsed = contactFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.company) {
    // Honeypot tripped — silently report success without writing anything.
    return { success: true };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error:
        "Contact storage isn't connected yet — Supabase hasn't been configured for this deployment.",
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again shortly." };
  }

  return { success: true };
}
