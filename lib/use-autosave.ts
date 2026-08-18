"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clearDraft, snapshotForm, writeDraft } from "./form-draft";

/** How long the typing has to stop before the row is written. */
const QUIET_MS = 800;

export type SaveStatus = "idle" | "saving" | "saved";

interface Options {
  form: React.RefObject<HTMLFormElement | null>;
  /** localStorage key for the browser-side copy. */
  storageKey: string;
  /** Server action that upserts the partial row. */
  save: (formData: FormData) => Promise<{ ok: boolean }>;
  /** Held back until the reader has actually answered something. */
  enabled?: boolean;
}

/**
 * Autosave for the multi-step forms.
 *
 * Two speeds, because they protect against different things. The browser copy
 * is written on every change — it costs nothing and covers a tab that dies
 * mid-sentence. The row is written once the typing stops, so a four-step form
 * costs a handful of requests instead of one per keystroke.
 *
 * `flush` forces the pending write immediately; the forms call it on a step
 * change, where the reader has visibly finished with a section.
 */
export function useAutosave({ form, storageKey, save, enabled = true }: Options) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  // Ignores the response of a write that a newer one has already superseded,
  // so an out-of-order reply can't flash "saved" over a live "saving".
  const generation = useRef(0);

  const write = useCallback(async () => {
    if (!form.current || !pending.current) return;
    pending.current = false;

    const mine = ++generation.current;
    setStatus("saving");
    const { ok } = await save(new FormData(form.current));
    if (mine !== generation.current) return;
    // A failure leaves the indicator alone rather than claiming a save that
    // didn't happen — the browser copy still holds the answers either way.
    setStatus(ok ? "saved" : "idle");
  }, [form, save]);

  /**
   * Call on every change: stores locally, schedules the row write.
   *
   * Both reads of the form are deferred past the current render. Radix's
   * radios and checkboxes post through hidden inputs React owns, and those
   * only carry the new value after the re-render their handler triggers —
   * reading during the handler would snapshot the previous answer.
   *
   * A zero timer rather than `requestAnimationFrame`: frames stop entirely in
   * a background tab, so a phone that gets switched away from mid-answer would
   * take the snapshot only once the reader came back. Timers are throttled
   * there but still run.
   */
  const touch = useCallback(() => {
    if (!enabled) return;
    pending.current = true;
    setTimeout(() => writeDraft(storageKey, snapshotForm(form.current)), 0);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(write, QUIET_MS);
  }, [enabled, form, storageKey, write]);

  const flush = useCallback(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    setTimeout(() => void write(), 0);
  }, [enabled, write]);

  /** On a finished submit the draft has served its purpose. */
  const done = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = false;
    // Bumped so a write still in flight can't resurrect the indicator.
    generation.current++;
    clearDraft(storageKey);
  }, [storageKey]);

  // A tab closing or backgrounding gets one last synchronous local write.
  // `visibilitychange` rather than `unload`, which mobile browsers skip.
  useEffect(() => {
    if (!enabled) return;
    const stash = () => {
      if (pending.current) writeDraft(storageKey, snapshotForm(form.current));
    };
    document.addEventListener("visibilitychange", stash);
    window.addEventListener("pagehide", stash);
    return () => {
      document.removeEventListener("visibilitychange", stash);
      window.removeEventListener("pagehide", stash);
    };
  }, [enabled, form, storageKey]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return { status, touch, flush, done };
}
