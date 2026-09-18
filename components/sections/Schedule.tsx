"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import { fadeIn, fadeUp, viewportOnce } from "@/lib/motion";

const DAYS = [
  {
    id: "day-1",
    label: "Day 1 (Oct 10th)",
    events: [
      { time: "8:00 am", name: "registration opens" },
      { time: "9:00 am", name: "opening ceremony" },
      { time: "9:15 am", name: "competition start" },
      { time: "12:30 pm", name: "lunch" },
      { time: "2:00 pm", name: "keynote panel" },
      { time: "4:30 pm", name: "fireside chat" },
      { time: "6:00 pm", name: "dinner" },
      { time: "8:00 pm", name: "end of day" },
    ],
  },
  {
    id: "day-2",
    label: "Day 2 (Oct 11th)",
    events: [
      { time: "9:00 am", name: "competition start" },
      { time: "9:00 am", name: "breakfast" },
      { time: "11:00 am", name: "leetcode challenge" },
      { time: "12:00 pm", name: "lunch" },
      { time: "3:30 pm", name: "submission deadline" },
      { time: "3:45 pm", name: "judging" },
      { time: "5:15 pm", name: "closing ceremony & awards" },
    ],
  },
];

/**
 * The run of show: the heading on the left, and the two days side by side on
 * the right as cards that drop open, styled like the FAQ cards. Both start
 * open so the pair reads level; items-start keeps closing one from stretching
 * it to its neighbour's height.
 *
 * The whole card is the click target: the trigger carries the card's padding
 * so the header strip is all trigger, and clicking the open list closes it.
 * That needs the open state controlled here rather than left to Radix. Below sm the days stack, below md the heading
 * sits above them.
 */
export default function Schedule() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;
  const [open, setOpen] = useState(["day-1", "day-2"]);
  const close = (id: string) => setOpen((ids) => ids.filter((d) => d !== id));

  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <SectionHeading plain="Schedule" accent="" className="text-left md:sticky md:top-28" />

        <div>
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="grid items-start gap-5 sm:grid-cols-2">
            {DAYS.map((day, i) => (
              <motion.div
                key={day.id}
                variants={item}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: i * 0.08 }}
              >
                <AccordionItem
                  value={day.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 hover:border-white/25"
                >
                  <AccordionTrigger className="cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-header text-base tracking-wider text-[var(--text-primary)] sm:text-lg">
                      {day.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent
                    className="cursor-pointer px-6 pb-5"
                    onClick={() => close(day.id)}
                  >
                    <ul className="divide-y divide-white/10">
                      {day.events.map((event) => (
                        <li
                          key={`${event.time}-${event.name}`}
                          className="flex items-baseline gap-4 py-3 first:pt-1 last:pb-0"
                        >
                          <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">
                            {event.time}
                          </span>
                          <span className="text-sm text-[var(--text-primary)] sm:text-base">
                            {event.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          <p className="mt-6 text-center text-xs text-muted-foreground/70">
            schedule is provisional — final times land closer to the event.
          </p>
        </div>
      </div>
    </section>
  );
}
