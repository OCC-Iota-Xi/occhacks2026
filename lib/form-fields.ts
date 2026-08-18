/** Field helpers shared by the hacker and volunteer/mentor step forms. */

/** Digits only, laid out US-style as you type: (714) 555-0123. */
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** One unanswered question: the fields to mark red, and why, if it isn't obvious. */
export interface Gap {
  fields: string[];
  message?: string;
}

export const FILL_IN_MESSAGE = "fill in the field marked in red.";

/**
 * The first question still standing in the way, or null when the step is done.
 * Only one is ever handed back — flagging every gap at once turns a step the
 * reader has only just landed on entirely red.
 */
export function firstGap(gaps: Gap[]) {
  const gap = gaps.find((g) => g.fields.length);
  if (!gap) return null;
  return { fields: gap.fields, message: gap.message ?? FILL_IN_MESSAGE };
}

/** Brings a flagged question into view, wherever in the step it sits. */
export function scrollToField(form: HTMLFormElement | null, name: string) {
  const control = form?.querySelector(`[name="${name}"]`);
  const target = control?.closest("[data-field-row], label") ?? control;
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Names of the controls in one step that fail native constraint validation.
 * Radix's hidden bubble inputs are skipped — they're checked against React
 * state instead, since an invisible input can't be marked up in red.
 */
export function nativeGaps(container: HTMLElement | null) {
  if (!container) return [];
  const gaps: string[] = [];
  const controls = container.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");
  for (const control of controls) {
    if (control.getAttribute("aria-hidden") === "true") continue;
    if (control.type === "hidden") continue;
    if (!control.checkValidity()) gaps.push(control.name);
  }
  return gaps;
}
