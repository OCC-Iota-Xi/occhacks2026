"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog } from "radix-ui";
import { quickSearch, type QuickHit } from "@/lib/admin/actions";
import { STATUS_LABEL, type Status } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * ⌘K / Ctrl-K: find an applicant from anywhere in the dashboard.
 *
 * The search runs on the server through the same RLS-guarded view as the list —
 * there's no client-side copy of the roster to search, which is both faster on
 * a large table and one less place applicant details can end up.
 */
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<QuickHit[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced, so typing a name is one query rather than one per keystroke.
  useEffect(() => {
    if (!open) return;
    const needle = term.trim();
    const timer = setTimeout(() => {
      if (needle.length < 2) {
        setHits([]);
        return;
      }
      startTransition(async () => {
        setHits(await quickSearch(needle));
        setActive(0);
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [term, open]);

  const go = (hit: QuickHit) => {
    setOpen(false);
    setTerm("");
    router.push(`/admin/applicants/${hit.id}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:border-[var(--ring)]/40 hover:text-foreground"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search applicants</span>
        <kbd className="hidden rounded border border-border px-1 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs" />
          <Dialog.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
            }}
            className="fixed top-24 left-1/2 z-100 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            <Dialog.Title className="sr-only">Search applicants</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search by name, email, school, or OCC student ID.
            </Dialog.Description>

            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((i) => Math.min(i + 1, hits.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (event.key === "Enter" && hits[active]) {
                    event.preventDefault();
                    go(hits[active]);
                  }
                }}
                placeholder="Name, email, school, or student ID"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              {pending && <span className="text-xs text-muted-foreground">…</span>}
            </div>

            <ul className="max-h-80 overflow-y-auto py-1">
              {hits.map((hit, index) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                      index === active ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {hit.full_name || "Unnamed applicant"}
                      <span className="ml-2 text-xs text-muted-foreground">{hit.email}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {STATUS_LABEL[hit.status as Status] ?? hit.status}
                    </span>
                  </button>
                </li>
              ))}
              {!hits.length && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                  {term.trim().length < 2
                    ? "Type at least two characters"
                    : pending
                      ? "Searching…"
                      : "No applicants match"}
                </li>
              )}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
