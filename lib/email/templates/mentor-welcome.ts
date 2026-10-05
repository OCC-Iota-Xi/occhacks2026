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

/** Confirmation for a mentor sign-up — see `volunteerWelcomeEmail`. */
export function mentorWelcomeEmail(fullName: string): WelcomeEmail {
  const name = esc(firstName(fullName));

  const body = [
    paragraph(
      `Hi ${name} — thank you for offering your time to OCC Hacks 2026. We have your sign-up, and we'll reach out to you soon with the blocks you're covering and how we match mentors to teams on the day.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Your role", value: "Mentor" },
      { label: "Parking", value: PARKING_HTML },
      { label: "Meals", value: "Covered while you're on the floor, same as the hackers" },
    ]),
    paragraph(
      `You'll be on the floor with our other mentors and 130–150 student hackers, most of them at their first hackathon. Nothing to prepare — the useful thing is to walk the room, ask teams what they're building, and get them unstuck. Saying "I don't know that one either, let's look" is a perfectly good answer.`
    ),
    paragraph(
      `Please join the Discord if you haven't already. Mentor coverage and day-of logistics are coordinated there, and teams post questions between blocks.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(`See you on the floor.`),
  ].join("\n");

  const text = `Thank you for offering your time — OCC Hacks 2026

Hi ${firstName(fullName)} — thank you for offering your time to OCC Hacks 2026. We have your sign-up, and we'll reach out to you soon with the blocks you're covering and how we match mentors to teams on the day.

When       ${EVENT.dates}
Where      ${EVENT.venue}
Your role  Mentor
Parking    ${EVENT.parking}
Meals      Covered while you're on the floor, same as the hackers

You'll be on the floor with our other mentors and 130-150 student hackers, most of them at their first hackathon. Nothing to prepare — the useful thing is to walk the room, ask teams what they're building, and get them unstuck. Saying "I don't know that one either, let's look" is a perfectly good answer.

Please join the Discord if you haven't already. Mentor coverage and day-of logistics are coordinated there, and teams post questions between blocks.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

See you on the floor.

${FOOTER_TEXT}`;

  return {
    subject: "Thank you for offering your time — OCC Hacks 2026",
    html: shell({
      preheader: `We have your mentor sign-up — we'll reach out to you soon.`,
      heading: "Thank you for offering your time",
      body,
    }),
    text,
  };
}
