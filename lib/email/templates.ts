/**
 * Welcome emails for the two sign-up forms.
 *
 * Hand-written table markup with inline styles — email clients strip <style>
 * blocks, external CSS, and most modern layout. The design follows the site
 * rather than the usual boxed-card email: full-bleed deep space, no panel,
 * hairline rules between rows, gold as the only accent. Copy is written in
 * sentence case, unlike the site's lowercase UI text.
 *
 * The masthead is `public/email/occhacks-wordmark.png` — the real hero
 * lockup (Bruno Ace SC + the gold gradient sweep), cropped from the headless
 * render in `assets/devpost/`. Neither the webfont nor `background-clip:text`
 * survives an email client, so the wordmark has to ship as an image.
 */

const SITE = "https://www.occhacks.com";
const WORDMARK = `${SITE}/email/occhacks-wordmark.png`;

/**
 * Seamless 400px starfield tile — see assets/email/generate-stars.mjs. Stands
 * in for the site's WebGL particle field, which no email client can run.
 * Outlook's Word engine ignores CSS background images, so every element that
 * carries it also carries `background-color` and degrades to flat deep space.
 */
const STARS = `${SITE}/email/stars-tile.png`;

/** Native asset is 760×116; half that is crisp on retina and fits the column. */
const WORDMARK_W = 380;
const WORDMARK_H = 58;

const EVENT = {
  dates: "October 10–11, 2026",
  venue: "The OCC Ballroom, Orange Coast College",
  checkIn: "8:00 AM Saturday",
  ceremony: "9:00 AM",
  parking: "Free in Lot C, at Merrimac Way and Fairview Road",
  parkingUrl: "https://maps.app.goo.gl/7yWSvNarKVgHhJZW8",
  /** Same invite the site footer links to — see components/sections/Closer.tsx. */
  discordUrl: "https://discord.gg/Qn638vTzp2",
} as const;

const COLOR = {
  bg: "#0a0a0a",
  border: "#262626",
  text: "#ffffff",
  muted: "#a3a3a3",
  faint: "#6b6b6b",
  gold: "#fcd34d",
} as const;

/** Space Grotesk if the client happens to have it, system sans otherwise. */
const FONT =
  "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Escapes user-supplied values before they land in the HTML body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** First name if we can find one, otherwise a safe stand-in. */
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

/** Sentence-cases a lowercase label for use as a standalone value. */
function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface Detail {
  label: string;
  value: string;
}

/** Rule-separated rows, the same hairline treatment the schedule section uses. */
function detailTable(details: Detail[]): string {
  const rows = details
    .map(
      ({ label, value }) => `
                    <tr>
                      <td style="padding:11px 16px 11px 0;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:13px;line-height:1.5;color:${COLOR.faint};white-space:nowrap;vertical-align:top;">${label}</td>
                      <td style="padding:11px 0;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:14px;line-height:1.5;color:${COLOR.text};vertical-align:top;">${value}</td>
                    </tr>`
    )
    .join("");

  return `                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:4px 0 32px;">
                  <tbody>${rows}
                  </tbody>
                </table>`;
}

interface ShellArgs {
  preheader: string;
  heading: string;
  body: string;
}

/** Outer chrome: wordmark, headline, content, footer rule. */
function shell({ preheader, heading, body }: ShellArgs): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${esc(heading)}</title>
  </head>
  <body style="margin:0;padding:0;width:100%;background-color:${COLOR.bg};background-image:url('${STARS}');">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" background="${STARS}" style="background-color:${COLOR.bg};background-image:url('${STARS}');background-repeat:repeat;">
      <tr>
        <td align="center" style="padding:56px 24px 64px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">
            <tr>
              <td style="padding:0 0 40px;">
                <img src="${WORDMARK}" width="${WORDMARK_W}" height="${WORDMARK_H}" alt="OCCHacks" style="display:block;width:${WORDMARK_W}px;max-width:100%;height:auto;border:0;font-family:${FONT};font-size:24px;letter-spacing:2px;color:${COLOR.gold};" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 24px;">
                <h1 style="margin:0;font-family:${FONT};font-size:38px;line-height:1.1;letter-spacing:-0.5px;font-weight:500;color:${COLOR.text};">${esc(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td>
${body}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0 0;">
                <p style="margin:0;padding-top:28px;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:12px;line-height:1.8;color:${COLOR.faint};">
                  OCC Hacks 2026 · Organized by the Iota Xi Society<br />
                  Orange Coast College · Costa Mesa, CA<br />
                  Questions? Just reply — this reaches the organizers.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(html: string): string {
  return `                <p style="margin:0 0 22px;font-family:${FONT};font-size:15px;line-height:1.75;color:${COLOR.muted};">${html}</p>`;
}

/**
 * The Discord mark from the site footer (components/sections/Closer.tsx),
 * rasterized to gold to match the primary pill. Email clients drop inline SVG,
 * so it ships as a PNG at 2× its display size.
 */
const DISCORD_ICON = `${SITE}/email/discord-gold.png`;
const ICON_SIZE = 18;

interface Cta {
  label: string;
  href: string;
  primary?: boolean;
  /** Decorative — the label already names the destination, so `alt` stays empty. */
  icon?: string;
}

/**
 * The site's CTA set is a gold-tinted glass pill beside a neutral glass one.
 * Glass doesn't survive an email client, so this keeps what does: gold hairline
 * and gold label for the primary, neutral hairline for the secondary. Laid out
 * as table cells so Outlook keeps them on one row.
 */
function buttons(ctas: Cta[]): string {
  const cells = ctas
    .map(({ label, href, primary, icon }, i) => {
      const color = primary ? COLOR.gold : COLOR.text;
      const border = primary ? COLOR.gold : COLOR.border;
      // `vertical-align:middle` against a line-height equal to the icon keeps
      // the mark centred on the label instead of riding the text baseline.
      const mark = icon
        ? `<img src="${icon}" width="${ICON_SIZE}" height="${ICON_SIZE}" alt="" style="display:inline-block;vertical-align:middle;margin:0 9px 0 0;border:0;" />`
        : "";
      return `
                      <td style="padding:0 ${i === ctas.length - 1 ? 0 : 10}px 0 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="border:1px solid ${border};border-radius:999px;">
                              <a href="${href}" style="display:inline-block;padding:12px 26px;font-family:${FONT};font-size:14px;line-height:${ICON_SIZE}px;color:${color};text-decoration:none;white-space:nowrap;">${mark}<span style="vertical-align:middle;">${esc(label)}</span></a>
                            </td>
                          </tr>
                        </table>
                      </td>`;
    })
    .join("");

  return `                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 34px;">
                  <tr>${cells}
                  </tr>
                </table>`;
}

const goldLink = (label: string, href: string) =>
  `<a href="${href}" style="color:${COLOR.gold};text-decoration:underline;">${esc(label)}</a>`;

/** `EVENT.parking` with the lot linked to its map pin — for HTML bodies only. */
const PARKING_HTML = `Free in ${goldLink("Lot C", EVENT.parkingUrl)}, at Merrimac Way and Fairview Road`;

export interface WelcomeEmail {
  subject: string;
  html: string;
  text: string;
}

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
      { label: "Prizes", value: "$500 per track, plus $500 overall" },
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
Prizes    $500 per track, plus $500 overall

In the meantime, join the Discord. That's where we post announcements, run team formation, and where our industry mentors answer questions before and during the event.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

No team or idea yet? That's the normal way to show up. We run beginner-friendly workshops and team formation at kickoff, and the industry mentors are around all weekend to help you get unstuck.

Spotted a mistake in your answers? You can update your registration at any time: ${SITE}/register
FAQ: ${SITE}/#faq

Talk soon.

—
OCC Hacks 2026 · Organized by the Iota Xi Society
Orange Coast College · Costa Mesa, CA
Questions? Just reply — this reaches the organizers.`;

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

export type VolunteerRole = "volunteer" | "mentor" | "both";

const ROLE_LABEL: Record<VolunteerRole, string> = {
  volunteer: "volunteer",
  mentor: "mentor",
  both: "volunteer and mentor",
};

/** Confirmation for a volunteer / mentor sign-up. */
export function volunteerWelcomeEmail(
  fullName: string,
  role: VolunteerRole
): WelcomeEmail {
  const name = esc(firstName(fullName));
  const roleLabel = ROLE_LABEL[role] ?? "volunteer";

  const roleBlurb =
    role === "volunteer"
      ? `Volunteers keep the weekend running — check-in, meals, keeping the room stocked, and pointing 130–150 hackers in the right direction.`
      : `You'll be working alongside our other industry mentors and 130–150 student hackers, most of them at their first hackathon. The best thing you can do is unblock people and ask what they're building.`;

  const body = [
    paragraph(
      `Hi ${name} — thanks for signing up to help run OCC Hacks 2026. We have you down as a ${esc(roleLabel)}, and an organizer will follow up closer to the event with your shift details and where to be.`
    ),
    detailTable([
      { label: "When", value: EVENT.dates },
      { label: "Where", value: EVENT.venue },
      { label: "Your role", value: esc(cap(roleLabel)) },
      { label: "Parking", value: PARKING_HTML },
      { label: "Meals", value: "Covered, same as the hackers" },
    ]),
    paragraph(roleBlurb),
    paragraph(
      `Please join the Discord if you haven't already — it's where we coordinate ${role === "volunteer" ? "shifts and day-of logistics" : "mentor coverage and day-of logistics"}, and it's the fastest way to reach an organizer.`
    ),
    buttons([
      { label: "Join the Discord", href: EVENT.discordUrl, primary: true, icon: DISCORD_ICON },
      { label: "See the schedule", href: `${SITE}/#schedule` },
    ]),
    paragraph(
      `Need to change your availability or role? You can ${goldLink("update your sign-up", `${SITE}/volunteer`)} at any time before the event.`
    ),
    paragraph(`See you out there.`),
  ].join("\n");

  const text = `Thanks for signing up — OCC Hacks 2026

Hi ${firstName(fullName)} — thanks for signing up to help run OCC Hacks 2026. We have you down as a ${roleLabel}, and an organizer will follow up closer to the event with your shift details and where to be.

When       ${EVENT.dates}
Where      ${EVENT.venue}
Your role  ${cap(roleLabel)}
Parking    ${EVENT.parking}
Meals      Covered, same as the hackers

${roleBlurb}

Please join the Discord if you haven't already — it's where we coordinate ${role === "volunteer" ? "shifts and day-of logistics" : "mentor coverage and day-of logistics"}, and it's the fastest way to reach an organizer.

Join the Discord: ${EVENT.discordUrl}
See the schedule: ${SITE}/#schedule

Need to change your availability or role? You can update your sign-up at any time before the event: ${SITE}/volunteer

See you out there.

—
OCC Hacks 2026 · Organized by the Iota Xi Society
Orange Coast College · Costa Mesa, CA
Questions? Just reply — this reaches the organizers.`;

  return {
    subject: "Thanks for signing up — OCC Hacks 2026",
    html: shell({
      preheader: `You're on the ${roleLabel} roster for ${EVENT.dates}.`,
      heading: "Thanks for signing up",
      body,
    }),
    text,
  };
}
