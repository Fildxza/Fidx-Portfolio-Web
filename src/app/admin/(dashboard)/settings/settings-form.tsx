"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadToStorage } from "@/lib/storage-upload";
import { upsertSetting } from "./actions";

export function SettingsForm({
  resumeUrl,
  profilePhotoUrl,
}: {
  resumeUrl: string | null;
  profilePhotoUrl: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState<"resume" | "photo" | null>(null);
  const [resume, setResume] = useState(resumeUrl ?? "");
  const [photo, setPhoto] = useState(profilePhotoUrl ?? "");

  async function handleUpload(kind: "resume" | "photo", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    const url = await uploadToStorage(file, kind === "resume" ? "resume" : "profile");
    setUploading(null);

    if (!url) {
      toast.error("Upload failed. Check your Supabase Storage configuration.");
      return;
    }

    const key = kind === "resume" ? "resume_url" : "profile_photo_url";
    const result = await upsertSetting(key, url);

    if (!result.success) {
      toast.error(result.error ?? "Couldn't save setting.");
      return;
    }

    if (kind === "resume") setResume(url);
    else setPhoto(url);

    toast.success("Saved.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <Label className="mb-2 block">Resume (PDF)</Label>
        <Input
          type="file"
          accept="application/pdf"
          disabled={uploading === "resume"}
          onChange={(e) => handleUpload("resume", e.target.files?.[0])}
        />
        {uploading === "resume" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Uploading...
          </p>
        )}
        {resume && (
          <a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-xs text-brand hover:underline"
          >
            {resume}
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <Label className="mb-2 block">Profile Photo</Label>
        <Input
          type="file"
          accept="image/*"
          disabled={uploading === "photo"}
          onChange={(e) => handleUpload("photo", e.target.files?.[0])}
        />
        {uploading === "photo" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Uploading...
          </p>
        )}
        {photo && (
          <a
            href={photo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-xs text-brand hover:underline"
          >
            {photo}
          </a>
        )}
      </div>
    </div>
  );
}
