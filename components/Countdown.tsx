"use client";

import { Fragment, useSyncExternalStore } from "react";

/** Applications close Oct 5, 2026 at 11:59 PM Pacific (PDT). */
const DEADLINE_SECONDS = Date.parse("2026-10-05T23:59:00-07:00") / 1000;

// One shared 1s clock. The server snapshot is null so the markup hydrates
// cleanly, then the client swaps in the live time on its first render.
function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const getNowSeconds = () => Math.floor(Date.now() / 1000);
const getServerNowSeconds = () => null;

/**
 * A two-digit number that rolls vertically to its next value, like a
 * mechanical counter. Each strip holds every value up to `max`.
 */
function RollingNumber({ value, max }: { value: number; max: number }) {
  return (
    <span aria-hidden className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15] tabular-nums">
      <span
        className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(${-1.15 * value}em)` }}
      >
        {Array.from({ length: max + 1 }, (_, n) => (
          <span key={n} className="block h-[1.15em] text-center">
            {String(n).padStart(2, "0")}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Countdown to the application deadline. Renders nothing once it passes. */
export default function Countdown() {
  const now = useSyncExternalStore(subscribe, getNowSeconds, getServerNowSeconds);
  const remaining = now === null ? null : Math.max(0, DEADLINE_SECONDS - now);
  if (remaining === 0) return null;

  const r = remaining ?? 0;
  const units = [
    { label: "days", value: Math.min(99, Math.floor(r / 86400)), max: 99 },
    { label: "hours", value: Math.floor((r % 86400) / 3600), max: 23 },
    { label: "min", value: Math.floor((r % 3600) / 60), max: 59 },
    { label: "sec", value: r % 60, max: 59 },
  ];
  const spoken = `${units[0].value} days, ${units[1].value} hours, ${units[2].value} minutes until applications close`;

  return (
    <div
      role="timer"
      aria-label={remaining === null ? "time until applications close" : spoken}
      className={`inline-flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm transition-opacity duration-500 sm:px-6 ${remaining === null ? "opacity-0" : "opacity-100"}`}
    >
      <p className="text-sm text-white/60">Applications close in</p>
      <div className="flex items-start gap-2 sm:gap-4">
        {units.map((unit, i) => (
          <Fragment key={unit.label}>
            {i > 0 && (
              <span aria-hidden className="font-header text-3xl leading-[1.15] text-white/25 sm:text-4xl md:text-5xl">
                :
              </span>
            )}
            <div className="flex flex-col items-center">
              <span className="font-header text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl">
                <RollingNumber value={unit.value} max={unit.max} />
              </span>
              <span className="mt-1 text-xs text-white/50">{unit.label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
