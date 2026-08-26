/**
 * The event's clock.
 *
 * Everything an organizer reads is in Orange Coast College's local time,
 * because that's the only clock that matters to them: an application submitted
 * at 6pm on the 25th was submitted on the 25th, not — as UTC would have it —
 * at 1am on the 26th. Postgres stores `timestamptz`, so the instants are
 * unambiguous; this module is about which day an instant falls on and how a
 * date the organizer picked turns back into an instant.
 *
 * Server renders and browser renders agree because the zone is named
 * explicitly rather than taken from whatever machine is doing the formatting.
 */
export const EVENT_TIME_ZONE = "America/Los_Angeles";

/** "2026-08-25" for a given instant, in event time. */
export function eventDay(date: Date = new Date()): string {
  // en-CA gives ISO-ordered parts, which is exactly the shape wanted here.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Calendar arithmetic on a "YYYY-MM-DD", with no zone to drift against. */
export function shiftDay(day: string, delta: number): string {
  const [year, month, date] = day.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, date + delta));
  return shifted.toISOString().slice(0, 10);
}

/**
 * The offset event time was at on a given day — "-07:00" in summer, "-08:00"
 * in winter. Read from the zone database rather than hardcoded, so the two
 * weekends a year when California changes clocks don't quietly shift a filter
 * by an hour.
 */
function offsetOn(day: string): string {
  const noon = new Date(`${day}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(noon);
  const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT-08:00";
  const offset = name.replace("GMT", "").trim();
  return offset || "+00:00";
}

/** The instant a given event-time day starts, as an ISO string Postgres accepts. */
export function dayStart(day: string): string {
  return `${day}T00:00:00${offsetOn(day)}`;
}

/** The last instant of a given event-time day. */
export function dayEnd(day: string): string {
  return `${day}T23:59:59.999${offsetOn(day)}`;
}
