import type { SkillCategory } from "@/lib/types";

/**
 * Presentation + evidence layer for the Skills section.
 *
 * Skill names/categories still come from the database (or resume-data
 * fallback). This module only adds *where each skill was actually used* —
 * every entry below is taken from the resume, so the section can show
 * evidence instead of self-assigned percentages. A skill with no entry here
 * simply renders without evidence rather than with an invented one.
 */

export type EvidenceKind = "work" | "project" | "cert" | "study" | "listed";

export type EvidenceSource = {
  kind: EvidenceKind;
  label: string;
};

const WORK = (label: string): EvidenceSource => ({ kind: "work", label });
const PROJECT = (label: string): EvidenceSource => ({ kind: "project", label });
const CERT = (label: string): EvidenceSource => ({ kind: "cert", label });
const STUDY = (label: string): EvidenceSource => ({ kind: "study", label });
const LISTED = (label: string): EvidenceSource => ({ kind: "listed", label });

const QORVA = WORK("Qorva Technology");
const PAVILION = WORK("Pavilion");
const SCHINDLER = WORK("Antah Schindler");
const BOCORCHECK = PROJECT("BocorCheck");
const SECURITY_PLUS = CERT("CompTIA Security+");
const UNIRAZAK = STUDY("UNIRAZAK");

type SkillMeta = {
  short?: string;
  note: string;
  sources: EvidenceSource[];
};

const SKILL_META: Record<string, SkillMeta> = {
  "hardware & software troubleshooting": {
    short: "HW/SW Troubleshooting",
    note: "Resolved first-line hardware, software and connectivity tickets, and diagnosed faults on HVAC controllers and elevator systems.",
    sources: [QORVA, PAVILION, SCHINDLER],
  },
  "helpdesk ticketing (zendesk)": {
    short: "Zendesk Ticketing",
    note: "Logged, tracked and resolved end-user tickets in Zendesk.",
    sources: [QORVA],
  },
  "virtualization (vmware, virtualbox)": {
    short: "VMware / VirtualBox",
    note: "Virtualization platforms listed on my resume.",
    sources: [LISTED("Resume")],
  },
  "windows, ubuntu & kali linux": {
    short: "Windows / Ubuntu / Kali",
    note: "Operating systems listed on my resume.",
    sources: [LISTED("Resume")],
  },
  "wireshark & nmap": {
    note: "Network analysis and scanning tools listed on my resume under forensics and security tools.",
    sources: [LISTED("Resume")],
  },
  "autopsy, ftk imager & volatility": {
    short: "Autopsy / FTK / Volatility",
    note: "Disk and memory forensics tools listed on my resume.",
    sources: [LISTED("Resume")],
  },
  "aleapp / ileapp": {
    note: "Mobile-forensics parsers listed on my resume.",
    sources: [LISTED("Resume")],
  },
  "sherlock, spiderfoot & maltego": {
    short: "Sherlock / SpiderFoot / Maltego",
    note: "OSINT tools listed on my resume.",
    sources: [LISTED("Resume")],
  },
  "basic java": {
    note: "Basic Java, supported by a Java course certificate (LearnQuest, 2025).",
    sources: [CERT("Java · LearnQuest")],
  },
  "preventive maintenance": {
    short: "Preventive Maintenance",
    note: "Ran preventive checks across end-user devices and routine inspections on elevator systems.",
    sources: [QORVA, SCHINDLER],
  },
  "lan/wan diagnostics": {
    short: "LAN/WAN Diagnostics",
    note: "Diagnosed basic LAN/WAN connectivity issues to keep operations stable.",
    sources: [QORVA],
  },
  "tcp/ip": {
    note: "Applied while diagnosing connectivity tickets.",
    sources: [QORVA],
  },
  "building automation systems (bas)": {
    short: "Building Automation",
    note: "Monitored HVAC controller, sensor and panel networks across a multi-tenant commercial site.",
    sources: [PAVILION],
  },
  "comptia security+": {
    short: "Security+",
    note: "Holds the CompTIA Security+ certification.",
    sources: [SECURITY_PLUS],
  },
  osint: {
    note: "Core technique behind how BocorCheck discovers personal data exposure.",
    sources: [BOCORCHECK],
  },
  "have i been pwned api": {
    short: "HIBP API",
    note: "Breach-data source integrated into BocorCheck's risk scoring.",
    sources: [BOCORCHECK],
  },
  "computer forensics fundamentals": {
    short: "Forensics Fundamentals",
    note: "Studied as part of the B.IT (Computer Forensics) degree.",
    sources: [UNIRAZAK],
  },
  python: {
    note: "Backend language for BocorCheck.",
    sources: [BOCORCHECK],
  },
  flask: {
    note: "Web framework serving the BocorCheck backend.",
    sources: [BOCORCHECK],
  },
  mysql: {
    note: "Database layer for BocorCheck.",
    sources: [BOCORCHECK],
  },
  "ollama / local llms": {
    short: "Ollama / Local LLMs",
    note: "A local LLM generates privacy-preserving mitigation guidance in BocorCheck.",
    sources: [BOCORCHECK],
  },
  "agile sdlc": {
    note: "Applied across design, development and structured user acceptance testing on the final year project.",
    sources: [BOCORCHECK, UNIRAZAK],
  },
};

export type CategoryMeta = {
  /** CSS colour for the category's nodes/accents — readable on light and dark. */
  color: string;
  blurb: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  "IT Support & Infrastructure": {
    color: "oklch(0.7 0.15 255)",
    blurb: "Keeping end-user systems and building infrastructure running — from helpdesk tickets to HVAC controllers.",
  },
  Networking: {
    color: "oklch(0.74 0.12 205)",
    blurb: "Diagnosing connectivity problems across LAN/WAN and the controller networks behind building systems.",
  },
  "Security & Forensics": {
    color: "oklch(0.74 0.16 160)",
    blurb: "Security fundamentals and an OSINT-driven final year project, studied under a Computer Forensics degree.",
  },
  Development: {
    color: "oklch(0.72 0.15 305)",
    blurb: "The stack behind BocorCheck: Python, Flask, MySQL and a locally hosted LLM.",
  },
};

const FALLBACK_COLORS = [
  "oklch(0.7 0.15 255)",
  "oklch(0.74 0.12 205)",
  "oklch(0.74 0.16 160)",
  "oklch(0.72 0.15 305)",
  "oklch(0.76 0.14 80)",
  "oklch(0.72 0.15 20)",
];

export type EnrichedSkill = {
  id: string;
  name: string;
  label: string;
  note: string | null;
  sources: EvidenceSource[];
};

export type EnrichedCategory = {
  id: string;
  name: string;
  color: string;
  blurb: string | null;
  skills: EnrichedSkill[];
};

export function enrichCategories(categories: SkillCategory[]): EnrichedCategory[] {
  return categories.map((category, index) => {
    const meta = CATEGORY_META[category.name];
    return {
      id: category.id,
      name: category.name,
      color: meta?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      blurb: meta?.blurb ?? null,
      skills: category.skills.map((skill) => {
        const skillMeta = SKILL_META[skill.name.trim().toLowerCase()];
        return {
          id: skill.id,
          name: skill.name,
          label: skillMeta?.short ?? skill.name,
          note: skillMeta?.note ?? null,
          sources: skillMeta?.sources ?? [],
        };
      }),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Layout — pure geometry for the capability map                       */
/* ------------------------------------------------------------------ */

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 620;
export const MAP_CENTER = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };

export type MapSkillNode = {
  skill: EnrichedSkill;
  categoryIndex: number;
  x: number;
  y: number;
  /** Label placement relative to the node. */
  anchor: "start" | "end" | "middle";
  labelDx: number;
  labelDy: number;
};

export type MapHubNode = {
  category: EnrichedCategory;
  index: number;
  x: number;
  y: number;
};

export type MapLayout = {
  hubs: MapHubNode[];
  skills: MapSkillNode[];
};

export const HUB_RX = 205;
export const HUB_RY = 132;
const SKILL_RADIUS = 122;
const DEG = Math.PI / 180;

// Rounded so server- and client-rendered SVG coordinates match exactly.
const round = (n: number) => Math.round(n * 100) / 100;

export function layoutMap(categories: EnrichedCategory[]): MapLayout {
  const hubs: MapHubNode[] = [];
  const skills: MapSkillNode[] = [];
  const count = Math.max(categories.length, 1);

  categories.forEach((category, index) => {
    // Spread hubs evenly, offset so four categories land on the diagonals.
    const angle = (-90 + (360 / count) * (index + 0.5)) * DEG;
    const x = round(MAP_CENTER.x + HUB_RX * Math.cos(angle));
    const y = round(MAP_CENTER.y + HUB_RY * Math.sin(angle));
    hubs.push({ category, index, x, y });

    // Fan the skills outward, away from the centre.
    const outward = Math.atan2(y - MAP_CENTER.y, x - MAP_CENTER.x);
    const total = category.skills.length;
    const spread = Math.min(150, 31 * Math.max(total - 1, 0)) * DEG;

    category.skills.forEach((skill, j) => {
      const t = total === 1 ? 0 : j / (total - 1) - 0.5;
      const a = outward + spread * t;
      const radius = SKILL_RADIUS + Math.max(total - 5, 0) * 11;
      const sx = round(x + radius * Math.cos(a));
      const sy = round(y + radius * Math.sin(a));
      // Labels face away from their hub; near-vertical nodes get a centred label above/below.
      const dx = sx - x;
      const vertical = Math.abs(dx) < 26;
      skills.push({
        skill,
        categoryIndex: index,
        x: sx,
        y: sy,
        anchor: vertical ? "middle" : dx > 0 ? "start" : "end",
        labelDx: vertical ? 0 : dx > 0 ? 15 : -15,
        labelDy: vertical ? (sy < y ? -15 : 25) : 4.5,
      });
    });
  });

  return { hubs, skills };
}

/** Skills that share at least one evidence source with `skillId`. */
export function relatedSkillIds(layout: MapLayout, skillId: string): Set<string> {
  const target = layout.skills.find((n) => n.skill.id === skillId);
  const related = new Set<string>();
  if (!target) return related;
  // "Listed on resume" is not a shared context, so it never links skills together.
  const shared = (sources: EvidenceSource[]) => sources.filter((s) => s.kind !== "listed");
  const labels = new Set(shared(target.skill.sources).map((s) => `${s.kind}:${s.label}`));
  if (labels.size === 0) return related;

  for (const node of layout.skills) {
    if (node.skill.id === skillId) continue;
    if (shared(node.skill.sources).some((s) => labels.has(`${s.kind}:${s.label}`))) {
      related.add(node.skill.id);
    }
  }
  return related;
}

/** Greedy word-wrap so long skill names stay inside the map instead of being clipped. */
export function wrapLabel(label: string, maxChars = 17): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of label.split(" ")) {
    if (current && `${current} ${word}`.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
