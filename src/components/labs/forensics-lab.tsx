"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  Copy,
  FileText,
  HardDrive,
  Info,
  Lock,
  Microscope,
  RotateCcw,
  Search,
  Upload,
  Waypoints,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  HASH_ALGORITHMS,
  MAX_FILE_BYTES,
  SAMPLE_EVIDENCE,
  checkSignature,
  diffHex,
  digestHex,
  formatBytes,
  normaliseHash,
  toHexBytes,
  type HashAlgorithm,
  type SignatureResult,
} from "@/lib/forensics";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Workflow                                                            */
/* ------------------------------------------------------------------ */

const STEPS: { title: string; icon: LucideIcon; body: string; inLab: string }[] = [
  {
    title: "Identify",
    icon: Search,
    body: "Work out what could hold relevant evidence — devices, accounts, logs, cloud services — and confirm what you are authorised to examine.",
    inLab: "The sample chat export below stands in for an identified evidence item.",
  },
  {
    title: "Preserve",
    icon: Lock,
    body: "Stop evidence changing: isolate the device, record its state, capture volatile data first, and always work on copies rather than originals.",
    inLab: "Hash the item the moment it is acquired, so any later change becomes detectable.",
  },
  {
    title: "Collect",
    icon: HardDrive,
    body: "Acquire a forensic image or export (with a write-blocker where applicable), log who, what and when, then verify the copy matches by hash.",
    inLab: "Pick a file of your own and compute its hash right in the browser.",
  },
  {
    title: "Examine",
    icon: Microscope,
    body: "Extract and review data from the copy: file metadata, file signatures, timestamps, deleted items and logs.",
    inLab: "The workbench reads metadata and checks the file signature against the extension.",
  },
  {
    title: "Analyse",
    icon: Waypoints,
    body: "Interpret what the data means: correlate sources, build a timeline, test hypotheses — and actively consider innocent explanations.",
    inLab: "The Log Explorer lab practises this step: patterns, timeline and false positives.",
  },
  {
    title: "Report",
    icon: FileText,
    body: "Document methods, tools, hashes and findings so another examiner could reproduce them, and state the limitations plainly.",
    inLab: "Copy the generated evidence record at the end of the workbench.",
  },
];

function Workflow() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const step = STEPS[active];

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h4 className="text-sm font-semibold">How a digital forensic investigation flows</h4>
        <span className="text-[0.7rem] text-muted-foreground">Loosely follows NIST SP 800-86</span>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">Select a stage to see what it means and where this lab touches it.</p>

      <div role="tablist" aria-label="Investigation stages" className="relative grid grid-cols-6 gap-1">
        <div aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-5 h-px bg-border" />
        <motion.div
          aria-hidden="true"
          className="absolute left-[8.33%] top-5 h-px origin-left bg-brand"
          style={{ width: "83.33%" }}
          initial={false}
          animate={{ scaleX: active / (STEPS.length - 1) }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i <= active;
          return (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="forensics-step-panel"
              onClick={() => setActive(i)}
              className="group relative flex flex-col items-center gap-2 rounded-lg px-1 py-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "relative z-10 flex size-10 items-center justify-center rounded-full border bg-background transition-colors",
                  done ? "border-brand text-brand" : "border-border text-muted-foreground group-hover:text-foreground",
                  i === active && "shadow-[0_0_0_4px] shadow-brand/15"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className={cn("text-[0.7rem] font-medium sm:text-xs", i === active ? "text-foreground" : "text-muted-foreground")}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      <div id="forensics-step-panel" role="tabpanel" className="mt-5 min-h-28 rounded-xl bg-muted/40 p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">
                {active + 1}. {step.title}.
              </span>{" "}
              <span className="text-muted-foreground">{step.body}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-brand">In this lab: {step.inLab}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hash display                                                        */
/* ------------------------------------------------------------------ */

function HashView({ hash, against, label }: { hash: string; against?: string; label: string }) {
  const chars = against && against.length === hash.length ? diffHex(against, hash) : null;
  return (
    <div>
      <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="break-all rounded-lg border border-border/70 bg-background/70 p-3 font-mono text-[0.78rem] leading-relaxed"
        aria-label={`${label}: ${hash}`}
      >
        {chars
          ? chars.map((c, i) => (
              <span
                key={i}
                className={cn(c.changed && "rounded-sm bg-destructive/20 text-destructive")}
              >
                {c.char}
              </span>
            ))
          : hash || "…"}
      </p>
    </div>
  );
}

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
        ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Sample evidence                                                     */
/* ------------------------------------------------------------------ */

function SampleEvidence() {
  const [text, setText] = useState(SAMPLE_EVIDENCE);
  const [original, setOriginal] = useState("");
  const [current, setCurrent] = useState("");

  const hashText = useCallback((value: string) => digestHex(new TextEncoder().encode(value), "SHA-256"), []);

  useEffect(() => {
    let cancelled = false;
    hashText(SAMPLE_EVIDENCE).then((h) => !cancelled && setOriginal(h));
    return () => {
      cancelled = true;
    };
  }, [hashText]);

  useEffect(() => {
    let cancelled = false;
    hashText(text).then((h) => !cancelled && setCurrent(h));
    return () => {
      cancelled = true;
    };
  }, [text, hashText]);

  const ready = original !== "" && current !== "";
  const matches = ready && original === current;
  const changedChars = ready ? diffHex(original, current).filter((c) => c.changed).length : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <label htmlFor="sample-evidence" className="text-sm font-medium">
          Synthetic evidence item <span className="font-normal text-muted-foreground">— edit it to simulate tampering</span>
        </label>
        <textarea
          id="sample-evidence"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-input bg-background/70 p-3 font-mono text-[0.78rem] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setText(SAMPLE_EVIDENCE.replace("Q1", "Q2"))}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            Alter one character (Q1 → Q2)
          </button>
          <button
            type="button"
            onClick={() => setText(SAMPLE_EVIDENCE)}
            disabled={text === SAMPLE_EVIDENCE}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Restore original
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <HashView hash={original} label="SHA-256 at acquisition (reference)" />
        <HashView hash={current} against={original} label="SHA-256 now" />
        {ready && (
          <Verdict ok={matches}>
            {matches
              ? "Hashes match — the bytes are identical to those hashed at acquisition."
              : `Hashes differ — ${changedChars} of 64 characters changed. Altering a single character rewrites the whole digest (the “avalanche effect”).`}
          </Verdict>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Your own file                                                       */
/* ------------------------------------------------------------------ */

type FileInfo = {
  name: string;
  size: number;
  declaredType: string;
  modified: string;
  firstBytes: string;
  signature: SignatureResult;
};

const EXPECTED_LENGTH: Record<HashAlgorithm, number> = { "SHA-256": 64, "SHA-1": 40, "SHA-512": 128 };

function YourFile() {
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [hash, setHash] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [expected, setExpected] = useState("");
  const [copied, setCopied] = useState(false);
  const bytesRef = useRef<Uint8Array | null>(null);
  const [hashedAt, setHashedAt] = useState("");

  const compute = useCallback(async (algo: HashAlgorithm) => {
    if (!bytesRef.current) return;
    setBusy(true);
    try {
      setHash(await digestHex(bytesRef.current, algo));
      setHashedAt(new Date().toISOString());
    } catch {
      setError("Your browser could not compute that hash.");
    } finally {
      setBusy(false);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setHash("");
      setInfo(null);
      bytesRef.current = null;
      if (file.size === 0) {
        setError("That file is empty — there is nothing to hash.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`That file is ${formatBytes(file.size)}. This lab reads files into memory, so the limit is 50 MB.`);
        return;
      }
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        bytesRef.current = bytes;
        setInfo({
          name: file.name,
          size: file.size,
          declaredType: file.type || "not declared by the browser",
          modified: file.lastModified ? new Date(file.lastModified).toISOString() : "unavailable",
          firstBytes: toHexBytes(bytes),
          signature: checkSignature(bytes, file.name),
        });
        await compute(algorithm);
      } catch {
        setError("That file could not be read. It may be locked or no longer available.");
      }
    },
    [algorithm, compute]
  );

  const pickAlgorithm = (algo: HashAlgorithm) => {
    setAlgorithm(algo);
    compute(algo);
  };

  const expectedNorm = normaliseHash(expected);
  const expectedValid = expectedNorm.length === EXPECTED_LENGTH[algorithm] && /^[0-9a-f]+$/.test(expectedNorm);

  const record = info
    ? [
        "EVIDENCE RECORD (generated in-browser)",
        `File: ${info.name}`,
        `Size: ${info.size} bytes`,
        `${algorithm}: ${hash}`,
        `Hashed at (UTC): ${hashedAt}`,
        `Note: a matching hash shows the bytes are unchanged since hashing; it does not prove authenticity.`,
      ].join("\n")
    : "";

  const copyRecord = async () => {
    try {
      await navigator.clipboard.writeText(record);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy was blocked by the browser. Select the record text and copy it manually.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="forensics-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
            dragging ? "border-brand bg-brand/5" : "border-border hover:bg-muted/40"
          )}
        >
          <Upload className="size-5 text-brand" aria-hidden="true" />
          <span className="text-sm font-medium">Choose a file or drop it here</span>
          <span className="text-xs text-muted-foreground">Up to 50 MB. Read locally — never uploaded.</span>
          <input
            id="forensics-file"
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>

        <div role="radiogroup" aria-label="Hash algorithm" className="flex gap-1.5">
          {HASH_ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              role="radio"
              aria-checked={algorithm === algo}
              onClick={() => pickAlgorithm(algo)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                algorithm === algo ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {algo}
            </button>
          ))}
        </div>
        {algorithm === "SHA-1" && (
          <p className="text-xs text-muted-foreground">
            SHA-1 has known collision attacks, so it is shown for legacy comparison only; prefer SHA-256.
          </p>
        )}

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!info && !error && (
          <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            Metadata, the file signature check and the hash will appear here. Try a screenshot or PDF — then rename its
            extension and load it again to watch the signature check catch the mismatch.
          </p>
        )}
        {info && (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border border-border/70 bg-background/60 p-3 text-xs">
              {[
                ["Name", info.name],
                ["Size", formatBytes(info.size)],
                ["Declared type", info.declaredType],
                ["Last modified", info.modified],
                ["First bytes", info.firstBytes],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="break-all font-mono">{v}</dd>
                </div>
              ))}
            </dl>

            {info.signature.status === "match" && (
              <Verdict ok>Signature identifies it as {info.signature.type}, consistent with its extension.</Verdict>
            )}
            {info.signature.status === "mismatch" && (
              <Verdict ok={false}>
                Signature says {info.signature.type}, but the extension is “.{info.signature.extension}”. Mismatches like this
                are worth investigating — though renamed files can also be innocent.
              </Verdict>
            )}
            {info.signature.status === "unknown" && (
              <p className="text-xs text-muted-foreground">
                No known signature matched (plain text and many formats have none). That alone proves nothing.
              </p>
            )}

            <HashView hash={busy ? "computing…" : hash} label={`${algorithm} (computed in your browser)`} />

            <div>
              <label htmlFor="expected-hash" className="mb-1 block text-xs font-medium text-muted-foreground">
                Compare with an expected {algorithm} hash (for example, one published by a vendor)
              </label>
              <input
                id="expected-hash"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="Paste the expected hash"
                className="w-full rounded-lg border border-input bg-background/70 px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {expectedNorm !== "" &&
              (expectedValid ? (
                <Verdict ok={expectedNorm === hash}>
                  {expectedNorm === hash ? "Match — the file is byte-identical to what that hash describes." : "No match — this is not the same content."}
                </Verdict>
              ) : (
                <p className="text-xs text-muted-foreground">
                  A {algorithm} hash is {EXPECTED_LENGTH[algorithm]} hexadecimal characters.
                </p>
              ))}

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Evidence record</span>
                <button
                  type="button"
                  onClick={copyRecord}
                  disabled={!hash || busy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                >
                  {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-border/70 bg-background/60 p-3 font-mono text-[0.72rem] leading-relaxed">
                {record}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export function ForensicsLab() {
  const [mode, setMode] = useState<"sample" | "file">("sample");

  return (
    <div className="flex flex-col gap-6">
      <Workflow />

      <div className="rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold">Hash &amp; integrity workbench</h4>
          <div role="radiogroup" aria-label="Workbench mode" className="flex rounded-full border border-border p-0.5">
            {(
              [
                ["sample", "Synthetic sample"],
                ["file", "Your own file"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  mode === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "sample" ? <SampleEvidence /> : <YourFile />}

        <p className="mt-5 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden="true" />
          <span>
            A matching hash shows the bytes are unchanged since they were hashed. It does <strong className="text-foreground">not</strong>{" "}
            prove the evidence is authentic, who created it, or that it was hashed before anyone tampered with it — that is
            why chain-of-custody records and the acquisition method matter just as much.
          </span>
        </p>
      </div>
    </div>
  );
}
