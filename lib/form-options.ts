/** Shared option lists for the hacker and volunteer/mentor forms. */

/**
 * The OCC courses whose instructors are giving extra credit for attending.
 * These drive the "extra credit" picker on both forms; the stored value is
 * the string shown here, so edit freely without touching the schema.
 *
 * Codes are the CCCD catalog's. Several of these run more than one section
 * (C++ 2 and Java 1 are three apiece), but the reader picks the course rather
 * than the section — the roster is matched against the instructor's list
 * afterwards. Note the catalog carries two other data-structures courses,
 * A132 (Python) and A275 (Java); A200 is the one meant here.
 */
export const OCC_CLASSES = [
  "CS A170 Java 1",
  "CS A200 Data Structures",
  "CS A220 Software Engineering",
  "CS A250 C++ 2",
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
