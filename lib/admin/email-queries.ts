import type { PostgrestError } from "@supabase/supabase-js";
import {
  AUDIENCE_KEYS,
  EMAIL_RE,
  normalizeEmail,
  parseAudience,
  type AudienceKey,
  type AudienceSpec,
  type Campaign,
  type CampaignRecipient,
  type EmailContact,
  type Recipient,
  type RecipientSource,
} from "@/lib/admin/email";
import type { AdminContext } from "@/lib/admin/queries";

/**
 * Every read the email pages make. Same rule as `queries.ts`: all of it runs
 * as the signed-in organizer, and the policies in migration 0022 decide.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Hacker audiences read the roster view; the rest are their own tables. */
const HACKER_KEYS: readonly AudienceKey[] = [
  "accepted",
  "waitlisted",
  "rejected",
  "pending",
  "confirmed",
  "checked_in",
];

interface ApplicantRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

function applicantQuery(ctx: AdminContext, key: AudienceKey) {
  let q = ctx.supabase.from("admin_applicants").select("id, email, full_name").limit(5000);
  switch (key) {
    case "pending":
      q = q.in("status", ["submitted", "in_review"]);
      break;
    case "confirmed":
      q = q.eq("attendance", "confirmed");
      break;
    case "checked_in":
      q = q.not("checked_in_at", "is", null);
      break;
    default:
      q = q.eq("status", key);
  }
  return q;
}

/**
 * Turns the organizer's choice into one address list. Each source is queried
 * in parallel, then merged in the order they're listed below: an address in
 * two audiences is kept once, under the first source that named it — and the
 * hacker sources go first because they're the ones that carry a name.
 */
export async function resolveAudience(
  ctx: AdminContext,
  spec: AudienceSpec
): Promise<{ recipients: Recipient[]; skipped: number }> {
  const keys = spec.keys.filter((key) => AUDIENCE_KEYS.includes(key));
  const applicantIds = Array.from(new Set(spec.applicantIds.filter((id) => UUID.test(id))));

  type Batch = { source: RecipientSource; rows: Recipient[] };
  const jobs: Promise<Batch>[] = [];

  const fromApplicants = async (
    source: RecipientSource,
    run: () => PromiseLike<{ data: ApplicantRow[] | null; error: PostgrestError | null }>
  ): Promise<Batch> => {
    const { data, error } = await run();
    if (error) throw new Error(error.message);
    return {
      source,
      rows: (data ?? []).map((row) => ({
        email: row.email ?? "",
        name: row.full_name,
        source,
        applicant_id: row.id,
      })),
    };
  };

  if (applicantIds.length) {
    for (let i = 0; i < applicantIds.length; i += 500) {
      const chunk = applicantIds.slice(i, i + 500);
      jobs.push(
        fromApplicants("selected", () =>
          ctx.supabase.from("admin_applicants").select("id, email, full_name").in("id", chunk)
        )
      );
    }
  }

  for (const key of keys) {
    if (HACKER_KEYS.includes(key)) {
      jobs.push(fromApplicants(key, () => applicantQuery(ctx, key)));
    } else if (key === "volunteers" || key === "mentors") {
      jobs.push(
        (async () => {
          const { data, error } = await ctx.supabase
            .from(key)
            .select("email, full_name")
            .not("completed_at", "is", null);
          if (error) throw new Error(error.message);
          return {
            source: key,
            rows: (data ?? []).map((row) => ({
              email: row.email ?? "",
              name: row.full_name ?? null,
              source: key,
              applicant_id: null,
            })),
          };
        })()
      );
    } else if (key === "notify") {
      jobs.push(
        (async () => {
          const { data, error } = await ctx.supabase.from("notify_optins").select("email");
          if (error) throw new Error(error.message);
          return {
            source: key,
            rows: (data ?? []).map((row) => ({
              email: row.email ?? "",
              name: null,
              source: key,
              applicant_id: null,
            })),
          };
        })()
      );
    } else if (key === "contacts") {
      jobs.push(
        (async () => {
          const { data, error } = await ctx.supabase.from("email_contacts").select("email, name");
          if (error) throw new Error(error.message);
          return {
            source: key,
            rows: (data ?? []).map((row) => ({
              email: row.email,
              name: row.name,
              source: key,
              applicant_id: null,
            })),
          };
        })()
      );
    }
  }

  const batches = await Promise.all(jobs);
  batches.push({
    source: "extra",
    rows: spec.extra.map((email) => ({ email, name: null, source: "extra", applicant_id: null })),
  });

  const seen = new Set<string>();
  const recipients: Recipient[] = [];
  let skipped = 0;

  for (const batch of batches) {
    for (const row of batch.rows) {
      const email = normalizeEmail(row.email);
      if (!EMAIL_RE.test(email)) {
        skipped += 1;
        continue;
      }
      if (seen.has(email)) continue;
      seen.add(email);
      recipients.push({ ...row, email });
    }
  }

  return { recipients, skipped };
}

/** How many people each audience would reach on its own — the hints beside the checkboxes. */
export async function fetchAudienceCounts(ctx: AdminContext): Promise<Record<AudienceKey, number>> {
  const count = async (
    run: () => PromiseLike<{ count: number | null; error: PostgrestError | null }>
  ) => {
    const { count: n, error } = await run();
    return error ? 0 : (n ?? 0);
  };

  const [accepted, waitlisted, rejected, pending, confirmed, checked_in, volunteers, mentors, notify, contacts] =
    await Promise.all([
      ...(["accepted", "waitlisted", "rejected", "pending", "confirmed", "checked_in"] as const).map(
        (key) =>
          count(() => {
            let q = ctx.supabase
              .from("admin_applicants")
              .select("id", { count: "exact", head: true });
            if (key === "pending") q = q.in("status", ["submitted", "in_review"]);
            else if (key === "confirmed") q = q.eq("attendance", "confirmed");
            else if (key === "checked_in") q = q.not("checked_in_at", "is", null);
            else q = q.eq("status", key);
            return q;
          })
      ),
      count(() =>
        ctx.supabase
          .from("volunteers")
          .select("user_id", { count: "exact", head: true })
          .not("completed_at", "is", null)
      ),
      count(() =>
        ctx.supabase
          .from("mentors")
          .select("user_id", { count: "exact", head: true })
          .not("completed_at", "is", null)
      ),
      count(() => ctx.supabase.from("notify_optins").select("user_id", { count: "exact", head: true })),
      count(() => ctx.supabase.from("email_contacts").select("id", { count: "exact", head: true })),
    ]);

  return { accepted, waitlisted, rejected, pending, confirmed, checked_in, volunteers, mentors, notify, contacts };
}

export async function fetchContacts(ctx: AdminContext): Promise<EmailContact[]> {
  const { data } = await ctx.supabase
    .from("email_contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);
  return (data ?? []) as EmailContact[];
}

type CampaignRow = Omit<Campaign, "audience"> & { audience: unknown };

function toCampaign(row: CampaignRow): Campaign {
  return { ...row, audience: parseAudience(row.audience) };
}

/**
 * The history list. The error comes back rather than being swallowed so the
 * page can tell "no campaigns yet" from "migration 0022 hasn't been run".
 */
export async function fetchCampaigns(
  ctx: AdminContext,
  limit = 50
): Promise<{ campaigns: Campaign[]; error: PostgrestError | null }> {
  const { data, error } = await ctx.supabase
    .from("admin_email_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { campaigns: ((data ?? []) as CampaignRow[]).map(toCampaign), error };
}

export async function fetchCampaign(
  ctx: AdminContext,
  id: string
): Promise<{ campaign: Campaign; recipients: CampaignRecipient[] } | null> {
  if (!UUID.test(id)) return null;

  const [campaign, recipients] = await Promise.all([
    ctx.supabase.from("admin_email_campaigns").select("*").eq("id", id).maybeSingle(),
    ctx.supabase
      .from("email_campaign_recipients")
      .select("id, campaign_id, email, name, source, applicant_id, status, resend_id, error, sent_at")
      .eq("campaign_id", id)
      .order("status")
      .order("email")
      .limit(5000),
  ]);

  if (!campaign.data) return null;
  return {
    campaign: toCampaign(campaign.data as CampaignRow),
    recipients: (recipients.data ?? []) as CampaignRecipient[],
  };
}
