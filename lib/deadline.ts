/** Applications close Oct 5, 2026 at 11:59 PM Pacific (PDT). */
export const APPLICATION_DEADLINE = "2026-10-05T23:59:00-07:00";

export const APPLICATION_DEADLINE_MS = Date.parse(APPLICATION_DEADLINE);

export function applicationsClosed(now: number = Date.now()) {
  return now >= APPLICATION_DEADLINE_MS;
}

/** The late-arrival policy, worded once so every page says the same thing. */
export const WALK_IN_POLICY =
  "Due to the overwhelming number of applications, walk-ins will not be accepted.";
