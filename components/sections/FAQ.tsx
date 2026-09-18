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
import { FAQS } from "@/lib/faq";

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
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/25"
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
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.rich ?? faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  );
}
