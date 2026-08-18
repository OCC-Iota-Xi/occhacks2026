"use client";

/**
 * Browser-side half of the forms' autosave.
 *
 * The database holds the real draft — it survives a new device, a cleared
 * cache, a different browser. This layer sits in front of it for the gap the
 * server can't cover: the second between a keystroke and the debounced write.
 * A tab that dies in that window still comes back with everything typed.
 *
 * Everything here is best-effort. localStorage throws in private mode and when
 * the origin's quota is full, and a draft is a convenience, never the record —
 * so every entry point swallows its own failure rather than taking the form
 * down with it.
 */

/** A form's answers, keyed by control name. Repeated names become arrays. */
export type Draft = Record<string, string | string[]>;

/** React's server-action bookkeeping rides along in FormData; never store it. */
const INTERNAL = /^\$ACTION/;

export function snapshotForm(form: HTMLFormElement | null): Draft | null {
  if (!form) return null;

  const draft: Draft = {};
  for (const [key, value] of new FormData(form).entries()) {
    // File entries can't be serialised, and no form here has one.
    if (INTERNAL.test(key) || typeof value !== "string") continue;

    const seen = draft[key];
    if (seen === undefined) draft[key] = value;
    else if (Array.isArray(seen)) seen.push(value);
    else draft[key] = [seen, value];
  }
  return draft;
}

export function readDraft(key: string): Draft | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // Anything else means a stale or hand-edited entry — ignore it.
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Draft)
      : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, draft: Draft | null): void {
  if (!draft) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Quota or private mode. The server-side draft is still the record.
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to clean up if storage is unavailable */
  }
}

/** A draft's value for a single-answer question. */
export function one(draft: Draft | null, key: string): string {
  const value = draft?.[key];
  return typeof value === "string" ? value : "";
}

/** A draft's values for a question that can hold several answers. */
export function many(draft: Draft | null, key: string): string[] | null {
  const value = draft?.[key];
  if (value === undefined) return null;
  return Array.isArray(value) ? value : [value];
}

/**
 * Puts a draft back into the form's plain text inputs.
 *
 * Only those: radios, checkboxes and the comboboxes post through hidden inputs
 * that React owns, and assigning to one of those is silently undone on the next
 * render. Those questions are restored by the caller's `setState` instead.
 */
export function applyDraft(form: HTMLFormElement | null, draft: Draft): void {
  if (!form) return;

  for (const [key, value] of Object.entries(draft)) {
    if (typeof value !== "string") continue;

    const control = form.elements.namedItem(key);
    // A shared name yields a RadioNodeList, which fails both checks below.
    if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
      continue;
    }
    if (control.type === "checkbox" || control.type === "radio" || control.type === "hidden") {
      continue;
    }
    if (control.getAttribute("aria-hidden") === "true") continue;

    control.value = value;
  }
}
