"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_LINKS, siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 print:hidden",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="container-page">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-4 py-2 transition-all duration-300",
            scrolled && "glass shadow-sm shadow-black/5"
          )}
        >
          <Link
            href="#top"
            className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            {siteConfig.shortName}
            <span className="text-brand">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              render={<Link href="/resume" />}
              size="sm"
              className="hidden sm:inline-flex rounded-full"
            >
              Resume
            </Button>

            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden rounded-full" aria-label="Open menu" />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{siteConfig.shortName}</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1 px-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/resume"
                    className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground text-center"
                  >
                    Resume
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
