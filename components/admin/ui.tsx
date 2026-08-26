import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/admin/format";
import {
  ATTENDANCE_LABEL,
  STATUS_LABEL,
  type Attendance,
  type Status,
  type TagColor,
} from "@/lib/admin/types";

/**
 * The organizer dashboard's building blocks.
 *
 * Gold stays the accent — active navigation, the focused control, the one
 * number a card is about — as it is everywhere else on the site. The status
 * colours are the exception, and they earn it: "accepted" and "rejected" have
 * to be distinguishable at a glance in a table of two hundred rows, and a gold
 * badge for both would make that a reading exercise. They're kept desaturated
 * so a screen of them still reads as one surface.
 */

export function Panel({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-xl border border-border bg-card/40", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * A KPI. The comparison line is omitted rather than shown as "—" when there's
 * no previous period to compare against: an empty change is noise, and the
 * first week of applications has nothing behind it.
 */
export function StatCard({
  label,
  value,
  hint,
  change,
  href,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  change?: number | null;
  href?: string;
  emphasis?: boolean;
}) {
  const arrow = formatDelta(change ?? null);
  const body = (
    <>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1.5 text-2xl tabular-nums tracking-tight",
          emphasis ? "text-[var(--ring)]" : "text-foreground"
        )}
      >
        {value}
      </div>
      {(arrow || hint) && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {arrow && (
            <span
              className={cn(
                change && change > 0
                  ? "text-emerald-400/90"
                  : change && change < 0
                    ? "text-rose-400/90"
                    : "text-muted-foreground"
              )}
            >
              {arrow}
            </span>
          )}
          {hint && <span className="truncate text-muted-foreground">{hint}</span>}
        </div>
      )}
    </>
  );

  const className = cn(
    "block rounded-xl border border-border bg-card/40 px-4 py-3 transition-colors",
    href && "hover:border-[var(--ring)]/40 hover:bg-accent/40"
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  draft: "border-border bg-muted/60 text-muted-foreground",
  submitted: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  in_review: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  accepted: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  waitlisted: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  rejected: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  withdrawn: "border-border bg-muted/60 text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap",
        STATUS_STYLE[status] ?? STATUS_STYLE.draft,
        className
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

const ATTENDANCE_STYLE: Record<Attendance, string> = {
  pending: "border-border bg-muted/60 text-muted-foreground",
  confirmed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  declined: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export function AttendanceBadge({ attendance }: { attendance: Attendance }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap",
        ATTENDANCE_STYLE[attendance] ?? ATTENDANCE_STYLE.pending
      )}
    >
      {ATTENDANCE_LABEL[attendance] ?? attendance}
    </span>
  );
}

const TAG_STYLE: Record<TagColor, string> = {
  gold: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  slate: "border-border bg-muted/60 text-muted-foreground",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export function TagPill({
  name,
  color = "slate",
  onRemove,
  className,
}: {
  name: string;
  color?: TagColor;
  onRemove?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap",
        TAG_STYLE[color] ?? TAG_STYLE.slate,
        className
      )}
    >
      {name}
      {onRemove}
    </span>
  );
}

export function Score({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "tabular-nums",
        value >= 4 ? "text-[var(--ring)]" : value >= 3 ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {Number(value).toFixed(2)}
    </span>
  );
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

/** A labelled value inside a profile section. Long answers wrap; empty reads "—". */
export function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const empty = children == null || children === "" || children === false;
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-foreground">
        {empty ? <span className="text-muted-foreground">—</span> : children}
      </dd>
    </div>
  );
}
