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

/** Check-in has a closing time too, which only the accepted need to know. */
const CHECK_IN_WINDOW = "8:00–8:40 AM Saturday";

/**
 * Tells an applicant they're in and what confirms the spot: the signed waiver
 * packet, sent back as a reply. The packet is an attachment and the reply has
 * to land with the right people, so whatever sends this passes
 * `WAIVER_ATTACHMENT` and `WAIVER_REPLY_TO` along — nothing here can.
 *
 * `confirmBy` is the day the forms are due ("Wednesday, October 7th"); each
 * wave of acceptances gets its own.
 */
export function acceptanceEmail(fullName: string, confirmBy: string): WelcomeEmail {
  const name = esc(firstName(fullName));
  const due = `${confirmBy}, at 11:59 PM`;

  const body = [
    paragraph(
      `Hi ${name} — congratulations. You've been accepted to OCC Hacks 2026, and we're excited to have you join us.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Check-in", value: CHECK_IN_WINDOW },
      { label: "Kickoff", value: EVENT.ceremony },
      { label: "Parking", value: PARKING_HTML },
    ]),
    paragraph(
      `To confirm your spot, sign the attached waiver forms and reply to this email with your signed copy by ${bright(esc(due))}. Once we have your forms, your spot is officially confirmed.`
    ),
    paragraph(REPLY_NOTE_HTML),
    paragraph(MEDICAL_NOTE),
    paragraph(
      `Then get ready for a weekend of $2,000 in prizes, free food, and guest speakers you won't want to miss.`
    ),
    paragraph(
      `Join the Discord if you haven't already. That's where we post announcements and run team formation.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(`See you at OCC Hacks.`),
  ].join("\n");

  const subject = `You're in — sign and return your OCC Hacks waivers by ${confirmBy}`;

  const text = `${subject}

Hi ${firstName(fullName)} — congratulations. You've been accepted to OCC Hacks 2026, and we're excited to have you join us.

When      ${EVENT.dates}
Where     ${EVENT.venue}
Check-in  ${CHECK_IN_WINDOW}
Kickoff   ${EVENT.ceremony}
Parking   ${EVENT.parking}

To confirm your spot, sign the attached waiver forms and reply to this email with your signed copy by ${due}. Once we have your forms, your spot is officially confirmed.

${REPLY_NOTE_TEXT}

${MEDICAL_NOTE}

Then get ready for a weekend of $2,000 in prizes, free food, and guest speakers you won't want to miss.

Join the Discord if you haven't already. That's where we post announcements and run team formation.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

See you at OCC Hacks.

${FOOTER_TEXT}`;

  return {
    subject,
    html: shell({
      preheader: `You've been accepted. Reply with your signed waiver forms by ${confirmBy} to confirm your spot.`,
      heading: "You're in — confirm your spot by signing the waivers and replying to this email",
      body,
    }),
    text,
  };
}
