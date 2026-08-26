import { ATTENDANCE, STATUSES } from "@/lib/admin/types";

/**
 * The applicant list's state lives entirely in the URL.
 *
 * That's what makes a filtered list shareable ("here are the 73 waitlisted"),
 * a chart segment clickable (it's just a link), the back button work, and a
 * saved view nothing more than a stored query string. Nothing about the table
 * is held in React state that survives a reload.
 */

export const SORTABLE = [
  "completed_at",
  "created_at",
  "full_name",
  "email",
  "school",
  "status",
  "avg_score",
  "review_count",
  "checked_in_at",
] as const;
export type SortKey = (typeof SORTABLE)[number];

export const FLAGS = [
  "missing_info",
  "duplicate_email",
  "unreviewed",
  "unconfirmed",
  "stale_draft",
  "not_checked_in",
] as const;
export type Flag = (typeof FLAGS)[number];

export const FLAG_LABEL: Record<Flag, string> = {
  missing_info: "Missing information",
  duplicate_email: "Duplicate email",
  unreviewed: "Not yet reviewed",
  unconfirmed: "Accepted, not confirmed",
  stale_draft: "Abandoned draft",
  not_checked_in: "Confirmed, not checked in",
};

export const PAGE_SIZES = [25, 50, 100, 200];

export interface ApplicantFilters {
  q: string;
  status: string[];
  attendance: string[];
  school: string[];
  major: string[];
  track: string[];
  shirt: string[];
  tag: string[];
  klass: string[];
  iota: string;
  checkedIn: string;
  reviewer: string;
  reviewed: string;
  scoreMin: string;
  scoreMax: string;
  from: string;
  to: string;
  flag: string[];
  sort: SortKey;
  dir: "asc" | "desc";
  page: number;
  per: number;
}

const MULTI = [
  ["status", "status"],
  ["attendance", "attendance"],
  ["school", "school"],
  ["major", "major"],
  ["track", "track"],
  ["shirt", "shirt"],
  ["tag", "tag"],
  ["class", "klass"],
  ["flag", "flag"],
] as const;

const SINGLE = [
  ["iota", "iota"],
  ["checked_in", "checkedIn"],
  ["reviewer", "reviewer"],
  ["reviewed", "reviewed"],
  ["score_min", "scoreMin"],
  ["score_max", "scoreMax"],
  ["from", "from"],
  ["to", "to"],
] as const;

/** Next hands `searchParams` as a plain object; PostgREST work wants the real thing. */
export function toSearchParams(
  input: Record<string, string | string[] | undefined> | URLSearchParams
): URLSearchParams {
  if (input instanceof URLSearchParams) return new URLSearchParams(input);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v !== "") params.append(key, v);
    }
  }
  return params;
}

export function parseFilters(input: URLSearchParams): ApplicantFilters {
  const params = toSearchParams(input);
  const one = (key: string) => (params.get(key) ?? "").trim();

  const filters: ApplicantFilters = {
    q: one("q"),
    status: [],
    attendance: [],
    school: [],
    major: [],
    track: [],
    shirt: [],
    tag: [],
    klass: [],
    iota: "",
    checkedIn: "",
    reviewer: "",
    reviewed: "",
    scoreMin: "",
    scoreMax: "",
    from: "",
    to: "",
    flag: [],
    sort: "completed_at",
    dir: "desc",
    page: 1,
    per: 50,
  };

  for (const [param, key] of MULTI) {
    (filters[key] as string[]) = params
      .getAll(param)
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter(Boolean);
  }
  for (const [param, key] of SINGLE) {
    (filters[key] as string) = one(param);
  }

  filters.status = filters.status.filter((s) => (STATUSES as readonly string[]).includes(s));
  filters.attendance = filters.attendance.filter((a) =>
    (ATTENDANCE as readonly string[]).includes(a)
  );
  filters.flag = filters.flag.filter((f) => (FLAGS as readonly string[]).includes(f));

  const sort = one("sort");
  if ((SORTABLE as readonly string[]).includes(sort)) filters.sort = sort as SortKey;
  if (one("dir") === "asc") filters.dir = "asc";

  const page = Number(one("page"));
  if (Number.isFinite(page) && page >= 1) filters.page = Math.floor(page);
  const per = Number(one("per"));
  if (PAGE_SIZES.includes(per)) filters.per = per;

  return filters;
}

/** True when anything is narrowing the list — drives the "clear all" affordance. */
export function hasActiveFilters(f: ApplicantFilters): boolean {
  return Boolean(
    f.q ||
      f.status.length ||
      f.attendance.length ||
      f.school.length ||
      f.major.length ||
      f.track.length ||
      f.shirt.length ||
      f.tag.length ||
      f.klass.length ||
      f.flag.length ||
      f.iota ||
      f.checkedIn ||
      f.reviewer ||
      f.reviewed ||
      f.scoreMin ||
      f.scoreMax ||
      f.from ||
      f.to
  );
}

export interface Chip {
  /** Query param to drop, and the value to drop from it (for repeated params). */
  param: string;
  value?: string;
  label: string;
}

const YES_NO: Record<string, string> = { yes: "Yes", no: "No" };

/** The removable chips above the table: one per active narrowing. */
export function activeChips(
  f: ApplicantFilters,
  lookup: { reviewerName?: (id: string) => string } = {}
): Chip[] {
  const chips: Chip[] = [];
  const push = (param: string, value: string, label: string) =>
    chips.push({ param, value, label });

  if (f.q) chips.push({ param: "q", label: `Search: ${f.q}` });
  for (const s of f.status) push("status", s, `Status: ${labelize(s)}`);
  for (const a of f.attendance) push("attendance", a, `Attendance: ${labelize(a)}`);
  for (const s of f.school) push("school", s, `School: ${s}`);
  for (const m of f.major) push("major", m, `Major: ${m}`);
  for (const t of f.track) push("track", t, `Track: ${t}`);
  for (const s of f.shirt) push("shirt", s, `Shirt: ${s.toUpperCase()}`);
  for (const t of f.tag) push("tag", t, `Tag: ${t}`);
  for (const c of f.klass) push("class", c, `Class: ${c}`);
  for (const flag of f.flag)
    push("flag", flag, FLAG_LABEL[flag as Flag] ?? labelize(flag));
  if (f.iota) chips.push({ param: "iota", label: `Iota Xi member: ${YES_NO[f.iota] ?? f.iota}` });
  if (f.checkedIn)
    chips.push({ param: "checked_in", label: `Checked in: ${YES_NO[f.checkedIn] ?? f.checkedIn}` });
  if (f.reviewed)
    chips.push({ param: "reviewed", label: `Reviewed: ${YES_NO[f.reviewed] ?? f.reviewed}` });
  if (f.reviewer) {
    const name =
      f.reviewer === "unassigned"
        ? "Unassigned"
        : f.reviewer === "me"
          ? "Me"
          : (lookup.reviewerName?.(f.reviewer) ?? "Reviewer");
    chips.push({ param: "reviewer", label: `Reviewer: ${name}` });
  }
  if (f.scoreMin) chips.push({ param: "score_min", label: `Score ≥ ${f.scoreMin}` });
  if (f.scoreMax) chips.push({ param: "score_max", label: `Score ≤ ${f.scoreMax}` });
  if (f.from) chips.push({ param: "from", label: `Submitted from ${f.from}` });
  if (f.to) chips.push({ param: "to", label: `Submitted to ${f.to}` });

  return chips;
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/**
 * URL helpers. Every one resets `page`: changing what you're looking at while
 * staying on page 7 of the old result set is never what someone meant.
 */
export function setParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  next.delete("page");
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

export function toggleParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  next.delete("page");
  const current = next.getAll(key).flatMap((v) => v.split(","));
  next.delete(key);
  const wanted = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  for (const v of wanted) next.append(key, v);
  return next;
}

export function removeChip(params: URLSearchParams, chip: Chip) {
  const next = new URLSearchParams(params);
  next.delete("page");
  if (chip.value == null) {
    next.delete(chip.param);
    return next;
  }
  const rest = next
    .getAll(chip.param)
    .flatMap((v) => v.split(","))
    .filter((v) => v !== chip.value);
  next.delete(chip.param);
  for (const v of rest) next.append(chip.param, v);
  return next;
}

/** Everything except the table's own bookkeeping — used by "clear all". */
export function clearFilters(params: URLSearchParams) {
  const next = new URLSearchParams();
  for (const key of ["sort", "dir", "per"]) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  return next;
}

export function queryString(params: URLSearchParams) {
  const query = params.toString();
  return query ? `?${query}` : "";
}
