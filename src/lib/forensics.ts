/**
 * Pure helpers for the Digital Forensics lab. Everything here runs in the
 * browser (Web Crypto) — no file is ever uploaded.
 */

export const HASH_ALGORITHMS = ["SHA-256", "SHA-1", "SHA-512"] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

/** Largest file the lab will read into memory. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export async function digestHex(
  data: ArrayBuffer | Uint8Array,
  algorithm: HashAlgorithm = "SHA-256"
): Promise<string> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  // Copy into a fresh buffer so a shared/offset view can never be hashed by mistake.
  const digest = await crypto.subtle.digest(algorithm, bytes.slice().buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[unit]} (${bytes.toLocaleString("en-US")} bytes)`;
}

export function toHexBytes(bytes: Uint8Array, count = 8): string {
  return Array.from(bytes.slice(0, count), (b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
}

type Signature = { type: string; extensions: string[]; magic: number[] };

const SIGNATURES: Signature[] = [
  { type: "PNG image", extensions: ["png"], magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "JPEG image", extensions: ["jpg", "jpeg"], magic: [0xff, 0xd8, 0xff] },
  { type: "GIF image", extensions: ["gif"], magic: [0x47, 0x49, 0x46, 0x38] },
  { type: "PDF document", extensions: ["pdf"], magic: [0x25, 0x50, 0x44, 0x46] },
  {
    type: "ZIP container (also .docx, .xlsx, .apk, .jar)",
    extensions: ["zip", "docx", "xlsx", "pptx", "jar", "apk"],
    magic: [0x50, 0x4b, 0x03, 0x04],
  },
  { type: "Windows executable (PE)", extensions: ["exe", "dll", "sys"], magic: [0x4d, 0x5a] },
  { type: "ELF executable", extensions: ["elf", "so", "bin"], magic: [0x7f, 0x45, 0x4c, 0x46] },
  { type: "GZIP archive", extensions: ["gz", "tgz"], magic: [0x1f, 0x8b] },
  { type: "7-Zip archive", extensions: ["7z"], magic: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c] },
  { type: "PCAP capture", extensions: ["pcap"], magic: [0xd4, 0xc3, 0xb2, 0xa1] },
];

export type SignatureResult =
  | { status: "unknown" }
  | { status: "match"; type: string }
  | { status: "mismatch"; type: string; extension: string };

/** Compares a file's leading "magic number" with what its extension claims. */
export function checkSignature(bytes: Uint8Array, fileName: string): SignatureResult {
  const found = SIGNATURES.find((sig) => sig.magic.every((b, i) => bytes[i] === b));
  if (!found) return { status: "unknown" };
  const dot = fileName.lastIndexOf(".");
  const extension = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
  if (!extension || found.extensions.includes(extension)) return { status: "match", type: found.type };
  return { status: "mismatch", type: found.type, extension };
}

/** Per-character comparison of two equal-length hex digests. */
export function diffHex(a: string, b: string): { char: string; changed: boolean }[] {
  return Array.from(b, (char, i) => ({ char, changed: a[i] !== char }));
}

export function normaliseHash(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

export const SAMPLE_EVIDENCE = `CASE REF: DEMO-0001 (synthetic sample, not a real case)
ITEM:     Exported chat excerpt
ACQUIRED: 2026-01-15 09:30 UTC by "Examiner A" (fictional)

[09:12] user_a: Did you move the invoice to the shared drive?
[09:13] user_b: Yes, it is in /finance/2026/Q1.
[09:14] user_a: Thanks. I will approve it this afternoon.`;
