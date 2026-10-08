/**
 * The handbook's sections, in order. `/handbook` draws its headings from this
 * and the sidebar lists the same sections under its handbook entry, so a link
 * there always has somewhere to land.
 */
export const HANDBOOK_SECTIONS = [
  { id: "about", title: "What is OCCHacks?" },
  { id: "venue", title: "Venue and Parking" },
  { id: "schedule", title: "Schedule" },
  { id: "rules", title: "Rules & Guidelines" },
  { id: "prizes", title: "Prizes" },
  { id: "extra-credit", title: "Extra Credit" },
  { id: "logistics", title: "Logistics & Facilities" },
  { id: "judging", title: "Judging Criteria" },
  { id: "help", title: "Getting Help & Updates" },
] as const;

export type HandbookSectionId = (typeof HANDBOOK_SECTIONS)[number]["id"];
