export const siteConfig = {
  name: "Mohamad Fildza Azman",
  shortName: "Fildza",
  title: "Mohamad Fildza Azman — IT & Computer Forensics",
  description:
    "Portfolio of Mohamad Fildza Azman — IT student specializing in Computer Forensics, with hands-on experience in IT support, network diagnostics, systems administration, and cybersecurity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fildza.dev",
  email: "mfildxza@gmail.com",
  phone: "+60 11-3600 5936",
  location: "Penang, Malaysia",
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "Fildxza",
  linkedinUsername: "mohamad-fildza-40734040b",
  links: {
    github: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "Fildxza"}`,
    linkedin: "https://www.linkedin.com/in/mohamad-fildza-40734040b/",
    email: "mailto:mfildxza@gmail.com",
  },
  ogImage: "/og-image.png",
} as const;

/**
 * Explicit curation for the homepage Featured Projects grid — exact repo
 * names, in display order. Anything not listed here still shows up on the
 * /projects "More Projects" page if it's a public, non-fork repo.
 */
export const FEATURED_REPO_ORDER = [
  "BocorCheck-OSINT",
  "EMV-Smart-Card-Security-Analysis",
  "fidxDFT-DigitalForensicsTool-",
  "Neuro-Track",
  "justice-for-wildlife-malaysia",
  "Ops-Mission-Control",
] as const;

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "GitHub", href: "#github" },
  { label: "Contact", href: "#contact" },
] as const;

export const TYPING_ROLES = [
  "IT Support Specialist",
  "Computer Forensics Student",
  "Network & Systems Troubleshooter",
  "OSINT & Security Enthusiast",
] as const;
