import type { Applicant } from "@/lib/admin/types";

/**
 * CSV export.
 *
 * The column list is a fixed allowlist rather than "whatever the row has": the
 * applicant view carries internal flags and assignment ids that have no business
 * in a spreadsheet passed around an organizing team, and a new column added to
 * the view later shouldn't silently start leaving the building. Notes and review
 * comments are absent for the same reason — those are organizer-to-organizer,
 * and an exported file is the easiest thing in the world to forward.
 */

interface Column {
  header: string;
  value: (row: Applicant) => string | number | null | undefined;
}

const COLUMNS: Column[] = [
  { header: "application_id", value: (r) => r.id },
  { header: "name", value: (r) => r.full_name },
  { header: "email", value: (r) => r.email },
  { header: "phone", value: (r) => r.phone },
  { header: "school", value: (r) => r.school },
  { header: "major", value: (r) => r.major },
  { header: "occ_student_id", value: (r) => r.occ_id },
  { header: "age", value: (r) => r.age },
  { header: "iota_xi_member", value: (r) => yesNo(r.iota_xi) },
  { header: "shirt_size", value: (r) => r.shirt },
  { header: "accessibility_or_dietary_needs", value: (r) => r.needs },
  { header: "extra_credit_classes", value: (r) => r.classes?.join("; ") },
  { header: "first_choice_track", value: (r) => r.first_choice_track },
  { header: "rank_entertainment", value: (r) => r.rank_entertainment },
  { header: "rank_education", value: (r) => r.rank_education },
  { header: "rank_productivity", value: (r) => r.rank_productivity },
  { header: "status", value: (r) => r.status },
  { header: "attendance", value: (r) => r.attendance },
  { header: "checked_in_at", value: (r) => r.checked_in_at },
  { header: "average_score", value: (r) => r.avg_score },
  { header: "review_count", value: (r) => r.review_count },
  { header: "assigned_reviewer", value: (r) => r.assigned_name ?? r.assigned_email },
  { header: "tags", value: (r) => r.tags?.join("; ") },
  { header: "submitted_at", value: (r) => r.completed_at },
  { header: "started_at", value: (r) => r.created_at },
  { header: "agreed_to_eligibility", value: (r) => yesNo(r.eligibility_agreed) },
  { header: "email_opt_in", value: (r) => yesNo(r.email_opt_in) },
];

function yesNo(value: boolean | null | undefined) {
  if (value == null) return "";
  return value ? "yes" : "no";
}

/**
 * Quotes a field, and defuses the leading characters Excel and Sheets treat as
 * the start of a formula — an applicant who types `=cmd|...` into a free-text
 * answer shouldn't get to run anything on an organizer's machine.
 */
function escape(value: string | number | null | undefined) {
  if (value == null) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function csvHeader() {
  return `${COLUMNS.map((c) => c.header).join(",")}\r\n`;
}

export function csvRows(rows: Applicant[]) {
  return rows
    .map((row) => COLUMNS.map((column) => escape(column.value(row))).join(","))
    .concat("")
    .join("\r\n");
}

export function csvFilename(scope: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `occhacks-applicants-${scope}-${stamp}.csv`;
}
