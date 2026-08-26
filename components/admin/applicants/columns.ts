import type { Applicant } from "@/lib/admin/types";
import type { SortKey } from "@/lib/admin/filters";

/**
 * The applicant table's columns.
 *
 * Every column is optional except the applicant themself, and which ones are
 * showing is remembered per organizer in localStorage — someone doing decisions
 * wants score and reviewer, someone doing logistics wants shirt size and
 * dietary needs, and neither should have to scroll past the other's columns.
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
  { key: "submitted", label: "Submitted", sort: "completed_at" },
  { key: "started", label: "Started", sort: "created_at" },
];

export const DEFAULT_COLUMNS = [
  "applicant",
  "email",
  "school",
  "status",
  "score",
  "tags",
  "reviewer",
  "submitted",
];

export const COLUMN_STORAGE_KEY = "occhacks:admin-columns";

/** The flags worth showing inline as a warning triangle on the row. */
export function rowFlags(applicant: Applicant): string[] {
  const flags: string[] = [];
  if (applicant.flag_missing_info) flags.push("Missing required information");
  if (applicant.flag_duplicate_email) flags.push("Another application shares this email");
  if (applicant.flag_unconfirmed) flags.push("Accepted, attendance not confirmed");
  if (applicant.flag_stale_draft) flags.push("Draft abandoned over three days ago");
  return flags;
}
