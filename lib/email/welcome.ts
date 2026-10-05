import type { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./client";
import { HELPER_TABLE, type HelperRole, type HelperTable } from "@/lib/helper-roles";
import { hackerWelcomeEmail, helperWelcomeEmail, type WelcomeEmail } from "./templates";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Table = "hackers" | HelperTable;

/**
 * Claims the welcome-email slot for the signed-in user's row: flips
 * `welcome_email_sent_at` from null to now() and reports whether *this* call
 * is the one that flipped it.
 *
 * Goes through `claim_welcome_email` (migration 0025) rather than an update:
 * the row belongs to the applicant, so a stamp they could write is a stamp
 * they could clear. The function is atomic, so a double-submit or a later edit
 * of the same form can't produce a second email, and it stops answering after
 * three claims.
 */
async function claim(supabase: Supabase, table: Table): Promise<boolean> {
  // Each table is keyed by `user_id` alone and the function only touches the
  // caller's row, so the claim can't reach past the one sign-up it's for —
  // someone who registered and also volunteered has a separate slot in each.
  const { data, error } = await supabase.rpc("claim_welcome_email", { p_table: table });

  if (error) {
    console.error(`[email] couldn't claim the welcome slot on ${table}:`, error);
    return false;
  }

  return data === true;
}

/** Hands the slot back so a later save retries — used when the send fails. */
async function release(supabase: Supabase, table: Table): Promise<void> {
  const { error } = await supabase.rpc("release_welcome_email", { p_table: table });

  if (error) {
    console.error(`[email] couldn't release the welcome slot on ${table}:`, error);
  }
}

async function sendWelcome(
  supabase: Supabase,
  table: Table,
  to: string,
  message: WelcomeEmail
): Promise<void> {
  if (!to) return;
  if (!(await claim(supabase, table))) return;

  const result = await sendEmail({ to, ...message });
  if (!result.ok) await release(supabase, table);
}

/**
 * Welcomes a first-time hacker registration. No-op on later edits.
 *
 * `to` is the address the account signed in with — never one read from the
 * form, which would let anyone point this at a stranger's inbox.
 */
export async function sendHackerWelcome(
  supabase: Supabase,
  to: string,
  fullName: string
): Promise<void> {
  await sendWelcome(supabase, "hackers", to, hackerWelcomeEmail(fullName));
}

/**
 * Welcomes a first-time volunteer or mentor sign-up. No-op on later edits of
 * that role — someone who signs up for both gets one email for each, because
 * the two roles keep their sign-ups in separate tables.
 */
export async function sendHelperWelcome(
  supabase: Supabase,
  role: HelperRole,
  to: string,
  fullName: string
): Promise<void> {
  await sendWelcome(supabase, HELPER_TABLE[role], to, helperWelcomeEmail(fullName, role));
}
