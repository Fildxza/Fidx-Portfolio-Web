import { createClient } from "@/lib/supabase/server";
import {
  ACHIEVEMENTS,
  CERTIFICATES,
  EDUCATION,
  EXPERIENCE,
  PROJECTS,
  SKILL_CATEGORIES,
} from "@/lib/resume-data";
import type {
  Achievement,
  Certificate,
  Education,
  Experience,
  Project,
  SkillCategory,
  SocialLink,
} from "@/lib/types";

export async function getExperience(): Promise<Experience[]> {
  const supabase = await createClient();
  if (!supabase) return EXPERIENCE;

  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return EXPERIENCE;
  return data as Experience[];
}

export async function getEducation(): Promise<Education[]> {
  const supabase = await createClient();
  if (!supabase) return EDUCATION;

  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return EDUCATION;
  return data as Education[];
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  if (!supabase) return PROJECTS;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return PROJECTS;
  return data as Project[];
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const supabase = await createClient();
  if (!supabase) return SKILL_CATEGORIES;

  const { data, error } = await supabase
    .from("skill_categories")
    .select("*, skills(*)")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return SKILL_CATEGORIES;

  return data.map((cat) => ({
    ...cat,
    skills: (cat.skills ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  })) as SkillCategory[];
}

export async function getCertificates(): Promise<Certificate[]> {
  const supabase = await createClient();
  if (!supabase) return CERTIFICATES;

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return CERTIFICATES;
  return data as Certificate[];
}

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createClient();
  if (!supabase) return ACHIEVEMENTS;

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return ACHIEVEMENTS;
  return data as Achievement[];
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as SocialLink[];
}

export async function getResumeUrl(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "resume_url")
    .maybeSingle();

  return data?.value ?? null;
}

export async function getProfilePhotoUrl(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "profile_photo_url")
    .maybeSingle();

  return data?.value ?? null;
}
