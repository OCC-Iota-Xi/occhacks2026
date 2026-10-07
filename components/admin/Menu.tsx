"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The filter menus.
 *
 * One component for all of them, because they only differ in what they list:
 * a searchable checkbox list in a popover, with the count of active choices on
 * the trigger. Selections are applied immediately rather than behind an "apply"
 * button — the list re-fetches on the server, and an extra click per filter is
 * the difference between exploring and filling in a form.
 */

export interface MenuOption {
  value: string;
  label: string;
  hint?: string;
}

export function FilterMenu({
  label,
  options,
  selected,
  onToggle,
  onClear,
  searchable,
  align = "start",
  width = "w-64",
}: {
  label: string;
  options: MenuOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
  searchable?: boolean;
  align?: "start" | "end";
  width?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs whitespace-nowrap transition-colors",
          selected.length
            ? "border-[var(--ring)]/40 bg-accent/50 text-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="tabular-nums text-[var(--ring)]">{selected.length}</span>
        )}
        <ChevronDown className="size-3" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          className={cn(
            "z-100 overflow-hidden rounded-lg border border-border bg-popover shadow-xl",
            width
          )}
        >
          <OptionList
            options={options}
            selected={selected}
            onToggle={onToggle}
            searchable={searchable}
          />

          {onClear && selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="w-full border-t border-border px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * The checkbox list inside a filter menu, on its own so a column header's menu
 * and the Filters panel can show the same choices the same way.
 */
export function OptionList({
  options,
  selected,
  onToggle,
  searchable,
}: {
  options: MenuOption[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}) {
  const [term, setTerm] = useState("");
  const needle = term.trim().toLowerCase();
  const shown = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;

  return (
    <>
      {searchable && (
        <div className="flex items-center gap-2 border-b border-border px-2.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Filter…"
            className="w-full bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      <ul className="scroll-soft max-h-64 overflow-y-auto py-1">
        {shown.map((option) => {
          const active = selected.includes(option.value);
          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onToggle(option.value)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-accent/50"
              >
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border",
                    active ? "border-foreground bg-foreground text-background" : "border-border"
                  )}
                >
                  {active && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.hint && (
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {option.hint}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {!shown.length && (
          <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">
            Nothing matches
          </li>
        )}
      </ul>
    </>
  );
}

/**
 * One choice out of two or three, as a row of buttons. A checkbox list that
 * silently unticks its neighbour reads as a bug; pressing the lit one again
 * clears it.
 */
export function Segmented({
  options,
  value,
  onSelect,
}: {
  options: MenuOption[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 px-2.5 py-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "flex-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap transition-colors",
            value === option.value
              ? "border-[var(--ring)]/50 bg-accent/60 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A from–to pair. Keyed on the value so a chip removed, or Clear all, empties
 * the box: an uncontrolled input would otherwise go on showing a bound that is
 * no longer applied.
 */
export function RangeFields({
  type,
  min,
  max,
  onChange,
  step,
  lo,
  hi,
}: {
  type: "number" | "date";
  min: { param: string; value: string };
  max: { param: string; value: string };
  onChange: (param: string, value: string) => void;
  step?: string;
  lo?: number;
  hi?: number;
}) {
  const field = (bound: { param: string; value: string }, placeholder: string) => (
    <input
      key={`${bound.param}:${bound.value}`}
      type={type}
      min={lo}
      max={hi}
      step={step}
      defaultValue={bound.value}
      placeholder={placeholder}
      aria-label={placeholder}
      // A number commits when the typing stops being typing; a date picker
      // only ever reports whole dates.
      onChange={
        type === "date" ? (event) => onChange(bound.param, event.target.value) : undefined
      }
      onBlur={
        type === "number"
          ? (event) => {
              if (event.target.value !== bound.value) onChange(bound.param, event.target.value);
            }
          : undefined
      }
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className={cn(
        "h-7 min-w-0 rounded-md border border-border bg-transparent px-2 text-xs text-foreground outline-none focus:border-[var(--ring)]/50",
        type === "number" ? "w-16" : "flex-1"
      )}
    />
  );

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-muted-foreground">
      {field(min, type === "number" ? "min" : "from")}
      <span>–</span>
      {field(max, type === "number" ? "max" : "to")}
    </div>
  );
}

/** A plain menu of actions — no selection state, one click each. */
export function ActionMenu({
  trigger,
  children,
  align = "end",
  width = "w-56",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  width?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          className={cn(
            "z-100 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-xl",
            width
          )}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function MenuItem({
  onSelect,
  children,
  destructive,
  disabled,
}: {
  onSelect: () => void;
  children: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Popover.Close asChild>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent/50 disabled:opacity-40",
          destructive ? "text-rose-300" : "text-foreground"
        )}
      >
        {children}
      </button>
    </Popover.Close>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pt-2 pb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  );
}
