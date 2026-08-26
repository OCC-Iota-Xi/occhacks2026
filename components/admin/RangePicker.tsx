"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All time", value: "all" },
];

/**
 * The dashboard's date range. Written to the URL rather than to component
 * state, so a range someone is looking at is a link they can send.
 */
export default function RangePicker({ basePath = "/admin" }: { basePath?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("days") ?? "30";
  const [custom, setCustom] = useState({
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  });
  const [open, setOpen] = useState(Boolean(params.get("from") && params.get("to")));

  const go = (next: URLSearchParams) => router.push(`${basePath}?${next.toString()}`);

  const pick = (value: string) => {
    const next = new URLSearchParams(params);
    next.set("days", value);
    next.delete("from");
    next.delete("to");
    setOpen(false);
    go(next);
  };

  const applyCustom = () => {
    if (!custom.from || !custom.to) return;
    const next = new URLSearchParams(params);
    next.delete("days");
    next.set("from", custom.from);
    next.set("to", custom.to);
    go(next);
  };

  const customActive = Boolean(params.get("from") && params.get("to"));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-0.5 rounded-lg border border-border p-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => pick(preset.value)}
            className={cn(
              "rounded-md px-2 py-1 text-xs transition-colors",
              !customActive && current === preset.value
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "rounded-md px-2 py-1 text-xs transition-colors",
            customActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Custom
        </button>
      </div>

      {open && (
        <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1">
          <input
            type="date"
            value={custom.from}
            onChange={(event) => setCustom({ ...custom, from: event.target.value })}
            className="bg-transparent text-xs outline-none"
          />
          <span className="text-xs text-muted-foreground">→</span>
          <input
            type="date"
            value={custom.to}
            onChange={(event) => setCustom({ ...custom, to: event.target.value })}
            className="bg-transparent text-xs outline-none"
          />
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-md bg-accent px-1.5 py-0.5 text-xs text-accent-foreground"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
