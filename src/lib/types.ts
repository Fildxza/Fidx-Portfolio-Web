export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
  sort_order: number;
};

export type Education = {
  id: string;
  institution: string;
  credential: string;
  field: string | null;
  start_date: string;
  end_date: string | null;
  score: string | null;
  sort_order: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  tech_stack: string[];
  repo_url: string | null;
  live_url: string | null;
  image_url: string | null;
  is_pinned: boolean;
  is_featured: boolean;
  source: "manual" | "github";
  github_repo_name: string | null;
  sort_order: number;
};

export type FeaturedProject = {
  key: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  stars: number | null;
  lastUpdated: string | null;
  isPrivate: boolean;
};

export type SkillCategory = {
  id: string;
  name: string;
  sort_order: number;
  skills: Skill[];
};

export type Skill = {
  id: string;
  category_id: string;
  name: string;
  proficiency: number | null;
  sort_order: number;
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  file_url: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  pinned?: boolean;
};

export type GithubStats = {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  topLanguages: { name: string; count: number; percentage: number }[];
};
