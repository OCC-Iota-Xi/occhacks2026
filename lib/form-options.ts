/** Shared option lists for the hacker and volunteer/mentor forms. */

/**
 * PLACEHOLDER — replace with the real OCC course list from the org team.
 * These drive the "extra credit" checkboxes on both forms; the stored value is
 * the string shown here, so edit freely without touching the schema.
 */
export const OCC_CLASSES = [
  "CS A150 — Programming Concepts",
  "CS A170 — Java Programming",
  "CS A250 — Data Structures",
  "CIS A111 — Intro to Computer Information Systems",
  "MATH A170 — Discrete Mathematics",
];

export const SHIRT_SIZES = ["xs", "s", "m", "l", "xl", "xxl"];

export const TRACKS = [
  { key: "entertainment", label: "entertainment" },
  { key: "education", label: "education" },
  { key: "productivity", label: "productivity" },
];

/** Shifts volunteers and mentors can sign up for across the weekend. */
export const AVAILABILITY_BLOCKS = [
  "oct 10 · setup (7–8 am)",
  "oct 10 · morning (8 am–12 pm)",
  "oct 10 · afternoon (12–4 pm)",
  "oct 10 · evening (4–8 pm)",
  "oct 11 · morning (8 am–12 pm)",
  "oct 11 · afternoon (12–4 pm)",
  "oct 11 · teardown (4–6 pm)",
];
