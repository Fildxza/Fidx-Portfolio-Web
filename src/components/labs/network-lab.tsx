"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AppWindow,
  Ban,
  Cable,
  CheckCircle2,
  Cpu,
  Database,
  FolderOpen,
  Globe,
  HardDrive,
  Laptop,
  Monitor,
  Printer,
  Router,
  Server,
  Shield,
  Thermometer,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  EDGES,
  NET_HEIGHT,
  NET_WIDTH,
  NODES,
  PATHS,
  PRINCIPLES,
  ZONES,
  type NetNode,
  type NodeKind,
  type Zone,
} from "@/lib/network-lab";
import { cn } from "@/lib/utils";

const ICONS: Record<NodeKind, LucideIcon> = {
  internet: Globe,
  firewall: Shield,
  router: Router,
  switch: Cable,
  web: AppWindow,
  database: Database,
  files: FolderOpen,
  backup: HardDrive,
  pc: Monitor,
  laptop: Laptop,
  printer: Printer,
  admin: UserCog,
  siem: Activity,
  "bas-server": Server,
  controller: Cpu,
  sensors: Thermometer,
};

const nodeById = new Map(NODES.map((n) => [n.id, n]));
const edgeKey = (a: string, b: string) => [a, b].sort().join("|");

const zoneOf = (n: NetNode): Zone | undefined =>
  ZONES.find((z) => n.x >= z.x && n.x <= z.x + z.w && n.y >= z.y && n.y <= z.y + z.h);

const zoneColor = (z: Zone | undefined, alpha = 1) =>
  z ? `oklch(0.72 0.14 ${z.hue} / ${alpha})` : `oklch(0.72 0.1 255 / ${alpha})`;

/** Geometry for each link; later devices on one switch arc over earlier ones. */
function buildEdges() {
  const used = new Map<string, number>();
  return EDGES.map(([a, b]) => {
    const from = nodeById.get(a)!;
    const to = nodeById.get(b)!;
    const index = used.get(a) ?? 0;
    used.set(a, index + 1);
    const sameRow = from.kind === "switch" && from.y === to.y && to.kind !== "switch";
    const d =
      sameRow && index > 0
        ? `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - (12 + index * 14) * 2} ${to.x} ${to.y}`
        : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    return { key: edgeKey(a, b), d };
  });
}
const EDGE_GEOMETRY = buildEdges();

export function NetworkLab() {
  const reduce = useReducedMotion() ?? false;
  const [pathId, setPathId] = useState(PATHS[0].id);
  const [nodeId, setNodeId] = useState<string | null>(null);

  const path = PATHS.find((p) => p.id === pathId) ?? PATHS[0];
  const activeEdges = useMemo(() => {
    const keys = new Set<string>();
    for (let i = 0; i < path.steps.length - 1; i++) keys.add(edgeKey(path.steps[i].node, path.steps[i + 1].node));
    return keys;
  }, [path]);
  const stepIndex = new Map(path.steps.map((s, i) => [s.node, i]));
  const blockedNode = path.steps.find((s) => s.blocked)?.node;
  const selected = nodeId ? nodeById.get(nodeId) : null;
  const blocked = path.verdict === "blocked";
  const flowColor = blocked ? "oklch(0.66 0.21 25)" : "var(--brand)";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/60 bg-card/50 p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Traffic scenarios">
          {PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === pathId}
              onClick={() => setPathId(p.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                p.id === pathId
                  ? p.verdict === "blocked"
                    ? "border-red-500/60 bg-red-500/10"
                    : "border-brand bg-brand/10"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {p.verdict === "blocked" ? (
                <Ban className="size-3 text-red-500" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-3 text-emerald-500" aria-hidden="true" />
              )}
              {p.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${NET_WIDTH} ${NET_HEIGHT}`}
            className="h-auto w-full min-w-[640px]"
            role="group"
            aria-label="Fictional network diagram: internet, edge firewall, DMZ, core router and four VLANs. Select a traffic scenario to trace its path, or a device for details."
          >
            {ZONES.map((z) => (
              <g key={z.id}>
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx={16}
                  fill={zoneColor(z, 0.06)}
                  stroke={zoneColor(z, 0.4)}
                  strokeDasharray="4 5"
                />
                <text x={z.x + z.w - 14} y={z.y + 20} textAnchor="end" fontSize={11.5} fontWeight={600} fill={zoneColor(z)}>
                  {z.label}
                </text>
              </g>
            ))}

            {EDGE_GEOMETRY.map((e) => (
              <path key={e.key} d={e.d} fill="none" strokeWidth={1.4} className="stroke-foreground/20" />
            ))}
            {EDGE_GEOMETRY.filter((e) => activeEdges.has(e.key)).map((e) => (
              <motion.path
                key={`${path.id}-${e.key}`}
                d={e.d}
                fill="none"
                stroke={flowColor}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray={reduce ? undefined : "7 7"}
                className={reduce ? undefined : "net-flow"}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            ))}

            {NODES.map((n) => {
              const Icon = ICONS[n.kind];
              const zone = zoneOf(n);
              const color = zoneColor(zone);
              const onPath = stepIndex.has(n.id);
              const isBlocked = n.id === blockedNode;
              const isSelected = n.id === nodeId;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  className="cursor-pointer outline-none focus-visible:[&>circle:first-of-type]:stroke-[3]"
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${n.label}${onPath ? ` (step ${stepIndex.get(n.id)! + 1} of the selected path)` : ""}`}
                  onClick={() => setNodeId(isSelected ? null : n.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setNodeId(isSelected ? null : n.id);
                    }
                  }}
                >
                  {(onPath || isSelected) && (
                    <circle
                      r={29}
                      fill="none"
                      strokeWidth={2}
                      stroke={isBlocked ? "oklch(0.66 0.21 25)" : onPath ? flowColor : color}
                      opacity={onPath ? 0.9 : 0.6}
                    />
                  )}
                  <circle r={21} className="fill-background" stroke={isBlocked ? "oklch(0.66 0.21 25)" : color} strokeWidth={1.6} />
                  <Icon x={-10} y={-10} width={20} height={20} strokeWidth={1.7} stroke={isBlocked ? "oklch(0.66 0.21 25)" : color} />
                  <text y={38} textAnchor="middle" fontSize={11} className="fill-foreground" fontWeight={onPath ? 600 : 400}>
                    {n.label}
                  </text>
                  {isBlocked && (
                    <g transform="translate(15 -15)">
                      <circle r={8} fill="oklch(0.66 0.21 25)" />
                      <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                    </g>
                  )}
                  <circle r={26} fill="transparent" />
                </g>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 px-1 text-[0.7rem] text-muted-foreground">
          Fictional network. Nothing here sends or scans real traffic. Click any device for its role and the defence that protects it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <div className="mb-1 flex items-center gap-2">
            {blocked ? (
              <Ban className="size-4 text-red-500" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
            )}
            <h3 className="text-sm font-semibold">
              {path.label} — {blocked ? "blocked" : "allowed"}
            </h3>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{path.summary}</p>
          <ol className="flex flex-col gap-2.5">
            {path.steps.map((step, i) => {
              const node = nodeById.get(step.node)!;
              return (
                <li key={`${path.id}-${i}`} className="flex gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold",
                      step.blocked ? "bg-red-500 text-white" : "bg-brand/15 text-brand"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <button
                      type="button"
                      onClick={() => setNodeId(node.id)}
                      className="font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {node.label}
                    </button>
                    <span className="text-muted-foreground"> — {step.note}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-col gap-4">
          <div className="min-h-40 rounded-2xl border border-border/60 bg-card/50 p-5" aria-live="polite">
            {selected ? (
              <>
                <h3 className="text-sm font-semibold">{selected.label}</h3>
                <dl className="mt-3 flex flex-col gap-2 text-xs leading-relaxed">
                  <div>
                    <dt className="font-semibold">Role</dt>
                    <dd className="text-muted-foreground">{selected.role}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Typical risk</dt>
                    <dd className="text-muted-foreground">{selected.risk}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-emerald-700 dark:text-emerald-400">Defensive practice</dt>
                    <dd className="text-muted-foreground">{selected.defence}</dd>
                  </div>
                </dl>
                {zoneOf(selected) && (
                  <p className="mt-3 text-[0.7rem] text-muted-foreground">
                    <span className="font-semibold text-foreground">{zoneOf(selected)!.label}:</span> {zoneOf(selected)!.rule}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a device on the diagram — or a step on the left — to see its role and how it is defended.</p>
            )}
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-xl border border-border/60 bg-card/50 p-3">
                <p className="text-xs font-semibold">{p.title}</p>
                <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
