/**
 * Shapes and helpers shared by the email composer (client) and its server
 * code. Nothing here touches the database or Resend, so the client bundle can
 * import it freely.
 */

/** Hacker audiences, resolved against the `admin_applicants` view. */
export const HACKER_AUDIENCES = [
  "accepted",
  "waitlisted",
  "rejected",
  "pending",
  "confirmed",
  "checked_in",
] as const;

/** Everyone who isn't a hacker: helper tables and the two mailing lists. */
export const LIST_AUDIENCES = ["volunteers", "mentors", "notify", "contacts"] as const;

export type HackerAudience = (typeof HACKER_AUDIENCES)[number];
export type ListAudience = (typeof LIST_AUDIENCES)[number];
export type AudienceKey = HackerAudience | ListAudience;

export const AUDIENCE_KEYS: readonly AudienceKey[] = [...HACKER_AUDIENCES, ...LIST_AUDIENCES];

export const AUDIENCE_LABEL: Record<AudienceKey, string> = {
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  pending: "Submitted / in review",
  confirmed: "Confirmed attendance",
  checked_in: "Checked in",
  volunteers: "Volunteers",
  mentors: "Mentors",
  notify: "Notify list",
  contacts: "Contact list",
};

export const AUDIENCE_HINT: Partial<Record<AudienceKey, string>> = {
  pending: "Applied, no decision yet",
  confirmed: "Accepted and said they're coming",
  notify: "Asked to hear when registration opened",
  contacts: "Addresses added by hand below",
};

/**
 * What the organizer chose, stored on the campaign. `applicantIds` is the
 * checkbox selection handed over from the applicants table; `extra` is the
 * one-off addresses typed into the To field.
 */
export interface AudienceSpec {
  keys: AudienceKey[];
  applicantIds: string[];
  extra: string[];
}

export const EMPTY_AUDIENCE: AudienceSpec = { keys: [], applicantIds: [], extra: [] };

/** Where a recipient row came from — an audience, the table selection, or the To field. */
export type RecipientSource = AudienceKey | "selected" | "extra";

export interface Recipient {
  email: string;
  name: string | null;
  source: RecipientSource;
  applicant_id: string | null;
}

export interface EmailContact {
  id: string;
  email: string;
  name: string | null;
  note: string | null;
  added_by: string | null;
  created_at: string;
}

export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

/** A row of the `admin_email_campaigns` view, with `audience` parsed. */
export interface Campaign {
  id: string;
  subject: string;
  body_text: string;
  audience: AudienceSpec;
  status: CampaignStatus;
  sent_by: string | null;
  sent_by_name: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  finished_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  queued_count: number;
}

export type RecipientStatus = "queued" | "sending" | "sent" | "failed";

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  email: string;
  name: string | null;
  source: RecipientSource;
  applicant_id: string | null;
  status: RecipientStatus;
  resend_id: string | null;
  error: string | null;
  sent_at: string | null;
}

/** Progress of a send, returned by every step so the client can draw one bar. */
export interface SendProgress {
  ok: boolean;
  message?: string;
  status: CampaignStatus;
  total: number;
  sent: number;
  failed: number;
  queued: number;
  done: boolean;
}

export const SUBJECT_MAX = 200;
export const BODY_MAX = 20_000;
/** Cap on typed-in addresses per campaign; the audiences carry the real volume. */
export const EXTRA_MAX = 500;

/** Good enough to catch typos; Resend does the real validation. */
export const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Reads a stored `audience` column, tolerating `{}` and junk. */
export function parseAudience(json: unknown): AudienceSpec {
  const raw = (json ?? {}) as Partial<Record<keyof AudienceSpec, unknown>>;
  const strings = (value: unknown) =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  return {
    keys: strings(raw.keys).filter((k): k is AudienceKey =>
      (AUDIENCE_KEYS as readonly string[]).includes(k)
    ),
    applicantIds: strings(raw.applicantIds),
    extra: strings(raw.extra),
  };
}

/** "Accepted + Volunteers + 12 selected + 3 extra" — for the history table and confirm dialog. */
export function summarizeAudience(spec: AudienceSpec): string {
  const parts = spec.keys.map((key) => AUDIENCE_LABEL[key]);
  if (spec.applicantIds.length) parts.push(`${spec.applicantIds.length} selected`);
  if (spec.extra.length) parts.push(`${spec.extra.length} extra`);
  return parts.length ? parts.join(" + ") : "Nobody yet";
}

export interface ParsedAddress {
  email: string;
  name: string | null;
}

/**
 * Pulls addresses out of whatever got pasted: one per line, comma-separated,
 * space-separated, or the `Name <email>` form a mail client copies out.
 * Addresses come back lowercased and deduped; anything that doesn't look like
 * an address is returned so the organizer can see what was dropped.
 */
export function parseAddresses(text: string): { valid: ParsedAddress[]; invalid: string[] } {
  const seen = new Set<string>();
  const valid: ParsedAddress[] = [];
  const invalid: string[] = [];

  for (const chunk of text.split(/[\n,;]+/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const bracketed = trimmed.match(/^(.*?)\s*<([^<>]+)>$/);
    const tokens = bracketed
      ? [{ raw: bracketed[2], name: bracketed[1].replace(/^"|"$/g, "").trim() || null }]
      : trimmed.split(/\s+/).map((raw) => ({ raw, name: null }));

    for (const { raw, name } of tokens) {
      const email = normalizeEmail(raw);
      if (!EMAIL_RE.test(email)) {
        invalid.push(raw);
        continue;
      }
      if (seen.has(email)) continue;
      seen.add(email);
      valid.push({ email, name });
    }
  }

  return { valid, invalid };
}
