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
 * The event runs two days and each morning is its own check-in, but the code
 * is the same on both: there's no day in it. The desk knows which morning it
 * is, so the same screenshot scans on Saturday and again on Sunday.
 *
 * Shared by the server (which draws the QR) and the browser (which reads it),
 * so nothing here may import server-only code.
 */

import { eventDay, shiftDay } from "@/lib/admin/time";
import { EVENT_START } from "@/lib/eligibility";

export const EVENT_DAYS = [1, 2] as const;
export type EventDay = (typeof EVENT_DAYS)[number];

/**
 * The day the desk is checking people in for: day one until the second
 * morning, day two from then on. Before the event that's day one, which is
 * also where a test check-in lands.
 */
export function currentEventDay(now: Date = new Date()): EventDay {
  return eventDay(now) >= shiftDay(EVENT_START, 1) ? 2 : 1;
}

/**
 * When someone checked in on a given day, from a row of `admin_applicants`.
 *
 * The per-day columns arrive with migration 0027. A database that hasn't had it
 * yet has one check-in time, and it is day one's.
 */
export function checkedInOn(
  row: {
    checked_in_at?: string | null;
    checked_in_day1_at?: string | null;
    checked_in_day2_at?: string | null;
  },
  day: EventDay
): string | null {
  if (day === 2) return row.checked_in_day2_at ?? null;
  if (row.checked_in_day1_at !== undefined) return row.checked_in_day1_at;
  return row.checked_in_at ?? null;
}

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
