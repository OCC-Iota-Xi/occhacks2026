import { OCC_CLASSES } from "@/lib/form-options";

/**
 * The homepage FAQ. `answer` is plain text and feeds both the accordion and the
 * FAQPage JSON-LD on the homepage; `rich` optionally replaces it on screen when
 * the answer needs links.
 */
export const FAQS: { question: string; answer: string; rich?: React.ReactNode }[] = [
  {
    question: "What is a hackathon?",
    answer:
      "A weekend sprint where you team up to build a project from scratch, guided by mentors, and demo it to judges at the end.",
  },
  {
    question: "Who can come?",
    answer:
      "Any college student who's 18 or older — every major and skill level, beginners included.",
  },
  {
    question: "What does it cost?",
    answer:
      "Nothing. Entry is free and meals are on us: Costco muffins for breakfast, Raising Cane's for lunch, Domino's for dinner, plus snacks and caffeine all weekend.",
  },
  {
    question: "Are there prizes?",
    answer:
      "Yes — $500 for the best project in each track, plus $250 for the overall best. The LeetCode challenge has its own pot too: $150, $75, and $25 for first through third.",
  },
  {
    question: "Can I get extra credit?",
    answer: `Yes, if you're enrolled in one of these OCC courses: ${OCC_CLASSES.join(", ")}. Pick your course on the registration form — one course per hacker.`,
  },
  {
    question: "What if I'm new, or don't have a team or idea?",
    answer:
      "Totally fine. We run beginner-friendly workshops and team formation at kickoff, and mentors are around all weekend. Solo hacking is welcome too.",
  },
  {
    question: "What can I build?",
    answer:
      "Web, mobile, AI/ML, hardware, games — anything that fits our tracks, as long as it's built during the event.",
  },
  {
    question: "Who will I meet there?",
    answer:
      "130–150 student hackers, judges from OCC CS faculty and industry, and industry technical mentors.",
  },
  {
    question: "What should I bring?",
    answer:
      "Laptop, chargers, and whatever keeps you comfortable — we cover the rest.",
  },
  {
    question: "When and where?",
    answer:
      "The OCC Ballroom at Orange Coast College, October 10–11, 2026 — check-in opens 8:00 AM Saturday, opening ceremony at 9:00. Park for free in Lot C at Merrimac Way and Fairview Road.",
    rich: (
      <>
        The OCC Ballroom — check-in opens 8:00 AM Saturday, opening ceremony at
        9:00. Park for free in{" "}
        <a
          href="https://maps.app.goo.gl/7yWSvNarKVgHhJZW8"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Lot C
        </a>{" "}
        at Merrimac Way and Fairview Road.
      </>
    ),
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};
