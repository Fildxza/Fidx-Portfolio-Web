"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { ProjectCard } from "@/components/sections/project-card";
import type { FeaturedProject } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectsGrid({ projects }: { projects: FeaturedProject[] }) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const reduce = useReducedMotion() ?? false;

  const categories = useMemo(() => {
    const unique = new Set(projects.flatMap((p) => p.categories));
    return ["All", ...Array.from(unique)];
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (category !== "All" && !p.categories.includes(category)) return false;
      if (!q) return true;
      return [p.title, p.description, p.status ?? "", ...p.techStack, ...p.categories].some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  }, [projects, category, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                category === c
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects by name, technology or category"
            placeholder="Search projects or tech"
            className="w-full rounded-full border border-input bg-background/70 py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
          <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No projects match that filter.</p>
          <button
            type="button"
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
            className="text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout={!reduce} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => (
              <motion.div
                key={project.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
