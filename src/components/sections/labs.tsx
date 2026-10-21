"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fingerprint, Gauge, Lock, Network, ScrollText, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import dynamic from "next/dynamic";
import { LazyMount } from "@/components/shared/lazy-mount";
import { OPEN_LAB_EVENT, isLabId, type LabId } from "@/lib/lab-events";
import { cn } from "@/lib/utils";

const LabLoading = () => (
  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground" role="status">
    Loading lab…
  </div>
);
const ForensicsLab = dynamic(() => import("@/components/labs/forensics-lab").then((m) => m.ForensicsLab), { ssr: false, loading: LabLoading });
const RiskLab = dynamic(() => import("@/components/labs/risk-lab").then((m) => m.RiskLab), { ssr: false, loading: LabLoading });
const LogLab = dynamic(() => import("@/components/labs/log-lab").then((m) => m.LogLab), { ssr: false, loading: LabLoading });
const NetworkLab = dynamic(() => import("@/components/labs/network-lab").then((m) => m.NetworkLab), { ssr: false, loading: LabLoading });

const LABS: {
  id: LabId;
  label: string;
  caption: string;
  icon: LucideIcon;
  blurb: string;
}[] = [
  {
    id: "forensics",
    label: "Forensics Lab",
    caption: "Hashing · metadata · integrity",
    icon: Fingerprint,
    blurb: "Walk the investigation workflow, then hash a synthetic item (or your own file) and see how integrity checks work.",
  },
  {
    id: "risk",
    label: "Risk Scoring",
    caption: "BocorCheck-style demo",
    icon: Gauge,
    blurb: "Change a scenario and watch an explainable risk score move — the idea behind BocorCheck, with invented data.",
  },
  {
    id: "logs",
    label: "Log Explorer",
    caption: "Detection · timeline",
    icon: ScrollText,
    blurb: "Filter a fictional security log, review what detection rules caught, and read the reconstructed incident timeline.",
  },
  {
    id: "network",
    label: "Network Map",
    caption: "Segmentation · defence",
    icon: Network,
    blurb: "Trace allowed and blocked traffic across a fictional segmented network, including a building-automation VLAN.",
  },
];

export function Labs() {
  const [active, setActive] = useState<LabId>("forensics");
  const reduce = useReducedMotion() ?? false;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = LABS.find((l) => l.id === active) ?? LABS[0];

  // Lets the command palette (and any other part of the page) switch labs.
  useEffect(() => {
    const onOpenLab = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (isLabId(id)) setActive(id);
    };
    window.addEventListener(OPEN_LAB_EVENT, onOpenLab);
    return () => window.removeEventListener(OPEN_LAB_EVENT, onOpenLab);
  }, []);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = LABS.length - 1;
    let next = index;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setActive(LABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="labs" className="section-y bg-muted/30">
      <div className="container-page">
        <SectionHeading
          eyebrow="Interactive Labs"
          title="Try the ideas, not just read about them"
          description="Four small, safe demos built around my coursework and projects. Everything runs in your browser; all scenarios and data are fictional."
        />

        <div className="mb-6 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-brand" aria-hidden="true" />
            No uploads, no scanning, no real personal data
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Interactive labs"
          className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4"
        >
          {LABS.map((lab, index) => {
            const Icon = lab.icon;
            const selected = lab.id === active;
            return (
              <button
                key={lab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`lab-tab-${lab.id}`}
                aria-selected={selected}
                aria-controls={`lab-panel-${lab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(lab.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={cn(
                  "relative flex min-h-14 items-center gap-3 rounded-xl border px-3.5 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "border-transparent" : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId={reduce ? undefined : "labs-tab-pill"}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl border border-brand/50 bg-card shadow-lg shadow-brand/10"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-lg",
                    selected ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="relative flex min-w-0 flex-col leading-tight">
                  <span className={cn("text-sm font-medium", selected && "text-foreground")}>{lab.label}</span>
                  <span className="text-[0.7rem] text-muted-foreground">{lab.caption}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-6 text-center text-sm text-muted-foreground">{current.blurb}</p>

        <div role="tabpanel" id={`lab-panel-${active}`} aria-labelledby={`lab-tab-${active}`}>
          <LazyMount minHeight={640}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {active === "forensics" && <ForensicsLab />}
              {active === "risk" && <RiskLab />}
              {active === "logs" && <LogLab />}
              {active === "network" && <NetworkLab />}
            </motion.div>
          </AnimatePresence>
          </LazyMount>
        </div>
      </div>
    </section>
  );
}
