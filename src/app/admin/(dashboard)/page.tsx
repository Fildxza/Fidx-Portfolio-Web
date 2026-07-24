import Link from "next/link";
import {
  Award,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Mail,
  Sparkles,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAchievements,
  getCertificates,
  getEducation,
  getExperience,
  getProjects,
  getSkillCategories,
} from "@/lib/queries";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [experience, education, projects, skillCategories, certificates, achievements] =
    await Promise.all([
      getExperience(),
      getEducation(),
      getProjects(),
      getSkillCategories(),
      getCertificates(),
      getAchievements(),
    ]);

  let unreadMessages = 0;
  if (supabase) {
    const { count } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    unreadMessages = count ?? 0;
  }

  const cards = [
    { label: "Experience", value: experience.length, href: "/admin/experience", icon: Briefcase },
    { label: "Education", value: education.length, href: "/admin/education", icon: GraduationCap },
    { label: "Projects", value: projects.length, href: "/admin/projects", icon: FolderGit2 },
    {
      label: "Skill Categories",
      value: skillCategories.length,
      href: "/admin/skills",
      icon: Sparkles,
    },
    { label: "Certificates", value: certificates.length, href: "/admin/certificates", icon: Award },
    { label: "Achievements", value: achievements.length, href: "/admin/achievements", icon: Trophy },
    { label: "Unread Messages", value: unreadMessages, href: "/admin/messages", icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          {supabase
            ? "Connected to Supabase — changes here go live immediately."
            : "Supabase isn't configured yet — the public site is showing resume-derived fallback content."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-brand/40"
          >
            <card.icon className="mb-3 size-5 text-brand" />
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
