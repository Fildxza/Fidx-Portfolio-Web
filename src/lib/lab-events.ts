export const COMMAND_PALETTE_EVENT = "open-command-palette";

export type LabId = "forensics" | "risk" | "logs" | "network";

/** Dispatched on `window` (detail: LabId) to switch the Interactive Labs tab. */
export const OPEN_LAB_EVENT = "open-lab";

export const isLabId = (value: unknown): value is LabId =>
  value === "forensics" || value === "risk" || value === "logs" || value === "network";
