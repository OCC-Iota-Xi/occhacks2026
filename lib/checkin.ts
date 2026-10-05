/**
 * The check-in code: what an attendee's QR carries and how the desk reads it.
 *
 * The payload is a link to the check-in page with the attendee's id on it, not
 * a bare id, so there are two ways to read one. The scanner on the check-in
 * page pulls the id out and checks them in on the spot; any phone's own camera
 * opens the same link and lands an organizer on that attendee, which is what
 * the desk falls back to if the in-page scanner won't start. Opening the link
 * does nothing by itself, and `/admin` turns away anyone who isn't an organizer.
 *
 * Shared by the server (which draws the QR) and the browser (which reads it),
 * so nothing here may import server-only code.
 */

const CHECKIN_URL = "https://occhacks.com/admin/checkin";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function checkInUrl(userId: string): string {
  return `${CHECKIN_URL}?code=${userId}`;
}

/**
 * The attendee id inside whatever was scanned or typed: the link above, a bare
 * id, or the link on another host (a preview deploy, localhost). Null for
 * anything else, so a stray QR on a poster reads as "not a check-in code".
 */
export function parseCheckInCode(text: string | null | undefined): string | null {
  const match = text?.match(UUID);
  return match ? match[0].toLowerCase() : null;
}

/**
 * The first eight characters of the id, printed under the QR. It's the last
 * resort when a screen won't scan: the attendee reads it out and the desk types
 * it into the search box.
 */
export function backupCode(userId: string): string {
  const head = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${head.slice(0, 4)} ${head.slice(4)}`;
}

/** Whether a search term is a backup code (or the start of one) for this id. */
export function matchesBackupCode(userId: string, term: string): boolean {
  const typed = term.replace(/[\s-]/g, "").toLowerCase();
  if (typed.length < 4 || !/^[0-9a-f]+$/.test(typed)) return false;
  return userId.replace(/-/g, "").startsWith(typed);
}

/**
 * The event runs two days and people check in on each. The QR is the same both
 * days: it says who someone is, and the desk records which day it was read on.
 */
export const CHECKIN_DAYS = [
  { day: 1, label: "Day 1", date: "2026-10-10" },
  { day: 2, label: "Day 2", date: "2026-10-11" },
] as const;
export type CheckInDay = (typeof CHECKIN_DAYS)[number]["day"];

/**
 * Which day a check-in belongs to, given today's date in event time
 * ("YYYY-MM-DD"). Anything before the second day counts as the first, so a
 * rehearsal the week before lands on day 1.
 */
export function checkInDayOn(eventDate: string): CheckInDay {
  return eventDate >= CHECKIN_DAYS[1].date ? 2 : 1;
}

export function parseCheckInDay(value: unknown): CheckInDay | null {
  return value === 1 || value === "1" ? 1 : value === 2 || value === "2" ? 2 : null;
}
