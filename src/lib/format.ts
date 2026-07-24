export function formatDateRange(
  start: string,
  end: string | null,
  isCurrent?: boolean
): string {
  const startLabel = formatMonthYear(start);
  if (isCurrent) return `${startLabel} — Present`;
  if (!end) return startLabel;
  return `${startLabel} — ${formatMonthYear(end)}`;
}

export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatYearRange(start: string, end: string | null): string {
  const startYear = new Date(start).getFullYear();
  if (!end) return `${startYear} — Present`;
  return `${startYear} — ${new Date(end).getFullYear()}`;
}
