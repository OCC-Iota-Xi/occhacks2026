/** Shared option lists for the hacker and volunteer/mentor forms. */

/**
 * The OCC courses whose instructors are giving extra credit for attending.
 * These drive the "extra credit" picker on the hacker form; the stored value is
 * the string shown here, so edit freely without touching the schema.
 *
 * Codes are the CCCD catalog's. Several of these run more than one section
 * (C++ 2 and Java 1 are three apiece); the registration form asks for the
 * course alone, and the section is picked from `CLASS_SECTIONS` afterwards.
 * Note the catalog carries two other data-structures courses, A132 (Python)
 * and A275 (Java); A200 is the one meant here.
 */
export const OCC_CLASSES = [
  "CS A170 Java 1",
  "CS A200 Data Structures",
  "CS A220 Software Engineering",
  "CS A250 C++ 2",
];

/**
 * The sections of each of those courses running this term, keyed by the
 * course's string in `OCC_CLASSES`. The CRN is what's stored
 * (`hackers.class_section`) and what goes on the roster sent to the
 * instructor; the label is only how the section is told apart on screen.
 */
export const CLASS_SECTIONS: Record<string, { crn: string; label: string }[]> = {
  "CS A170 Java 1": [
    { crn: "20962", label: "Hybrid, Wed 11:10 AM to 1:40 PM" },
    { crn: "24602", label: "Asynchronous" },
    { crn: "23903", label: "Tue and Thu 2:20 PM to 5:30 PM" },
  ],
  "CS A200 Data Structures": [
    { crn: "22181", label: "Asynchronous with in-person test days, Tue 6:00 PM to 8:00 PM" },
  ],
  "CS A220 Software Engineering": [{ crn: "22941", label: "Hybrid, Wed 2:20 PM to 4:50 PM" }],
  "CS A250 C++ 2": [
    { crn: "20125", label: "Hybrid, Tue 2:20 PM to 4:50 PM" },
    { crn: "21173", label: "Hybrid, Tue 11:10 AM to 1:40 PM" },
    { crn: "23355", label: "Hybrid, Thu 11:10 AM to 1:40 PM" },
  ],
};

/** Whether `crn` is one of the sections `course` runs. */
export function isClassSection(course: string, crn: string) {
  return !!CLASS_SECTIONS[course]?.some((section) => section.crn === crn);
}

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
