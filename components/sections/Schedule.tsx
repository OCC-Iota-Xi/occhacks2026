"use client";

import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import { fadeIn, fadeUp, viewportOnce } from "@/lib/motion";
import { SCHEDULE_DAYS } from "@/lib/schedule";

/**
 * The run of show: the heading on the left, and the two days side by side on
 * the right as static cards — both always fully listed, nothing to open or
 * close. The pair stretches to a shared height so they bottom-align despite
 * Day 1 having the longer list. Below sm the days stack, below md the heading
 * sits above them.
 */
export default function Schedule() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;

  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <SectionHeading plain="Schedule" accent="" className="text-left md:sticky md:top-28" />

        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            {SCHEDULE_DAYS.map((day, i) => (
              <motion.div
                key={day.id}
                className="h-full"
                variants={item}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-sm">
                  <h3 className="font-header text-base tracking-wider text-[var(--text-primary)] sm:text-lg">
                    {day.label}
                  </h3>
                  <ul className="mt-4 divide-y divide-white/10">
                    {day.events.map((event) => (
                      <li
                        key={`${event.time}-${event.name}`}
                        className="flex items-baseline gap-4 py-3 first:pt-1 last:pb-0"
                      >
                        <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">
                          {event.time}
                        </span>
                        {/* The shared schedule is written in sentence case;
                            this section sets everything but names in lowercase. */}
                        <span className="text-sm lowercase text-[var(--text-primary)] sm:text-base">
                          {event.name}
                          {event.speakers && (
                            <span className="block text-xs normal-case text-muted-foreground sm:text-sm">
                              {event.speakers}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/70">
            schedule is provisional — final times land closer to the event. you do not need to
            stay for the whole time.
          </p>
        </div>
      </div>
    </section>
  );
}
