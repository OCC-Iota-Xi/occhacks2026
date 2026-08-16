import { Resend } from "resend";

/**
 * Transactional email through Resend.
 *
 * Both values are optional at build time so the app still boots (and the sign-up
 * forms still save) on a machine without email configured — `sendEmail` reports
 * a skip instead of throwing.
 */
const API_KEY = process.env.RESEND_API_KEY;

/**
 * Must be an address on a domain verified at https://resend.com/domains —
 * Resend rejects anything else, so a school or personal mailbox only works as
 * `RESEND_REPLY_TO`, not as the sender.
 */
const FROM = process.env.RESEND_FROM ?? "OCC Hacks <hello@occhacks.com>";

/** Optional — where organizer replies should land. */
const REPLY_TO = process.env.RESEND_REPLY_TO;

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!API_KEY) return null;
  client ??= new Resend(API_KEY);
  return client;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true }
  | { ok: false; skipped?: false; error: string };

/**
 * Sends one email. Never throws — callers run inside `after()`, where an
 * unhandled rejection would be invisible to the user and unrecoverable anyway.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return { ok: false, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    });

    if (error) {
      console.error(`[email] resend rejected the send from ${FROM}:`, error);
      if (/domain is not verified|not verified/i.test(error.message)) {
        console.error(
          "[email] verify the sender's domain at https://resend.com/domains, or set " +
            "RESEND_FROM to an address on a domain you control and keep RESEND_REPLY_TO " +
            "pointed at the mailbox that should receive replies."
        );
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
