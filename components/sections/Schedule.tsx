"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

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

/* Cards are a fixed height so the stack maths stays arithmetic rather than
   measured: every offset below is derived from these three numbers. */
const CARD_HEIGHT = 62;
const CARD_GAP = 10;
/** How much of each card behind the top one stays visible. */
const PEEK = 11;
/** Cards past this sit exactly behind the last peeking one, fully faded. */
const VISIBLE_BEHIND = 3;

const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

const collapsedHeight = (n: number) => CARD_HEIGHT + Math.min(n - 1, VISIBLE_BEHIND) * PEEK;
const expandedHeight = (n: number) => n * CARD_HEIGHT + (n - 1) * CARD_GAP;

/**
 * Collapsed, each card is pulled up onto the one above it, leaving a sliver
 * showing and shrinking slightly as it goes back. Expanded, everything returns
 * to where flex already put it.
 *
 * Expanding cascades downward and collapsing folds up from the bottom, so the
 * stack gathers itself in the direction you would expect.
 */
function cardVariants(i: number, total: number, reduceMotion: boolean) {
  const depth = Math.min(i, VISIBLE_BEHIND);
  const transition = reduceMotion ? { duration: 0 } : SPRING;

  return {
    collapsed: {
      y: -i * (CARD_HEIGHT + CARD_GAP) + depth * PEEK,
      scale: 1 - depth * 0.04,
      opacity: i <= VISIBLE_BEHIND ? 1 : 0,
      transition: { ...transition, delay: reduceMotion ? 0 : (total - 1 - i) * 0.02 },
    },
    expanded: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { ...transition, delay: reduceMotion ? 0 : i * 0.03 },
    },
  };
}

/**
 * One day's run of show as a stack of cards that spreads open, after Motion's
 * iOS notifications stack.
 *
 * The container's height is animated explicitly. Transforms do not affect
 * layout, so flex keeps every card at its full-list position whether the stack
 * is open or shut — without this the collapsed stack would leave the height of
 * the whole day empty beneath it.
 */
function DayStack({ label, events }: { label: string; events: { time: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const total = events.length;

  return (
    <div className="mx-auto max-w-md">
      <motion.ul
        animate={open ? "expanded" : "collapsed"}
        initial={false}
        variants={{
          collapsed: { height: collapsedHeight(total) },
          expanded: { height: expandedHeight(total) },
        }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
        className="relative flex flex-col"
        style={{ gap: CARD_GAP }}
      >
        {events.map((event, i) => (
          <motion.li
            key={`${event.time}-${event.name}`}
            variants={cardVariants(i, total, Boolean(reduceMotion))}
            onClick={() => setOpen((o) => !o)}
            style={{
              height: CARD_HEIGHT,
              zIndex: total - i,
              transformOrigin: "top center",
            }}
            className="flex shrink-0 cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-card px-5 shadow-lg shadow-black/40 transition-colors duration-300 hover:border-ring/30"
          >
            <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground sm:w-20">
              {event.time}
            </span>
            <span className="text-sm sm:text-base">{event.name}</span>
          </motion.li>
        ))}
      </motion.ul>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mx-auto mt-8 block cursor-pointer rounded-full border border-border px-5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? `collapse ${label}` : `show all ${total} stops`}
      </button>
    </div>
  );
}

/**
 * The run of show, one stack per day. Radix drops the inactive panel, so each
 * day's stack starts collapsed when you switch to it.
 */
export default function Schedule() {
  return (
    <section id="schedule" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Schedule" accent="" className="mb-10" />

      <Tabs defaultValue="day-one">
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
            <Reveal>
              <DayStack label={day.label} events={day.events} />
            </Reveal>
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-10 text-center text-xs text-muted-foreground/70">
        schedule is provisional — final times land closer to the event.
      </p>
    </section>
  );
}
