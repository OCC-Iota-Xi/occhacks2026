import { FOOTER_TEXT, bright, esc, firstName, paragraph, shell, type WelcomeEmail } from "./layout";
import { WAIVER_DUE_DAY } from "./waivers";

/**
 * Tells an applicant they're on the waitlist and when that can change: spots
 * open once the waiver deadline passes and accepted hackers who never sent
 * their forms give theirs up. It reads the deadline from `WAIVER_DUE_DAY`, the
 * same day the reminder gives the accepted, so the two letters can't disagree
 * about when the list starts moving.
 *
 * No button: `/status` words a waitlisted application as "under review" (see
 * `applicantStage`), which would contradict the letter that sent them there.
 */
export function waitlistEmail(fullName: string): WelcomeEmail {
  const name = esc(firstName(fullName));
  const opens = `${WAIVER_DUE_DAY} at 11:59 PM`;

  const body = [
    paragraph(
      `Hi ${name} — thank you for your patience while we finalize registrations for OCC Hacks 2026.`
    ),
    paragraph(
      `This year's event has seen a record number of applications. Because space is limited, we've placed your application on our waitlist for now. Once the waiver deadline passes on ${bright(opens)}, we will begin accepting waitlisted hackers to fill any spots left by accepted participants who have not submitted their waivers.`
    ),
    paragraph(
      `Please keep an eye on your inbox. If a spot opens up for you, you'll receive an email with instructions on how to claim it and submit your waiver.`
    ),
    paragraph(`Stay tuned, and we'll reach out directly as spots open up.`),
  ].join("\n");

  const subject = "You're on the OCC Hacks waitlist";

  const text = `${subject}

Hi ${firstName(fullName)} — thank you for your patience while we finalize registrations for OCC Hacks 2026.

This year's event has seen a record number of applications. Because space is limited, we've placed your application on our waitlist for now. Once the waiver deadline passes on ${opens}, we will begin accepting waitlisted hackers to fill any spots left by accepted participants who have not submitted their waivers.

Please keep an eye on your inbox. If a spot opens up for you, you'll receive an email with instructions on how to claim it and submit your waiver.

Stay tuned, and we'll reach out directly as spots open up.

${FOOTER_TEXT}`;

  return {
    subject,
    html: shell({
      preheader: `Your application is on the waitlist. Spots open after ${opens}.`,
      heading: "You're on the waitlist",
      body,
    }),
    text,
  };
}
