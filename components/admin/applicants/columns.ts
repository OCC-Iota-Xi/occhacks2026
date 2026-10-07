import type { Applicant } from "@/lib/admin/types";
import type { SortKey } from "@/lib/admin/filters";

/**
 * The applicant table's columns.
 *
 * The default is the roster an organizer works from: who the applicant is and
 * how to reach them, their stage (which is also the control that moves them),
 * what they told us on the form, and when they applied and last touched their
 * answers. The table scrolls sideways to fit it. Everything else is optional,
 * and the choice is remembered per organizer in localStorage — someone who only
 * wants names and stages can switch the rest off.
 *
 * A column's header is also its menu: sort by it, filter by it (which filter is
 * `COLUMN_CONTROL` in controls.ts), or hide it.
 */
export interface ColumnDef {
  key: string;
  label: string;
  /** The view column this sorts by, when the column is sortable at all. */
  sort?: SortKey;
  /** What the column holds, which is how its two sort orders are worded. */
  kind?: "text" | "number" | "date";
  align?: "right";
  width?: string;
}

export const COLUMNS: ColumnDef[] = [
  { key: "applicant", label: "Applicant", sort: "full_name" },
  { key: "id", label: "Application ID" },
  { key: "email", label: "Email", sort: "email" },
  { key: "phone", label: "Phone" },
  { key: "stage", label: "Stage", sort: "status" },
  { key: "day1", label: "Day 1", sort: "checked_in_day1_at", kind: "date" },
  { key: "day2", label: "Day 2", sort: "checked_in_day2_at", kind: "date" },
  { key: "status", label: "Status", sort: "status" },
  { key: "school", label: "School", sort: "school" },
  { key: "major", label: "Major", sort: "major" },
  { key: "occ_id", label: "OCC student ID" },
  { key: "age", label: "Age", sort: "age", kind: "number", align: "right" },
  { key: "iota_xi", label: "Iota Xi" },
  { key: "shirt", label: "Shirt", sort: "shirt" },
  { key: "needs", label: "Needs" },
  { key: "classes", label: "Extra credit" },
  { key: "track", label: "Track", sort: "first_choice_track" },
  { key: "attendance", label: "Attendance", sort: "attendance" },
  { key: "checked_in", label: "Checked in", sort: "checked_in_at", kind: "date" },
  { key: "score", label: "Score", sort: "avg_score", kind: "number", align: "right" },
  { key: "reviews", label: "Reviews", sort: "review_count", kind: "number", align: "right" },
  { key: "tags", label: "Tags" },
  { key: "reviewer", label: "Reviewer" },
  { key: "submitted", label: "Date submitted", sort: "timeline_at", kind: "date" },
  { key: "edited", label: "Last edited", sort: "updated_at", kind: "date" },
  { key: "started", label: "Started", sort: "created_at", kind: "date" },
];

export const DEFAULT_COLUMNS = [
  "applicant",
  "id",
  "email",
  "phone",
  "stage",
  "day1",
  "day2",
  "school",
  "major",
  "occ_id",
  "age",
  "iota_xi",
  "shirt",
  "needs",
  "classes",
  "track",
  "submitted",
  "edited",
];

/** Versioned: a saved choice from before a default column would hide it. */
export const COLUMN_STORAGE_KEY = "occhacks:admin-columns-v5";

/** The flags worth showing inline as a warning triangle on the row. */
export function rowFlags(applicant: Applicant): string[] {
  const flags: string[] = [];
  if (applicant.flag_missing_info) flags.push("Missing required information");
  if (applicant.flag_duplicate_email) flags.push("Another application shares this email");
  if (applicant.flag_waivers_to_review) flags.push("Says waivers are sent, waiting on review");
  else if (applicant.flag_unconfirmed) flags.push("Accepted, attendance not confirmed");
  if (applicant.flag_stale_draft) flags.push("Draft abandoned over three days ago");
  return flags;
}
