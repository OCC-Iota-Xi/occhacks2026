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
 * A code is read once. The event runs two days, but checking in on either one
 * covers both, so there's no day in here and nothing to scan a second time.
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
