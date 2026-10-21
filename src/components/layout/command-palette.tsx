"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Compass,
  Copy,
  Download,
  FileText,
  Fingerprint,
  Gauge,
  Moon,
  Network,
  ScrollText,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NAV_LINKS, siteConfig } from "@/lib/constants";
import { COMMAND_PALETTE_EVENT, OPEN_LAB_EVENT, type LabId } from "@/lib/lab-events";
import { cn } from "@/lib/utils";

type Command = {
  id: string;
  group: "Go to" | "Labs" | "Actions";
  label: string;
  keywords?: string;
  icon: LucideIcon;
  run: () => void;
};

function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", hash);
  }
}

export function CommandPalette({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen);
    };
  }, []);

  const commands = useMemo<Command[]>(() => {
    const openLab = (id: LabId) => () => {
      scrollToHash("#labs");
      window.dispatchEvent(new CustomEvent(OPEN_LAB_EVENT, { detail: id }));
    };
    const external = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

    return [
      ...NAV_LINKS.map<Command>((l) => ({
        id: `go-${l.href}`,
        group: "Go to",
        label: l.label,
        icon: Compass,
        run: () => scrollToHash(l.href),
      })),
      { id: "lab-forensics", group: "Labs", label: "Forensics Lab — hash & integrity", keywords: "sha256 evidence metadata", icon: Fingerprint, run: openLab("forensics") },
      { id: "lab-risk", group: "Labs", label: "Risk Scoring — BocorCheck demo", keywords: "osint breach score", icon: Gauge, run: openLab("risk") },
      { id: "lab-logs", group: "Labs", label: "Log Explorer — detections & timeline", keywords: "siem incident", icon: ScrollText, run: openLab("logs") },
      { id: "lab-network", group: "Labs", label: "Network Map — segmentation", keywords: "firewall vlan topology", icon: Network, run: openLab("network") },
      { id: "resume-page", group: "Actions", label: "View resume", icon: FileText, run: () => (window.location.href = "/resume") },
      {
        id: "resume-pdf",
        group: "Actions",
        label: "Download resume (PDF)",
        keywords: "cv",
        icon: Download,
        run: () => {
          const a = document.createElement("a");
          a.href = "/resume/resume.pdf";
          a.download = "Mohamad-Fildza-Azman-Resume.pdf";
          a.click();
          toast.success("Resume download started");
        },
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        keywords: "contact",
        icon: Copy,
        run: async () => {
          try {
            await navigator.clipboard.writeText(siteConfig.email);
            toast.success("Email copied to clipboard");
          } catch {
            toast.error(`Couldn't copy automatically — ${siteConfig.email}`);
          }
        },
      },
      { id: "github", group: "Actions", label: "Open GitHub profile", icon: ArrowUpRight, run: external(siteConfig.links.github) },
      { id: "linkedin", group: "Actions", label: "Open LinkedIn profile", icon: ArrowUpRight, run: external(siteConfig.links.linkedin) },
      {
        id: "theme",
        group: "Actions",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`,
        keywords: "dark light mode",
        icon: Moon,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
  }, [resolvedTheme, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  const activeIndex = Math.min(index, Math.max(filtered.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    close();
    // Let the dialog unmount before scrolling/navigating.
    setTimeout(command.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex(filtered.length ? (activeIndex + 1) % filtered.length : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex(filtered.length ? (activeIndex - 1 + filtered.length) % filtered.length : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(filtered[activeIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
            aria-label="Search sections, labs and actions"
            placeholder="Jump to a section, open a lab, or run an action…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground sm:block">Esc</kbd>
        </div>

        <ul id="command-list" ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">No matching commands.</li>}
          {filtered.map((c, i) => {
            const showGroup = i === 0 || filtered[i - 1].group !== c.group;
            const Icon = c.icon;
            return (
              <li key={c.id} role="presentation">
                {showGroup && (
                  <p className="px-3 pb-1 pt-2 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{c.group}</p>
                )}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  data-index={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => execute(c)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    i === activeIndex ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {c.label}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[0.7rem] text-muted-foreground">
          <span>↑ ↓ to navigate · Enter to select</span>
          <span>Ctrl / ⌘ + K to toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
