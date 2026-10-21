"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertOctagon, Flag, HelpCircle, Search, ShieldAlert } from "lucide-react";
import { LOG_EVENTS, SEVERITIES, detectAlerts, type Alert, type Severity } from "@/lib/log-lab";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<Severity, { dot: string; text: string }> = {
  info: { dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  low: { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  medium: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  high: { dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  critical: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

const STATUS_STYLE: Record<Alert["status"], string> = {
  suspicious: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
  review: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "likely benign": "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function LogLab() {
  const reduce = useReducedMotion() ?? false;
  const alerts = useMemo(() => detectAlerts(LOG_EVENTS), []);
  const [enabled, setEnabled] = useState<Set<Severity>>(new Set(SEVERITIES));
  const [query, setQuery] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const flagged = useMemo(() => new Set(alerts.flatMap((a) => a.eventIds)), [alerts]);
  const selected = alerts.find((a) => a.id === selectedAlert) ?? null;
  const highlight = useMemo(() => new Set(selected?.eventIds ?? []), [selected]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<Severity, number>;
    for (const e of LOG_EVENTS) c[e.severity]++;
    return c;
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOG_EVENTS.filter((e) => {
      if (!enabled.has(e.severity)) return false;
      if (onlyFlagged && !flagged.has(e.id)) return false;
      if (!q) return true;
      return [e.message, e.user, e.srcIp, e.host].some((v) => v?.toLowerCase().includes(q));
    });
  }, [enabled, query, onlyFlagged, flagged]);

  const toggleSeverity = (s: Severity) =>
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const timeline = alerts.filter((a) => a.status === "suspicious");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Events */}
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-40 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search events by message, user, IP or host"
                placeholder="Search message, user, IP, host"
                className="w-full rounded-full border border-input bg-background/70 py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium focus-within:ring-2 focus-within:ring-ring">
              <input
                type="checkbox"
                checked={onlyFlagged}
                onChange={(e) => setOnlyFlagged(e.target.checked)}
                className="size-3.5 accent-[var(--brand)]"
              />
              Flagged only
            </label>
          </div>

          <div role="group" aria-label="Filter by severity" className="flex flex-wrap gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={enabled.has(s)}
                onClick={() => toggleSeverity(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  enabled.has(s) ? "border-border bg-muted/60" : "border-border/50 text-muted-foreground opacity-60"
                )}
              >
                <span aria-hidden="true" className={cn("size-2 rounded-full", SEVERITY_STYLE[s].dot)} />
                {s}
                <span className="text-muted-foreground">{counts[s]}</span>
              </button>
            ))}
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Fictional security events"
            className="max-h-[26rem] overflow-auto rounded-xl border border-border/70 bg-background/50 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-card text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Host</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Event</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr
                    key={e.id}
                    className={cn(
                      "border-t border-border/50 align-top transition-colors",
                      highlight.has(e.id) ? "bg-brand/10" : flagged.has(e.id) && "bg-muted/40"
                    )}
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono">{e.time}</td>
                    <td className={cn("px-3 py-2 font-medium capitalize", SEVERITY_STYLE[e.severity].text)}>{e.severity}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono">{e.host}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono">{e.srcIp ?? "—"}</td>
                    <td className="px-3 py-2">
                      {flagged.has(e.id) && <Flag className="mr-1 inline size-3 text-brand" aria-label="Flagged by a detection rule" />}
                      {e.message}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No events match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            Showing {rows.length} of {LOG_EVENTS.length} events. Every host, user and IP is invented (IPs use the documentation ranges reserved for examples).
          </p>
        </div>

        {/* Detections */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-5">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-semibold">Detections</h4>
            <span className="text-xs text-muted-foreground">{alerts.length} rules fired</span>
          </div>
          <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
            {alerts.map((a) => {
              const open = a.id === selectedAlert;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setSelectedAlert(open ? null : a.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      open ? "border-brand/60 bg-brand/5" : "border-border/70 hover:bg-muted/40"
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">{a.title}</span>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium capitalize", STATUS_STYLE[a.status])}>
                        {a.status}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {a.rule} · {a.time} · {a.eventIds.length} event{a.eventIds.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-2 px-1 pb-1 pt-2 text-xs leading-relaxed">
                          <p>
                            <span className="font-semibold">What happened: </span>
                            <span className="text-muted-foreground">{a.summary}</span>
                          </p>
                          <p>
                            <span className="font-semibold">Why it matters: </span>
                            <span className="text-muted-foreground">{a.why}</span>
                          </p>
                          <p className="flex gap-1.5">
                            <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                            <span>
                              <span className="font-semibold">Possible false positive: </span>
                              <span className="text-muted-foreground">{a.falsePositive}</span>
                            </span>
                          </p>
                          <p className="text-[0.7rem] text-muted-foreground">Matching events are highlighted in the table.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertOctagon className="size-4 text-brand" aria-hidden="true" />
          <h4 className="text-sm font-semibold">Reconstructed incident timeline</h4>
        </div>
        <ol className="relative ml-2 flex flex-col gap-4 border-l border-border pl-6">
          {timeline.map((a, i) => (
            <motion.li
              key={a.id}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
              className="relative"
            >
              <span
                aria-hidden="true"
                className={cn("absolute -left-[1.9rem] top-1 size-2.5 rounded-full ring-4 ring-card", SEVERITY_STYLE[a.severity].dot)}
              />
              <p className="text-sm font-medium">
                <span className="mr-2 font-mono text-xs text-muted-foreground">{a.time}</span>
                {a.title}
              </p>
              <p className="text-xs text-muted-foreground">{a.summary}</p>
            </motion.li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
          <span>
            <strong className="text-foreground">Simulated.</strong> The data is fictional, but the seven detection rules are real
            code running on it in your browser. In a real investigation an analyst would validate each alert, consider the false
            positives listed above, and corroborate with other sources before drawing conclusions.
          </span>
        </p>
      </div>
    </div>
  );
}
