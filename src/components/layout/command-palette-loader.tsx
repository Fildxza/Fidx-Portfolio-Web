"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { COMMAND_PALETTE_EVENT } from "@/lib/lab-events";

const CommandPalette = dynamic(
  () => import("@/components/layout/command-palette").then((m) => m.CommandPalette),
  { ssr: false }
);

/** Loads the palette's code on first use (Ctrl/Cmd+K or the navbar button) rather than with the page. */
export function CommandPaletteLoader() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActive(true);
      }
    };
    const onOpen = () => setActive(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen);
    };
  }, [active]);

  return active ? <CommandPalette defaultOpen /> : null;
}
