"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Renders the real value on the server and without JavaScript, then counts up
 * from zero once it scrolls into view. (An earlier version started at 0 and
 * only revealed the number after an in-view animation, so crawlers, print
 * views and any client where the animation never fired showed "0".)
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  // null means "show the real value"; a number is an in-flight animation frame.
  const [frame, setFrame] = useState<number | null>(null);

  useEffect(() => {
    if (reduce || !isInView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setFrame(Math.round(v)),
      onComplete: () => setFrame(null),
    });
    return () => controls.stop();
  }, [isInView, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {frame ?? value}
    </span>
  );
}
