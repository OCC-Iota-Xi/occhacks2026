/**
 * One file per letter: the welcome notes for the sign-up forms, the acceptance
 * letters, and the organizer broadcast. `layout.ts` holds the shell they share.
 */

export { EVENT } from "./event";
export { firstName, type WelcomeEmail } from "./layout";
export { hackerWelcomeEmail } from "./hacker-welcome";
export { volunteerWelcomeEmail } from "./volunteer-welcome";
export { mentorWelcomeEmail } from "./mentor-welcome";
export { helperWelcomeEmail } from "./helper-welcome";
export { MEDICAL_NOTE, WAIVER_ATTACHMENT, WAIVER_DUE_DAY, WAIVER_REPLY_TO } from "./waivers";
export { acceptanceEmail } from "./acceptance";
export { acceptanceReminderEmail } from "./acceptance-reminder";
export { broadcastEmail, type BroadcastArgs } from "./broadcast";
