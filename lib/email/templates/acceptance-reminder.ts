import {
  FOOTER_TEXT,
  SITE,
  bright,
  buttons,
  esc,
  firstName,
  paragraph,
  shell,
  type WelcomeEmail,
} from "./layout";
import {
  REPLY_NOTE_HTML,
  REPLY_NOTE_TEXT,
  WAIVER_DUE_DAY,
  WAIVER_DUE_DAY_SHORT,
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
