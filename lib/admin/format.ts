import { EVENT_TIME_ZONE } from "@/lib/admin/time";

/**
 * Formatting shared by the organizer pages.
 *
 * Every formatter names the event's time zone. Without it, a date rendered on
 * the server comes out in the host's zone — UTC on most deployments — so an
 * evening submission would be dated the following day, and the same row would
 * read differently once the browser re-rendered it.
 */

const DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  month: "short",
  day: "numeric",
});

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE.format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_TIME.format(date);
}

export function formatShortDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return SHORT_DATE.format(date);
}

/**
 * A chart axis label for a "YYYY-MM-DD" that is already an event-time day.
 * Formatted from its parts so it can't be nudged across a boundary on the way
 * through a Date.
 */
export function formatDayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

/** "3 min ago" / "2 days ago" — the activity feed's clock. */
export function relativeTime(value: string | null | undefined) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
    [Infinity, "year"],
  ];
  const divisors = [1, 60, 3600, 86400, 604800, 2629800, 31557600];
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  for (let i = 0; i < units.length; i++) {
    if (seconds < units[i][0]) {
      return formatter.format(-Math.round(seconds / divisors[i]), units[i][1]);
    }
  }
  return "";
}

export function formatNumber(value: number | null | undefined) {
  return typeof value === "number" ? value.toLocaleString("en-US") : "—";
}

export function formatPercent(numerator: number, denominator: number, digits = 0) {
  if (!denominator) return "—";
  return `${((numerator / denominator) * 100).toFixed(digits)}%`;
}

/** Period-over-period change, or null when the previous period was empty. */
export function delta(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return ((current - previous) / previous) * 100;
}

export function formatDelta(value: number | null) {
  if (value == null) return null;
  const sign = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  return `${sign} ${Math.abs(value).toFixed(1)}%`;
}

export function initials(name: string | null | undefined, fallback = "?") {
  const source = (name ?? "").trim();
  if (!source) return fallback;
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export function displayName(applicant: { full_name?: string | null; email?: string | null }) {
  return applicant.full_name?.trim() || applicant.email?.trim() || "Unnamed applicant";
}

/** A safe href for a link someone typed into a form field. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
