"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import { fadeIn, fadeUp, viewportOnce } from "@/lib/motion";

const FAQS: { question: string; answer: React.ReactNode }[] = [
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
    answer: (
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

/**
 * Left-aligned in its column next to the schedule, so the two read as a pair.
 * The open/close animation stays with Radix — it already height-animates via
 * the accordion keyframes in globals.css.
 */
/**
 * The questions as a grid of cards that drop open in place.
 *
 * type="multiple" rather than single: in a grid, opening a card in the third
 * column should not silently close one in the first.
 *
 * Each card watches the viewport for itself, with the delay standing in for a
 * stagger. A stagger container would have to sit outside the accordion root,
 * which owns the grid, so the cards would no longer be its own children.
 *
 * The grid stays items-start on purpose. Stretching the row would even the
 * cards out too, but then opening one card would inflate every card beside it
 * into a mostly empty box.
 */
export default function FAQ() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;

  return (
    <section id="faq" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="FAQ" accent="" className="mb-12" />

      <Accordion
        type="multiple"
        className="mx-auto grid max-w-6xl items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FAQS.map((faq, i) => (
          <motion.div
            key={faq.question}
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ delay: (i % 3) * 0.08 }}
          >
            <AccordionItem
              value={`faq-${i}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-sm transition-colors duration-300 hover:border-ring/25"
            >
              <AccordionTrigger className="group/card justify-between gap-4 py-0 text-left">
                {/* The reserved height is what keeps every closed card the
                    same size: questions wrap to one line or two, and without
                    it the grid comes out ragged. */}
                <span className="flex min-h-12 flex-1 items-center gap-3">
                  <span className="text-xs tabular-nums text-muted-foreground transition-colors duration-300 group-data-[state=open]/card:text-ring">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-header text-base tracking-wider text-[var(--text-primary)]">
                    {faq.question}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  );
}
