"use client";

import { motion, useReducedMotion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeading from "@/components/SectionHeading";
import HorizontalScroller from "@/components/motion/HorizontalScroller";
import { fadeIn, fadeUp, stagger, viewportOnce } from "@/lib/motion";

const DAYS = [
  {
    id: "day-one",
    label: "day one · oct 10",
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
    id: "day-two",
    label: "day two · oct 11",
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
 * The day's run of show as a horizontal flight path you scroll along. Each
 * stop paints its own segment of the rail across its full width, so the
 * segments meet into one continuous line without any hand-tuned offsets.
 *
 * Switching days remounts the list — Radix drops the inactive panel — so the
 * stagger replays for the new day.
 */
export default function Schedule() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;

  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Schedule" accent="" className="mb-10" />

      <Tabs defaultValue="day-one" className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <TabsList>
            {DAYS.map((day) => (
              <TabsTrigger key={day.id} value={day.id}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DAYS.map((day) => (
          <TabsContent key={day.id} value={day.id}>
            <HorizontalScroller label={`${day.label} schedule`}>
              <motion.ol
                className="flex min-w-max px-2"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
              >
                {day.events.map((event) => (
                  <motion.li
                    key={`${event.time}-${event.name}`}
                    variants={item}
                    className="group/stop flex w-36 shrink-0 flex-col items-center px-1 text-center sm:w-44"
                  >
                    <span className="text-xs tabular-nums text-muted-foreground transition-colors duration-300 group-hover/stop:text-ring">
                      {event.time}
                    </span>

                    <span className="relative my-4 flex h-2.5 w-full items-center justify-center">
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ring/20"
                      />
                      <span
                        aria-hidden
                        className="relative h-2.5 w-2.5 rounded-full bg-ring/60 transition-transform duration-300 ease-out group-hover/stop:scale-150"
                      />
                    </span>

                    <span className="text-sm leading-snug transition-colors duration-300 group-hover/stop:text-foreground sm:text-base">
                      {event.name}
                    </span>
                  </motion.li>
                ))}
              </motion.ol>
            </HorizontalScroller>
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-8 text-center text-xs text-muted-foreground/70">
        schedule is provisional — final times land closer to the event.
      </p>
    </section>
  );
}
