/**
 * The shell and building blocks every OCC Hacks email is assembled from. Each
 * letter lives in its own file beside this one.
 *
 * Hand-written table markup with inline styles — email clients strip <style>
 * blocks, external CSS, and most modern layout. The design follows the site
 * rather than the usual boxed-card email: full-bleed deep space, hairline
 * rules between rows, gold as the only accent. The starfield stays clear of
 * the copy — the column the text sits in is flat, borderless deep space, so
 * the stars show behind the masthead and in the margins and nothing has to be
 * read through them. Copy is written in sentence case, unlike the site's
 * lowercase UI text.
 *
 * The masthead is `public/email/occhacks-wordmark.png` — the real hero
 * lockup (Bruno Ace SC + the gold gradient sweep), cropped from the headless
 * render in `assets/devpost/`. Neither the webfont nor `background-clip:text`
 * survives an email client, so the wordmark has to ship as an image.
 */

export const SITE = "https://www.occhacks.com";
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

export const COLOR = {
  bg: "#0a0a0a",
  border: "#262626",
  text: "#ffffff",
  muted: "#d4d4d4",
  faint: "#8a8a8a",
  gold: "#fcd34d",
} as const;

/** Space Grotesk if the client happens to have it, system sans otherwise. */
const FONT =
  "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Escapes user-supplied values before they land in the HTML body. */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** First name if we can find one, otherwise a safe stand-in. */
export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? "").trim().split(/\s+/)[0] || "there";
}

interface Detail {
  label: string;
  value: string;
}

/** Rule-separated rows, the same hairline treatment the schedule section uses. */
export function detailTable(details: Detail[]): string {
  const rows = details
    .map(
      ({ label, value }) => `
                    <tr>
                      <td class="faint" bgcolor="${COLOR.bg}" style="padding:11px 16px 11px 0;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:13px;line-height:1.5;color:${COLOR.faint};background-color:${COLOR.bg};white-space:nowrap;vertical-align:top;">${label}</td>
                      <td class="bright" bgcolor="${COLOR.bg}" style="padding:11px 0;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:14px;line-height:1.5;color:${COLOR.text};background-color:${COLOR.bg};vertical-align:top;">${value}</td>
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

/**
 * Keeps mobile clients from re-tinting the palette.
 *
 * Gmail, Outlook and Yahoo run their own dark-mode pass over incoming mail.
 * They read `background-color` off the element itself — never an ancestor's,
 * and never a `background-image` — so a `#ffffff` run with no background of
 * its own is assumed to sit on white and gets darkened to a mid grey. That
 * left the headline and the detail-table values unreadable while the body
 * copy, below their remap threshold, came through untouched. Two defences, because no single one covers every client:
 *
 *   1. Every light-on-dark run carries its own `background-color` inline
 *      (below), which is enough for the clients that only ever look there.
 *   2. These rules re-assert the palette after the fact — `[data-ogsc]` /
 *      `[data-ogsb]` are the hooks Outlook's mobile app leaves on rewritten
 *      elements, and the media query catches Apple Mail. Inline styles are
 *      what the clients rewrite, so these have to be `!important` to win.
 *
 * Declaring both schemes is deliberate: clients skip their forced pass only
 * for mail that claims to handle dark mode itself, and several don't
 * recognise a lone `dark`.
 */
const DARK_MODE_CSS = `
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      [data-ogsc] .bright, [data-ogsb] .bright { color: ${COLOR.text} !important; }
      [data-ogsc] .muted,  [data-ogsb] .muted  { color: ${COLOR.muted} !important; }
      [data-ogsc] .faint,  [data-ogsb] .faint  { color: ${COLOR.faint} !important; }
      [data-ogsc] .gold,   [data-ogsb] .gold   { color: ${COLOR.gold} !important; }
      [data-ogsc] .canvas, [data-ogsb] .canvas { background-color: ${COLOR.bg} !important; }
      @media (prefers-color-scheme: dark) {
        .bright { color: ${COLOR.text} !important; }
        .muted  { color: ${COLOR.muted} !important; }
        .faint  { color: ${COLOR.faint} !important; }
        .gold   { color: ${COLOR.gold} !important; }
        .canvas { background-color: ${COLOR.bg} !important; }
      }`;

/**
 * Outer chrome: wordmark, headline, content, footer rule.
 *
 * A headline that is a full sentence — an instruction, or an organizer's
 * subject line — drops a size, so it wraps to two or three lines rather than
 * filling a phone screen.
 */
export function shell({ preheader, heading, body }: ShellArgs): string {
  const headingSize = heading.length > 28 ? 28 : 38;
  const headingLeading = heading.length > 28 ? 1.25 : 1.1;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${esc(heading)}</title>
    <style type="text/css">${DARK_MODE_CSS}
    </style>
  </head>
  <body class="canvas" bgcolor="${COLOR.bg}" style="margin:0;padding:0;width:100%;background-color:${COLOR.bg};background-image:url('${STARS}');">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" background="${STARS}" bgcolor="${COLOR.bg}" class="canvas" style="background-color:${COLOR.bg};background-image:url('${STARS}');background-repeat:repeat;">
      <tr>
        <td align="center" style="padding:48px 12px 56px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:568px;">
            <tr>
              <td style="padding:0 24px 36px;">
                <img src="${WORDMARK}" width="${WORDMARK_W}" height="${WORDMARK_H}" alt="OCCHacks" style="display:block;width:${WORDMARK_W}px;max-width:100%;height:auto;border:0;font-family:${FONT};font-size:24px;letter-spacing:2px;color:${COLOR.gold};" />
              </td>
            </tr>
            <tr>
              <td class="canvas" bgcolor="${COLOR.bg}" style="padding:36px 24px 24px;background-color:${COLOR.bg};">
                <h1 class="bright" style="margin:0;font-family:${FONT};font-size:${headingSize}px;line-height:${headingLeading};letter-spacing:-0.5px;font-weight:500;color:${COLOR.text};background-color:${COLOR.bg};">${esc(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td class="canvas" bgcolor="${COLOR.bg}" style="padding:0 24px;background-color:${COLOR.bg};">
${body}
              </td>
            </tr>
            <tr>
              <td class="canvas" bgcolor="${COLOR.bg}" style="padding:8px 24px 36px;background-color:${COLOR.bg};">
                <p class="faint" style="margin:0;padding-top:28px;border-top:1px solid ${COLOR.border};font-family:${FONT};font-size:12px;line-height:1.8;color:${COLOR.faint};">
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

export function paragraph(html: string): string {
  return `                <p class="muted" style="margin:0 0 22px;font-family:${FONT};font-size:15px;line-height:1.75;color:${COLOR.muted};">${html}</p>`;
}

/**
 * The Discord mark from the site footer (components/sections/Closer.tsx),
 * rasterized to gold to match the primary pill. Email clients drop inline SVG,
 * so it ships as a PNG at 2× its display size.
 */
export const DISCORD_ICON = `${SITE}/email/discord-gold.png`;
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
export function buttons(ctas: Cta[]): string {
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
                            <td bgcolor="${COLOR.bg}" class="canvas" style="border:1px solid ${border};border-radius:999px;background-color:${COLOR.bg};">
                              <a href="${href}" class="${primary ? "gold" : "bright"}" style="display:inline-block;padding:12px 26px;font-family:${FONT};font-size:14px;line-height:${ICON_SIZE}px;color:${color};text-decoration:none;white-space:nowrap;">${mark}<span style="vertical-align:middle;">${esc(label)}</span></a>
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

export const goldLink = (label: string, href: string) =>
  `<a href="${href}" class="gold" style="color:${COLOR.gold};text-decoration:underline;">${esc(label)}</a>`;

/**
 * White against the muted body copy — the one line that can't be skimmed past.
 * Carries its own background for the same reason the headline does: see
 * `DARK_MODE_CSS`.
 */
export const bright = (html: string) =>
  `<span class="bright" style="color:${COLOR.text};background-color:${COLOR.bg};">${html}</span>`;

/** The plain-text twin of the shell's footer rule. */
export const FOOTER_TEXT = `—
OCC Hacks 2026 · Organized by the Iota Xi Society
Orange Coast College · Costa Mesa, CA
Questions? Just reply — this reaches the organizers.`;

export interface WelcomeEmail {
  subject: string;
  html: string;
  text: string;
}
