"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import ApplicantTable from "@/components/admin/applicants/Table";
import {
  COLUMNS,
  COLUMN_STORAGE_KEY,
  DEFAULT_COLUMNS,
  type ColumnDef,
} from "@/components/admin/applicants/columns";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ActionMenu, FilterMenu, MenuItem, MenuLabel } from "@/components/admin/Menu";
import { useToast } from "@/components/admin/Toast";
import { Empty, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  addTag,
  assignReviewer,
  matchingIds,
  removeTag,
  saveView,
  setAttendance,
  setCheckedIn,
  setStatus,
  type ActionResult,
} from "@/lib/admin/actions";
import {
  activeChips,
  clearFilters,
  FLAGS,
  FLAG_LABEL,
  hasActiveFilters,
  PAGE_SIZES,
  queryString,
  removeChip,
  setParam,
  toggleParam,
  type ApplicantFilters,
} from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import type { FilterFacets } from "@/lib/admin/queries";
import {
  ATTENDANCE,
  ATTENDANCE_LABEL,
  STATUSES,
  STATUS_LABEL,
  STATUS_VERB,
  type AdminUser,
  type Applicant,
  type Attendance,
  type SavedView,
  type Status,
  type Tag,
} from "@/lib/admin/types";
import { OCC_CLASSES, SHIRT_SIZES, TRACKS } from "@/lib/form-options";
import { cn } from "@/lib/utils";

/**
 * The organizer workspace: filters, table, selection, bulk actions.
 *
 * The one piece of state that isn't in the URL is the selection — checkboxes
 * are about what you're doing right now, not about what you're looking at, and
 * putting two hundred ids in the address bar would help nobody.
 */

/** Views every organizer gets, as query strings against this same list. */
const BUILT_IN_VIEWS: { name: string; query: string }[] = [
  { name: "All applicants", query: "" },
  { name: "Needs review", query: "flag=unreviewed" },
  { name: "My review queue", query: "reviewer=me&status=submitted&status=in_review" },
  { name: "Accepted", query: "status=accepted" },
  { name: "Waitlisted", query: "status=waitlisted" },
  { name: "Rejected", query: "status=rejected" },
  { name: "Confirmed", query: "attendance=confirmed" },
  { name: "Missing confirmation", query: "flag=unconfirmed" },
  { name: "Drafts", query: "status=draft" },
  { name: "Data problems", query: "flag=missing_info&flag=duplicate_email" },
];

export default function ApplicantsWorkspace({
  rows,
  total,
  filters,
  facets,
  tags,
  admins,
  savedViews,
  viewerId,
  error,
}: {
  rows: Applicant[];
  total: number;
  filters: ApplicantFilters;
  facets: FilterFacets;
  tags: Tag[];
  admins: AdminUser[];
  savedViews: SavedView[];
  viewerId: string;
  error: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [term, setTerm] = useState(filters.q);
  const [showMore, setShowMore] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState<string[]>(DEFAULT_COLUMNS);
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    label: string;
    destructive?: boolean;
    run: () => Promise<ActionResult>;
  } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  // The anchor for shift-click range selection. State rather than a ref
  // because it's cleared when the rows change, which happens during render.
  const [anchor, setAnchor] = useState<number | null>(null);

  // Column choices are a personal preference, not shared state — localStorage,
  // read after mount rather than during render so the server's HTML and the
  // first client render agree on which columns exist.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLUMN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Reading a browser store on mount is exactly what an effect is for;
        // the rule can't tell this apart from a render-triggering cascade.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed) && parsed.length) setVisible(parsed);
      }
    } catch {
      // A browser refusing localStorage just gets the default columns.
    }
  }, []);

  const setColumns = (next: string[]) => {
    setVisible(next);
    try {
      window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not worth telling anyone about.
    }
  };

  const push = useCallback(
    (next: URLSearchParams) => {
      startTransition(() => router.push(`${pathname}${queryString(next)}`));
    },
    [pathname, router]
  );

  // Debounced search: one query when the typing stops, not one per keystroke.
  useEffect(() => {
    if (term === filters.q) return;
    const timer = setTimeout(() => push(setParam(params, "q", term.trim())), 300);
    return () => clearTimeout(timer);
    // `params` changes identity on every navigation; depending on it here would
    // re-arm the timer mid-typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // Two pieces of state that follow the URL rather than the other way round:
  // the search box when someone clears the chip, and the selection when the
  // rows underneath it change. Adjusted during render against the last value
  // seen — the React pattern for this — rather than in an effect, which would
  // paint the stale value first.
  const [lastQuery, setLastQuery] = useState(filters.q);
  if (lastQuery !== filters.q) {
    setLastQuery(filters.q);
    setTerm(filters.q);
  }

  const paramsKey = params.toString();
  const [lastParams, setLastParams] = useState(paramsKey);
  if (lastParams !== paramsKey) {
    setLastParams(paramsKey);
    setSelected(new Set());
    setAnchor(null);
  }

  const toggle = (key: string, value: string) => push(toggleParam(params, key, value));

  const toggleRow = (id: string, shiftKey: boolean, index: number) => {
    setSelected((current) => {
      const next = new Set(current);
      // Shift-click fills the range, the way every list of checkboxes should.
      if (shiftKey && anchor != null) {
        const [start, end] = [anchor, index].sort((a, b) => a - b);
        for (let i = start; i <= end; i++) next.add(rows[i].id);
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setAnchor(index);
  };

  const toggleAll = () => {
    setSelected((current) =>
      rows.every((row) => current.has(row.id)) ? new Set() : new Set(rows.map((row) => row.id))
    );
  };

  const selectEveryMatch = async () => {
    const ids = await matchingIds(params.toString());
    setSelected(new Set(ids));
    toast(`Selected ${formatNumber(ids.length)} applicants`);
  };

  const ids = useMemo(() => Array.from(selected), [selected]);

  const run = (action: () => Promise<ActionResult>, success: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(success.replace("{n}", formatNumber(result.count ?? ids.length)));
        setSelected(new Set());
        setConfirm(null);
        router.refresh();
      } else {
        toast(result.message ?? "That didn't work.", "error");
      }
    });
  };

  const confirmStatus = (status: Status) => {
    const people = ids.length === 1 ? "applicant" : "applicants";
    setConfirm({
      title: `${STATUS_VERB[status]} ${ids.length} ${people}?`,
      body: `This sets their application status to ${STATUS_LABEL[status].toLowerCase()}. It doesn't email anyone.`,
      label: `${STATUS_VERB[status]} ${people}`,
      destructive: status === "rejected",
      run: () => setStatus(ids, status),
    });
  };

  const chips = activeChips(filters, {
    reviewerName: (id) =>
      admins.find((admin) => admin.user_id === id)?.display_name ??
      admins.find((admin) => admin.user_id === id)?.email ??
      "Reviewer",
  });

  const backQuery = queryString(params) ? `?back=${encodeURIComponent(params.toString())}` : "";
  const exportHref =
    ids.length && ids.length <= 200
      ? `/admin/export?ids=${ids.join(",")}`
      : `/admin/export${queryString(params)}`;

  const reviewerOptions = [
    { value: "unassigned", label: "Unassigned" },
    { value: "me", label: "Me" },
    ...admins
      .filter((admin) => admin.user_id && admin.user_id !== viewerId)
      .map((admin) => ({
        value: admin.user_id!,
        label: admin.display_name ?? admin.email,
      })),
  ];

  const currentQuery = params.toString();

  return (
    <div className="space-y-3">
      {/* Saved views */}
      <div className="scroll-soft flex items-center gap-1.5 overflow-x-auto pb-1">
        {[...BUILT_IN_VIEWS, ...savedViews.map((v) => ({ name: v.name, query: v.query }))].map(
          (view) => {
            const active = normalize(currentQuery) === normalize(view.query);
            return (
              <Link
                key={view.name}
                href={`${pathname}${view.query ? `?${view.query}` : ""}`}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
                  active
                    ? "border-[var(--ring)]/40 bg-accent/60 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {view.name}
              </Link>
            );
          }
        )}
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bookmark className="size-3" />
          Save this view
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-8 min-w-[16rem] flex-1 items-center gap-2 rounded-lg border border-border px-2.5 focus-within:border-[var(--ring)]/50">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search name, email, school, major, student ID"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
          {term && (
            <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
              <X className="size-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <FilterMenu
          label="Status"
          options={STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
          selected={filters.status}
          onToggle={(value) => toggle("status", value)}
          onClear={() => push(setParam(params, "status", ""))}
        />
        <FilterMenu
          label="Attendance"
          options={ATTENDANCE.map((value) => ({ value, label: ATTENDANCE_LABEL[value] }))}
          selected={filters.attendance}
          onToggle={(value) => toggle("attendance", value)}
          onClear={() => push(setParam(params, "attendance", ""))}
        />
        <FilterMenu
          label="School"
          searchable
          options={facets.schools.map((school) => ({ value: school, label: school }))}
          selected={filters.school}
          onToggle={(value) => toggle("school", value)}
          onClear={() => push(setParam(params, "school", ""))}
        />
        <FilterMenu
          label="Tags"
          options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
          selected={filters.tag}
          onToggle={(value) => toggle("tag", value)}
          onClear={() => push(setParam(params, "tag", ""))}
        />
        <FilterMenu
          label="Reviewer"
          options={reviewerOptions}
          selected={filters.reviewer ? [filters.reviewer] : []}
          onToggle={(value) =>
            push(setParam(params, "reviewer", filters.reviewer === value ? "" : value))
          }
          onClear={() => push(setParam(params, "reviewer", ""))}
        />
        <FilterMenu
          label="Data quality"
          width="w-72"
          options={FLAGS.map((flag) => ({ value: flag, label: FLAG_LABEL[flag] }))}
          selected={filters.flag}
          onToggle={(value) => toggle("flag", value)}
          onClear={() => push(setParam(params, "flag", ""))}
        />

        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors",
            showMore
              ? "border-[var(--ring)]/40 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          More
        </button>

        <FilterMenu
          label="Columns"
          align="end"
          options={COLUMNS.map((column) => ({ value: column.key, label: column.label }))}
          selected={visible}
          onToggle={(value) =>
            setColumns(
              visible.includes(value)
                ? visible.filter((key) => key !== value || key === "applicant")
                : [...visible, value]
            )
          }
        />

        <ActionMenu
          trigger={
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Export
            </Button>
          }
        >
          <MenuLabel>Download CSV</MenuLabel>
          <MenuItem onSelect={() => window.open("/admin/export", "_self")}>
            All applicants
          </MenuItem>
          <MenuItem
            onSelect={() => window.open(`/admin/export${queryString(params)}`, "_self")}
            disabled={!hasActiveFilters(filters)}
          >
            Filtered ({formatNumber(total)})
          </MenuItem>
          <MenuItem
            onSelect={() => window.open(exportHref, "_self")}
            disabled={!ids.length}
          >
            Selected ({ids.length})
          </MenuItem>
        </ActionMenu>
      </div>

      {showMore && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/30 p-2">
          <FilterMenu
            label="Major"
            searchable
            options={facets.majors.map((major) => ({ value: major, label: major }))}
            selected={filters.major}
            onToggle={(value) => toggle("major", value)}
            onClear={() => push(setParam(params, "major", ""))}
          />
          <FilterMenu
            label="Track"
            options={TRACKS.map((track) => ({ value: track.key, label: track.label }))}
            selected={filters.track}
            onToggle={(value) => toggle("track", value)}
            onClear={() => push(setParam(params, "track", ""))}
          />
          <FilterMenu
            label="Shirt"
            options={SHIRT_SIZES.map((size) => ({ value: size, label: size.toUpperCase() }))}
            selected={filters.shirt}
            onToggle={(value) => toggle("shirt", value)}
            onClear={() => push(setParam(params, "shirt", ""))}
          />
          <FilterMenu
            label="Extra credit"
            width="w-72"
            options={OCC_CLASSES.map((course) => ({ value: course, label: course }))}
            selected={filters.klass}
            onToggle={(value) => toggle("class", value)}
            onClear={() => push(setParam(params, "class", ""))}
          />
          <FilterMenu
            label="Iota Xi"
            options={[
              { value: "yes", label: "Member" },
              { value: "no", label: "Not a member" },
            ]}
            selected={filters.iota ? [filters.iota] : []}
            onToggle={(value) =>
              push(setParam(params, "iota", filters.iota === value ? "" : value))
            }
          />
          <FilterMenu
            label="Reviewed"
            options={[
              { value: "yes", label: "Has a review" },
              { value: "no", label: "Not reviewed" },
            ]}
            selected={filters.reviewed ? [filters.reviewed] : []}
            onToggle={(value) =>
              push(setParam(params, "reviewed", filters.reviewed === value ? "" : value))
            }
          />
          <FilterMenu
            label="Checked in"
            options={[
              { value: "yes", label: "Checked in" },
              { value: "no", label: "Not checked in" },
            ]}
            selected={filters.checkedIn ? [filters.checkedIn] : []}
            onToggle={(value) =>
              push(setParam(params, "checked_in", filters.checkedIn === value ? "" : value))
            }
          />

          <label className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground">
            Score
            <input
              type="number"
              min={1}
              max={5}
              step="0.1"
              defaultValue={filters.scoreMin}
              onBlur={(event) => push(setParam(params, "score_min", event.target.value))}
              className="w-12 bg-transparent text-foreground outline-none"
              placeholder="min"
            />
            –
            <input
              type="number"
              min={1}
              max={5}
              step="0.1"
              defaultValue={filters.scoreMax}
              onBlur={(event) => push(setParam(params, "score_max", event.target.value))}
              className="w-12 bg-transparent text-foreground outline-none"
              placeholder="max"
            />
          </label>

          <label className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground">
            Submitted
            <input
              type="date"
              defaultValue={filters.from}
              onChange={(event) => push(setParam(params, "from", event.target.value))}
              className="bg-transparent text-foreground outline-none"
            />
            →
            <input
              type="date"
              defaultValue={filters.to}
              onChange={(event) => push(setParam(params, "to", event.target.value))}
              className="bg-transparent text-foreground outline-none"
            />
          </label>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={`${chip.param}-${chip.value ?? ""}`}
              type="button"
              onClick={() => push(removeChip(params, chip))}
              className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {chip.label}
              <X className="size-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => push(clearFilters(params))}
            className="px-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bulk actions */}
      {ids.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-[var(--ring)]/30 bg-popover/95 px-3 py-2 shadow-2xl backdrop-blur">
          <span className="text-xs text-foreground">
            {formatNumber(ids.length)} selected
          </span>
          {rows.length > 0 &&
            rows.every((row) => selected.has(row.id)) &&
            total > ids.length && (
              <button
                type="button"
                onClick={selectEveryMatch}
                className="text-xs text-[var(--ring)] underline-offset-2 hover:underline"
              >
                Select all {formatNumber(total)} matching
              </button>
            )}

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={() => confirmStatus("accepted")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => confirmStatus("waitlisted")}>
              Waitlist
            </Button>
            <Button size="sm" variant="outline" onClick={() => confirmStatus("rejected")}>
              Reject
            </Button>

            <ActionMenu
              trigger={
                <Button size="sm" variant="outline">
                  More
                </Button>
              }
            >
              <MenuLabel>Status</MenuLabel>
              {(["in_review", "submitted", "withdrawn"] as Status[]).map((status) => (
                <MenuItem key={status} onSelect={() => confirmStatus(status)}>
                  {STATUS_VERB[status]}
                </MenuItem>
              ))}

              <MenuLabel>Attendance</MenuLabel>
              {ATTENDANCE.map((value) => (
                <MenuItem
                  key={value}
                  onSelect={() =>
                    run(
                      () => setAttendance(ids, value as Attendance),
                      `Attendance updated for {n} applicants`
                    )
                  }
                >
                  Mark {ATTENDANCE_LABEL[value].toLowerCase()}
                </MenuItem>
              ))}

              <MenuLabel>Check-in</MenuLabel>
              <MenuItem
                onSelect={() => run(() => setCheckedIn(ids, true), "Checked in {n} applicants")}
              >
                Check in
              </MenuItem>
              <MenuItem
                onSelect={() => run(() => setCheckedIn(ids, false), "Undid check-in for {n}")}
              >
                Undo check-in
              </MenuItem>
            </ActionMenu>

            <ActionMenu
              trigger={
                <Button size="sm" variant="outline">
                  Assign
                </Button>
              }
            >
              <MenuLabel>Assign reviewer</MenuLabel>
              {admins
                .filter((admin) => admin.user_id)
                .map((admin) => (
                  <MenuItem
                    key={admin.email}
                    onSelect={() =>
                      run(
                        () => assignReviewer(ids, admin.user_id!),
                        `Assigned {n} applicants to ${admin.display_name ?? admin.email}`
                      )
                    }
                  >
                    {admin.display_name ?? admin.email}
                  </MenuItem>
                ))}
              <MenuItem onSelect={() => run(() => assignReviewer(ids, null), "Unassigned {n}")}>
                Unassign
              </MenuItem>
            </ActionMenu>

            <ActionMenu
              trigger={
                <Button size="sm" variant="outline">
                  Tag
                </Button>
              }
            >
              <MenuLabel>Add tag</MenuLabel>
              {tags.map((tag) => (
                <MenuItem
                  key={tag.id}
                  onSelect={() =>
                    run(() => addTag(ids, tag.id), `Tagged {n} applicants “${tag.name}”`)
                  }
                >
                  {tag.name}
                </MenuItem>
              ))}
              <MenuLabel>Remove tag</MenuLabel>
              {tags.map((tag) => (
                <MenuItem
                  key={`remove-${tag.id}`}
                  onSelect={() =>
                    run(() => removeTag(ids, tag.id), `Removed “${tag.name}” from {n}`)
                  }
                >
                  {tag.name}
                </MenuItem>
              ))}
            </ActionMenu>

            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Panel className="overflow-hidden">
        {error ? (
          <Empty title="Could not load applicants" hint={error} />
        ) : rows.length ? (
          <>
            <ApplicantTable
              rows={rows}
              filters={filters}
              visible={visible}
              selected={selected}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onSort={(column: ColumnDef) => {
                if (!column.sort) return;
                const next = new URLSearchParams(params);
                next.set("sort", column.sort);
                next.set(
                  "dir",
                  filters.sort === column.sort && filters.dir === "desc" ? "asc" : "desc"
                );
                next.delete("page");
                push(next);
              }}
              backQuery={backQuery}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
              <span>
                {formatNumber((filters.page - 1) * filters.per + 1)}–
                {formatNumber(Math.min(filters.page * filters.per, total))} of{" "}
                {formatNumber(total)}
                {pending && <span className="ml-2 opacity-70">updating…</span>}
              </span>

              <div className="flex items-center gap-2">
                <FilterMenu
                  label={`${filters.per} per page`}
                  align="end"
                  width="w-40"
                  options={PAGE_SIZES.map((size) => ({
                    value: String(size),
                    label: `${size} per page`,
                  }))}
                  selected={[String(filters.per)]}
                  onToggle={(value) => push(setParam(params, "per", value))}
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={filters.page <= 1}
                    onClick={() => push(setPage(params, filters.page - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="tabular-nums">
                    {filters.page} / {Math.max(1, Math.ceil(total / filters.per))}
                  </span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={filters.page >= Math.ceil(total / filters.per)}
                    onClick={() => push(setPage(params, filters.page + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Empty
            title={hasActiveFilters(filters) ? "No applicants match these filters" : "No applications yet"}
            hint={
              hasActiveFilters(filters)
                ? "Try removing a filter chip above."
                : "Rows appear the moment someone starts the registration form."
            }
            action={
              hasActiveFilters(filters) ? (
                <Button size="sm" variant="outline" onClick={() => push(clearFilters(params))}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"}
        destructive={confirm?.destructive}
        pending={pending}
        onConfirm={() => confirm && run(confirm.run, "Updated {n} applications")}
      />

      {/* Save current filters as a view */}
      <Dialog.Root open={saveOpen} onOpenChange={setSaveOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-100 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-5 shadow-2xl">
            <Dialog.Title className="text-sm">Save this view</Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-muted-foreground">
              Saves the filters and sort you have now, for every organizer.
            </Dialog.Description>
            <input
              value={viewName}
              onChange={(event) => setViewName(event.target.value)}
              placeholder="e.g. Hardware track, needs travel"
              className="mt-4 w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none focus:border-[var(--ring)]/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                size="sm"
                disabled={!viewName.trim() || pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await saveView(viewName, currentQuery);
                    if (result.ok) {
                      toast(`Saved “${viewName.trim()}”`);
                      setSaveOpen(false);
                      setViewName("");
                      router.refresh();
                    } else {
                      toast(result.message ?? "Could not save that view.", "error");
                    }
                  })
                }
              >
                Save view
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function setPage(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(Math.max(1, page)));
  return next;
}

/** Compares two query strings ignoring order and paging, for view highlighting. */
function normalize(query: string) {
  const params = new URLSearchParams(query);
  params.delete("page");
  params.delete("per");
  const entries = Array.from(params.entries()).sort(([a, b], [c, d]) =>
    a === c ? b.localeCompare(d) : a.localeCompare(c)
  );
  return entries.map(([key, value]) => `${key}=${value}`).join("&");
}
