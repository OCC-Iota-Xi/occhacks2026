import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import type { Bucket } from "@/lib/admin/types";

/**
 * Charts, drawn by hand in SVG.
 *
 * No charting library: the four shapes this dashboard needs — a ranked bar
 * list, a donut, a funnel, a trend line — are a few dozen lines of SVG each,
 * and pulling in a runtime for them would ship a client bundle to render what
 * the server already knows. Everything here except the trend chart renders on
 * the server with no JavaScript at all.
 *
 * Each chart takes an optional `hrefFor`, and when it's given every segment
 * becomes a link into the applicant list with that filter applied. A chart you
 * can't act on is decoration.
 */

const SERIES_COLORS = ["#fbbf24", "#38bdf8", "#a78bfa", "#34d399", "#fb7185", "#94a3b8"];

export function BarList({
  items,
  limit = 8,
  hrefFor,
  emptyLabel = "Nothing to show yet",
  groupOther = true,
}: {
  items: Bucket[];
  limit?: number;
  hrefFor?: (label: string) => string | null;
  emptyLabel?: string;
  groupOther?: boolean;
}) {
  if (!items.length) {
    return <p className="px-4 py-6 text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  const shown = items.slice(0, limit);
  const rest = items.slice(limit);
  const otherCount = rest.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(...shown.map((item) => item.count), otherCount, 1);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const rows = [
    ...shown,
    ...(groupOther && otherCount
      ? [{ label: `Other (${rest.length} more)`, count: otherCount }]
      : []),
  ];

  return (
    <ul className="divide-y divide-border/60">
      {rows.map((item, index) => {
        const href = index < shown.length ? hrefFor?.(item.label) : null;
        const inner = (
          <>
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 bg-[var(--ring)]/12 transition-[width]"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
            <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
            <span className="relative tabular-nums text-muted-foreground">
              {formatPercent(item.count, total)}
            </span>
            <span className="relative w-10 text-right tabular-nums text-foreground">
              {formatNumber(item.count)}
            </span>
          </>
        );

        const className =
          "relative flex items-center gap-3 overflow-hidden px-4 py-2 text-xs";

        return (
          <li key={`${item.label}-${index}`}>
            {href ? (
              <Link href={href} className={cn(className, "hover:bg-accent/40")}>
                {inner}
              </Link>
            ) : (
              <div className={className}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A donut with the total in the middle. Sized in a viewBox so it scales with
 * the panel rather than to a fixed pixel width.
 */
export function Donut({
  items,
  hrefFor,
  centerLabel,
}: {
  items: Bucket[];
  hrefFor?: (label: string) => string | null;
  centerLabel?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (!total) {
    return <p className="px-4 py-6 text-xs text-muted-foreground">Nothing to show yet</p>;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  // Each arc's start is the sum of the ones before it, worked out up front so
  // the render itself stays a pure map over the data.
  const arcs = items.reduce<{ item: Bucket; dash: number; offset: number }[]>(
    (acc, item) => {
      const dash = (item.count / total) * circumference;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
      return [...acc, { item, dash, offset }];
    },
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-5 px-4 py-4">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90">
        {arcs.map(({ item, dash, offset }, index) => (
          <circle
            key={item.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            opacity={0.85}
          >
            <title>{`${item.label}: ${item.count}`}</title>
          </circle>
        ))}
        <circle cx="50" cy="50" r={radius - 8} fill="var(--card)" />
      </svg>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {items.map((item, index) => {
          const href = hrefFor?.(item.label);
          const row = (
            <>
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatPercent(item.count, total)}
              </span>
              <span className="w-8 text-right tabular-nums">{formatNumber(item.count)}</span>
            </>
          );
          return (
            <li key={item.label} className="text-xs">
              {href ? (
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-accent/40"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-1 py-0.5">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
      {centerLabel && <span className="sr-only">{centerLabel}</span>}
    </div>
  );
}

export interface FunnelStage {
  label: string;
  count: number;
  href?: string;
  /** Why this stage is missing, when the data can't answer it yet. */
  note?: string;
}

/**
 * The application funnel. Each bar is drawn against the first stage, and the
 * percentage next to it is the conversion from the stage above — the two
 * numbers organizers actually compare.
 */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.count || 1;

  return (
    <ol className="space-y-1.5 px-4 py-4">
      {stages.map((stage, index) => {
        const previous = index === 0 ? null : stages[index - 1].count;
        const conversion =
          previous == null ? null : previous === 0 ? null : (stage.count / previous) * 100;
        const width = Math.max((stage.count / top) * 100, stage.count ? 4 : 0);

        const body = (
          <div className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-border/60 px-3 py-2">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 bg-[var(--ring)]/15"
              style={{ width: `${width}%` }}
            />
            <span className="relative w-28 shrink-0 truncate text-xs text-muted-foreground">
              {stage.label}
            </span>
            <span className="relative flex-1 text-sm tabular-nums text-foreground">
              {formatNumber(stage.count)}
            </span>
            <span className="relative text-xs tabular-nums text-muted-foreground">
              {conversion == null ? "" : `${conversion.toFixed(0)}%`}
            </span>
          </div>
        );

        return (
          <li key={stage.label}>
            {stage.href ? (
              <Link href={stage.href} className="block hover:opacity-90">
                {body}
              </Link>
            ) : (
              body
            )}
            {stage.note && (
              <p className="px-3 pt-1 text-[11px] text-muted-foreground">{stage.note}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** A bare trend line, for the corner of a KPI card. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 24 - (value / max) * 22;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className={cn("h-6 w-full", className)}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--ring)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export { SERIES_COLORS };
