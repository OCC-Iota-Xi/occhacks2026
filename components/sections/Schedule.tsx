"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeading from "@/components/SectionHeading";
import { EASE, fadeIn, fadeUp, stagger, viewportOnce } from "@/lib/motion";

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
 * The day's run of show as a flight path: a gold line drawing itself down the
 * column with each event as a stop on it. Switching days remounts the list —
 * Radix drops the inactive panel — so the stagger replays for the new day.
 */
export default function Schedule() {
  const reduceMotion = useReducedMotion();
  const pathRef = useRef<HTMLDivElement>(null);
  /* Watched explicitly rather than with whileInView: the line scales from
     zero, and a zero-area box never reads as in view, so the ref stays on the
     full-height wrapper while the scaling happens inside it. The margin is
     vertical-only — the shared "-80px" insets all four sides, and this line is
     one pixel wide near the left edge, so it would never intersect at all. */
  const pathInView = useInView(pathRef, { once: true, margin: "-80px 0px" });
  const item = reduceMotion ? fadeIn : fadeUp;

  return (
    <div id="schedule" className="scroll-mt-24">
      <SectionHeading plain="Schedule" accent="" size="column" className="mb-10" />

      <Tabs defaultValue="day-one">
        <div className="mb-10 text-center">
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
            <div className="relative pl-6">
              {/* The path itself, drawn top to bottom as the column arrives. */}
              <div
                ref={pathRef}
                aria-hidden
                className="absolute left-[3px] top-2 bottom-2 w-px"
              >
                <motion.div
                  className="h-full w-full origin-top bg-gradient-to-b from-ring/50 via-ring/25 to-transparent"
                  initial={{ scaleY: reduceMotion ? 1 : 0 }}
                  animate={{ scaleY: pathInView || reduceMotion ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>

              <motion.ul
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
              >
                {day.events.map((event) => (
                  <motion.li
                    key={`${event.time}-${event.name}`}
                    variants={item}
                    className="group relative -ml-6 flex items-baseline gap-4 rounded-md py-3 pl-6 pr-3 transition-colors hover:bg-accent"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[1.15rem] h-1.5 w-1.5 rounded-full bg-ring/60 transition-colors duration-300 group-hover:bg-ring"
                    />
                    <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground transition-colors group-hover:text-accent-foreground">
                      {event.time}
                    </span>
                    <span className="text-base transition-colors group-hover:text-accent-foreground">
                      {event.name}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/70">
              schedule is provisional — final times land closer to the event.
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
