"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { FlowNode } from "@/lib/project-registry";
import { cn } from "@/lib/utils";

/**
 * Interactive architecture strip. Nodes fade in in sequence; selecting one (hover, focus or tap) reveals what it does.
 */
export function ArchitectureFlow({ nodes, caption }: { nodes: FlowNode[]; caption: string }) {
  const [active, setActive] = useState(0);

  return (
    <figure>
      <ol className="flex flex-wrap items-stretch gap-y-2">
        {nodes.map((node, i) => {
          const selected = i === active;
          return (
            // Content stays visible without JavaScript; the stagger is a CSS-only flourish.
            <li
              key={node.label}
              className="flex animate-in items-center fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards motion-reduce:animate-none"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "border-brand bg-brand/10" : "border-border/70 bg-card/50 hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold",
                    selected ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <span className="font-medium">{node.label}</span>
              </button>
              {i < nodes.length - 1 && (
                <ChevronRight className="mx-1 size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 min-h-16 rounded-xl bg-muted/40 p-4" aria-live="polite">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">{nodes[active]?.label}: </span>
          <span className="text-muted-foreground">{nodes[active]?.detail}</span>
        </p>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
