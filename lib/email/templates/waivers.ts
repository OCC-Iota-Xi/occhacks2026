/** The waiver packet and where it goes back to — shared by the acceptance letters. */

import { SITE, goldLink } from "./layout";

/**
 * The waiver packet both acceptance letters ask people to sign and send back —
 * `public/email/OCCHacksWaivers.pdf`. Shaped for Resend's `attachments`, which
 * fetches `path` itself, so a send doesn't need the file on disk.
 */
export const WAIVER_ATTACHMENT = {
  filename: "OCCHacksWaivers.pdf",
  path: `${SITE}/email/OCCHacksWaivers.pdf`,
} as const;

/**
 * The organizers collecting signed waivers. Whatever sends these letters sets
 * both as the reply-to, so a plain reply reaches the two of them. The letters
 * name them as well — some clients ignore reply-to, and people do send the
 * forms from a different account than the one we wrote to.
 */
export const WAIVER_REPLY_TO = [
  "nngo62@student.cccd.edu",
  "lnguyen1509@student.cccd.edu",
] as const;

/**
 * The day signed waivers are due, at 11:59 PM. The reminder and the status
 * page both read it from here, so they can't tell someone two different days.
 */
export const WAIVER_DUE_DAY = "Wednesday, October 7";

/** The same day, abbreviated — for subject lines and headlines, where space is short. */
export const WAIVER_DUE_DAY_SHORT = "Wed October 7";

/** Its own paragraph in both letters, so it isn't lost mid-sentence. */
export const REPLY_NOTE_HTML = `Replies to this email go to two of our organizers: ${WAIVER_REPLY_TO.map((to) =>
  goldLink(to, `mailto:${to}`)
).join(" and ")}. If your reply isn't addressed to both, add them before you send.`;
export const REPLY_NOTE_TEXT = `Replies to this email go to two of our organizers: ${WAIVER_REPLY_TO.join(" and ")}. If your reply isn't addressed to both, add them before you send.`;

export const MEDICAL_NOTE = `The packet includes a Medical Consent Form, which is required only for Orange Coast College students. If you're not an OCC student, skip it.`;
