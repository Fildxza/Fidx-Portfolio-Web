/**
 * Fictional security log + a small, real detection engine for the Log Explorer
 * lab. Every host, user and IP below is invented; IPs come from the RFC 5737
 * documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24), which
 * are reserved for examples and never route on the public internet.
 */

export type Severity = "info" | "low" | "medium" | "high" | "critical";
export const SEVERITIES: Severity[] = ["info", "low", "medium", "high", "critical"];

type EventType =
  | "login_success"
  | "login_failed"
  | "conn_denied"
  | "sudo"
  | "account_created"
  | "transfer_out"
  | "log_cleared"
  | "job";

export type LogEvent = {
  id: number;
  time: string; // HH:MM:SS (fictional date, so no calendar maths is needed)
  host: string;
  user: string | null;
  srcIp: string | null;
  type: EventType;
  severity: Severity;
  message: string;
  port?: number;
  bytes?: number;
  knownGood?: boolean;
  newLocation?: boolean;
};

const toSeconds = (t: string) => {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

let nextId = 1;
const ev = (e: Omit<LogEvent, "id">): LogEvent => ({ id: nextId++, ...e });

const FAILED_TIMES = ["02:20:20", "02:20:26", "02:20:33", "02:20:39", "02:20:46", "02:20:52", "02:20:58"];
const SCAN_PORTS = [21, 22, 23, 25, 80, 110, 135, 139, 443, 445, 3389];

const RAW: Omit<LogEvent, "id">[] = [
  { time: "01:30:04", host: "backup-01", user: "svc-backup", srcIp: "10.0.3.10", type: "transfer_out", severity: "medium", message: "Nightly backup: 4.2 GB sent to backup.example.net", bytes: 4.2e9, knownGood: true },
  { time: "01:45:10", host: "web-01", user: "cron", srcIp: null, type: "job", severity: "info", message: "Scheduled log rotation completed" },
  ...SCAN_PORTS.map((port, i) => ({
    time: `02:12:${String(1 + i * 3).padStart(2, "0")}`,
    host: "fw-edge",
    user: null,
    srcIp: "198.51.100.23",
    type: "conn_denied" as const,
    severity: "low" as const,
    message: `Connection denied to web-01 on port ${port}`,
    port,
  })),
  ...FAILED_TIMES.map((time) => ({
    time,
    host: "web-01",
    user: "admin",
    srcIp: "203.0.113.45",
    type: "login_failed" as const,
    severity: "medium" as const,
    message: "SSH authentication failed for admin",
  })),
  { time: "02:21:02", host: "web-01", user: "admin", srcIp: "203.0.113.45", type: "login_success", severity: "high", message: "SSH login succeeded for admin" },
  { time: "02:23:40", host: "web-01", user: "admin", srcIp: "203.0.113.45", type: "sudo", severity: "high", message: "admin ran: sudo su -" },
  { time: "02:25:15", host: "web-01", user: "admin", srcIp: "203.0.113.45", type: "account_created", severity: "critical", message: "New account svc-update created and added to sudo group" },
  { time: "02:31:50", host: "web-01", user: "svc-update", srcIp: "203.0.113.45", type: "transfer_out", severity: "high", message: "380 MB sent to 203.0.113.45 over HTTPS", bytes: 3.8e8 },
  { time: "02:33:09", host: "web-01", user: "svc-update", srcIp: "203.0.113.45", type: "log_cleared", severity: "critical", message: "Audit log cleared (/var/log/auth.log truncated)" },
  { time: "08:02:17", host: "vpn-01", user: "alice", srcIp: "10.0.2.15", type: "login_success", severity: "info", message: "VPN login succeeded for alice" },
  { time: "08:05:44", host: "vpn-01", user: "mia", srcIp: "192.0.2.77", type: "login_success", severity: "medium", message: "VPN login succeeded for mia from a new country", newLocation: true },
  { time: "08:15:30", host: "file-01", user: "bob", srcIp: "10.0.2.21", type: "login_success", severity: "info", message: "SMB session opened by bob" },
  { time: "09:02:11", host: "vpn-01", user: "bob", srcIp: "10.0.2.21", type: "login_failed", severity: "low", message: "VPN password rejected for bob (typo, succeeded on retry)" },
  { time: "09:02:25", host: "vpn-01", user: "bob", srcIp: "10.0.2.21", type: "login_success", severity: "info", message: "VPN login succeeded for bob" },
];

export const LOG_EVENTS: LogEvent[] = RAW.map(ev).sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

/* ------------------------------------------------------------------ */
/* Detection engine                                                    */
/* ------------------------------------------------------------------ */

export type AlertStatus = "suspicious" | "review" | "likely benign";

export type Alert = {
  id: string;
  rule: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  eventIds: number[];
  time: string;
  summary: string;
  why: string;
  falsePositive: string;
};

const byTime = (a: LogEvent, b: LogEvent) => toSeconds(a.time) - toSeconds(b.time);

export function detectAlerts(events: LogEvent[]): Alert[] {
  const alerts: Alert[] = [];
  const sorted = [...events].sort(byTime);

  // 1. Port scan: one source denied on ≥8 distinct ports within 60 seconds.
  const deniedBySource = new Map<string, LogEvent[]>();
  for (const e of sorted) {
    if (e.type === "conn_denied" && e.srcIp) deniedBySource.set(e.srcIp, [...(deniedBySource.get(e.srcIp) ?? []), e]);
  }
  for (const [ip, list] of deniedBySource) {
    for (let i = 0; i < list.length; i++) {
      const windowEvents = list.filter(
        (e) => toSeconds(e.time) >= toSeconds(list[i].time) && toSeconds(e.time) - toSeconds(list[i].time) <= 60
      );
      const ports = new Set(windowEvents.map((e) => e.port));
      if (ports.size >= 8) {
        alerts.push({
          id: `scan-${ip}`,
          rule: "Port scan",
          title: `Port scan from ${ip}`,
          severity: "medium",
          status: "suspicious",
          eventIds: windowEvents.map((e) => e.id),
          time: windowEvents[0].time,
          summary: `${ports.size} different ports probed within 60 seconds, all denied by the firewall.`,
          why: "Attackers map which services are exposed before choosing an attack. Many denied connections to many ports from one source is the classic signature.",
          falsePositive: "An authorised vulnerability scanner or an internal network audit would look identical — check whether a scan was scheduled.",
        });
        break;
      }
    }
  }

  // 2. Brute force then success: ≥5 failures (user + IP) in 10 minutes, then a success from the same IP.
  const bruteForceSuccesses: { user: string; ip: string; time: string }[] = [];
  const failuresByKey = new Map<string, LogEvent[]>();
  for (const e of sorted) {
    if (e.type === "login_failed" && e.user && e.srcIp) {
      const key = `${e.srcIp}|${e.user}`;
      failuresByKey.set(key, [...(failuresByKey.get(key) ?? []), e]);
    }
  }
  for (const [key, fails] of failuresByKey) {
    const [ip, user] = key.split("|");
    if (fails.length < 5 || toSeconds(fails[fails.length - 1].time) - toSeconds(fails[0].time) > 600) continue;
    const success = sorted.find(
      (e) =>
        e.type === "login_success" &&
        e.srcIp === ip &&
        e.user === user &&
        toSeconds(e.time) > toSeconds(fails[fails.length - 1].time) &&
        toSeconds(e.time) - toSeconds(fails[fails.length - 1].time) <= 600
    );
    if (!success) continue;
    bruteForceSuccesses.push({ user, ip, time: success.time });
    alerts.push({
      id: `brute-${key}`,
      rule: "Brute force → success",
      title: `Possible account takeover: ${user} from ${ip}`,
      severity: "high",
      status: "suspicious",
      eventIds: [...fails.map((e) => e.id), success.id],
      time: fails[0].time,
      summary: `${fails.length} failed logins in under a minute, then a successful login from the same address.`,
      why: "A burst of failures followed by a success suggests a password was guessed or sprayed. The success is the dangerous event — everything after it deserves scrutiny.",
      falsePositive: "A person fumbling a password, or a misconfigured script retrying with stale credentials, can look similar — but that rarely happens ~7 times in under a minute from an unfamiliar external IP.",
    });
  }

  // 3. Privileged command shortly after a suspicious login.
  for (const bf of bruteForceSuccesses) {
    for (const e of sorted) {
      if (
        e.type === "sudo" &&
        e.user === bf.user &&
        toSeconds(e.time) >= toSeconds(bf.time) &&
        toSeconds(e.time) - toSeconds(bf.time) <= 900
      ) {
        alerts.push({
          id: `sudo-${e.id}`,
          rule: "Privilege escalation",
          title: `Privilege escalation by ${bf.user} after suspicious login`,
          severity: "high",
          status: "suspicious",
          eventIds: [e.id],
          time: e.time,
          summary: "Root shell opened minutes after the suspicious login.",
          why: "Escalating to root straight after getting in is how an intruder turns limited access into full control.",
          falsePositive: "Administrators legitimately use sudo. The signal here is the timing — it follows a likely brute-force login.",
        });
      }
    }
  }

  // 4. New account created outside business hours.
  for (const e of sorted) {
    const hour = Number(e.time.slice(0, 2));
    if (e.type === "account_created" && (hour < 6 || hour >= 22)) {
      alerts.push({
        id: `acct-${e.id}`,
        rule: "Off-hours account creation",
        title: "Privileged account created at an unusual hour",
        severity: "critical",
        status: "suspicious",
        eventIds: [e.id],
        time: e.time,
        summary: `${e.message}.`,
        why: "Creating a new privileged account is a common persistence technique — it lets an intruder return even if the original password is changed.",
        falsePositive: "Planned maintenance windows or automated provisioning can create accounts overnight. Check the change calendar.",
      });
    }
  }

  // 5. Large outbound transfer, downgraded when the destination is allow-listed.
  for (const e of sorted) {
    if (e.type === "transfer_out" && (e.bytes ?? 0) >= 100e6) {
      alerts.push({
        id: `xfer-${e.id}`,
        rule: "Large outbound transfer",
        title: e.knownGood ? "Large transfer to a known backup destination" : "Large transfer to an unrecognised destination",
        severity: e.knownGood ? "low" : "high",
        status: e.knownGood ? "likely benign" : "suspicious",
        eventIds: [e.id],
        time: e.time,
        summary: e.message + ".",
        why: "Data theft often shows up as unusual volumes leaving the network, especially to destinations the organisation has never used.",
        falsePositive: e.knownGood
          ? "This is the scheduled nightly backup to an allow-listed destination — exactly the kind of noise a naive size-only rule produces."
          : "Software updates and legitimate cloud syncs also move large files; verify the destination and the account that initiated it.",
      });
    }
  }

  // 6. Audit log cleared.
  for (const e of sorted) {
    if (e.type === "log_cleared") {
      alerts.push({
        id: `log-${e.id}`,
        rule: "Log tampering",
        title: "Audit log cleared",
        severity: "critical",
        status: "suspicious",
        eventIds: [e.id],
        time: e.time,
        summary: e.message + ".",
        why: "Clearing logs is anti-forensic behaviour — it destroys the trail. It is rarely benign right after other suspicious activity.",
        falsePositive: "Log rotation and disk-space clean-ups can truncate logs. Look at who did it and what happened just before.",
      });
    }
  }

  // 7. Login from a new location — worth a look, but often innocent.
  for (const e of sorted) {
    if (e.type === "login_success" && e.newLocation) {
      alerts.push({
        id: `geo-${e.id}`,
        rule: "New location",
        title: `${e.user} logged in from a new country`,
        severity: "medium",
        status: "review",
        eventIds: [e.id],
        time: e.time,
        summary: e.message + ".",
        why: "Logins from places an account has never used can indicate stolen credentials.",
        falsePositive: "Travel, a new mobile carrier or a VPN exit node are all common, harmless causes. A quick message to the user usually resolves it.",
      });
    }
  }

  return alerts.sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
}
