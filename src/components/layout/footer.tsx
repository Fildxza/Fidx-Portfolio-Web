import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/brand-icons";
import { siteConfig } from "@/lib/constants";

const ICON_LINK_CLASS =
  "rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 print:hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
      />

      <div className="container-page flex flex-col items-center gap-6 py-12 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium">{siteConfig.name}</p>
          <p className="text-sm text-muted-foreground">{siteConfig.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={ICON_LINK_CLASS}
            aria-label="GitHub"
          >
            <GithubIcon className="size-4.5" />
          </Link>
          <Link
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={ICON_LINK_CLASS}
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="size-4.5" />
          </Link>
          <Link href={siteConfig.links.email} className={ICON_LINK_CLASS} aria-label="Email">
            <Mail className="size-4.5" />
          </Link>
          <Link href="#top" className={ICON_LINK_CLASS} aria-label="Back to top">
            <ArrowUp className="size-4.5" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
