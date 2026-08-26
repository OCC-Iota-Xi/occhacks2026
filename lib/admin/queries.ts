import { cache } from "react";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";
import type { ApplicantFilters, Flag } from "@/lib/admin/filters";
import { dayEnd, dayStart } from "@/lib/admin/time";
import type {
  ActivityEvent,
  AdminUser,
  Applicant,
  Breakdowns,
  Helper,
  NeedsAttention,
  Note,
  OverviewStats,
  Review,
  SavedView,
  Tag,
  TimePoint,
} from "@/lib/admin/types";

/**
 * Every read the organizer pages make.
 *
 * All of it goes through the signed-in organizer's own Supabase session — there
 * is no service-role key in this project, and adding one would mean a secret
 * that grants unrestricted access to every applicant's details sitting in the
 * deployment env. The RLS policies in migration 0018 are what let an organizer
 * read the whole roster, so authorization is enforced by the database on every
 * single query rather than by remembering to check in the right places.
 */

/** The admin schema hasn't been applied yet (see supabase/migrations/0018). */
export function isSchemaMissing(error: PostgrestError | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "PGRST202" ||
    error.code === "42P01" ||
    error.code === "42883"
  );
}

export interface AdminContext {
  supabase: SupabaseClient;
  userId: string;
  email: string;
  /** False until migration 0018 has been run against this project. */
  ready: boolean;
}

/**
 * The gate plus the one-time bookkeeping every admin page needs: bind this
 * account to its allowlist row so assignments and review authorship have a
 * user id to point at, and find out whether the organizer schema exists.
 */
export const adminContext = cache(async (): Promise<AdminContext> => {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.rpc("admin_touch_self");
  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    ready: !isSchemaMissing(error),
  };
});

/** ilike patterns are built by hand, so the needle can't carry PostgREST syntax. */
function sanitize(term: string) {
  return term.replace(/[,()*%\\"']/g, " ").trim().slice(0, 80);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Translates the URL's filters into one PostgREST query. Filtering, sorting and
 * paging all happen in Postgres — the browser never sees a row it isn't showing.
 *
 * Generic in the builder type so the caller keeps whatever `select()` gave it —
 * the builder's own types describe the selected columns, which is more than
 * this function needs to know and more than it can usefully name.
 */
function applyFilters<Q>(query: Q, f: ApplicantFilters, viewerId: string): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;

  const needle = sanitize(f.q);
  if (needle) {
    if (UUID.test(f.q.trim())) {
      q = q.eq("id", f.q.trim());
    } else {
      const like = `%${needle}%`;
      q = q.or(
        [
          `full_name.ilike.${like}`,
          `email.ilike.${like}`,
          `school.ilike.${like}`,
          `major.ilike.${like}`,
          `occ_id.ilike.${like}`,
        ].join(",")
      );
    }
  }

  if (f.status.length) q = q.in("status", f.status);
  if (f.attendance.length) q = q.in("attendance", f.attendance);
  if (f.school.length) q = q.in("school", f.school);
  if (f.major.length) q = q.in("major", f.major);
  if (f.track.length) q = q.in("first_choice_track", f.track);
  if (f.shirt.length) q = q.in("shirt", f.shirt);
  // Tags narrow (every selected tag must be present); classes widen (any of
  // them) — picking two courses means "either course", not "both".
  if (f.tag.length) q = q.contains("tags", f.tag);
  if (f.klass.length) q = q.overlaps("classes", f.klass);

  if (f.iota === "yes") q = q.eq("iota_xi", true);
  if (f.iota === "no") q = q.eq("iota_xi", false);

  if (f.checkedIn === "yes") q = q.not("checked_in_at", "is", null);
  if (f.checkedIn === "no") q = q.is("checked_in_at", null);

  if (f.reviewed === "yes") q = q.gt("review_count", 0);
  if (f.reviewed === "no") q = q.eq("review_count", 0);

  if (f.reviewer === "unassigned") q = q.is("assigned_to", null);
  else if (f.reviewer === "me") q = q.eq("assigned_to", viewerId);
  else if (UUID.test(f.reviewer)) q = q.eq("assigned_to", f.reviewer);

  const min = Number(f.scoreMin);
  if (f.scoreMin && Number.isFinite(min)) q = q.gte("avg_score", min);
  const max = Number(f.scoreMax);
  if (f.scoreMax && Number.isFinite(max)) q = q.lte("avg_score", max);

  // The organizer picked a California date; turn it into the instants that day
  // actually spans rather than the UTC day of the same name.
  if (f.from) q = q.gte("completed_at", dayStart(f.from));
  if (f.to) q = q.lte("completed_at", dayEnd(f.to));

  for (const flag of f.flag as Flag[]) {
    if (flag === "not_checked_in") {
      q = q.eq("attendance", "confirmed").is("checked_in_at", null);
    } else {
      q = q.eq(`flag_${flag}`, true);
    }
  }

  return q as Q;
}

export interface ApplicantPage {
  rows: Applicant[];
  total: number;
  page: number;
  pageCount: number;
  error: string | null;
  schemaMissing: boolean;
}

export async function fetchApplicants(
  ctx: AdminContext,
  filters: ApplicantFilters
): Promise<ApplicantPage> {
  const from = (filters.page - 1) * filters.per;

  const base = ctx.supabase.from("admin_applicants").select("*", { count: "exact" });
  const query = applyFilters(base, filters, ctx.userId)
    // A second key on every sort: rows with equal timestamps would otherwise be
    // free to swap places between pages and appear twice, or not at all.
    .order(filters.sort, { ascending: filters.dir === "asc", nullsFirst: false })
    .order("id", { ascending: true })
    .range(from, from + filters.per - 1);

  const { data, error, count } = await query;

  if (error) {
    return {
      rows: [],
      total: 0,
      page: filters.page,
      pageCount: 1,
      error: error.message,
      schemaMissing: isSchemaMissing(error),
    };
  }

  const total = count ?? 0;
  return {
    rows: (data ?? []) as Applicant[],
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / filters.per)),
    error: null,
    schemaMissing: false,
  };
}

/**
 * Every id the current filters match, for "select all N" and for exporting a
 * filtered list. Capped: past a few thousand this stops being a UI action.
 */
export async function fetchFilteredIds(
  ctx: AdminContext,
  filters: ApplicantFilters,
  cap = 5000
): Promise<string[]> {
  const base = ctx.supabase.from("admin_applicants").select("id");
  const { data, error } = await applyFilters(base, filters, ctx.userId)
    .order("id", { ascending: true })
    .limit(cap);
  if (error) return [];
  return (data ?? []).map((row) => (row as { id: string }).id);
}

export interface ApplicantDetail {
  applicant: Applicant;
  reviews: Review[];
  notes: Note[];
  tags: Tag[];
  activity: ActivityEvent[];
  /** The reviews the signed-in organizer wrote, keyed for the score form. */
  ownReview: Review | null;
}

export async function fetchApplicantDetail(
  ctx: AdminContext,
  id: string
): Promise<ApplicantDetail | null> {
  if (!UUID.test(id)) return null;

  // Five small reads in parallel rather than one join: each is indexed on the
  // applicant id, and PostgREST would otherwise return the applicant's answers
  // repeated once per note.
  const [applicantRes, reviewsRes, notesRes, tagsRes, activityRes] = await Promise.all([
    ctx.supabase.from("admin_applicants").select("*").eq("id", id).maybeSingle(),
    ctx.supabase
      .from("application_reviews")
      .select("*")
      .eq("applicant_id", id)
      .order("created_at", { ascending: true }),
    ctx.supabase
      .from("applicant_notes")
      .select("*")
      .eq("applicant_id", id)
      .order("created_at", { ascending: false }),
    ctx.supabase
      .from("applicant_tags")
      .select("tag_id, tags(id, name, color)")
      .eq("applicant_id", id),
    ctx.supabase
      .from("admin_activity_feed")
      .select("*")
      .eq("applicant_id", id)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  if (!applicantRes.data) return null;

  const reviews = (reviewsRes.data ?? []) as Review[];
  const tagRows = (tagsRes.data ?? []) as unknown as { tags: Tag | null }[];

  return {
    applicant: applicantRes.data as Applicant,
    reviews,
    notes: (notesRes.data ?? []) as Note[],
    tags: tagRows.map((row) => row.tags).filter((t): t is Tag => Boolean(t)),
    activity: (activityRes.data ?? []) as ActivityEvent[],
    ownReview: reviews.find((r) => r.reviewer_id === ctx.userId) ?? null,
  };
}

export async function fetchOverview(
  ctx: AdminContext,
  days: number
): Promise<OverviewStats | null> {
  const { data, error } = await ctx.supabase.rpc("admin_overview_stats", { p_days: days });
  if (error) return null;
  return data as OverviewStats;
}

export async function fetchBreakdowns(ctx: AdminContext): Promise<Breakdowns | null> {
  const { data, error } = await ctx.supabase.rpc("admin_breakdowns");
  if (error) return null;
  return data as Breakdowns;
}

export async function fetchNeedsAttention(
  ctx: AdminContext
): Promise<NeedsAttention | null> {
  const { data, error } = await ctx.supabase.rpc("admin_needs_attention");
  if (error) return null;
  return data as NeedsAttention;
}

export async function fetchTimeseries(
  ctx: AdminContext,
  from: string,
  to: string
): Promise<TimePoint[]> {
  const { data, error } = await ctx.supabase.rpc("admin_timeseries", {
    p_from: from,
    p_to: to,
  });
  if (error) return [];
  return (data ?? []) as TimePoint[];
}

export async function fetchRecentActivity(
  ctx: AdminContext,
  limit = 12
): Promise<ActivityEvent[]> {
  const { data, error } = await ctx.supabase
    .from("admin_activity_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as ActivityEvent[];
}

export async function fetchRecentApplicants(
  ctx: AdminContext,
  limit = 8
): Promise<Applicant[]> {
  const { data, error } = await ctx.supabase
    .from("admin_applicants")
    .select("*")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Applicant[];
}

export async function fetchTags(ctx: AdminContext): Promise<Tag[]> {
  const { data, error } = await ctx.supabase
    .from("tags")
    .select("id, name, color")
    .order("name");
  if (error) return [];
  return (data ?? []) as Tag[];
}

/** Tag usage counts, for the tag admin page. */
export async function fetchTagUsage(ctx: AdminContext): Promise<Record<string, number>> {
  const { data, error } = await ctx.supabase.from("applicant_tags").select("tag_id");
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { tag_id: string }[]) {
    counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1;
  }
  return counts;
}

export async function fetchAdmins(ctx: AdminContext): Promise<AdminUser[]> {
  const { data, error } = await ctx.supabase
    .from("admin_users")
    .select("email, display_name, user_id, last_seen_at")
    .order("email");
  if (error) return [];
  return (data ?? []) as AdminUser[];
}

export async function fetchSavedViews(ctx: AdminContext): Promise<SavedView[]> {
  const { data, error } = await ctx.supabase
    .from("admin_saved_views")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as SavedView[];
}

/** The distinct values behind the school / major / class filter menus. */
export interface FilterFacets {
  schools: string[];
  majors: string[];
  shirts: string[];
  classes: string[];
}

export async function fetchFacets(ctx: AdminContext): Promise<FilterFacets> {
  const breakdowns = await fetchBreakdowns(ctx);
  if (!breakdowns) return { schools: [], majors: [], shirts: [], classes: [] };
  const labels = (buckets: { label: string; count: number }[]) =>
    buckets.map((b) => b.label).filter((l) => l && l !== "Not given");
  return {
    schools: labels(breakdowns.schools),
    majors: labels(breakdowns.majors),
    shirts: labels(breakdowns.shirts),
    classes: labels(breakdowns.classes),
  };
}

/** The volunteer and mentor rosters, for the helpers page. */
export async function fetchHelpers(ctx: AdminContext) {
  const [volunteers, mentors] = await Promise.all([
    ctx.supabase
      .from("volunteers")
      .select("*")
      .order("completed_at", { ascending: false, nullsFirst: false }),
    ctx.supabase
      .from("mentors")
      .select("*")
      .order("completed_at", { ascending: false, nullsFirst: false }),
  ]);
  return {
    volunteers: (volunteers.data ?? []) as Helper[],
    mentors: (mentors.data ?? []) as Helper[],
    error: volunteers.error?.message ?? mentors.error?.message ?? null,
  };
}

/**
 * The export's reader: pages through the matching applicants a chunk at a time
 * so a 3,000-row CSV is 3 requests and a constant amount of memory, rather than
 * one enormous response held whole in the server's heap.
 *
 * `ids` narrows to an explicit selection (the checkboxes); passing null means
 * "everything the filters match".
 */
export async function* iterateApplicants(
  ctx: AdminContext,
  filters: ApplicantFilters,
  ids: string[] | null,
  chunk = 1000
): AsyncGenerator<Applicant[]> {
  const selection = ids ? ids.filter((id) => UUID.test(id)) : null;
  if (selection && !selection.length) return;

  for (let offset = 0; ; offset += chunk) {
    let query = ctx.supabase.from("admin_applicants").select("*");
    if (selection) {
      query = query.in("id", selection.slice(offset, offset + chunk));
    } else {
      query = applyFilters(query, filters, ctx.userId).range(offset, offset + chunk - 1);
    }

    const { data, error } = await query.order("completed_at", {
      ascending: false,
      nullsFirst: false,
    });
    if (error) return;

    const rows = (data ?? []) as Applicant[];
    if (rows.length) yield rows;

    if (selection) {
      if (offset + chunk >= selection.length) return;
    } else if (rows.length < chunk) {
      return;
    }
  }
}

/** The first sign-up, for the "all time" range. */
export async function fetchEarliestDate(ctx: AdminContext): Promise<string | null> {
  const { data } = await ctx.supabase
    .from("hackers")
    .select("created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as { created_at: string } | null)?.created_at ?? null;
}
