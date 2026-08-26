"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatNumber, formatShortDate } from "@/lib/admin/format";
import type { TimePoint } from "@/lib/admin/types";

/**
 * Applications over time.
 *
 * Three shapes of the same data: daily (what happened), weekly (the trend
 * without weekend noise), and cumulative (how close the total is to where it
 * needs to be). Switching between them is local state — the data for all three
 * is already here, so a round trip to change the shape would be a round trip
 * for nothing. Changing the *range* does go back to the server, because that
 * genuinely needs different rows.
 */

type Mode = "daily" | "weekly" | "cumulative";

const SERIES = [
  { key: "submitted", label: "Submitted", color: "#fbbf24" },
  { key: "started", label: "Started", color: "#64748b" },
  { key: "accepted", label: "Accepted", color: "#34d399" },
  { key: "confirmed", label: "Confirmed", color: "#38bdf8" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

export default function TrendChart({ points }: { points: TimePoint[] }) {
  const [mode, setMode] = useState<Mode>("daily");
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set(["accepted", "confirmed"]));
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => shape(points, mode), [points, mode]);
  const visible = SERIES.filter((s) => !hidden.has(s.key));

  const max = Math.max(
    1,
    ...data.flatMap((row) => visible.map((s) => row[s.key] as number))
  );

  const width = 720;
  const height = 200;
  const padding = { top: 12, right: 8, bottom: 20, left: 34 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const x = (index: number) =>
    padding.left + (data.length <= 1 ? plotW / 2 : (index / (data.length - 1)) * plotW);
  const y = (value: number) => padding.top + plotH - (value / max) * plotH;

  const ticks = [0, 0.5, 1].map((fraction) => Math.round(max * fraction));
  const hovered = hover != null ? data[hover] : null;

  const toggle = (key: SeriesKey) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          {(["daily", "weekly", "cumulative"] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "rounded-md px-2 py-1 text-xs capitalize transition-colors",
                mode === option
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SERIES.map((series) => (
            <button
              key={series.key}
              type="button"
              onClick={() => toggle(series.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-opacity",
                hidden.has(series.key) ? "opacity-40" : "opacity-100"
              )}
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: series.color }}
              />
              {series.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Applications over time"
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y(tick) + 3}
                textAnchor="end"
                className="fill-[var(--muted-foreground)] text-[9px]"
              >
                {tick}
              </text>
            </g>
          ))}

          {visible.map((series) => {
            const line = data
              .map((row, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(row[series.key] as number)}`)
              .join(" ");
            const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
            return (
              <g key={series.key}>
                {series.key === "submitted" && (
                  <path d={area} fill={series.color} opacity="0.08" />
                )}
                <path
                  d={line}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {hover != null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padding.top}
              y2={padding.top + plotH}
              stroke="var(--ring)"
              strokeWidth="1"
              opacity="0.5"
            />
          )}

          {/* One invisible column per point: a hover target that doesn't depend
              on landing exactly on a 2px line. */}
          {data.map((row, index) => (
            <rect
              key={row.day}
              x={x(index) - plotW / Math.max(data.length, 1) / 2}
              y={padding.top}
              width={plotW / Math.max(data.length, 1)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
            />
          ))}

          {data.map((row, index) =>
            index % Math.ceil(data.length / 8) === 0 ? (
              <text
                key={`label-${row.day}`}
                x={x(index)}
                y={height - 6}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)] text-[9px]"
              >
                {formatShortDate(`${row.day}T12:00:00`)}
              </text>
            ) : null
          )}
        </svg>

        {hovered && (
          <div className="pointer-events-none absolute top-0 right-0 rounded-lg border border-border bg-popover/95 px-2.5 py-2 text-xs shadow-lg">
            <div className="text-muted-foreground">
              {formatShortDate(`${hovered.day}T12:00:00`)}
            </div>
            <div className="mt-1 space-y-0.5">
              {visible.map((series) => (
                <div key={series.key} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: series.color }}
                  />
                  <span className="text-muted-foreground">{series.label}</span>
                  <span className="ml-auto tabular-nums">
                    {formatNumber(hovered[series.key] as number)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Daily rows into weekly sums or a running total, depending on the mode. */
function shape(points: TimePoint[], mode: Mode): TimePoint[] {
  if (mode === "daily") return points;

  if (mode === "cumulative") {
    const running = { started: 0, submitted: 0, accepted: 0, confirmed: 0 };
    return points.map((point) => {
      running.started += point.started;
      running.submitted += point.submitted;
      running.accepted += point.accepted;
      running.confirmed += point.confirmed;
      return { day: point.day, ...running };
    });
  }

  const weeks: TimePoint[] = [];
  for (let i = 0; i < points.length; i += 7) {
    const slice = points.slice(i, i + 7);
    weeks.push({
      day: slice[0].day,
      started: sum(slice, "started"),
      submitted: sum(slice, "submitted"),
      accepted: sum(slice, "accepted"),
      confirmed: sum(slice, "confirmed"),
    });
  }
  return weeks;
}

function sum(points: TimePoint[], key: keyof Omit<TimePoint, "day">) {
  return points.reduce((total, point) => total + (point[key] as number), 0);
}
