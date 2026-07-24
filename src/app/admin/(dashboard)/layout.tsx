import Link from "next/link";
import {
  Award,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  Trophy,
  FolderGit2,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card p-4 sm:flex">
        <div className="mb-6 px-2 py-2">
          <p className="text-sm font-semibold">{siteConfig.shortName} Admin</p>
          <p className="text-xs text-muted-foreground">Content Dashboard</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut}>
          <Button variant="ghost" type="submit" className="w-full justify-start gap-2.5 text-muted-foreground">
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
