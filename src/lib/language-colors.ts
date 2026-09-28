/** Subset of GitHub's linguist colors, keyed by language name. */
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Shell: "#89e051",
  Go: "#00ADD8",
  Ruby: "#701516",
  Rust: "#dea584",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
};

export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return "var(--brand)";
  return LANGUAGE_COLORS[language] ?? "var(--brand)";
}
