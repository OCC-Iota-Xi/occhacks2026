"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, Check } from "lucide-react";
import { COLUMNS, rowFlags, type ColumnDef } from "@/components/admin/applicants/columns";
import { AttendanceBadge, Score, StatusBadge, TagPill } from "@/components/admin/ui";
import { displayName, formatDate, initials } from "@/lib/admin/format";
import type { ApplicantFilters } from "@/lib/admin/filters";
import type { Applicant } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * The applicant table.
 *
 * A plain `<table>` with a sticky header rather than a virtualized grid: the
 * page size is bounded (25–200 rows) because the filtering and paging happen in
 * Postgres, so there is never a ten-thousand-row DOM to virtualize. Sorting is
 * a link, not a click handler, for the same reason the filters are — the server
 * does the ordering, and the URL says what you're looking at.
 */
export default function ApplicantTable({
  rows,
  filters,
  visible,
  selected,
  onToggleRow,
  onToggleAll,
  onSort,
  backQuery,
}: {
  rows: Applicant[];
  filters: ApplicantFilters;
  visible: string[];
  selected: Set<string>;
  onToggleRow: (id: string, shiftKey: boolean, index: number) => void;
  onToggleAll: () => void;
  onSort: (column: ColumnDef) => void;
  backQuery: string;
}) {
  const router = useRouter();
  const columns = COLUMNS.filter((column) => visible.includes(column.key));
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  return (
    <div className="scroll-soft overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        {/* Sticks below the admin header, which is 53px tall — the table can
            be a thousand rows and the column names should never leave. */}
        <thead className="sticky top-[53px] z-20 bg-background/95 backdrop-blur">
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="w-9 px-3 py-2">
              <button
                type="button"
                onClick={onToggleAll}
                aria-label={allSelected ? "Clear selection" : "Select every row on this page"}
                className={cn(
                  "flex size-4 items-center justify-center rounded-[4px] border transition-colors",
                  allSelected ? "border-foreground bg-foreground text-background" : "border-border"
                )}
              >
                {allSelected && <Check className="size-3" strokeWidth={3} />}
              </button>
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-3 py-2 text-left font-normal whitespace-nowrap",
                  column.align === "right" && "text-right"
                )}
              >
                {column.sort ? (
                  <button
                    type="button"
                    onClick={() => onSort(column)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {column.label}
                    {filters.sort === column.sort &&
                      (filters.dir === "asc" ? (
                        <ArrowUp className="size-3 text-[var(--ring)]" />
                      ) : (
                        <ArrowDown className="size-3 text-[var(--ring)]" />
                      ))}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border/60">
          {rows.map((applicant, index) => {
            const flags = rowFlags(applicant);
            const isSelected = selected.has(applicant.id);
            return (
              <tr
                key={applicant.id}
                onClick={(event) => {
                  // Cmd/Ctrl-click opens in a new tab, as a link would.
                  if (event.metaKey || event.ctrlKey) {
                    window.open(`/admin/applicants/${applicant.id}`, "_blank");
                    return;
                  }
                  router.push(`/admin/applicants/${applicant.id}${backQuery}`);
                }}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected ? "bg-accent/40" : "hover:bg-accent/25"
                )}
              >
                <td
                  className="px-3 py-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleRow(applicant.id, event.shiftKey, index);
                  }}
                >
                  <span
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`Select ${displayName(applicant)}`}
                    className={cn(
                      "flex size-4 items-center justify-center rounded-[4px] border transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    )}
                  >
                    {isSelected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </td>

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 py-2 align-middle",
                      column.align === "right" && "text-right"
                    )}
                  >
                    <Cell column={column.key} applicant={applicant} flags={flags} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({
  column,
  applicant,
  flags,
}: {
  column: string;
  applicant: Applicant;
  flags: string[];
}) {
  const muted = "text-xs text-muted-foreground";

  switch (column) {
    case "applicant":
      return (
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
            {initials(applicant.full_name, "?")}
          </span>
          <Link
            href={`/admin/applicants/${applicant.id}`}
            onClick={(event) => event.stopPropagation()}
            className="truncate hover:text-[var(--ring)]"
          >
            {displayName(applicant)}
          </Link>
          {flags.length > 0 && (
            <span title={flags.join(" · ")}>
              <AlertTriangle className="size-3.5 shrink-0 text-amber-400/80" />
            </span>
          )}
        </div>
      );
    case "email":
      return <span className={cn(muted, "truncate")}>{applicant.email ?? "—"}</span>;
    case "school":
      return <span className="truncate text-xs">{applicant.school ?? "—"}</span>;
    case "major":
      return <span className="truncate text-xs">{applicant.major ?? "—"}</span>;
    case "status":
      return <StatusBadge status={applicant.status} />;
    case "attendance":
      return <AttendanceBadge attendance={applicant.attendance} />;
    case "score":
      return <Score value={applicant.avg_score} />;
    case "reviews":
      return <span className="text-xs tabular-nums">{applicant.review_count || "—"}</span>;
    case "tags":
      return applicant.tags.length ? (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {applicant.tags.slice(0, 2).map((tag) => (
            <TagPill key={tag} name={tag} />
          ))}
          {applicant.tags.length > 2 && (
            <span className={muted}>+{applicant.tags.length - 2}</span>
          )}
        </div>
      ) : (
        <span className={muted}>—</span>
      );
    case "reviewer":
      return (
        <span className={cn("truncate text-xs", !applicant.assigned_to && "text-muted-foreground")}>
          {applicant.assigned_name ?? applicant.assigned_email ?? "Unassigned"}
        </span>
      );
    case "track":
      return <span className="text-xs capitalize">{applicant.first_choice_track ?? "—"}</span>;
    case "shirt":
      return <span className="text-xs uppercase">{applicant.shirt ?? "—"}</span>;
    case "age":
      return <span className="text-xs tabular-nums">{applicant.age ?? "—"}</span>;
    case "classes":
      return (
        <span className={cn(muted, "truncate")}>
          {applicant.classes?.length ? applicant.classes.join(", ") : "—"}
        </span>
      );
    case "needs":
      return (
        <span className={cn(muted, "line-clamp-1 max-w-[240px]")}>{applicant.needs ?? "—"}</span>
      );
    case "checked_in":
      return applicant.checked_in ? (
        <span className="text-xs text-emerald-300">{formatDate(applicant.checked_in_at)}</span>
      ) : (
        <span className={muted}>—</span>
      );
    case "submitted":
      return (
        <span className={cn(muted, "whitespace-nowrap")}>
          {applicant.completed_at ? formatDate(applicant.completed_at) : "Draft"}
        </span>
      );
    case "started":
      return (
        <span className={cn(muted, "whitespace-nowrap")}>{formatDate(applicant.created_at)}</span>
      );
    default:
      return null;
  }
}
