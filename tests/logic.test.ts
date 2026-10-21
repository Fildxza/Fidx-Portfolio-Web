/**
 * Unit tests for the pure logic behind the Interactive Labs and the skills map.
 * Run with `npm test` (Node's built-in test runner, no extra dependencies).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { SAMPLE_EVIDENCE, checkSignature, diffHex, digestHex } from "../src/lib/forensics.ts";
import { LOG_EVENTS, detectAlerts } from "../src/lib/log-lab.ts";
import { PRESETS, computeRisk, leversFor, tierFor } from "../src/lib/risk-model.ts";

const encode = (text: string) => new TextEncoder().encode(text);

describe("forensics helpers", () => {
  it("matches the published SHA-256 test vector for 'abc'", async () => {
    assert.equal(
      await digestHex(encode("abc")),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("agrees with Node's crypto for every supported algorithm", async () => {
    for (const [node, web] of [
      ["sha256", "SHA-256"],
      ["sha1", "SHA-1"],
      ["sha512", "SHA-512"],
    ] as const) {
      assert.equal(
        await digestHex(encode(SAMPLE_EVIDENCE), web),
        createHash(node).update(SAMPLE_EVIDENCE).digest("hex")
      );
    }
  });

  it("changes most of the digest when a single character changes (avalanche effect)", async () => {
    const original = await digestHex(encode(SAMPLE_EVIDENCE));
    const tampered = await digestHex(encode(SAMPLE_EVIDENCE.replace("Q1", "Q2")));
    const changed = diffHex(original, tampered).filter((c) => c.changed).length;
    assert.ok(changed > 40, `expected most of 64 characters to change, got ${changed}`);
  });

  it("detects file-signature matches, mismatches and unknowns", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    assert.equal(checkSignature(png, "image.png").status, "match");
    assert.equal(checkSignature(jpeg, "image.png").status, "mismatch");
    assert.equal(checkSignature(new Uint8Array([1, 2, 3]), "notes.txt").status, "unknown");
  });
});

describe("risk model", () => {
  it("scores the demo presets into the expected tiers", () => {
    const byName = Object.fromEntries(PRESETS.map((p) => [p.name, computeRisk(p.input)]));
    assert.equal(byName["No exposure"].score, 0);
    assert.equal(byName["Old forum leak"].tier, "Low");
    assert.equal(byName["Credential-stuffing risk"].tier, "High");
    assert.equal(byName["Heavy exposure"].tier, "Critical");
  });

  it("keeps every score within 0-100 and maps tiers at the documented thresholds", () => {
    for (const p of PRESETS) {
      const { score } = computeRisk(p.input);
      assert.ok(score >= 0 && score <= 100);
    }
    assert.deepEqual([24, 25, 49, 50, 74, 75].map(tierFor), ["Low", "Medium", "Medium", "High", "High", "Critical"]);
  });

  it("reports a positive what-if gain for the controls the user can change", () => {
    const levers = leversFor(PRESETS.find((p) => p.name === "Credential-stuffing risk")!.input);
    assert.ok(levers.length >= 2);
    assert.ok(levers.every((l) => l.delta > 0));
  });
});

describe("log detection engine", () => {
  const alerts = detectAlerts(LOG_EVENTS);
  const rules = alerts.map((a) => a.rule);

  it("fires each rule on the fictional incident", () => {
    for (const rule of [
      "Port scan",
      "Brute force → success",
      "Privilege escalation",
      "Off-hours account creation",
      "Log tampering",
      "New location",
    ]) {
      assert.ok(rules.includes(rule), `missing rule: ${rule}`);
    }
  });

  it("treats the allow-listed nightly backup as a likely false positive", () => {
    const backup = alerts.find((a) => a.title.startsWith("Large transfer to a known"));
    assert.equal(backup?.status, "likely benign");
    assert.ok(alerts.some((a) => a.rule === "Large outbound transfer" && a.status === "suspicious"));
  });

  it("does not flag ordinary logins", () => {
    const flagged = new Set(alerts.flatMap((a) => a.eventIds));
    const normal = LOG_EVENTS.filter((e) => e.user === "alice" || (e.user === "bob" && e.type !== "login_failed"));
    assert.ok(normal.length > 0);
    assert.ok(normal.every((e) => !flagged.has(e.id)));
  });
});
