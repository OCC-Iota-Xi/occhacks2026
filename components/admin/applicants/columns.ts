import type { Applicant } from "@/lib/admin/types";
import type { SortKey } from "@/lib/admin/filters";

/**
 * The applicant table's columns.
 *
 * The default is the five that answer "who is this and where are they": the
 * applicant, their school, their stage (which is also the control that moves
 * them), when they applied, and when they last touched their answers.
 * Everything else is optional and remembered per
 * organizer in localStorage — someone doing logistics wants shirt size and
 * dietary needs, and nobody else should have to scroll past them.
 */
export interface ColumnDef {
  key: string;
  label: string;
  /** The view column this sorts by, when the column is sortable at all. */
  sort?: SortKey;
  align?: "right";
  width?: string;
}

export const COLUMNS: ColumnDef[] = [
  { key: "applicant", label: "Applicant", sort: "full_name" },
  { key: "email", label: "Email", sort: "email" },
  { key: "school", label: "School", sort: "school" },
  { key: "major", label: "Major" },
  { key: "stage", label: "Stage", sort: "status" },
  { key: "status", label: "Status", sort: "status" },
  { key: "attendance", label: "Attendance" },
  { key: "score", label: "Score", sort: "avg_score", align: "right" },
  { key: "reviews", label: "Reviews", sort: "review_count", align: "right" },
  { key: "tags", label: "Tags" },
  { key: "reviewer", label: "Reviewer" },
  { key: "track", label: "Track" },
  { key: "shirt", label: "Shirt" },
  { key: "age", label: "Age", align: "right" },
  { key: "classes", label: "Extra credit" },
  { key: "needs", label: "Needs" },
  { key: "checked_in", label: "Checked in", sort: "checked_in_at" },
  { key: "submitted", label: "Date submitted", sort: "timeline_at" },
  { key: "edited", label: "Last edited", sort: "updated_at" },
  { key: "started", label: "Started", sort: "created_at" },
];

export const DEFAULT_COLUMNS = ["applicant", "school", "stage", "submitted", "edited"];

/** Versioned: a saved choice from before a default column would hide it. */
export const COLUMN_STORAGE_KEY = "occhacks:admin-columns-v3";

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
