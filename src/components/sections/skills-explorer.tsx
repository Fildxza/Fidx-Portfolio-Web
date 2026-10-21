"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
  ListChecks,
  Laptop,
  Network,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SkillsMap } from "@/components/sections/skills-map";
import {
  enrichCategories,
  layoutMap,
  relatedSkillIds,
  type EvidenceKind,
} from "@/lib/skills-map";
import type { SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "IT Support & Infrastructure": Laptop,
  Networking: Network,
  "Security & Forensics": ShieldCheck,
  Development: Code2,
};

const EVIDENCE: Record<EvidenceKind, { icon: LucideIcon; label: string }> = {
  work: { icon: Briefcase, label: "Work experience" },
  project: { icon: FolderGit2, label: "Project" },
  cert: { icon: BadgeCheck, label: "Certification" },
  study: { icon: GraduationCap, label: "Coursework" },
  listed: { icon: ListChecks, label: "Listed on resume" },
};

export function SkillsExplorer({ categories }: { categories: SkillCategory[] }) {
  const enriched = useMemo(() => enrichCategories(categories), [categories]);
  const layout = useMemo(() => layoutMap(enriched), [enriched]);
  const icons = useMemo(
    () => enriched.map((c) => CATEGORY_ICONS[c.name] ?? Sparkles),
    [enriched]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() ?? false;
  const show = reduce || inView;

  const focusId = hoverId ?? pinnedId;
  const related = useMemo(
    () => (focusId ? relatedSkillIds(layout, focusId) : new Set<string>()),
    [layout, focusId]
  );
  const focusNode = focusId ? layout.skills.find((n) => n.skill.id === focusId) : undefined;
  const active = enriched[activeIndex];
  if (!active) return null;

  const selectCategory = (index: number) => {
    setActiveIndex(index);
    setPinnedId(null);
    setHoverId(null);
  };

  const pickSkill = (id: string, categoryIndex: number) => {
    setActiveIndex(categoryIndex);
    setPinnedId((current) => (current === id && categoryIndex === activeIndex ? null : id));
  };

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = enriched.length - 1;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    selectCategory(next);
    tabRefs.current[next]?.focus();
  };

  const relatedNames = layout.skills
    .filter((n) => related.has(n.skill.id))
    .map((n) => n.skill.label);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.9fr_1fr] lg:gap-8">
      {/* Capability map */}
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-3 sm:p-5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-[background] duration-500"
          style={{
            background: `radial-gradient(60% 55% at 50% 50%, color-mix(in oklab, ${active.color} 9%, transparent), transparent 70%)`,
          }}
        />
        <div className="relative">
          <SkillsMap
            layout={layout}
            icons={icons}
            activeIndex={activeIndex}
            focusId={focusId}
            related={related}
            show={show}
            reduce={reduce}
            onHoverSkill={setHoverId}
            onPickSkill={pickSkill}
            onPickCategory={selectCategory}
          />
        </div>
        <p
          aria-live="polite"
          className="relative mt-2 min-h-10 px-2 text-center text-xs leading-relaxed text-muted-foreground sm:text-[0.8rem]"
        >
          {focusNode ? (
            relatedNames.length > 0 ? (
              <>
                <span className="font-medium text-foreground">{focusNode.skill.label}</span> shares
                evidence with {relatedNames.join(", ")}.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{focusNode.skill.label}</span> is
                used in a single context.
              </>
            )
          ) : (
            "Hover or tap a skill to trace where it was used and what else it connects to."
          )}
        </p>
      </div>

      {/* Detail panel */}
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Skill categories"
          className="grid grid-cols-2 gap-2"
        >
          {enriched.map((category, index) => {
            const Icon = icons[index];
            const selected = index === activeIndex;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`skills-tab-${category.id}`}
                aria-selected={selected}
                aria-controls={`skills-panel-${category.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectCategory(index)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={cn(
                  "relative flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-transparent text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId={reduce ? undefined : "skills-tab-pill"}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl border bg-card"
                    style={{
                      borderColor: `color-mix(in oklab, ${category.color} 55%, transparent)`,
                      boxShadow: `0 0 0 1px color-mix(in oklab, ${category.color} 12%, transparent), 0 6px 24px -10px ${category.color}`,
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <Icon
                  className="relative size-4 shrink-0"
                  style={{ color: category.color }}
                  aria-hidden="true"
                />
                <span className="relative flex min-w-0 flex-col leading-tight">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {category.skills.length} {category.skills.length === 1 ? "skill" : "skills"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`skills-panel-${active.id}`}
          aria-labelledby={`skills-tab-${active.id}`}
          className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {active.blurb && (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {active.blurb}
                </p>
              )}

              <ul className="flex flex-col gap-1">
                {active.skills.map((skill, i) => {
                  const isFocus = focusId === skill.id;
                  const isPinned = pinnedId === skill.id;
                  return (
                    <motion.li
                      key={skill.id}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: reduce ? 0 : 0.04 * i }}
                    >
                      <button
                        type="button"
                        aria-pressed={isPinned}
                        onClick={() => pickSkill(skill.id, activeIndex)}
                        onMouseEnter={() => setHoverId(skill.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onFocus={() => setHoverId(skill.id)}
                        onBlur={() => setHoverId(null)}
                        className={cn(
                          "group flex w-full flex-col gap-2 rounded-xl px-3 py-2.5 text-left transition-colors",
                          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isFocus ? "bg-muted/70" : "hover:bg-muted/40"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full transition-transform group-hover:scale-125"
                            style={{ background: active.color }}
                          />
                          <span className="text-sm font-medium">{skill.name}</span>
                        </span>

                        {skill.sources.length > 0 && (
                          <span className="flex flex-wrap gap-1.5 pl-[1.125rem]">
                            {skill.sources.map((source) => {
                              const { icon: SourceIcon, label } = EVIDENCE[source.kind];
                              return (
                                <span
                                  key={`${source.kind}-${source.label}`}
                                  title={label}
                                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                                >
                                  <SourceIcon
                                    className="size-3"
                                    style={{ color: active.color }}
                                    aria-hidden="true"
                                  />
                                  <span className="sr-only">{label}: </span>
                                  {source.label}
                                </span>
                              );
                            })}
                          </span>
                        )}

                        <AnimatePresence initial={false}>
                          {isFocus && skill.note && (
                            <motion.span
                              key="note"
                              initial={reduce ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={reduce ? undefined : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="block overflow-hidden pl-[1.125rem] text-[0.8rem] leading-relaxed text-muted-foreground"
                            >
                              {skill.note}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <ul
          aria-label="Evidence legend"
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[0.72rem] text-muted-foreground"
        >
          {(Object.keys(EVIDENCE) as EvidenceKind[]).map((kind) => {
            const { icon: LegendIcon, label } = EVIDENCE[kind];
            return (
              <li key={kind} className="inline-flex items-center gap-1.5">
                <LegendIcon className="size-3.5" aria-hidden="true" />
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
