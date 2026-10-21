/**
 * A fictional small-organisation network for the Network Map lab. Nothing here
 * represents a real system, and the lab never sends traffic anywhere — the
 * "paths" are static explanations of how a well-segmented network treats them.
 */

export type NodeKind =
  | "internet"
  | "firewall"
  | "router"
  | "switch"
  | "web"
  | "database"
  | "files"
  | "backup"
  | "pc"
  | "laptop"
  | "printer"
  | "admin"
  | "siem"
  | "bas-server"
  | "controller"
  | "sensors";

export type NetNode = {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  role: string;
  risk: string;
  defence: string;
};

export type Zone = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hue: number;
  rule: string;
};

export const NET_WIDTH = 940;
export const NET_HEIGHT = 520;

export const ZONES: Zone[] = [
  { id: "dmz", label: "DMZ", x: 100, y: 52, w: 140, h: 110, hue: 60, rule: "Internet-facing services live here, walled off from the internal network." },
  { id: "servers", label: "Server VLAN", x: 410, y: 14, w: 500, h: 112, hue: 255, rule: "Only specific ports from specific segments are allowed in." },
  { id: "office", label: "Office VLAN", x: 410, y: 138, w: 500, h: 112, hue: 205, rule: "Staff devices can reach the servers they need, and nothing in Management or BAS." },
  { id: "mgmt", label: "Management VLAN", x: 410, y: 262, w: 500, h: 112, hue: 160, rule: "Admin tools and logging. Reachable only from admin workstations, with MFA." },
  { id: "bas", label: "Building Automation (BAS) VLAN", x: 410, y: 386, w: 500, h: 120, hue: 25, rule: "Operational technology: no internet access, no route from the office network." },
];

export const NODES: NetNode[] = [
  { id: "internet", label: "Internet", kind: "internet", x: 52, y: 262, role: "Untrusted external networks.", risk: "Source of scanning, phishing and automated attacks.", defence: "Treat everything arriving from here as untrusted; allow only what is explicitly needed." },
  { id: "fw", label: "Edge firewall", kind: "firewall", x: 170, y: 262, role: "Controls traffic between the internet, the DMZ and the internal network.", risk: "A misconfigured rule or an unpatched firewall exposes everything behind it.", defence: "Default-deny rules, minimal open ports, patching and logging every denied connection." },
  { id: "dmz-web", label: "Public web server", kind: "web", x: 170, y: 112, role: "Hosts the public website.", risk: "Directly reachable, so the most likely server to be attacked.", defence: "Keep it in the DMZ so a compromise cannot walk straight into the internal network." },
  { id: "core", label: "Core router", kind: "router", x: 300, y: 262, role: "Routes traffic between VLANs and enforces access control lists.", risk: "If inter-VLAN rules are too permissive, segmentation becomes decoration.", defence: "ACLs that only permit documented flows; log and review changes." },
  { id: "sw-srv", label: "Server switch", kind: "switch", x: 442, y: 70, role: "Connects the servers.", risk: "VLAN misconfiguration can leak traffic between segments.", defence: "Disable unused ports, use port security and keep VLANs tightly scoped." },
  { id: "db", label: "Database server", kind: "database", x: 560, y: 70, role: "Stores application data.", risk: "Holds the most valuable data; exposure means breach.", defence: "No internet route, least-privilege accounts, encryption and audited access." },
  { id: "files", label: "File server", kind: "files", x: 680, y: 70, role: "Shared documents for staff.", risk: "Ransomware and over-broad permissions.", defence: "Role-based shares, versioned backups and endpoint protection." },
  { id: "backup", label: "Backup server", kind: "backup", x: 800, y: 70, role: "Receives scheduled backups.", risk: "Attackers target backups so victims cannot recover.", defence: "Offline or immutable copies, separate credentials, tested restores." },
  { id: "sw-off", label: "Office switch", kind: "switch", x: 442, y: 194, role: "Connects staff devices.", risk: "Rogue devices plugged into open ports.", defence: "Port security or 802.1X so only known devices connect." },
  { id: "pc", label: "Staff desktop", kind: "pc", x: 590, y: 194, role: "A typical employee workstation.", risk: "Phishing and malware land here first.", defence: "Patching, endpoint protection, least-privilege user accounts." },
  { id: "laptop", label: "Staff laptop", kind: "laptop", x: 710, y: 194, role: "A mobile employee device.", risk: "Leaves the building, so it can be lost or join untrusted Wi-Fi.", defence: "Full-disk encryption, VPN and automatic updates." },
  { id: "printer", label: "Network printer", kind: "printer", x: 830, y: 194, role: "Shared printing.", risk: "Often forgotten, rarely patched, sometimes with default credentials.", defence: "Change defaults, update firmware and restrict who can reach it." },
  { id: "sw-mgmt", label: "Mgmt switch", kind: "switch", x: 442, y: 318, role: "Connects admin tooling.", risk: "Compromise here would expose every managed system.", defence: "Strictly limited membership and monitored access." },
  { id: "admin", label: "Admin workstation", kind: "admin", x: 610, y: 318, role: "Used only for administering systems.", risk: "A stolen admin credential is the keys to the kingdom.", defence: "Dedicated hardware, MFA, no email or web browsing on it." },
  { id: "siem", label: "Log server / SIEM", kind: "siem", x: 780, y: 318, role: "Collects logs from every device and raises alerts.", risk: "If logs can be edited, an intruder can erase their trail.", defence: "Forward logs off-host in real time with restricted write access." },
  { id: "sw-bas", label: "BAS switch", kind: "switch", x: 442, y: 446, role: "Connects building-automation equipment.", risk: "Operational technology often cannot be patched quickly.", defence: "Isolate it: its own VLAN and tightly filtered routes." },
  { id: "bas-srv", label: "BAS server", kind: "bas-server", x: 590, y: 446, role: "Supervises HVAC controllers and displays building status.", risk: "Legacy software and vendor remote access.", defence: "No direct internet access; vendor access through a monitored jump host." },
  { id: "ctrl", label: "HVAC controller", kind: "controller", x: 710, y: 446, role: "Runs a local control loop for heating and cooling.", risk: "Rarely updated, and a fault can affect a whole floor.", defence: "Allow-list only the BAS server to talk to it." },
  { id: "sensors", label: "Sensor panel", kind: "sensors", x: 830, y: 446, role: "Reports temperature and equipment status.", risk: "Unauthenticated protocols can be spoofed.", defence: "Keep on the isolated VLAN and monitor for unexpected devices." },
];

/** Links as [from, to]. Each switch lists its devices in left-to-right order. */
export const EDGES: [string, string][] = [
  ["internet", "fw"],
  ["fw", "dmz-web"],
  ["fw", "core"],
  ["core", "sw-srv"],
  ["core", "sw-off"],
  ["core", "sw-mgmt"],
  ["core", "sw-bas"],
  ["sw-srv", "db"],
  ["sw-srv", "files"],
  ["sw-srv", "backup"],
  ["sw-off", "pc"],
  ["sw-off", "laptop"],
  ["sw-off", "printer"],
  ["sw-mgmt", "admin"],
  ["sw-mgmt", "siem"],
  ["sw-bas", "bas-srv"],
  ["sw-bas", "ctrl"],
  ["sw-bas", "sensors"],
];

export type PathStep = { node: string; note: string; blocked?: boolean };

export type TrafficPath = {
  id: string;
  label: string;
  verdict: "allowed" | "blocked";
  summary: string;
  steps: PathStep[];
};

export const PATHS: TrafficPath[] = [
  {
    id: "visitor-web",
    label: "Visitor → public website",
    verdict: "allowed",
    summary: "A normal web visit, handled in the DMZ so it never touches the internal network.",
    steps: [
      { node: "internet", note: "A visitor requests the website over HTTPS (port 443)." },
      { node: "fw", note: "The firewall permits only 443 to the DMZ web server and inspects the connection." },
      { node: "dmz-web", note: "The DMZ server answers. It has no route onward to internal VLANs." },
    ],
  },
  {
    id: "staff-files",
    label: "Staff laptop → file server",
    verdict: "allowed",
    summary: "Inter-VLAN traffic is permitted because an ACL explicitly allows file sharing from the office.",
    steps: [
      { node: "laptop", note: "An employee opens a shared document." },
      { node: "sw-off", note: "The switch tags the traffic as Office VLAN." },
      { node: "core", note: "The router checks its ACL: Office → File server on SMB is explicitly allowed." },
      { node: "sw-srv", note: "Traffic enters the Server VLAN." },
      { node: "files", note: "The file server enforces per-user permissions and logs the access." },
    ],
  },
  {
    id: "admin-db",
    label: "Admin → database maintenance",
    verdict: "allowed",
    summary: "Administration only works from the Management VLAN, and is logged.",
    steps: [
      { node: "admin", note: "An administrator authenticates with multi-factor authentication." },
      { node: "sw-mgmt", note: "Traffic originates in the Management VLAN." },
      { node: "core", note: "ACL: only Management may reach database admin ports." },
      { node: "sw-srv", note: "Traffic enters the Server VLAN." },
      { node: "db", note: "The database records who connected and what they ran." },
    ],
  },
  {
    id: "bas-local",
    label: "HVAC controller → BAS server",
    verdict: "allowed",
    summary: "Building-automation traffic stays entirely inside its own isolated VLAN.",
    steps: [
      { node: "ctrl", note: "The controller reports status to its supervisor." },
      { node: "sw-bas", note: "The BAS switch forwards it within the BAS VLAN." },
      { node: "bas-srv", note: "The BAS server receives it. None of this crosses the core router or reaches the internet." },
    ],
  },
  {
    id: "internet-db",
    label: "Internet → database (attack)",
    verdict: "blocked",
    summary: "An outsider tries to reach the database directly. Default-deny stops it at the first hop.",
    steps: [
      { node: "internet", note: "An attacker probes the database port from the internet." },
      { node: "fw", note: "No rule allows this. The connection is dropped and logged for the SIEM.", blocked: true },
    ],
  },
  {
    id: "office-bas",
    label: "Office PC → HVAC controller (attack)",
    verdict: "blocked",
    summary: "Malware on a staff PC tries to reach building controls. Segmentation contains it.",
    steps: [
      { node: "pc", note: "Compromised workstation scans for building-automation devices." },
      { node: "sw-off", note: "Traffic leaves the Office VLAN." },
      { node: "core", note: "ACL: no route from Office to the BAS VLAN. Denied and logged.", blocked: true },
    ],
  },
];

export const PRINCIPLES = [
  { title: "Segmentation", body: "Split the network into zones so one compromised device cannot reach everything." },
  { title: "Default deny", body: "Block everything, then allow only the flows you can justify and document." },
  { title: "Least privilege", body: "Every user, device and service gets the minimum access its job needs." },
  { title: "Log and monitor", body: "Send logs off-host so activity — and tampering — leaves a trail you can investigate." },
];
