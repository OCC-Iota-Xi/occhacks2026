import { EVENT } from "./event";
import {
  DISCORD_ICON,
  FOOTER_TEXT,
  SITE,
  buttons,
  detailTable,
  esc,
  firstName,
  goldLink,
  paragraph,
  shell,
  type WelcomeEmail,
} from "./layout";

/**
 * Acknowledges a hacker registration. This is a "we got it, we're reviewing it"
 * note — not an acceptance — so it promises nothing about a spot, and the
 * day-of logistics (check-in time, parking, what to bring) are deliberately
 * held back for whatever email confirms people in.
 */
export function hackerWelcomeEmail(fullName: string): WelcomeEmail {
  const name = esc(firstName(fullName));

  const body = [
    paragraph(
      `Hi ${name} — thanks for registering for OCC Hacks 2026. Your application is in.`
    ),
    paragraph(
      `We're reviewing applications as they come in, and we'll email you as soon as there's a decision on your spot. There's nothing you need to do until then.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Cost", value: "Free — every meal covered" },
      { label: "Prizes", value: "$500 per track, plus $250 overall" },
    ]),
    paragraph(
      `In the meantime, join the Discord. That's where we post announcements, run team formation, and where our industry mentors answer questions before and during the event.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(
      `No team or idea yet? That's the normal way to show up. We run beginner-friendly workshops and team formation at kickoff, and the industry mentors are around all weekend to help you get unstuck.`
    ),
    paragraph(
      `Spotted a mistake in your answers? You can ${goldLink("update your registration", `${SITE}/register`)} at any time, and the ${goldLink("FAQ", `${SITE}/#faq`)} covers most of the rest.`
    ),
    paragraph(`Talk soon.`),
  ].join("\n");

  const text = `Thanks for registering — OCC Hacks 2026

Hi ${firstName(fullName)} — thanks for registering for OCC Hacks 2026. Your application is in.

We're reviewing applications as they come in, and we'll email you as soon as there's a decision on your spot. There's nothing you need to do until then.

When      ${EVENT.dates}
Where     ${EVENT.venue}
Cost      Free — every meal covered
Prizes    $500 per track, plus $250 overall

In the meantime, join the Discord. That's where we post announcements, run team formation, and where our industry mentors answer questions before and during the event.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

No team or idea yet? That's the normal way to show up. We run beginner-friendly workshops and team formation at kickoff, and the industry mentors are around all weekend to help you get unstuck.

Spotted a mistake in your answers? You can update your registration at any time: ${SITE}/register
FAQ: ${SITE}/#faq

Talk soon.

${FOOTER_TEXT}`;

  return {
    subject: "Thanks for registering — OCC Hacks 2026",
    html: shell({
      preheader: `Your application is in. We'll email you when there's a decision on your spot.`,
      heading: "Thanks for registering",
      body,
    }),
    text,
  };
}
