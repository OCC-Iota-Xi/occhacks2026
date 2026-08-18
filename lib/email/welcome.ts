import type { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./client";
import type { HelperRole } from "@/lib/helper-roles";
import { hackerWelcomeEmail, helperWelcomeEmail, type WelcomeEmail } from "./templates";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Table = "registrations" | "volunteers";

/**
 * Claims the welcome-email slot for a row: flips `welcome_email_sent_at` from
 * null to now() and reports whether *this* call is the one that flipped it.
 *
 * The `.is(..., null)` filter makes the claim atomic, so a double-submit or a
 * later edit of the same form can't produce a second email.
 */
async function claim(
  supabase: Supabase,
  table: Table,
  userId: string,
  role: HelperRole | null
): Promise<boolean> {
  // `volunteers` is keyed by (user_id, role), so a user_id on its own can match
  // two rows — the volunteer sign-up and the mentor one. Claiming both would
  // swallow the second email. `registrations` has no role and passes null.
  let query = supabase
    .from(table)
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("welcome_email_sent_at", null);
  if (role) query = query.eq("role", role);

  const { data, error } = await query.select("user_id");

  if (error) {
    console.error(`[email] couldn't claim the welcome slot on ${table}:`, error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/** Hands the slot back so a later save retries — used when the send fails. */
async function release(
  supabase: Supabase,
  table: Table,
  userId: string,
  role: HelperRole | null
): Promise<void> {
  let query = supabase
    .from(table)
    .update({ welcome_email_sent_at: null })
    .eq("user_id", userId);
  if (role) query = query.eq("role", role);

  const { error } = await query;

  if (error) {
    console.error(`[email] couldn't release the welcome slot on ${table}:`, error);
  }
}

async function sendWelcome(
  supabase: Supabase,
  table: Table,
  userId: string,
  role: HelperRole | null,
  to: string,
  message: WelcomeEmail
): Promise<void> {
  if (!to) return;
  if (!(await claim(supabase, table, userId, role))) return;

  const result = await sendEmail({ to, ...message });
  if (!result.ok) await release(supabase, table, userId, role);
}

/** Welcomes a first-time hacker registration. No-op on later edits. */
export async function sendHackerWelcome(
  supabase: Supabase,
  userId: string,
  to: string,
  fullName: string
): Promise<void> {
  await sendWelcome(supabase, "registrations", userId, null, to, hackerWelcomeEmail(fullName));
}

/**
 * Welcomes a first-time volunteer or mentor sign-up. No-op on later edits of
 * that role — someone who signs up for both gets one email for each, because
 * the claim is scoped to the row rather than the account.
 */
export async function sendHelperWelcome(
  supabase: Supabase,
  role: HelperRole,
  userId: string,
  to: string,
  fullName: string
): Promise<void> {
  await sendWelcome(
    supabase,
    "volunteers",
    userId,
    role,
    to,
    helperWelcomeEmail(fullName, role)
  );
}
