import type { FlowNode } from "@/lib/project-registry";

const HUES: Record<string, number> = {
  Cybersecurity: 160,
  "Digital Forensics": 205,
  "AI & Computer Vision": 305,
  "Web Applications": 255,
  "Research & Academic": 80,
};

/**
 * Generated thumbnail: the project's architecture drawn as a small node chain.
 * Used instead of a screenshot when none exists, and it never pretends to be one.
 */
export function ProjectThumb({ nodes, category }: { nodes: FlowNode[]; category?: string }) {
  const hue = HUES[category ?? ""] ?? 255;
  const count = Math.min(Math.max(nodes.length, 2), 6);
  const color = `oklch(0.72 0.14 ${hue})`;
  const points = Array.from({ length: count }, (_, i) => ({
    x: 40 + (i * 240) / (count - 1),
    y: i % 2 === 0 ? 78 : 112,
  }));

  return (
    <svg viewBox="0 0 320 190" className="size-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`thumb-grid-${hue}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" strokeWidth="0.5" className="stroke-foreground/10" />
        </pattern>
        <radialGradient id={`thumb-glow-${hue}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="190" fill={`url(#thumb-grid-${hue})`} />
      <rect width="320" height="190" fill={`url(#thumb-glow-${hue})`} />
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.55"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <rect
            x={-11}
            y={-11}
            width={22}
            height={22}
            rx={6}
            className="thumb-node fill-background"
            stroke={color}
            strokeWidth="1.5"
            style={{ animationDelay: `${i * 110}ms` }}
          />
          <circle r={3} fill={color} />
        </g>
      ))}
    </svg>
  );
}
