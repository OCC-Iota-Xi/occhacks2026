import { EVENT, PARKING_HTML } from "./event";
import {
  DISCORD_ICON,
  FOOTER_TEXT,
  SITE,
  buttons,
  detailTable,
  esc,
  firstName,
  paragraph,
  shell,
  type WelcomeEmail,
} from "./layout";

/**
 * Confirmation for a volunteer sign-up.
 *
 * Volunteers and mentors get separate letters rather than one with the role
 * swapped in: the two jobs are nothing alike on the day, and the wording that
 * actually helps someone — a shift and a place to report, versus a block on the
 * floor and a team to sit with — differs line by line. Both carry the same
 * facts: the event details, what the job is, the Discord, and how to edit the
 * sign-up.
 */
export function volunteerWelcomeEmail(fullName: string): WelcomeEmail {
  const name = esc(firstName(fullName));

  const body = [
    paragraph(
      `Hi ${name} — thank you for offering to help run OCC Hacks 2026. We have your sign-up, and we'll reach out to you soon with the shift you're on and where to report when you arrive.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Your role", value: "Volunteer" },
      { label: "Parking", value: PARKING_HTML },
      { label: "Meals", value: "Covered on every shift, same as the hackers" },
    ]),
    paragraph(
      `Volunteers are what keep the weekend running: check-in at the door, meals, keeping the room stocked, and pointing 130–150 hackers in the right direction. None of it needs a technical background — whoever is running your shift will walk you through it when you get there.`
    ),
    paragraph(
      `Please join the Discord if you haven't already. Shifts and day-of logistics are coordinated there, and it's the fastest way to reach an organizer.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(`See you out there.`),
  ].join("\n");

  const text = `Thank you for offering to help — OCC Hacks 2026

Hi ${firstName(fullName)} — thank you for offering to help run OCC Hacks 2026. We have your sign-up, and we'll reach out to you soon with the shift you're on and where to report when you arrive.

When       ${EVENT.dates}
Where      ${EVENT.venue}
Your role  Volunteer
Parking    ${EVENT.parking}
Meals      Covered on every shift, same as the hackers

Volunteers are what keep the weekend running: check-in at the door, meals, keeping the room stocked, and pointing 130-150 hackers in the right direction. None of it needs a technical background — whoever is running your shift will walk you through it when you get there.

Please join the Discord if you haven't already. Shifts and day-of logistics are coordinated there, and it's the fastest way to reach an organizer.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

See you out there.

${FOOTER_TEXT}`;

  return {
    subject: "Thank you for offering to help — OCC Hacks 2026",
    html: shell({
      preheader: `We have your volunteer sign-up — we'll reach out to you soon.`,
      heading: "Thank you for offering to help",
      body,
    }),
    text,
  };
}
