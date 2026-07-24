import type {
  Achievement,
  Certificate,
  Education,
  Experience,
  Project,
  SkillCategory,
} from "@/lib/types";

/**
 * Fallback content sourced directly from the resume. Used whenever Supabase
 * is not configured (no project provisioned yet) or a table is empty, so the
 * site always renders real content instead of placeholders. Once Supabase is
 * connected, everything here becomes editable from /admin instead.
 */

export const ABOUT_TEXT = `I'm an IT student based in Penang, Malaysia, currently finishing a degree in Computer Forensics at UNIRAZAK while holding down real operational IT work on the side. My path into this field wasn't purely academic — it started on the ground, maintaining building automation systems and elevator controllers, then moved into IT helpdesk work resolving hardware, software, and network tickets for end users.

That mix gives me a practical, troubleshooting-first mindset: I've diagnosed faults across HVAC and BAS networks, kept banking apps running for internal teams, and dug through logs to catch problems before they became outages. Lately I've been pointing that same instinct toward cybersecurity and digital forensics, building BocorCheck, an OSINT-based tool that turns raw breach data into plain-language risk scores people can actually act on.

I hold a CompTIA Security+ certification and I'm looking for an IT internship where I can keep building on infrastructure, networking, and security fundamentals in a real professional environment.`;

export const EXPERIENCE: Experience[] = [
  {
    id: "exp-bas",
    role: "Building Automation (BAS) Technician",
    company: "Pavilion Sdn. Bhd.",
    location: "Malaysia",
    start_date: "2023-05-01",
    end_date: "2024-06-01",
    is_current: false,
    bullets: [
      "Monitored the HVAC system and its network of temperature sensors, controllers, and monitoring panels across a multi-tenant commercial site, diagnosing faults to minimise downtime.",
      "Investigated system alerts and connectivity issues, documenting root causes and resolutions to support faster troubleshooting.",
      "Produced system diagnostic and incident reports used by the facilities team to track recurring issues.",
    ],
    sort_order: 1,
  },
  {
    id: "exp-helpdesk",
    role: "IT Support & Helpdesk",
    company: "Qorva Technology Sdn. Bhd.",
    location: "Malaysia",
    start_date: "2022-01-01",
    end_date: "2023-01-01",
    is_current: false,
    bullets: [
      "Logged, tracked, and resolved first-line hardware, software, and connectivity tickets using Zendesk, maintaining consistent system uptime.",
      "Configured and maintained the Sun Life app (CIMB bank's insurance application) for internal users, handling setup, updates, and troubleshooting.",
      "Ran preventive maintenance checks across end-user devices to reduce recurring fault tickets.",
      "Diagnosed basic network connectivity issues (LAN/WAN, TCP/IP) to maintain stable operations.",
    ],
    sort_order: 2,
  },
  {
    id: "exp-schindler",
    role: "Technical Field Support",
    company: "Antah Schindler Sdn. Bhd.",
    location: "Malaysia",
    start_date: "2017-08-01",
    end_date: "2018-08-01",
    is_current: false,
    bullets: [
      "Installed and upgraded elevator system software, controllers, and diagnostic tools across multiple sites.",
      "Analysed monitoring logs and performance data to detect irregularities before they caused system failure.",
      "Carried out routine inspections to maintain operational stability and safety compliance standards.",
    ],
    sort_order: 3,
  },
];

export const EDUCATION: Education[] = [
  {
    id: "edu-unirazak",
    institution: "Universiti Tun Abdul Razak (UNIRAZAK)",
    credential: "Bachelor of Information Technology (Computer Forensics), Hons",
    field: "Long-Distance Learning",
    start_date: "2024-01-01",
    end_date: null,
    score: "CGPA: 3.79",
    sort_order: 1,
  },
  {
    id: "edu-acmv",
    institution: "Sijil Akademi Binaan Malaysia (ACMV)",
    credential: "Level 1–3",
    field: null,
    start_date: "2014-01-01",
    end_date: "2016-01-01",
    score: null,
    sort_order: 2,
  },
];

export const PROJECTS: Project[] = [
  {
    id: "proj-bocorcheck",
    title: "BocorCheck — OSINT-Based Personal Data Exposure Monitoring & Risk Analysis System",
    slug: "bocorcheck",
    description:
      "Checks personal data exposure using OSINT techniques and the Have I Been Pwned (HIBP) API, translating raw breach data into a plain-language, tiered (Low/Medium/High/Critical) risk score.",
    long_description:
      "Final Year Project at UNIRAZAK (Bachelor of IT – Computer Forensics). Built the backend with Python (Flask) and MySQL, integrated a local LLM (Ollama) to generate personalised, privacy-preserving mitigation guidance without sending user data to third-party AI services, and delivered real-time breach alerts via Telegram. Applied Agile SDLC across the design, development, and testing lifecycle, including structured user acceptance testing.",
    tech_stack: ["Python", "Flask", "MySQL", "Ollama", "OSINT", "HIBP API", "Telegram Bot API"],
    repo_url: "https://github.com/Fildxza/BocorCheck-OSINT",
    live_url: null,
    image_url: null,
    is_pinned: true,
    is_featured: true,
    source: "manual",
    github_repo_name: "BocorCheck-OSINT",
    sort_order: 1,
  },
  {
    id: "proj-emv",
    title: "EMV Smart Card Security Analysis",
    slug: "emv-smart-card-security-analysis",
    description: "Details coming soon — this repository is currently private.",
    long_description: null,
    tech_stack: [],
    repo_url: "https://github.com/Fildxza/EMV-Smart-Card-Security-Analysis",
    live_url: null,
    image_url: null,
    is_pinned: true,
    is_featured: true,
    source: "manual",
    github_repo_name: "EMV-Smart-Card-Security-Analysis",
    sort_order: 2,
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "cat-support",
    name: "IT Support & Infrastructure",
    sort_order: 1,
    skills: [
      { id: "s-1", category_id: "cat-support", name: "Hardware & Software Troubleshooting", proficiency: 90, sort_order: 1 },
      { id: "s-2", category_id: "cat-support", name: "Helpdesk Ticketing (Zendesk)", proficiency: 85, sort_order: 2 },
      { id: "s-3", category_id: "cat-support", name: "Virtualization", proficiency: 75, sort_order: 3 },
      { id: "s-4", category_id: "cat-support", name: "Preventive Maintenance", proficiency: 85, sort_order: 4 },
    ],
  },
  {
    id: "cat-network",
    name: "Networking",
    sort_order: 2,
    skills: [
      { id: "s-5", category_id: "cat-network", name: "LAN/WAN Diagnostics", proficiency: 80, sort_order: 1 },
      { id: "s-6", category_id: "cat-network", name: "TCP/IP", proficiency: 78, sort_order: 2 },
      { id: "s-7", category_id: "cat-network", name: "Building Automation Systems (BAS)", proficiency: 85, sort_order: 3 },
    ],
  },
  {
    id: "cat-security",
    name: "Security & Forensics",
    sort_order: 3,
    skills: [
      { id: "s-8", category_id: "cat-security", name: "CompTIA Security+", proficiency: 80, sort_order: 1 },
      { id: "s-9", category_id: "cat-security", name: "OSINT", proficiency: 78, sort_order: 2 },
      { id: "s-10", category_id: "cat-security", name: "Have I Been Pwned API", proficiency: 75, sort_order: 3 },
      { id: "s-11", category_id: "cat-security", name: "Computer Forensics Fundamentals", proficiency: 72, sort_order: 4 },
    ],
  },
  {
    id: "cat-dev",
    name: "Development",
    sort_order: 4,
    skills: [
      { id: "s-12", category_id: "cat-dev", name: "Python", proficiency: 75, sort_order: 1 },
      { id: "s-13", category_id: "cat-dev", name: "Flask", proficiency: 70, sort_order: 2 },
      { id: "s-14", category_id: "cat-dev", name: "MySQL", proficiency: 70, sort_order: 3 },
      { id: "s-15", category_id: "cat-dev", name: "Ollama / Local LLMs", proficiency: 65, sort_order: 4 },
      { id: "s-16", category_id: "cat-dev", name: "Agile SDLC", proficiency: 75, sort_order: 5 },
    ],
  },
];

export const CERTIFICATES: Certificate[] = [
  {
    id: "cert-security-plus",
    title: "CompTIA Security+",
    issuer: "CompTIA",
    issue_date: null,
    credential_url: null,
    file_url: null,
    image_url: null,
    sort_order: 1,
  },
];

// No achievements were listed on the resume — add real ones from /admin.
export const ACHIEVEMENTS: Achievement[] = [];
