import { CHECK_IN_WINDOW } from "./acceptance";
import { EVENT, PARKING_HTML } from "./event";
import {
  DISCORD_ICON,
  FOOTER_TEXT,
  SITE,
  bright,
  buttons,
  detailTable,
  esc,
  firstName,
  paragraph,
  shell,
  type WelcomeEmail,
} from "./layout";
import { MEDICAL_NOTE, REPLY_NOTE_HTML, REPLY_NOTE_TEXT } from "./waivers";

/**
 * Tells someone on the waitlist that a spot has opened and how to claim it —
 * the email `waitlistEmail` promised them. It's `acceptanceEmail` for a person
 * who has already been told to wait: the same details and the same waiver
 * step, opened with the news that the wait is over and closed with what
 * happens to a spot nobody claims, since theirs came from exactly that.
 *
 * Like the acceptance letter, whatever sends this passes `WAIVER_ATTACHMENT`
 * and `WAIVER_REPLY_TO` along. `confirmBy` is the day their forms are due
 * ("Thursday, October 8th"); it is later than the first waves' deadline, which
 * has passed by the time the waitlist moves.
 */
export function waitlistAcceptedEmail(fullName: string, confirmBy: string): WelcomeEmail {
  const name = esc(firstName(fullName));
  const due = `${confirmBy}, at 11:59 PM`;

  const body = [
    paragraph(
      `Hi ${name} — good news. A spot has opened up and you're off the waitlist: you've been accepted to OCC Hacks 2026, and we're excited to have you join us.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Check-in", value: CHECK_IN_WINDOW },
      { label: "Kickoff", value: EVENT.ceremony },
      { label: "Parking", value: PARKING_HTML },
    ]),
    paragraph(
      `To claim your spot, sign the attached waiver forms and reply to this email with your signed copy by tonight, at ${bright(esc(due))}. Once we have your forms, your spot is officially confirmed.`
    ),
    paragraph(
      `The event is close, so this deadline is a short one. A spot that isn't claimed by then goes to the next person on the waitlist.`
    ),
    paragraph(REPLY_NOTE_HTML),
    paragraph(MEDICAL_NOTE),
    paragraph(
      `Join the Discord if you haven't already. That's where we post announcements and run team formation.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(`See you at OCC Hacks.`),
  ].join("\n");

  const subject = `You're off the waitlist — claim your OCC Hacks spot by ${confirmBy}`;

  const text = `${subject}

Hi ${firstName(fullName)} — good news. A spot has opened up and you're off the waitlist: you've been accepted to OCC Hacks 2026, and we're excited to have you join us.

When      ${EVENT.dates}
Where     ${EVENT.venue}
Check-in  ${CHECK_IN_WINDOW}
Kickoff   ${EVENT.ceremony}
Parking   ${EVENT.parking}

To claim your spot, sign the attached waiver forms and reply to this email with your signed copy by ${due}. Once we have your forms, your spot is officially confirmed.

The event is close, so this deadline is a short one. A spot that isn't claimed by then goes to the next person on the waitlist.

${REPLY_NOTE_TEXT}

${MEDICAL_NOTE}

Join the Discord if you haven't already. That's where we post announcements and run team formation.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

See you at OCC Hacks.

${FOOTER_TEXT}`;

  return {
    subject,
    html: shell({
      preheader: `A spot opened up. Reply with your signed waiver forms by ${confirmBy} to claim it.`,
      heading: "You're off the waitlist — sign the waivers and reply to this email to claim your spot",
      body,
    }),
    text,
  };
}
