import {
  FOOTER_TEXT,
  SITE,
  bright,
  buttons,
  esc,
  firstName,
  goldLink,
  paragraph,
  shell,
  type WelcomeEmail,
} from "./layout";
import {
  REPLY_NOTE_HTML,
  REPLY_NOTE_TEXT,
  WAIVER_DUE_DAY,
  WAIVER_DUE_DAY_SHORT,
  WAIVER_REPLY_TO,
} from "./waivers";

/** Where an applicant reads their decision — app/(account)/status/page.tsx. */
const STATUS_URL = `${SITE}/status`;

/**
 * The nudge for accepted applicants whose signed waivers may not be back yet.
 * Names the day the forms are due (`WAIVER_DUE_DAY`) rather than "today"
 * or "tonight", so it reads correctly whichever day before then it goes out.
 * `when: "tonight"` is the last call, for sending on the due day itself: it
 * says tonight where the other says the day, and still names the day once in
 * the body for whoever opens it the next morning.
 *
 * Kept to what someone needs to act on: the deadline, the packet (attached
 * again, same as `acceptanceEmail`, so nobody has to dig for the first one),
 * and where the reply lands. It goes to everyone accepted, including people
 * whose forms are already in, which is why its second paragraph tells them
 * they're set.
 */
export function acceptanceReminderEmail(
  fullName: string,
  when: "day" | "tonight" = "day"
): WelcomeEmail {
  const name = esc(firstName(fullName));
  const tonight = when === "tonight";
  const due = tonight
    ? `tonight, ${WAIVER_DUE_DAY}, at 11:59 PM`
    : `${WAIVER_DUE_DAY} at 11:59 PM`;
  /** For the subject and headline, where the full date doesn't fit. */
  const dueShort = tonight ? "tonight" : WAIVER_DUE_DAY_SHORT;

  const body = [
    paragraph(
      `Hi ${name} — you've been accepted to OCC Hacks 2026! If you have not sent in your signed waiver forms, please reply to this email with your signed forms by ${bright(due)}. Unconfirmed spots will be reallocated to waitlisted participants, so be sure to send them over promptly to guarantee your entry!`
    ),
    paragraph(
      `If you have already sent in your signed forms, then you're set and no further action is required.`
    ),
    paragraph(
      `The waiver packet is attached. Its Medical Consent Form is only for Orange Coast College students.`
    ),
    paragraph(REPLY_NOTE_HTML),
    buttons([{ label: "Check your status", href: STATUS_URL, primary: true }]),
  ].join("\n");

  const subject = `${tonight ? "Last reminder" : "Reminder"} — confirm your OCC Hacks spot by ${dueShort}`;

  const text = `${subject}

Hi ${firstName(fullName)} — you've been accepted to OCC Hacks 2026! If you have not sent in your signed waiver forms, please reply to this email with your signed forms by ${due}. Unconfirmed spots will be reallocated to waitlisted participants, so be sure to send them over promptly to guarantee your entry!

If you have already sent in your signed forms, then you're set and no further action is required.

The waiver packet is attached. Its Medical Consent Form is only for Orange Coast College students.

${REPLY_NOTE_TEXT}

Check your status: ${STATUS_URL}

${FOOTER_TEXT}`;

  return {
    subject,
    html: shell({
      preheader: tonight
        ? "Reply with your signed waiver forms by 11:59 PM tonight to keep your spot."
        : `Reply with your signed waiver forms by ${due} to keep your spot.`,
      heading: `Confirm your spot by ${dueShort}`,
      body,
    }),
    text,
  };
}

/**
 * The last word, for after `WAIVER_DUE_DAY` has passed: unconfirmed spots are
 * already going to the waitlist, so it names no deadline and asks for the forms
 * now. The wording is the organizers' own letter, kept as they wrote it. Same
 * attachment and reply-to as the reminders before it.
 */
export function acceptanceFinalReminderEmail(fullName: string): WelcomeEmail {
  const name = esc(firstName(fullName));

  const body = [
    paragraph(`Hi ${name},`),
    paragraph(
      `We are currently in the process of reallocating unconfirmed spots for OCCHacks 2026 to participants on our waitlist. If you still plan to attend, please reply with your signed waiver forms as soon as possible to lock in your entry.`
    ),
    paragraph(bright(`How to confirm your spot:`)),
    paragraph(
      `1. Attach your completed waiver packet to a reply to this email. (Note: The Medical Consent Form is only required for OCC students.)`
    ),
    paragraph(
      `2. Ensure both organizers: ${WAIVER_REPLY_TO.map((to) => goldLink(to, `mailto:${to}`)).join(" and ")} are included on your reply thread.`
    ),
    paragraph(
      `Once we receive your forms, your registration is fully secured. Hope to see you there!`
    ),
    paragraph(`Best,<br />The OCCHacks Team`),
    paragraph(
      `P.S. Don't miss out, our guest speaker lineup includes the Director of Applied Science at Blizzard and the former Director of Amazon Game Studios!`
    ),
  ].join("\n");

  const subject = `OCC Hacks 2026 — Urgent action required to secure your spot`;

  const text = `${subject}

Hi ${firstName(fullName)},

We are currently in the process of reallocating unconfirmed spots for OCCHacks 2026 to participants on our waitlist. If you still plan to attend, please reply with your signed waiver forms as soon as possible to lock in your entry.

How to confirm your spot:

1. Attach your completed waiver packet to a reply to this email. (Note: The Medical Consent Form is only required for OCC students.)

2. Ensure both organizers: ${WAIVER_REPLY_TO.join(" and ")} are included on your reply thread.

Once we receive your forms, your registration is fully secured. Hope to see you there!

Best,
The OCCHacks Team

P.S. Don't miss out, our guest speaker lineup includes the Director of Applied Science at Blizzard and the former Director of Amazon Game Studios!

${FOOTER_TEXT}`;

  return {
    subject,
    html: shell({
      preheader: "We're reallocating unconfirmed spots to the waitlist. Reply with your signed waiver forms to keep yours.",
      heading: "Urgent action required to secure your spot",
      body,
    }),
    text,
  };
}
