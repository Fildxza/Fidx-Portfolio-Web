"use client";

import { motion } from "framer-motion";

export function TimelineLine() {
  return (
    <motion.div
      aria-hidden
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      style={{ transformOrigin: "top" }}
      className="absolute left-[19px] top-2 bottom-2 hidden w-px bg-border sm:block"
    />
  );
}

export function TimelineItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="relative flex gap-6"
    >
      {children}
    </motion.li>
  );
}
