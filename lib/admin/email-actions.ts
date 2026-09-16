"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/actions";
import { assertAdmin, type AdminSession } from "@/lib/admin/auth";
import {
  AUDIENCE_KEYS,
  BODY_MAX,
  EMAIL_RE,
  EXTRA_MAX,
  PREVIEW_MAX,
  SUBJECT_MAX,
  normalizeEmail,
  parseAddresses,
  parseAudience,
  type AudienceSpec,
  type CampaignStatus,
  type Recipient,
  type SendProgress,
} from "@/lib/admin/email";
import { fetchCampaign, resolveAudience } from "@/lib/admin/email-queries";
import type { AdminContext } from "@/lib/admin/queries";
import { BATCH_MAX, sendBatch, sendEmail } from "@/lib/email/client";
import { broadcastEmail, firstName } from "@/lib/email/templates";

/**
 * Every write behind /admin/emails. The same two rules as `actions.ts`:
 * `assertAdmin()` first, and the write goes through the organizer's own
 * session so the policies in migration 0022 have the final say.
 *
 * A send is not one request. `startSend` turns the audience into recipient
 * rows and flips the campaign to `sending`; the browser then calls
 * `sendChunk` until it reports `done`. Each call mails at most one Resend
 * batch (100 people), so no request runs long enough to hit a timeout, and
 * every call passes through the proxy that keeps the session cookie fresh.
 * There is no service-role key in this project, so a detached job could not
 * read the roster anyway.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => UUID.test(id)))).slice(0, 2000);
}

function refresh() {
  revalidatePath("/admin", "layout");
}

function fail(error: { message: string } | null, fallback: string): ActionResult {
  return { ok: false, message: error?.message ?? fallback };
}

/** The read helpers want an `AdminContext`; an action already holds everything it needs. */
function contextOf(session: AdminSession): AdminContext {
  return { supabase: session.supabase, userId: session.user.id, email: session.email, ready: true };
}

/** Strips a submitted audience down to what the schema accepts. */
function cleanAudience(input: AudienceSpec): AudienceSpec {
  const spec = parseAudience(input);
  return {
    keys: Array.from(new Set(spec.keys.filter((key) => AUDIENCE_KEYS.includes(key)))),
    applicantIds: validIds(spec.applicantIds),
    extra: Array.from(new Set(spec.extra.map(normalizeEmail).filter((e) => EMAIL_RE.test(e)))).slice(
      0,
      EXTRA_MAX
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Contacts                                                                    */
/* -------------------------------------------------------------------------- */

export async function addContacts(text: string): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const { valid, invalid } = parseAddresses(text.slice(0, 50_000));
  if (!valid.length) {
    return { ok: false, message: invalid.length ? `No valid addresses in: ${invalid.join(", ")}` : "Paste at least one address." };
  }

  const rows = valid.slice(0, 1000).map(({ email, name }) => ({ email, name, added_by: user.id }));
  const { error } = await supabase
    .from("email_contacts")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true });
  if (error) return fail(error, "Could not add those contacts.");

  refresh();
  const skipped = invalid.length ? ` Skipped ${invalid.length} that didn't look like an address: ${invalid.slice(0, 5).join(", ")}${invalid.length > 5 ? "…" : ""}.` : "";
  return { ok: true, count: rows.length, message: `Added ${rows.length} contact${rows.length === 1 ? "" : "s"}.${skipped}` };
}

export async function removeContact(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(id)) return { ok: false, message: "Unknown contact." };

  const { error } = await supabase.from("email_contacts").delete().eq("id", id);
  if (error) return fail(error, "Could not remove that contact.");

  refresh();
  return { ok: true, count: 1 };
}

/* -------------------------------------------------------------------------- */
/* Drafts                                                                      */
/* -------------------------------------------------------------------------- */

export interface DraftResult extends ActionResult {
  id?: string;
}

export interface DraftInput {
  subject: string;
  bodyText: string;
  audience: AudienceSpec;
}

/** Creates a draft, or updates one that hasn't been sent. */
export async function saveDraft(id: string | null, input: DraftInput): Promise<DraftResult> {
  const { supabase, user } = await assertAdmin();

  const values = {
    subject: (input.subject ?? "").slice(0, SUBJECT_MAX),
    body_text: (input.bodyText ?? "").slice(0, BODY_MAX),
    audience: cleanAudience(input.audience ?? { keys: [], applicantIds: [], extra: [] }),
  };

  if (id) {
    if (!UUID.test(id)) return { ok: false, message: "Unknown campaign." };
    const { data, error } = await supabase
      .from("email_campaigns")
      .update(values)
      .eq("id", id)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();
    if (error) return fail(error, "Could not save the draft.");
    if (!data) return { ok: false, message: "That campaign has already been sent." };
    refresh();
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({ ...values, sent_by: user.id })
    .select("id")
    .single();
  if (error) return fail(error, "Could not create the draft.");

  refresh();
  return { ok: true, id: data.id };
}

/** The applicants table's "Email selected": a blank draft aimed at those rows. */
export async function draftCampaignForApplicants(ids: string[]): Promise<DraftResult> {
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  return saveDraft(null, {
    subject: "",
    bodyText: "",
    audience: { keys: [], applicantIds: targets, extra: [] },
  });
}

/** Copies a sent campaign's subject, body and audience into a fresh draft. */
export async function reuseCampaign(id: string): Promise<DraftResult> {
  const session = await assertAdmin();
  const found = await fetchCampaign(contextOf(session), id);
  if (!found) return { ok: false, message: "Unknown campaign." };

  const { campaign } = found;
  return saveDraft(null, {
    subject: campaign.subject,
    bodyText: campaign.body_text,
    audience: campaign.audience,
  });
}

export async function deleteDraft(id: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(id)) return { ok: false, message: "Unknown campaign." };

  const { data, error } = await supabase
    .from("email_campaigns")
    .delete()
    .eq("id", id)
    .eq("status", "draft")
    .select("id");
  if (error) return fail(error, "Could not delete the draft.");
  if (!data?.length) return { ok: false, message: "Only drafts can be deleted." };

  refresh();
  return { ok: true, count: 1 };
}

/* -------------------------------------------------------------------------- */
/* Preview and test                                                            */
/* -------------------------------------------------------------------------- */

export interface AudiencePreview {
  count: number;
  /** Rows that had no usable address. */
  skipped: number;
  /** The first `PREVIEW_MAX` recipients, deduped, in send order. */
  recipients: Recipient[];
}

/** Who the composer's choices add up to, shown as chips while the organizer picks. */
export async function previewAudience(audience: AudienceSpec): Promise<AudiencePreview> {
  const session = await assertAdmin();
  try {
    const { recipients, skipped } = await resolveAudience(contextOf(session), cleanAudience(audience));
    return { count: recipients.length, skipped, recipients: recipients.slice(0, PREVIEW_MAX) };
  } catch {
    return { count: 0, skipped: 0, recipients: [] };
  }
}

/** Mails the draft to the organizer pressing the button, and nobody else. */
export async function sendTest(input: { subject: string; bodyText: string }): Promise<ActionResult> {
  const { user, email, supabase } = await assertAdmin();
  const subject = (input.subject ?? "").trim().slice(0, SUBJECT_MAX);
  const bodyText = (input.bodyText ?? "").trim().slice(0, BODY_MAX);
  if (!subject || !bodyText) return { ok: false, message: "Write a subject and a message first." };
  if (!email) return { ok: false, message: "Your account has no email address to send to." };

  const { data: me } = await supabase
    .from("admin_users")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const message = broadcastEmail({
    subject: `[Test] ${subject}`,
    bodyText,
    firstName: firstName(me?.display_name ?? email.split("@")[0]),
  });
  const result = await sendEmail({ to: email, ...message });

  if (result.ok) return { ok: true, message: `Test sent to ${email}.` };
  if (result.skipped) return { ok: false, message: "RESEND_API_KEY isn't set on this server." };
  return { ok: false, message: `Resend said: ${result.error}` };
}

/* -------------------------------------------------------------------------- */
/* Sending                                                                     */
/* -------------------------------------------------------------------------- */

async function progressOf(
  session: AdminSession,
  id: string,
  extra: Partial<SendProgress> = {}
): Promise<SendProgress> {
  const { data } = await session.supabase
    .from("admin_email_campaigns")
    .select("status, recipient_count, sent_count, failed_count, queued_count")
    .eq("id", id)
    .maybeSingle();

  return {
    ok: true,
    status: (data?.status ?? "draft") as CampaignStatus,
    total: data?.recipient_count ?? 0,
    sent: data?.sent_count ?? 0,
    failed: data?.failed_count ?? 0,
    queued: data?.queued_count ?? 0,
    done: false,
    ...extra,
  };
}

function stopped(message: string): SendProgress {
  return { ok: false, message, status: "draft", total: 0, sent: 0, failed: 0, queued: 0, done: true };
}

/**
 * Resolves the audience into recipient rows and marks the campaign as
 * sending. Rows are inserted with `ignoreDuplicates`, so starting again after
 * a failure keeps everyone who already got the mail.
 */
export async function startSend(id: string): Promise<SendProgress> {
  const session = await assertAdmin();
  const { supabase } = session;
  if (!UUID.test(id)) return stopped("Unknown campaign.");

  const { data: campaign, error } = await supabase
    .from("email_campaigns")
    .select("id, subject, body_text, audience, status, sent_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !campaign) return stopped(error?.message ?? "Unknown campaign.");
  if (campaign.status === "sending") return progressOf(session, id);
  if (campaign.status === "sent") return stopped("This campaign has already been sent.");
  if (!campaign.subject.trim() || !campaign.body_text.trim()) {
    return stopped("Write a subject and a message first.");
  }

  let recipients: Recipient[];
  try {
    ({ recipients } = await resolveAudience(contextOf(session), parseAudience(campaign.audience)));
  } catch (err) {
    return stopped(err instanceof Error ? err.message : "Could not read the audience.");
  }
  if (!recipients.length) return stopped("Nobody to send to.");

  for (let i = 0; i < recipients.length; i += 500) {
    const rows = recipients.slice(i, i + 500).map((r) => ({ campaign_id: id, ...r }));
    const { error: insertError } = await supabase
      .from("email_campaign_recipients")
      .upsert(rows, { onConflict: "campaign_id,email", ignoreDuplicates: true });
    if (insertError) return stopped(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("email_campaigns")
    .update({ status: "sending", sent_at: campaign.sent_at ?? new Date().toISOString(), finished_at: null })
    .eq("id", id);
  if (updateError) return stopped(updateError.message);

  refresh();
  return progressOf(session, id);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resend allows two requests a second; one batch per call with this floor stays under it. */
const CHUNK_MIN_MS = 600;

/**
 * Mails the next batch of queued recipients. Called repeatedly by the
 * browser until `done`.
 *
 * The rows are claimed — flipped from `queued` to `sending` with the status
 * in the `where` — before anything is sent, and only the rows that flip are
 * mailed. Two overlapping calls therefore split the queue rather than both
 * taking the head of it.
 */
export async function sendChunk(id: string): Promise<SendProgress> {
  const started = Date.now();
  const session = await assertAdmin();
  const { supabase } = session;
  if (!UUID.test(id)) return stopped("Unknown campaign.");

  const { data: campaign, error } = await supabase
    .from("email_campaigns")
    .select("id, subject, body_text, status")
    .eq("id", id)
    .maybeSingle();
  if (error || !campaign) return stopped(error?.message ?? "Unknown campaign.");
  if (campaign.status !== "sending") return progressOf(session, id, { done: true });

  const { data: queued, error: queuedError } = await supabase
    .from("email_campaign_recipients")
    .select("id")
    .eq("campaign_id", id)
    .eq("status", "queued")
    .order("created_at")
    .order("id")
    .limit(BATCH_MAX);
  if (queuedError) return { ...(await progressOf(session, id)), ok: false, message: queuedError.message };

  if (!queued?.length) {
    const progress = await progressOf(session, id);
    const status: CampaignStatus = progress.sent === 0 && progress.failed > 0 ? "failed" : "sent";
    await supabase
      .from("email_campaigns")
      .update({ status, finished_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "sending");
    refresh();
    return { ...progress, status, done: true };
  }

  const { data: claimed, error: claimError } = await supabase
    .from("email_campaign_recipients")
    .update({ status: "sending" })
    .eq("campaign_id", id)
    .eq("status", "queued")
    .in(
      "id",
      queued.map((row) => row.id)
    )
    .select("id, email, name, source, applicant_id");
  if (claimError) return { ...(await progressOf(session, id)), ok: false, message: claimError.message };
  if (!claimed?.length) return progressOf(session, id);

  const messages = claimed.map((row) => ({
    to: row.email,
    ...broadcastEmail({
      subject: campaign.subject,
      bodyText: campaign.body_text,
      firstName: row.name ? firstName(row.name) : null,
    }),
  }));
  const key = createHash("sha1")
    .update(`${id}:${claimed.map((row) => row.id).join(",")}`)
    .digest("hex");

  let batch = await sendBatch(messages, key);
  if (!batch.ok && !batch.skipped) {
    await sleep(1000);
    batch = await sendBatch(messages, key);
  }

  const now = new Date().toISOString();
  const rows = claimed.map((row, index) => {
    const base = {
      id: row.id,
      campaign_id: id,
      email: row.email,
      name: row.name,
      source: row.source,
      applicant_id: row.applicant_id,
    };
    if (!batch.ok) {
      return {
        ...base,
        status: "failed",
        error: batch.skipped ? "RESEND_API_KEY is not set on this server" : batch.error,
        resend_id: null,
        sent_at: null,
      };
    }
    const result = batch.results[index];
    if (result?.ok) return { ...base, status: "sent", resend_id: result.id, error: null, sent_at: now };
    return {
      ...base,
      status: "failed",
      error: result && !result.ok && !result.skipped ? result.error : "unknown error",
      resend_id: null,
      sent_at: null,
    };
  });

  const { error: writeError } = await supabase
    .from("email_campaign_recipients")
    .upsert(rows, { onConflict: "id" });

  const elapsed = Date.now() - started;
  if (elapsed < CHUNK_MIN_MS) await sleep(CHUNK_MIN_MS - elapsed);

  const progress = await progressOf(session, id);
  if (writeError) return { ...progress, ok: false, message: `Sent, but couldn't record the result: ${writeError.message}` };
  return progress;
}

/** Puts every failed row back in the queue and reopens the campaign for `sendChunk`. */
export async function retryFailed(id: string): Promise<SendProgress> {
  const session = await assertAdmin();
  const { supabase } = session;
  if (!UUID.test(id)) return stopped("Unknown campaign.");

  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!campaign) return stopped("Unknown campaign.");
  if (campaign.status === "sending") return progressOf(session, id);
  if (campaign.status === "draft") return stopped("This campaign hasn't been sent yet.");

  // A row stuck at `sending` can only be left over from a request that died
  // mid-chunk — nothing else is in flight once the campaign isn't sending.
  const { error } = await supabase
    .from("email_campaign_recipients")
    .update({ status: "queued", error: null })
    .eq("campaign_id", id)
    .in("status", ["failed", "sending"]);
  if (error) return stopped(error.message);

  await supabase
    .from("email_campaigns")
    .update({ status: "sending", finished_at: null })
    .eq("id", id);

  refresh();
  return progressOf(session, id);
}
