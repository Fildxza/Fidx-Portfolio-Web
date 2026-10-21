"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  HUB_RX,
  HUB_RY,
  MAP_CENTER,
  MAP_HEIGHT,
  MAP_WIDTH,
  type MapLayout,
  type MapSkillNode,
} from "@/lib/skills-map";

type SkillsMapProps = {
  layout: MapLayout;
  icons: LucideIcon[];
  activeIndex: number;
  focusId: string | null;
  related: Set<string>;
  /** True once the map has scrolled into view (or immediately if motion is reduced). */
  show: boolean;
  reduce: boolean;
  onHoverSkill: (id: string | null) => void;
  onPickSkill: (id: string, categoryIndex: number) => void;
  onPickCategory: (index: number) => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Rough label width so the hub caption gets a backing pill. */
const pillWidth = (text: string) => Math.round(text.length * 7.4 + 24);

export function SkillsMap({
  layout,
  icons,
  activeIndex,
  focusId,
  related,
  show,
  reduce,
  onHoverSkill,
  onPickSkill,
  onPickCategory,
}: SkillsMapProps) {
  const focusNode = focusId ? layout.skills.find((n) => n.skill.id === focusId) ?? null : null;
  const relatedNodes = layout.skills.filter((n) => related.has(n.skill.id));
  const litHubs = new Set<number>(
    focusNode ? [focusNode.categoryIndex, ...relatedNodes.map((n) => n.categoryIndex)] : []
  );

  const skillOpacity = (n: MapSkillNode) => {
    if (focusNode) return n.skill.id === focusNode.skill.id || related.has(n.skill.id) ? 1 : 0.16;
    return n.categoryIndex === activeIndex ? 1 : 0.4;
  };
  const hubOpacity = (index: number) => {
    if (focusNode) return litHubs.has(index) ? 1 : 0.25;
    return index === activeIndex ? 1 : 0.6;
  };

  const entrance = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, scale: 0.5 },
          animate: show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  const draw = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const originStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="Capability map: skills grouped into categories around a central node, each connected to where it was used."
    >
      <defs>
        <radialGradient id="skills-center-glow">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </radialGradient>
        {layout.hubs.map((hub) => (
          <radialGradient key={hub.category.id} id={`skills-halo-${hub.index}`}>
            <stop offset="0%" stopColor={hub.category.color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={hub.category.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <pattern id="skills-dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" className="fill-foreground/15" />
        </pattern>
        <radialGradient id="skills-fade">
          <stop offset="30%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="skills-dots-mask">
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#skills-fade)" />
        </mask>
      </defs>

      {/* Backdrop: masked dot grid + orbit guides */}
      <rect
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        fill="url(#skills-dots)"
        mask="url(#skills-dots-mask)"
      />
      <circle
        cx={MAP_CENTER.x}
        cy={MAP_CENTER.y}
        r={HUB_RX + 70}
        fill="none"
        strokeWidth={1}
        strokeDasharray="2 7"
        className="skills-orbit stroke-foreground/20"
      />
      <ellipse
        cx={MAP_CENTER.x}
        cy={MAP_CENTER.y}
        rx={HUB_RX}
        ry={HUB_RY}
        fill="none"
        strokeWidth={1}
        className="stroke-foreground/10"
      />
      <motion.circle
        cx={MAP_CENTER.x}
        cy={MAP_CENTER.y}
        r={170}
        fill="url(#skills-center-glow)"
        {...(reduce
          ? { initial: false as const }
          : {
              initial: { opacity: 0 },
              animate: { opacity: show ? 1 : 0 },
              transition: { duration: 1.2 },
            })}
      />

      {/* Links: centre → hub */}
      {layout.hubs.map((hub) => (
        <motion.g
          key={`hub-link-${hub.category.id}`}
          animate={{ opacity: hubOpacity(hub.index) }}
          transition={{ duration: 0.3 }}
        >
          <motion.line
            x1={MAP_CENTER.x}
            y1={MAP_CENTER.y}
            x2={hub.x}
            y2={hub.y}
            stroke={hub.category.color}
            strokeWidth={1.5}
            strokeLinecap="round"
            {...draw(0.15 + hub.index * 0.08)}
          />
        </motion.g>
      ))}

      {/* Links: hub → skills */}
      {layout.skills.map((node, i) => {
        const hub = layout.hubs[node.categoryIndex];
        return (
          <motion.g
            key={`skill-link-${node.skill.id}`}
            animate={{ opacity: skillOpacity(node) * 0.75 }}
            transition={{ duration: 0.3 }}
          >
            <motion.line
              x1={hub.x}
              y1={hub.y}
              x2={node.x}
              y2={node.y}
              stroke={hub.category.color}
              strokeWidth={1}
              {...draw(0.5 + i * 0.04)}
            />
          </motion.g>
        );
      })}

      {/* Data pulses along the active category's links (skipped for reduced motion) */}
      {!reduce && show && !focusNode && layout.hubs[activeIndex] && (
        <g aria-hidden="true">
          <Pulse
            key={`pulse-hub-${activeIndex}`}
            x1={MAP_CENTER.x}
            y1={MAP_CENTER.y}
            x2={layout.hubs[activeIndex].x}
            y2={layout.hubs[activeIndex].y}
            color={layout.hubs[activeIndex].category.color}
            dur={2.4}
            begin={0}
          />
          {layout.skills
            .filter((n) => n.categoryIndex === activeIndex)
            .map((n, i) => (
              <Pulse
                key={`pulse-${n.skill.id}`}
                x1={layout.hubs[activeIndex].x}
                y1={layout.hubs[activeIndex].y}
                x2={n.x}
                y2={n.y}
                color={layout.hubs[activeIndex].category.color}
                dur={1.7}
                begin={0.6 + i * 0.35}
              />
            ))}
        </g>
      )}

      {/* Cross-links: skills that share evidence with the focused skill */}
      {focusNode &&
        relatedNodes.map((target, i) => {
          const mx = (focusNode.x + target.x) / 2;
          const my = (focusNode.y + target.y) / 2;
          const cx = mx * 0.5 + MAP_CENTER.x * 0.5;
          const cy = my * 0.5 + MAP_CENTER.y * 0.5;
          return (
            <motion.path
              key={`cross-${focusNode.skill.id}-${target.skill.id}`}
              d={`M ${focusNode.x} ${focusNode.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={1.4}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 0.55, delay: i * 0.05, ease: EASE }}
            />
          );
        })}

      {/* Skill nodes */}
      {layout.skills.map((node, i) => {
        const color = layout.hubs[node.categoryIndex].category.color;
        const isFocus = focusNode?.skill.id === node.skill.id;
        const isRelated = related.has(node.skill.id);
        return (
          <g key={node.skill.id} transform={`translate(${node.x} ${node.y})`}>
            <motion.g
              animate={{ opacity: skillOpacity(node) }}
              transition={{ duration: 0.3 }}
            >
              <motion.g style={originStyle} {...entrance(0.7 + i * 0.045)}>
                <g
                  className="skills-float"
                  style={
                    {
                      "--float-delay": `${(i % 7) * -0.9}s`,
                      "--float-dur": `${4.2 + (i % 5) * 0.5}s`,
                    } as React.CSSProperties
                  }
                >
                  <motion.circle
                    r={10}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.4}
                    animate={{ opacity: isFocus || isRelated ? 1 : 0, scale: isFocus ? 1.25 : 1 }}
                    style={originStyle}
                    transition={{ duration: 0.25 }}
                  />
                  <circle r={4.5} fill={color} />
                  <text
                    x={node.labelDx}
                    y={node.labelDy}
                    textAnchor={node.anchor}
                    fontSize={14}
                    fontWeight={isFocus ? 600 : 500}
                    className="fill-foreground max-sm:hidden"
                  >
                    {node.skill.label}
                  </text>
                  {/* Generous pointer target; keyboard users use the list beside the map. */}
                  <circle
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => onHoverSkill(node.skill.id)}
                    onMouseLeave={() => onHoverSkill(null)}
                    onClick={() => onPickSkill(node.skill.id, node.categoryIndex)}
                  />
                </g>
              </motion.g>
            </motion.g>
          </g>
        );
      })}

      {/* Category hubs */}
      {layout.hubs.map((hub) => {
        const Icon = icons[hub.index];
        const active = hub.index === activeIndex;
        const name = hub.category.name;
        const below = hub.y < MAP_CENTER.y; // caption faces the centre
        const pw = pillWidth(name);
        return (
          <g key={hub.category.id} transform={`translate(${hub.x} ${hub.y})`}>
            <motion.circle
              r={78}
              fill={`url(#skills-halo-${hub.index})`}
              animate={{ opacity: active || litHubs.has(hub.index) ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
            <motion.g
              animate={{ opacity: hubOpacity(hub.index) }}
              transition={{ duration: 0.3 }}
            >
              <motion.g style={originStyle} {...entrance(0.3 + hub.index * 0.1)}>
                <circle
                  r={29}
                  strokeWidth={1.5}
                  stroke={hub.category.color}
                  className="fill-background"
                />
                <circle
                  r={36}
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="3 6"
                  stroke={hub.category.color}
                  className={active ? "skills-orbit" : undefined}
                  opacity={active ? 0.9 : 0.35}
                />
                {Icon && (
                  <Icon
                    x={-11}
                    y={-11}
                    width={22}
                    height={22}
                    strokeWidth={1.8}
                    stroke={hub.category.color}
                  />
                )}
                <g className="max-sm:hidden">
                  <rect
                    x={-pw / 2}
                    y={below ? 42 : -62}
                    width={pw}
                    height={22}
                    rx={11}
                    className="fill-background stroke-border"
                  />
                  <text
                    y={below ? 57 : -47}
                    textAnchor="middle"
                    fontSize={12.5}
                    fontWeight={600}
                    className="fill-foreground"
                  >
                    {name}
                  </text>
                </g>
                <circle
                  r={40}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => onPickCategory(hub.index)}
                />
              </motion.g>
            </motion.g>
          </g>
        );
      })}

      {/* Centre node */}
      <g transform={`translate(${MAP_CENTER.x} ${MAP_CENTER.y})`}>
        <circle r={34} fill="none" strokeWidth={1.2} className="skills-pulse stroke-brand" />
        <motion.g style={originStyle} {...entrance(0)}>
          <circle r={34} className="fill-background stroke-brand" strokeWidth={1.8} />
          <circle r={27} fill="var(--brand)" opacity={0.12} />
          <text
            y={5.5}
            textAnchor="middle"
            fontSize={16}
            fontWeight={700}
            letterSpacing={0.5}
            className="fill-foreground"
          >
            FA
          </text>
        </motion.g>
      </g>
    </svg>
  );
}

function Pulse({
  x1,
  y1,
  x2,
  y2,
  color,
  dur,
  begin,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dur: number;
  begin: number;
}) {
  return (
    <circle r={2.6} fill={color} opacity={0}>
      <animateMotion
        path={`M ${x1} ${y1} L ${x2} ${y2}`}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.15;0.8;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}
