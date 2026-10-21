"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { getLanguageColor } from "@/lib/language-colors";
import { cn } from "@/lib/utils";

type Language = { name: string; count: number; percentage: number };

const RADIUS = 44;
const GAP = 1.2; // visual gap between segments, in % of the ring

export function LanguageDonut({ languages }: { languages: Language[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<string | null>(null);

  const total = languages.reduce((sum, l) => sum + l.count, 0);
  if (total === 0) return null;

  const segments = languages.map((lang, i) => ({
    lang,
    share: (lang.count / total) * 100,
    start: (languages.slice(0, i).reduce((sum, l) => sum + l.count, 0) / total) * 100,
  }));
  const active = hovered ? languages.find((l) => l.name === hovered) : null;

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div className="relative size-44 shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="size-full -rotate-90"
          role="img"
          aria-label={`Primary language of each public repository: ${languages
            .map((l) => `${l.name} ${l.count}`)
            .join(", ")}.`}
        >
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="11" className="stroke-muted" />
          {segments.map(({ lang, share, start }) => {
            const dash = Math.max(share - GAP, 0.5);
            const dim = hovered !== null && hovered !== lang.name;
            return (
              <motion.circle
                key={lang.name}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth={hovered === lang.name ? 14 : 11}
                stroke={getLanguageColor(lang.name)}
                pathLength={100}
                strokeDashoffset={-start}
                initial={reduce ? false : { strokeDasharray: "0 100", opacity: 0 }}
                animate={{
                  strokeDasharray: inView || reduce ? `${dash} ${100 - dash}` : "0 100",
                  opacity: dim ? 0.25 : 1,
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHovered(lang.name)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold leading-none">
            {active ? active.count : total}
          </span>
          <span className="mt-1 max-w-[6rem] text-[0.7rem] leading-tight text-muted-foreground">
            {active ? `${active.name} repos` : "repos with a language"}
          </span>
        </div>
      </div>

      <ul className="grid w-full flex-1 gap-1">
        {languages.map((lang) => (
          <li key={lang.name}>
            <button
              type="button"
              onMouseEnter={() => setHovered(lang.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(lang.name)}
              onBlur={() => setHovered(null)}
              aria-label={`${lang.name}: ${lang.count} ${lang.count === 1 ? "repository" : "repositories"}`}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring",
                hovered === lang.name ? "bg-muted" : "hover:bg-muted/60"
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: getLanguageColor(lang.name) }}
                />
                {lang.name}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {lang.count} · {lang.percentage}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
