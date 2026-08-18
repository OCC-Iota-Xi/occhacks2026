/**
 * The two ways to help run the event, and the copy that separates them.
 *
 * Volunteers and mentors fill in the same shape of form — the same person,
 * contact, and logistics questions — so both pages render `HelperForm` and
 * differ only in what's below. Keeping the differences here rather than in two
 * near-identical components means a change to the shared questions lands on
 * both pages at once, and the role-specific wording stays legible side by side.
 *
 * The role also decides which row the sign-up writes to: the `volunteers` table
 * is keyed by (user_id, role), so someone can hold both without either
 * overwriting the other.
 */

export type HelperRole = "volunteer" | "mentor";

export interface HelperCopy {
  role: HelperRole;
  /** Sidebar entry and page heading. */
  navLabel: string;
  heading: string;
  metaTitle: string;
  metaDescription: string;
  /** Title of the fourth step, where the role-specific questions live. */
  lastStep: string;
  /**
   * Questions only the mentor form asks, on the details step. Null on the
   * volunteer form, which skips the block entirely.
   */
  details: {
    resume: { label: string; hint: string };
    reason: { label: string; hint: string };
    preferredTime: { label: string; hint: string };
  } | null;
  /**
   * Whether to ask for an OCC student ID. Volunteers are mostly OCC students
   * and the ID ties a shift to extra credit; mentors come from anywhere, so
   * the question would be dead weight on that form.
   */
  asksOccId: boolean;
  /** Whether to ask about OCC classes — the extra-credit question. */
  asksClasses: boolean;
  availability: { label: string; hint: string; error: string };
  expertise: {
    label: string;
    hint: string;
    /** Mentors have to answer this one — it's the whole point of the sign-up. */
    required: boolean;
  };
  /** The screen after a successful submit. */
  thanks: { lead: string; accent: string; body: string };
  /** localStorage key for the browser-side draft — one per role, never shared. */
  draftKey: string;
}

export const VOLUNTEER_COPY: HelperCopy = {
  role: "volunteer",
  navLabel: "volunteer",
  heading: "volunteer with us",
  metaTitle: "volunteer — OCC Hacks 2026",
  metaDescription:
    "Volunteer at OCC Hacks 2026 — Oct 10–11 at Orange Coast College. Take a shift and help run the weekend.",
  lastStep: "how you'll help",
  details: null,
  asksOccId: true,
  asksClasses: false,
  availability: {
    label: "which time periods are you available to help?",
    hint: "check every block that works — we'll build shifts around it.",
    error: "pick at least one time period you're available.",
  },
  expertise: {
    label: "anything you'd rather do, or rather avoid?",
    hint: "check-in, meals, setup, floating — tell us where you'd be happiest.",
    required: false,
  },
  thanks: {
    lead: "thank you",
    accent: "for helping",
    body: "You're signed up to volunteer. We'll email you with shift details and everything else closer to the event.",
  },
  draftKey: "occhacks:volunteer-draft",
};

export const MENTOR_COPY: HelperCopy = {
  role: "mentor",
  navLabel: "mentor",
  heading: "mentor with us",
  metaTitle: "mentor — OCC Hacks 2026",
  metaDescription:
    "Mentor at OCC Hacks 2026 — Oct 10–11 at Orange Coast College. Sit with student teams and help them get unstuck.",
  lastStep: "your mentoring",
  details: {
    resume: {
      label: "upload your résumé",
      hint: "PDF only, up to 5 MB. it's how we match you to teams — only organizers see it.",
    },
    reason: {
      label: "why do you want to mentor with us?",
      hint: "optional, and there's no wrong answer — a sentence or two is plenty.",
    },
    preferredTime: {
      label: "which time would work best for you?",
      hint: "your first choice. you'll pick everything you're free for on the next step.",
    },
  },
  asksOccId: false,
  asksClasses: true,
  availability: {
    label: "when can you be on the floor?",
    hint: "most mentors take one or two blocks — check everything that works.",
    error: "pick at least one time period you're available.",
  },
  expertise: {
    label: "what can you mentor on?",
    hint: "languages, frameworks, tools, or topics — the more specific, the better we can match you to a team.",
    required: true,
  },
  thanks: {
    lead: "thank you",
    accent: "for mentoring",
    body: "You're on the mentor roster. We'll email you closer to the event with your blocks and how team matching works on the day.",
  },
  draftKey: "occhacks:mentor-draft",
};

export const HELPER_COPY: Record<HelperRole, HelperCopy> = {
  volunteer: VOLUNTEER_COPY,
  mentor: MENTOR_COPY,
};
