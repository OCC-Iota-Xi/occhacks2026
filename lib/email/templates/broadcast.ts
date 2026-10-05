import { COLOR, FOOTER_TEXT, esc, paragraph, shell, type WelcomeEmail } from "./layout";

const FIRST_NAME_TOKEN = /\{\{\s*first_name\s*\}\}/gi;

/** Bare URLs become gold links. Runs on escaped text, so the match can't carry markup. */
function linkify(escaped: string): string {
  return escaped.replace(
    /https?:\/\/[^\s<]+[^\s<.,;:!?)]/g,
    (url) => `<a href="${url}" class="gold" style="color:${COLOR.gold};text-decoration:underline;">${url}</a>`
  );
}

export interface BroadcastArgs {
  subject: string;
  /** Plain text. Blank lines separate paragraphs; single newlines are kept. */
  bodyText: string;
  /** The recipient's first name, or null when we only have an address. */
  firstName: string | null;
}

/**
 * The letter organizers write themselves on /admin/emails. Same chrome as the
 * welcome notes, with the organizer's paragraphs where the copy would be.
 * `{{first_name}}` in the subject or body is replaced per recipient, falling
 * back to "there" when the address came from a list without names.
 */
export function broadcastEmail({ subject, bodyText, firstName: name }: BroadcastArgs): WelcomeEmail {
  const who = name?.trim() || "there";
  const fill = (value: string) => value.replace(FIRST_NAME_TOKEN, who);

  const filledSubject = fill(subject).trim();
  const paragraphs = fill(bodyText)
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const body = paragraphs
    .map((p) => paragraph(linkify(esc(p)).replace(/\n/g, "<br />")))
    .join("\n");

  const text = `${filledSubject}

${paragraphs.join("\n\n")}

${FOOTER_TEXT}`;

  return {
    subject: filledSubject,
    html: shell({
      preheader: (paragraphs[0] ?? filledSubject).replace(/\s+/g, " ").slice(0, 120),
      heading: filledSubject,
      body,
    }),
    text,
  };
}
