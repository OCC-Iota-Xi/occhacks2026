"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { OptionGroup } from "@/lib/school-options";

interface ComboboxProps {
  /** Form field name — the visible input posts its text directly. */
  name: string;
  groups: OptionGroup[];
  placeholder: string;
  defaultValue?: string;
  invalid?: boolean;
  id?: string;
  /**
   * Fired when a value is picked from the list. Typing already reaches the
   * form's own `onChange` through the visible input, but choosing an option
   * only moves React state — no native event, so nothing bubbles.
   */
  onCommit?: () => void;
}

/** Flattened matches, keeping the group headings that still have hits. */
function match(groups: OptionGroup[], query: string) {
  const needle = query.trim().toLowerCase();
  const rows: { group: string; options: string[] }[] = [];
  for (const group of groups) {
    const options = needle
      ? group.options.filter((option) => option.toLowerCase().includes(needle))
      : group.options;
    if (options.length) rows.push({ group: group.label, options });
  }
  return rows;
}

/**
 * Type-to-search picker: the list drops below the field and narrows as you
 * type. Anything not in the list is still allowed — whatever's typed is what
 * gets saved, so "other" needs no separate box.
 */
export default function Combobox({
  name,
  groups,
  placeholder,
  defaultValue = "",
  invalid,
  onCommit,
  id,
}: ComboboxProps) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Drives the scrollbar fade — true only while the list is actually moving.
  const [scrolling, setScrolling] = useState(false);

  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  function onScroll() {
    setScrolling(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setScrolling(false), 700);
  }

  const rows = useMemo(() => match(groups, query), [groups, query]);
  const flat = useMemo(() => rows.flatMap((row) => row.options), [rows]);
  // Exact hit means the box already holds a real option — nothing to add.
  const exact = flat.some((option) => option.toLowerCase() === query.trim().toLowerCase());
  const custom = !!query.trim() && !exact;

  // Clicking anywhere else commits what's typed and closes the list.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function commit(value: string) {
    setQuery(value);
    setOpen(false);
    setActive(0);
    onCommit?.();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((prev) => (prev + step + flat.length) % Math.max(flat.length, 1));
      return;
    }
    if (event.key === "Enter" && open && flat.length) {
      // The form treats Enter as "next step" — not while a list is open.
      event.preventDefault();
      event.stopPropagation();
      commit(flat[active]);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        id={id ?? name}
        name={name}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        required
      />

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          onScroll={onScroll}
          className={`scroll-soft absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-background py-1 text-left shadow-lg ${
            scrolling ? "is-scrolling" : ""
          }`}
        >
          {rows.map((row) => (
            <li key={row.group}>
              <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-muted-foreground/60">
                {row.group}
              </p>
              <ul>
                {row.options.map((option) => {
                  const index = flat.indexOf(option);
                  return (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={option === query}
                        data-index={index}
                        // Mouse-down would blur the input before the click lands.
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => commit(option)}
                        onMouseEnter={() => setActive(index)}
                        className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                          index === active
                            ? "bg-foreground/10 text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {custom && (
            <li className="border-t border-border px-3 py-2 text-sm text-muted-foreground/70">
              not on the list? we&apos;ll save{" "}
              <span className="text-foreground">{query.trim()}</span> as typed.
            </li>
          )}

          {!flat.length && !custom && (
            <li className="px-3 py-2 text-sm text-muted-foreground/70">start typing to search…</li>
          )}
        </ul>
      )}
    </div>
  );
}
