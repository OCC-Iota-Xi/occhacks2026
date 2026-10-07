import type { MenuOption } from "@/components/admin/Menu";
import {
  FLAGS,
  FLAG_LABEL,
  setParam,
  toggleParam,
  type ApplicantFilters,
} from "@/lib/admin/filters";
import type { FilterFacets } from "@/lib/admin/queries";
import { STAGES, STAGE_LABEL } from "@/lib/admin/stage";
import {
  ATTENDANCE,
  ATTENDANCE_LABEL,
  STATUSES,
  STATUS_LABEL,
  type AdminUser,
  type Tag,
} from "@/lib/admin/types";
import { OCC_CLASSES, SHIRT_SIZES, TRACKS } from "@/lib/form-options";

/**
 * Every way the applicant list can be narrowed, described once.
 *
 * A filter is reachable from two places — the menu on its column's header and
 * the Filters panel, which is how a hidden column's filter is still found — and
 * both draw it from here, so they can't disagree about what the choices are or
 * which query parameter they set.
 */
export type Control =
  | {
      kind: "options";
      key: string;
      label: string;
      param: string;
      options: MenuOption[];
      selected: string[];
      /** One value at a time; choosing the selected one again clears it. */
      single?: boolean;
      searchable?: boolean;
    }
  | {
      kind: "range";
      key: string;
      label: string;
      type: "number" | "date";
      min: { param: string; value: string };
      max: { param: string; value: string };
      step?: string;
      lo?: number;
      hi?: number;
    };

const yesNo = (yes: string, no: string): MenuOption[] => [
  { value: "yes", label: yes },
  { value: "no", label: no },
];

export function buildControls({
  filters: f,
  facets,
  tags,
  admins,
  viewerId,
}: {
  filters: ApplicantFilters;
  facets: FilterFacets;
  tags: Tag[];
  admins: AdminUser[];
  viewerId: string;
}): Control[] {
  const one = (value: string) => (value ? [value] : []);
  const list = (values: string[]): MenuOption[] =>
    values.map((value) => ({ value, label: value }));

  const controls: Control[] = [
    {
      kind: "options",
      key: "stage",
      label: "Stage",
      param: "stage",
      options: STAGES.map((stage) => ({ value: stage, label: STAGE_LABEL[stage] })),
      selected: f.stage,
    },
    {
      kind: "options",
      key: "status",
      label: "Status",
      param: "status",
      options: STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
      selected: f.status,
    },
    {
      kind: "options",
      key: "attendance",
      label: "Attendance",
      param: "attendance",
      options: ATTENDANCE.map((value) => ({ value, label: ATTENDANCE_LABEL[value] })),
      selected: f.attendance,
    },
    {
      kind: "options",
      key: "day1",
      label: "Day 1 check-in",
      param: "day1",
      options: yesNo("Checked in", "Not checked in"),
      selected: one(f.day1),
      single: true,
    },
    {
      kind: "options",
      key: "day2",
      label: "Day 2 check-in",
      param: "day2",
      options: yesNo("Checked in", "Not checked in"),
      selected: one(f.day2),
      single: true,
    },
    {
      kind: "options",
      key: "checked_in",
      label: "Checked in, either day",
      param: "checked_in",
      options: yesNo("Checked in", "Not checked in"),
      selected: one(f.checkedIn),
      single: true,
    },
    {
      kind: "options",
      key: "school",
      label: "School",
      param: "school",
      options: list(facets.schools),
      selected: f.school,
      searchable: true,
    },
    {
      kind: "options",
      key: "major",
      label: "Major",
      param: "major",
      options: list(facets.majors),
      selected: f.major,
      searchable: true,
    },
    {
      kind: "options",
      key: "occ",
      label: "OCC student ID",
      param: "occ",
      options: yesNo("Has one", "None given"),
      selected: one(f.occ),
      single: true,
    },
    {
      kind: "range",
      key: "age",
      label: "Age",
      type: "number",
      min: { param: "age_min", value: f.ageMin },
      max: { param: "age_max", value: f.ageMax },
      lo: 0,
      hi: 120,
    },
    {
      kind: "options",
      key: "iota",
      label: "Iota Xi",
      param: "iota",
      options: yesNo("Member", "Not a member"),
      selected: one(f.iota),
      single: true,
    },
    {
      kind: "options",
      key: "shirt",
      label: "Shirt",
      param: "shirt",
      options: SHIRT_SIZES.map((size) => ({ value: size, label: size.toUpperCase() })),
      selected: f.shirt,
    },
    {
      kind: "options",
      key: "needs",
      label: "Needs",
      param: "needs",
      options: yesNo("Has needs", "None"),
      selected: one(f.needs),
      single: true,
    },
    {
      kind: "options",
      key: "class",
      label: "Extra credit",
      param: "class",
      options: list(OCC_CLASSES),
      selected: f.klass,
    },
    {
      kind: "options",
      key: "track",
      label: "Track",
      param: "track",
      options: TRACKS.map((track) => ({ value: track.key, label: track.label })),
      selected: f.track,
    },
    {
      kind: "options",
      key: "flag",
      label: "Problems",
      param: "flag",
      options: FLAGS.map((flag) => ({ value: flag, label: FLAG_LABEL[flag] })),
      selected: f.flag,
    },
    {
      kind: "range",
      key: "submitted",
      label: "Date submitted",
      type: "date",
      min: { param: "from", value: f.from },
      max: { param: "to", value: f.to },
    },
    {
      kind: "options",
      key: "reviewer",
      label: "Reviewer",
      param: "reviewer",
      options: [
        { value: "unassigned", label: "Unassigned" },
        { value: "me", label: "Me" },
        ...admins
          .filter((admin) => admin.user_id && admin.user_id !== viewerId)
          .map((admin) => ({
            value: admin.user_id!,
            label: admin.display_name ?? admin.email,
          })),
      ],
      selected: one(f.reviewer),
      single: true,
    },
    {
      kind: "options",
      key: "reviewed",
      label: "Reviewed",
      param: "reviewed",
      options: yesNo("Has a review", "Not reviewed"),
      selected: one(f.reviewed),
      single: true,
    },
    {
      kind: "range",
      key: "score",
      label: "Score",
      type: "number",
      min: { param: "score_min", value: f.scoreMin },
      max: { param: "score_max", value: f.scoreMax },
      step: "0.1",
      lo: 1,
      hi: 5,
    },
  ];

  // No tags defined yet means nothing to filter by.
  if (tags.length) {
    controls.push({
      kind: "options",
      key: "tag",
      label: "Tags",
      param: "tag",
      options: tags.map((tag) => ({ value: tag.name, label: tag.name })),
      selected: f.tag,
    });
  }

  return controls;
}

/** Which control a column's header menu shows, by column key. */
export const COLUMN_CONTROL: Record<string, string> = {
  applicant: "flag",
  stage: "stage",
  day1: "day1",
  day2: "day2",
  status: "status",
  school: "school",
  major: "major",
  occ_id: "occ",
  age: "age",
  iota_xi: "iota",
  shirt: "shirt",
  needs: "needs",
  classes: "class",
  track: "track",
  attendance: "attendance",
  checked_in: "checked_in",
  score: "score",
  reviews: "reviewed",
  tags: "tag",
  reviewer: "reviewer",
  submitted: "submitted",
};

/** How many values a control is currently narrowing by. */
export function activeCount(control: Control): number {
  if (control.kind === "options") return control.selected.length;
  return (control.min.value ? 1 : 0) + (control.max.value ? 1 : 0);
}

export function toggleControl(
  params: URLSearchParams,
  control: Extract<Control, { kind: "options" }>,
  value: string
) {
  if (!control.single) return toggleParam(params, control.param, value);
  return setParam(params, control.param, control.selected[0] === value ? "" : value);
}

export function clearControl(params: URLSearchParams, control: Control) {
  if (control.kind === "options") return setParam(params, control.param, "");
  return setParam(setParam(params, control.min.param, ""), control.max.param, "");
}
