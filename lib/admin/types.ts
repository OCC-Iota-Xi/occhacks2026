/** Shared shapes for the organizer dashboard. */

/**
 * Where an application sits in the decision workflow. Attendance is tracked
 * separately (see `Attendance`) — "accepted" and "confirmed" answer different
 * questions, and folding them into one field loses the group organizers care
 * about most: accepted, hasn't replied.
 */
export const STATUSES = [
  "draft",
  "submitted",
  "in_review",
  "accepted",
  "waitlisted",
  "rejected",
  "withdrawn",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/**
 * What an organizer is *doing* when they set a status, as opposed to what the
 * status is called. Confirmation dialogs need the verb — "Accept 34 applicants"
 * — and a label reads as a past-tense report there.
 */
export const STATUS_VERB: Record<Status, string> = {
  draft: "Move to draft",
  submitted: "Move back to submitted",
  in_review: "Move to in review",
  accepted: "Accept",
  waitlisted: "Waitlist",
  rejected: "Reject",
  withdrawn: "Mark withdrawn",
};

/** Statuses an organizer can set. `draft` is the applicant's to leave. */
export const DECISION_STATUSES = [
  "submitted",
  "in_review",
  "accepted",
  "waitlisted",
  "rejected",
  "withdrawn",
] as const;

export const ATTENDANCE = ["pending", "confirmed", "declined"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  pending: "Awaiting reply",
  confirmed: "Confirmed",
  declined: "Declined",
};

export const TAG_COLORS = ["gold", "slate", "sky", "violet", "emerald", "rose"] as const;
export type TagColor = (typeof TAG_COLORS)[number];

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

/** A row of `public.admin_applicants`. */
export interface Applicant {
  id: string;
  email: string | null;
  full_name: string | null;
  school: string | null;
  major: string | null;
  occ_id: string | null;
  phone: string | null;
  dob: string | null;
  shirt: string | null;
  needs: string | null;
  classes: string[];
  iota_xi: boolean | null;
  rank_entertainment: number | null;
  rank_education: number | null;
  rank_productivity: number | null;
  eligibility_agreed: boolean;
  email_opt_in: boolean;
  welcome_email_sent_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  status: Status;
  attendance: Attendance;
  assigned_to: string | null;
  assigned_name: string | null;
  assigned_email: string | null;
  decided_at: string | null;
  confirmed_at: string | null;
  checked_in_at: string | null;
  checked_in: boolean;
  review_count: number;
  avg_score: number | null;
  tags: string[];
  first_choice_track: string | null;
  age: number | null;
  flag_missing_info: boolean;
  flag_duplicate_email: boolean;
  flag_unreviewed: boolean;
  flag_unconfirmed: boolean;
  flag_stale_draft: boolean;
}

export interface Review {
  id: string;
  applicant_id: string;
  reviewer_id: string;
  technical: number;
  projects: number;
  community: number;
  quality: number;
  fit: number;
  overall: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

/** The five things a review scores, in the order the form shows them. */
export const REVIEW_CRITERIA = [
  { key: "technical", label: "Technical experience" },
  { key: "projects", label: "Projects / initiative" },
  { key: "community", label: "Community / leadership" },
  { key: "quality", label: "Application quality" },
  { key: "fit", label: "Hackathon fit" },
] as const;

export type ReviewCriterion = (typeof REVIEW_CRITERIA)[number]["key"];

export interface Note {
  id: string;
  applicant_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: number;
  applicant_id: string;
  kind: string;
  summary: string;
  meta: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
}

export interface AdminUser {
  email: string;
  display_name: string | null;
  user_id: string | null;
  last_seen_at: string | null;
}

export interface SavedView {
  id: string;
  owner_id: string;
  name: string;
  query: string;
  shared: boolean;
  created_at: string;
}

export interface OverviewStats {
  total: number;
  submitted: number;
  drafts: number;
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  period: number;
  prev_period: number;
  in_review: number;
  accepted: number;
  waitlisted: number;
  rejected: number;
  withdrawn: number;
  pending_review: number;
  reviewed: number;
  confirmed: number;
  declined: number;
  checked_in: number;
  assigned: number;
  unassigned: number;
  eligibility_agreed: number;
  email_opt_in: number;
  volunteers: number;
  volunteer_drafts: number;
  mentors: number;
  mentor_drafts: number;
  notify_optins: number;
  days: number;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface Breakdowns {
  schools: Bucket[];
  majors: Bucket[];
  shirts: Bucket[];
  tracks: Bucket[];
  status: Bucket[];
  attendance: Bucket[];
  iota_xi: Bucket[];
  classes: Bucket[];
  ages: Bucket[];
  needs: Bucket[];
  reviews: Bucket[];
  reviewers: Bucket[];
}

export interface NeedsAttention {
  unreviewed: number;
  unconfirmed: number;
  missing_info: number;
  duplicate_email: number;
  stale_drafts: number;
  unassigned: number;
  confirmed_not_checked_in: number;
}

export interface TimePoint {
  day: string;
  started: number;
  submitted: number;
  accepted: number;
  confirmed: number;
}

/** A volunteer or mentor sign-up, for the helpers roster. */
export interface Helper {
  user_id: string;
  email: string | null;
  full_name: string | null;
  dob: string | null;
  phone: string | null;
  availability: string[];
  expertise: string | null;
  shirt: string | null;
  needs: string | null;
  occ_id?: string | null;
  resume_path?: string | null;
  mentor_reason?: string | null;
  email_opt_in: boolean;
  eligibility_agreed: boolean;
  completed_at: string | null;
  created_at: string;
}
