/** The 18+ rule, shared by the form and the server action. */

/** Day one of the event — the date someone has to be 18 by. */
export const EVENT_START = "2026-10-10";

/**
 * The latest date of birth that still clears 18 by day one, and so both the
 * date field's default and its ceiling. Derived by string rather than Date
 * math so a server in another timezone can't shift it by a day.
 */
const [year, month, day] = EVENT_START.split("-");
export const LATEST_DOB = `${Number(year) - 18}-${month}-${day}`;

export const UNDER_18_MESSAGE =
  "sorry — you have to be 18 by oct 10, 2026 to take part.";

/**
 * True when a date of birth clears 18 by the first day of the event, so a
 * student turning 18 the week before still gets in. Blank or malformed input
 * passes here — that's the "required" check's job, not this one.
 */
export function isOldEnough(dob: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return true;
  // Zero-padded ISO dates sort chronologically as plain strings.
  return dob <= LATEST_DOB;
}
