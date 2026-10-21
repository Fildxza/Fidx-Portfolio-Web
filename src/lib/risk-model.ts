/**
 * Illustrative exposure-risk model for the BocorCheck demo lab.
 *
 * This is NOT BocorCheck's real scoring algorithm and it never touches real
 * breach data — it exists to show how an explainable, factor-by-factor score
 * can be built and how changing one factor moves the result. All weights are
 * arbitrary demo values.
 */

export type DataClassId = "email" | "phone" | "hashedPassword" | "plainPassword" | "govId" | "address";
export type BreachBand = 0 | 1 | 2 | 4;
export type Recency = "recent" | "mid" | "old";

export type RiskInput = {
  breachBand: BreachBand;
  classes: Record<DataClassId, boolean>;
  recency: Recency;
  passwordReuse: boolean;
  twoFactor: boolean;
};

export type Tier = "Low" | "Medium" | "High" | "Critical";

export type Contribution = {
  id: string;
  label: string;
  points: number;
  note: string;
};

export type RiskResult = {
  score: number;
  tier: Tier;
  contributions: Contribution[];
};

export const BREACH_BANDS: { value: BreachBand; label: string; points: number }[] = [
  { value: 0, label: "None", points: 0 },
  { value: 1, label: "1", points: 8 },
  { value: 2, label: "2–3", points: 16 },
  { value: 4, label: "4+", points: 24 },
];

export const DATA_CLASSES: { id: DataClassId; label: string; points: number; note: string }[] = [
  { id: "email", label: "Email address", points: 4, note: "Enables phishing and credential stuffing." },
  { id: "phone", label: "Phone number", points: 7, note: "Enables SMS phishing and SIM-swap attempts." },
  { id: "hashedPassword", label: "Password (hashed)", points: 10, note: "Weak hashes can still be cracked offline." },
  { id: "plainPassword", label: "Password (plaintext)", points: 24, note: "Immediately usable on every site that reuses it." },
  { id: "govId", label: "Government ID number", points: 20, note: "Hard to change; enables identity fraud." },
  { id: "address", label: "Home address", points: 8, note: "Physical-world exposure and targeted scams." },
];

export const RECENCY: { value: Recency; label: string; multiplier: number }[] = [
  { value: "recent", label: "Under 1 year ago", multiplier: 1 },
  { value: "mid", label: "1–3 years ago", multiplier: 0.8 },
  { value: "old", label: "Over 3 years ago", multiplier: 0.6 },
];

const REUSE_POINTS = 14;
const TWO_FACTOR_POINTS = -10;

export function tierFor(score: number): Tier {
  if (score < 25) return "Low";
  if (score < 50) return "Medium";
  if (score < 75) return "High";
  return "Critical";
}

export function computeRisk(input: RiskInput): RiskResult {
  const contributions: Contribution[] = [];
  const band = BREACH_BANDS.find((b) => b.value === input.breachBand) ?? BREACH_BANDS[0];

  if (band.points > 0) {
    contributions.push({
      id: "breaches",
      label: `Appears in ${band.label} breach${band.value === 1 ? "" : "es"}`,
      points: band.points,
      note: "More breaches mean more copies of your data in circulation.",
    });
  }

  const exposed = band.value > 0 ? DATA_CLASSES.filter((c) => input.classes[c.id]) : [];
  for (const c of exposed) {
    contributions.push({ id: c.id, label: c.label, points: c.points, note: c.note });
  }

  const subtotal = contributions.reduce((sum, c) => sum + c.points, 0);
  const recency = RECENCY.find((r) => r.value === input.recency) ?? RECENCY[0];
  if (subtotal > 0 && recency.multiplier < 1) {
    contributions.push({
      id: "recency",
      label: "Older exposure",
      points: -Math.round(subtotal * (1 - recency.multiplier)),
      note: "Older leaks are somewhat less likely to still be actionable.",
    });
  }

  const passwordExposed = exposed.some((c) => c.id === "hashedPassword" || c.id === "plainPassword");
  if (passwordExposed && input.passwordReuse) {
    contributions.push({
      id: "reuse",
      label: "Password reused elsewhere",
      points: REUSE_POINTS,
      note: "One leaked password unlocks every account sharing it.",
    });
  }
  if (passwordExposed && input.twoFactor) {
    contributions.push({
      id: "twoFactor",
      label: "Two-factor authentication on",
      points: TWO_FACTOR_POINTS,
      note: "A stolen password alone is no longer enough to log in.",
    });
  }

  const raw = contributions.reduce((sum, c) => sum + c.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  return { score, tier: tierFor(score), contributions };
}

export type Lever = { action: string; delta: number };

/** What the score would drop by if the user changed one thing they control. */
export function leversFor(input: RiskInput): Lever[] {
  const base = computeRisk(input).score;
  const levers: Lever[] = [];
  if (input.passwordReuse) {
    levers.push({
      action: "Use a unique password on every account",
      delta: base - computeRisk({ ...input, passwordReuse: false }).score,
    });
  }
  if (!input.twoFactor) {
    levers.push({
      action: "Turn on two-factor authentication",
      delta: base - computeRisk({ ...input, twoFactor: true }).score,
    });
  }
  return levers.filter((l) => l.delta > 0).sort((a, b) => b.delta - a.delta);
}

export function mitigationsFor(input: RiskInput): string[] {
  const out: string[] = [];
  const band = input.breachBand;
  if (band === 0) return ["No exposure in this scenario — keep using unique passwords and two-factor authentication."];
  if (input.classes.plainPassword) {
    out.push("Change that password everywhere it was used, starting with email and banking.");
  } else if (input.classes.hashedPassword) {
    out.push("Change the exposed password; hashes can be cracked, especially if the password was weak.");
  }
  if (input.classes.hashedPassword || input.classes.plainPassword) {
    if (input.passwordReuse) out.push("Stop reusing passwords: a password manager makes unique passwords practical.");
    if (!input.twoFactor) out.push("Enable two-factor authentication, preferably an authenticator app or security key.");
  }
  if (input.classes.phone) out.push("Treat unexpected calls and SMS as suspect; ask your carrier about SIM-swap protection.");
  if (input.classes.email) out.push("Expect more phishing — verify links and senders before clicking.");
  if (input.classes.govId) out.push("Watch for identity fraud and consider a credit freeze where your country offers one.");
  if (input.classes.address) out.push("Be wary of delivery or ‘official’ scams that quote your address.");
  if (out.length === 0) out.push("Select what was exposed to see tailored steps.");
  return out;
}

export const EMPTY_CLASSES: Record<DataClassId, boolean> = {
  email: false,
  phone: false,
  hashedPassword: false,
  plainPassword: false,
  govId: false,
  address: false,
};

export const PRESETS: { name: string; blurb: string; input: RiskInput }[] = [
  {
    name: "No exposure",
    blurb: "Baseline",
    input: { breachBand: 0, classes: EMPTY_CLASSES, recency: "recent", passwordReuse: false, twoFactor: true },
  },
  {
    name: "Old forum leak",
    blurb: "Email + hashed password, 3+ years ago",
    input: {
      breachBand: 1,
      classes: { ...EMPTY_CLASSES, email: true, hashedPassword: true },
      recency: "old",
      passwordReuse: false,
      twoFactor: false,
    },
  },
  {
    name: "Credential-stuffing risk",
    blurb: "Plaintext password, reused, no 2FA",
    input: {
      breachBand: 2,
      classes: { ...EMPTY_CLASSES, email: true, phone: true, plainPassword: true },
      recency: "recent",
      passwordReuse: true,
      twoFactor: false,
    },
  },
  {
    name: "Heavy exposure",
    blurb: "Many breaches, sensitive data",
    input: {
      breachBand: 4,
      classes: { email: true, phone: true, hashedPassword: false, plainPassword: true, govId: true, address: true },
      recency: "recent",
      passwordReuse: true,
      twoFactor: false,
    },
  },
];
