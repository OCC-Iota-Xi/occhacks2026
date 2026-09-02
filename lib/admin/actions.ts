"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/auth";
import {
  ATTENDANCE,
  DECISION_STATUSES,
  REVIEW_CRITERIA,
  TAG_COLORS,
  type Attendance,
  type Status,
} from "@/lib/admin/types";

/**
 * Every write the organizer dashboard makes.
 *
 * Two rules hold across all of them. First, `assertAdmin()` before anything
 * else: a server action is a public endpoint, so "the button is only rendered
 * for admins" is not a check. Second, the write still goes through the caller's
 * own Supabase session, so the RLS policies from migration 0018 have to agree
 * as well — a mistake here fails closed rather than silently succeeding.
 *
 * The activity log is deliberately absent from this file: it's written by
 * triggers on the tables below, so the history records what happened to the
 * data rather than what this code remembered to mention.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
  count?: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => UUID.test(id)))).slice(0, 2000);
}

/** Refreshes every admin route — a decision shows up in the list, the KPIs and the profile at once. */
function refresh() {
  revalidatePath("/admin", "layout");
}

function fail(error: { message: string } | null, fallback: string): ActionResult {
  return { ok: false, message: error?.message ?? fallback };
}

/* -------------------------------------------------------------------------- */
/* Decisions                                                                   */
/* -------------------------------------------------------------------------- */

export async function setStatus(ids: string[], status: Status): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  if (!(DECISION_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: "Unknown status." };
  }

  // A decision is stamped; moving back to submitted / in review clears the
  // stamp, so "decided_at" always means "when the current decision was made".
  const decided = ["accepted", "waitlisted", "rejected"].includes(status);
  const rows = targets.map((user_id) => ({
    user_id,
    status,
    decided_at: decided ? new Date().toISOString() : null,
    decided_by: decided ? user.id : null,
  }));

  const { error } = await supabase
    .from("application_status")
    .upsert(rows, { onConflict: "user_id" });
  if (error) return fail(error, "Could not update those applications.");

  refresh();
  return { ok: true, count: targets.length };
}

export async function setAttendance(
  ids: string[],
  attendance: Attendance
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  if (!(ATTENDANCE as readonly string[]).includes(attendance)) {
    return { ok: false, message: "Unknown attendance state." };
  }

  const rows = targets.map((user_id) => ({
    user_id,
    attendance,
    confirmed_at: attendance === "confirmed" ? new Date().toISOString() : null,
  }));

  const { error } = await supabase
    .from("application_status")
    .upsert(rows, { onConflict: "user_id" });
  if (error) return fail(error, "Could not update attendance.");

  refresh();
  return { ok: true, count: targets.length };
}

export async function setCheckedIn(
  ids: string[],
  checkedIn: boolean
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };

  const rows = targets.map((user_id) => ({
    user_id,
    checked_in_at: checkedIn ? new Date().toISOString() : null,
  }));

  const { error } = await supabase
    .from("application_status")
    .upsert(rows, { onConflict: "user_id" });
  if (error) return fail(error, "Could not update check-in.");

  refresh();
  return { ok: true, count: targets.length };
}

/** `reviewerId` of null unassigns. */
export async function assignReviewer(
  ids: string[],
  reviewerId: string | null
): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  if (reviewerId && !UUID.test(reviewerId)) {
    return { ok: false, message: "Unknown reviewer." };
  }

  // Only an organizer can be assigned: the picker is populated from this table,
  // and checking it here stops a hand-crafted request pointing at anyone else.
  if (reviewerId) {
    const { data } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", reviewerId)
      .maybeSingle();
    if (!data) return { ok: false, message: "That reviewer is not an organizer." };
  }

  const rows = targets.map((user_id) => ({ user_id, assigned_to: reviewerId }));
  const { error } = await supabase
    .from("application_status")
    .upsert(rows, { onConflict: "user_id" });
  if (error) return fail(error, "Could not assign those applications.");

  refresh();
  return { ok: true, count: targets.length };
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                        */
/* -------------------------------------------------------------------------- */

export async function addTag(ids: string[], tagId: string): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  if (!UUID.test(tagId)) return { ok: false, message: "Unknown tag." };

  const rows = targets.map((applicant_id) => ({
    applicant_id,
    tag_id: tagId,
    added_by: user.id,
  }));
  // Already-tagged rows are not an error — bulk-tagging a selection that
  // partly has the tag should finish, not fail halfway.
  const { error } = await supabase
    .from("applicant_tags")
    .upsert(rows, { onConflict: "applicant_id,tag_id", ignoreDuplicates: true });
  if (error) return fail(error, "Could not add that tag.");

  refresh();
  return { ok: true, count: targets.length };
}

export async function removeTag(ids: string[], tagId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };
  if (!UUID.test(tagId)) return { ok: false, message: "Unknown tag." };

  const { error } = await supabase
    .from("applicant_tags")
    .delete()
    .eq("tag_id", tagId)
    .in("applicant_id", targets);
  if (error) return fail(error, "Could not remove that tag.");

  refresh();
  return { ok: true, count: targets.length };
}

export async function createTag(name: string, color: string): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const clean = name.trim().slice(0, 40);
  if (!clean) return { ok: false, message: "Give the tag a name." };
  const swatch = (TAG_COLORS as readonly string[]).includes(color) ? color : "slate";

  const { error } = await supabase
    .from("tags")
    .insert({ name: clean, color: swatch, created_by: user.id });
  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "That tag already exists." : error.message,
    };
  }

  refresh();
  return { ok: true };
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(tagId)) return { ok: false, message: "Unknown tag." };

  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) return fail(error, "Could not delete that tag.");

  refresh();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Reviews and notes                                                           */
/* -------------------------------------------------------------------------- */

export async function saveReview(input: {
  applicantId: string;
  scores: Record<string, number>;
  comment: string;
}): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  if (!UUID.test(input.applicantId)) return { ok: false, message: "Unknown applicant." };

  const scores: Record<string, number> = {};
  for (const { key, label } of REVIEW_CRITERIA) {
    const value = Number(input.scores[key]);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return { ok: false, message: `Score ${label.toLowerCase()} from 1 to 5.` };
    }
    scores[key] = value;
  }

  const { error } = await supabase.from("application_reviews").upsert(
    {
      applicant_id: input.applicantId,
      reviewer_id: user.id,
      ...scores,
      comment: input.comment.trim().slice(0, 2000) || null,
    },
    { onConflict: "applicant_id,reviewer_id" }
  );
  if (error) return fail(error, "Could not save that review.");

  refresh();
  return { ok: true };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(reviewId)) return { ok: false, message: "Unknown review." };

  // RLS allows deleting only your own; this is the message, not the guard.
  const { error } = await supabase.from("application_reviews").delete().eq("id", reviewId);
  if (error) return fail(error, "Could not delete that review.");

  refresh();
  return { ok: true };
}

export async function addNote(applicantId: string, body: string): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  if (!UUID.test(applicantId)) return { ok: false, message: "Unknown applicant." };
  const text = body.trim().slice(0, 4000);
  if (!text) return { ok: false, message: "Write something first." };

  const { error } = await supabase
    .from("applicant_notes")
    .insert({ applicant_id: applicantId, author_id: user.id, body: text });
  if (error) return fail(error, "Could not save that note.");

  refresh();
  return { ok: true };
}

export async function deleteNote(noteId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(noteId)) return { ok: false, message: "Unknown note." };

  const { error } = await supabase.from("applicant_notes").delete().eq("id", noteId);
  if (error) return fail(error, "Could not delete that note.");

  refresh();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Corrections                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fixes a typo in someone's answers — a misspelled school, an email with a
 * missing letter. Only these fields, and only ever one applicant at a time:
 * this is a correction tool, not an editor for the application.
 */
const EDITABLE = ["full_name", "email", "school", "major", "phone", "shirt", "needs"] as const;

export async function updateApplicant(
  applicantId: string,
  patch: Record<string, string>
): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  if (!UUID.test(applicantId)) return { ok: false, message: "Unknown applicant." };

  const row: Record<string, string | null> = {};
  for (const field of EDITABLE) {
    if (!(field in patch)) continue;
    const value = String(patch[field] ?? "").trim().slice(0, 300);
    row[field] = value || null;
  }
  if (!Object.keys(row).length) return { ok: false, message: "Nothing to change." };
  row.updated_at = new Date().toISOString();

  const { error } = await supabase.from("hackers").update(row).eq("user_id", applicantId);
  if (error) return fail(error, "Could not save those changes.");

  // The correction itself isn't covered by the decision triggers, so it's
  // recorded here — an edited email is exactly the kind of change someone will
  // later want to trace.
  await supabase.from("application_activity").insert({
    applicant_id: applicantId,
    actor_id: user.id,
    kind: "edit",
    summary: `Details edited (${Object.keys(row)
      .filter((k) => k !== "updated_at")
      .join(", ")})`,
  });

  refresh();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Deletion                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Removes applications for good.
 *
 * Not the same thing as a decision: an applicant who pulls out is `withdrawn`
 * and still counted, still reviewable, still there. This is for the rows that
 * should never have existed — a duplicate, a test signup, obvious junk — and
 * for someone who writes in asking to be taken off the list.
 *
 * Deleting the `hackers` row cascades through the decision, reviews, notes,
 * tags and activity log (migration 0018). Their Supabase account is untouched,
 * so nothing stops them registering again. There is no undo.
 */
export async function deleteApplicants(ids: string[]): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const targets = validIds(ids);
  if (!targets.length) return { ok: false, message: "No applicants selected." };

  // `select()` on a delete returns the rows that actually went, which is both
  // the honest count and the last chance to read the names for the audit.
  const { data: removed, error } = await supabase
    .from("hackers")
    .delete()
    .in("user_id", targets)
    .select("user_id, full_name, email");
  if (error) return fail(error, "Could not delete those applications.");

  const gone = (removed ?? []) as {
    user_id: string;
    full_name: string | null;
    email: string | null;
  }[];

  // The activity log cascades away with the applicant, so the only trace of a
  // deletion is the one written here (migration 0020). Recorded after the fact
  // rather than before, so the log never claims a delete that didn't happen.
  if (gone.length) {
    await supabase.from("application_deletions").insert(
      gone.map((row) => ({
        applicant_id: row.user_id,
        full_name: row.full_name,
        email: row.email,
        deleted_by: user.id,
      }))
    );
  }

  refresh();
  return { ok: true, count: gone.length };
}

/* -------------------------------------------------------------------------- */
/* Saved views                                                                 */
/* -------------------------------------------------------------------------- */

export async function saveView(
  name: string,
  query: string,
  shared = true
): Promise<ActionResult> {
  const { supabase, user } = await assertAdmin();
  const clean = name.trim().slice(0, 60);
  if (!clean) return { ok: false, message: "Give the view a name." };

  const { error } = await supabase.from("admin_saved_views").upsert(
    {
      owner_id: user.id,
      name: clean,
      // Stored without the leading "?" and without paging, so opening a saved
      // view always starts at the first page.
      query: stripPaging(query),
      shared,
    },
    { onConflict: "owner_id,name" }
  );
  if (error) return fail(error, "Could not save that view.");

  refresh();
  return { ok: true };
}

export async function deleteView(viewId: string): Promise<ActionResult> {
  const { supabase } = await assertAdmin();
  if (!UUID.test(viewId)) return { ok: false, message: "Unknown view." };

  const { error } = await supabase.from("admin_saved_views").delete().eq("id", viewId);
  if (error) return fail(error, "Could not delete that view.");

  refresh();
  return { ok: true };
}

function stripPaging(query: string) {
  const params = new URLSearchParams(query.replace(/^\?/, ""));
  params.delete("page");
  return params.toString();
}

/**
 * Every id the given filters match — what "select all 214 matching" needs to
 * hand a bulk action. The filters travel as the list's own query string, so
 * there's one filter implementation, not two.
 */
export async function matchingIds(query: string): Promise<string[]> {
  await assertAdmin();
  const { parseFilters } = await import("@/lib/admin/filters");
  const { adminContext, fetchFilteredIds } = await import("@/lib/admin/queries");
  const ctx = await adminContext();
  return fetchFilteredIds(ctx, parseFilters(new URLSearchParams(query.replace(/^\?/, ""))));
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export interface QuickHit {
  id: string;
  full_name: string | null;
  email: string | null;
  school: string | null;
  status: string;
}

/** Backs ⌘K. Deliberately narrow: five columns, ten rows, no personal detail. */
export async function quickSearch(term: string): Promise<QuickHit[]> {
  const { supabase } = await assertAdmin();
  const needle = term.replace(/[,()*%\\"']/g, " ").trim().slice(0, 60);
  if (needle.length < 2) return [];

  const like = `%${needle}%`;
  const { data } = await supabase
    .from("admin_applicants")
    .select("id, full_name, email, school, status")
    .or(
      [
        `full_name.ilike.${like}`,
        `email.ilike.${like}`,
        `school.ilike.${like}`,
        `occ_id.ilike.${like}`,
      ].join(",")
    )
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(10);

  return (data ?? []) as QuickHit[];
}
