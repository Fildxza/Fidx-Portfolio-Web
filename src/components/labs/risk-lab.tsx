"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowDownRight, ShieldAlert } from "lucide-react";
import {
  BREACH_BANDS,
  DATA_CLASSES,
  PRESETS,
  RECENCY,
  computeRisk,
  leversFor,
  mitigationsFor,
  type DataClassId,
  type RiskInput,
  type Tier,
} from "@/lib/risk-model";
import { cn } from "@/lib/utils";

const TIER_COLOR: Record<Tier, string> = {
  Low: "oklch(0.72 0.16 160)",
  Medium: "oklch(0.8 0.15 85)",
  High: "oklch(0.74 0.16 50)",
  Critical: "oklch(0.66 0.21 25)",
};

const ARC = "M 20 100 A 80 80 0 0 1 180 100";

function Gauge({ score, tier }: { score: number; tier: Tier }) {
  const reduce = useReducedMotion() ?? false;
  const value = useMotionValue(score);
  const rounded = useTransform(value, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(value, score, { duration: reduce ? 0 : 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [score, reduce, value]);

  return (
    <div className="relative mx-auto w-full max-w-64">
      <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={`Simulated risk score ${score} out of 100, tier ${tier}`}>
        <path d={ARC} pathLength={100} fill="none" strokeWidth={14} strokeLinecap="butt" strokeDasharray="24.2 0.8" className="stroke-muted" />
        <motion.path
          d={ARC}
          pathLength={100}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: Math.max(score, 0.01) / 100, stroke: TIER_COLOR[tier] }}
          transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <motion.span className="text-4xl font-semibold tabular-nums leading-none">{rounded}</motion.span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: TIER_COLOR[tier] }}>
          {tier}
        </span>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  children,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
        checked ? "border-brand/60 bg-brand/5" : "border-border/70 hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-45"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-[var(--brand)]"
      />
      {children}
    </label>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            value === o.value ? "border-brand bg-brand/10" : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RiskLab() {
  const [input, setInput] = useState<RiskInput>(PRESETS[2].input);
  const [preset, setPreset] = useState<string | null>(PRESETS[2].name);
  const reduce = useReducedMotion() ?? false;

  const result = useMemo(() => computeRisk(input), [input]);
  const levers = useMemo(() => leversFor(input), [input]);
  const mitigations = useMemo(() => mitigationsFor(input), [input]);

  const update = (patch: Partial<RiskInput>) => {
    setPreset(null);
    setInput((current) => ({ ...current, ...patch }));
  };
  const hasBreach = input.breachBand > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Start from a scenario</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                aria-pressed={preset === p.name}
                onClick={() => {
                  setInput(p.input);
                  setPreset(p.name);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  preset === p.name ? "border-brand bg-brand/5" : "border-border/70 hover:bg-muted/50"
                )}
              >
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="block text-[0.7rem] leading-snug text-muted-foreground">{p.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Breaches found</legend>
          <Segmented
            label="Number of breaches"
            value={input.breachBand}
            options={BREACH_BANDS.map((b) => ({ value: b.value, label: b.label }))}
            onChange={(breachBand) => update({ breachBand })}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2" disabled={!hasBreach}>
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Data exposed</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {DATA_CLASSES.map((c) => (
              <Toggle
                key={c.id}
                checked={hasBreach && input.classes[c.id]}
                disabled={!hasBreach}
                onChange={(v) => update({ classes: { ...input.classes, [c.id as DataClassId]: v } })}
              >
                {c.label}
              </Toggle>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2" disabled={!hasBreach}>
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">How recent</legend>
          <Segmented
            label="How recent the breach was"
            value={input.recency}
            options={RECENCY.map((r) => ({ value: r.value, label: r.label }))}
            onChange={(recency) => update({ recency })}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Your habits</legend>
          <Toggle checked={input.passwordReuse} onChange={(passwordReuse) => update({ passwordReuse })}>
            I reuse that password on other accounts
          </Toggle>
          <Toggle checked={input.twoFactor} onChange={(twoFactor) => update({ twoFactor })}>
            Two-factor authentication is enabled
          </Toggle>
        </fieldset>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
        <Gauge score={result.score} tier={result.tier} />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why this score</p>
          {result.contributions.length === 0 ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Nothing contributes to the score in this scenario.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {result.contributions.map((c) => (
                <li key={c.id} title={c.note}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span>{c.label}</span>
                    <span className={cn("font-mono text-xs tabular-nums", c.points < 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
                      {c.points > 0 ? "+" : ""}
                      {c.points}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.points < 0 ? TIER_COLOR.Low : TIER_COLOR[result.tier] }}
                      initial={false}
                      animate={{ width: `${Math.min(Math.abs(c.points) / 30, 1) * 100}%` }}
                      transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{c.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {levers.length > 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
              What-if
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {levers.map((l) => (
                <li key={l.action}>
                  {l.action} <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">→ −{l.delta} points</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested next steps</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm marker:text-brand">
            {mitigations.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
          <span>
            <strong className="text-foreground">Simulated.</strong> This demo uses invented scenarios and arbitrary weights to
            illustrate explainable scoring. It performs no breach lookups and is not the BocorCheck algorithm. Never enter real
            passwords or personal data anywhere.
          </span>
        </p>
      </div>
    </div>
  );
}
