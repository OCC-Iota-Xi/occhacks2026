import type { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./client";
import {
  hackerWelcomeEmail,
  volunteerWelcomeEmail,
  type VolunteerRole,
  type WelcomeEmail,
} from "./templates";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Table = "registrations" | "volunteers";

/**
 * Claims the welcome-email slot for a row: flips `welcome_email_sent_at` from
 * null to now() and reports whether *this* call is the one that flipped it.
 *
 * The `.is(..., null)` filter makes the claim atomic, so a double-submit or a
 * later edit of the same form can't produce a second email.
 */
async function claim(supabase: Supabase, table: Table, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("welcome_email_sent_at", null)
    .select("user_id");

  if (error) {
    console.error(`[email] couldn't claim the welcome slot on ${table}:`, error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/** Hands the slot back so a later save retries — used when the send fails. */
async function release(supabase: Supabase, table: Table, userId: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({ welcome_email_sent_at: null })
    .eq("user_id", userId);

  if (error) {
    console.error(`[email] couldn't release the welcome slot on ${table}:`, error);
  }
}

async function sendWelcome(
  supabase: Supabase,
  table: Table,
  userId: string,
  to: string,
  message: WelcomeEmail
): Promise<void> {
  if (!to) return;
  if (!(await claim(supabase, table, userId))) return;

  const result = await sendEmail({ to, ...message });
  if (!result.ok) await release(supabase, table, userId);
}

/** Welcomes a first-time hacker registration. No-op on later edits. */
export async function sendHackerWelcome(
  supabase: Supabase,
  userId: string,
  to: string,
  fullName: string
): Promise<void> {
  await sendWelcome(supabase, "registrations", userId, to, hackerWelcomeEmail(fullName));
}

/** Welcomes a first-time volunteer / mentor sign-up. No-op on later edits. */
export async function sendVolunteerWelcome(
  supabase: Supabase,
  userId: string,
  to: string,
  fullName: string,
  role: VolunteerRole
): Promise<void> {
  await sendWelcome(
    supabase,
    "volunteers",
    userId,
    to,
    volunteerWelcomeEmail(fullName, role)
  );
}
