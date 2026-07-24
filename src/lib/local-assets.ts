import fs from "node:fs";
import path from "node:path";

const LOCAL_PHOTO_PATH = "/images/profile.jpg";
const LOCAL_RESUME_PATH = "/resume/resume.pdf";

/** Server-only check: is a local profile photo present in /public/images? */
export function getLocalProfilePhoto(): string | null {
  const absolute = path.join(process.cwd(), "public", "images", "profile.jpg");
  return fs.existsSync(absolute) ? LOCAL_PHOTO_PATH : null;
}

/** Server-only check: is a local resume PDF present in /public/resume? */
export function getLocalResumeUrl(): string | null {
  const absolute = path.join(process.cwd(), "public", "resume", "resume.pdf");
  return fs.existsSync(absolute) ? LOCAL_RESUME_PATH : null;
}
