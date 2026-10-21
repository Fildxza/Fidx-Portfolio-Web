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

/** Certificates may carry just a year ("2025"); show that as-is instead of inventing a month. */
export function formatCertDate(value: string): string {
  return /^\d{4}$/.test(value) ? value : formatMonthYear(value);
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
