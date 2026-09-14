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

/** Resend accepts at most this many messages per batch call. */
export const BATCH_MAX = 100;

export type SendBatchResult =
  | { ok: true; results: SendEmailResult[] }
  | { ok: false; skipped: true }
  | { ok: false; skipped?: false; error: string };

/**
 * Sends up to `BATCH_MAX` messages in one request — the organizer broadcasts.
 *
 * Permissive validation so one bad address fails alone rather than sinking
 * the batch. Resend then returns the successful ids in input order with the
 * failures listed separately by index, which this folds back into one array
 * aligned with `messages`. `idempotencyKey` lets a retried request reuse the
 * first attempt's result instead of sending everyone a second copy.
 */
export async function sendBatch(
  messages: SendEmailArgs[],
  idempotencyKey: string
): Promise<SendBatchResult> {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped a batch of ${messages.length}`);
    return { ok: false, skipped: true };
  }
  if (!messages.length) return { ok: true, results: [] };
  if (messages.length > BATCH_MAX) {
    return { ok: false, error: `a batch holds at most ${BATCH_MAX} messages` };
  }

  try {
    const { data, error } = await resend.batch.send(
      messages.map(({ to, subject, html, text }) => ({
        from: FROM,
        to,
        subject,
        html,
        text,
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      })),
      { batchValidation: "permissive", idempotencyKey }
    );

    if (error) {
      console.error(`[email] resend rejected the batch from ${FROM}:`, error);
      return { ok: false, error: error.message };
    }

    const failed = new Map<number, string>();
    for (const item of data?.errors ?? []) failed.set(item.index, item.message);

    const ids = data?.data ?? [];
    let next = 0;
    const results: SendEmailResult[] = messages.map((_, index) => {
      const message = failed.get(index);
      if (message !== undefined) return { ok: false, error: message };
      return { ok: true, id: ids[next++]?.id ?? null };
    });

    return { ok: true, results };
  } catch (err) {
    console.error("[email] batch send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
