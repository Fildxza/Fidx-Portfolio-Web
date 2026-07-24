"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "portfolio-media";

/** Uploads a file to Supabase Storage from the browser and returns its public URL. */
export async function uploadToStorage(file: File, folder: string): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
