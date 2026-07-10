"use client";

import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const TRACKS = [
  {
    number: "01",
    name: "education",
    description:
      "Build tools that help people learn — tutoring platforms, study aids, interactive lessons, or anything that makes knowledge stick.",
    tag: "build to learn",
  },
  {
    number: "02",
    name: "productivity",
    description:
      "Ship apps that save time and cut the busywork — task managers, automation, planners, or smarter everyday workflows.",
    tag: "build to ship",
  },
  {
    number: "03",
    name: "spoof apps",
    description:
      "Go wild with parody and joke apps. Useless machines, absurd tools, and shamelessly silly ideas are all fair game.",
    tag: "build to laugh",
  },
];

export default function Tracks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="tracks" className="scroll-mt-24 py-24 md:py-32">
      <SectionHeading plain="Our" accent="tracks" className="mb-16 px-6" />

      <div className="border-b border-border">
        {TRACKS.map((track, i) => (
          <Reveal key={track.name} delay={i * 0.05}>
            <motion.div
              className="group border-t border-border px-6 py-10 text-center transition-colors duration-300 hover:bg-accent md:py-12"
              whileHover={reduceMotion ? undefined : "hover"}
            >
              <p className="text-xs tabular-nums text-muted-foreground transition-colors group-hover:text-accent-foreground">
                {track.number}
              </p>
              <motion.h3
                className="mt-2 font-serif text-4xl text-foreground sm:text-5xl"
                variants={{ hover: { scale: 1.02 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {track.name}
              </motion.h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-accent-foreground sm:text-base">
                {track.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground/70 transition-colors group-hover:text-accent-foreground/70">
                {track.tag}
              </p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
