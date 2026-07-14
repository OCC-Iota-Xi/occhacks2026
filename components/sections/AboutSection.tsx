"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import RevealLines from "@/components/motion/RevealLines";

const ambient = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&playsinline=1&modestbranding=1`;

const SHOWREEL = {
  name: "Spookathon 2025",
  youtube: "https://www.youtube.com/watch?v=I9FVxneDnL4",
  embed: ambient("I9FVxneDnL4"),
  stats: [
    { value: "134", label: "registrations" },
    { value: "21", label: "teams" },
    { value: "$6,000+", label: "in funding & prizes" },
  ],
};

const PREVIOUS = {
  name: "HackCC 2024",
  youtube: "https://www.youtube.com/watch?v=vT81BYkjc8k",
  embed: ambient("vT81BYkjc8k"),
  stats: [
    { value: "300+", label: "registrations" },
    { value: "27", label: "teams" },
    { value: "$14,000+", label: "in funding & prizes" },
  ],
};

const BENEFITS = [
  "extra credit for OCC courses",
  "free food all weekend",
  "learn from industry mentors",
  "workshops for all skill levels",
  "free swag and merch",
  "network with fellow hackers",
];

interface Stat {
  value: string;
  label: string;
}

function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-x-20 gap-y-6">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5 text-center">
          <span className="font-header text-4xl tracking-wider text-[var(--text-primary)] sm:text-5xl">
            {value}
          </span>
          <span className="font-body text-sm tracking-wide text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * About as a showreel: a masked line-reveal headline, then the recap video
 * starting full-bleed and shrinking down to a tile (the frame itself resizes,
 * reference-style). The caption and the previous event's recap fade into the
 * space the video frees up.
 */
export default function AboutSection() {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start 75%", "start 15%"],
  });

  // The frame resizes from full-bleed down to a tile, reference-style.
  const width = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["48%", "48%"] : ["100%", "48%"]);
  const height = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["48%", "48%"] : ["100%", "48%"]);

  // The caption and second recap fade in as the video gets out of their way.
  const captionOpacity = useTransform(scrollYProgress, [0.55, 0.95], reduceMotion ? [1, 1] : [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.55, 0.95], reduceMotion ? [0, 0] : [24, 0]);
  const secondOpacity = useTransform(scrollYProgress, [0.7, 1], reduceMotion ? [1, 1] : [0, 1]);
  const secondY = useTransform(scrollYProgress, [0.7, 1], reduceMotion ? [0, 0] : [24, 0]);

  return (
    <section
      id="about"
      className="relative z-10 w-full scroll-mt-24 px-6 py-24 sm:px-12 md:px-24 md:py-36"
    >
      {/* Headline */}
      <RevealLines
        className="font-header text-5xl tracking-wider leading-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] 2xl:text-[8rem]"
        lines={[<span key="1">you belong here.</span>]}
      />

      {/* Showreel grid: on md+ the whole block keeps the full-bleed video's
          footprint; the shrinking frame frees the right and bottom for the
          caption and the previous recap. On mobile it all stacks. */}
      <div ref={wrapRef} className="relative mt-14 w-full max-md:flex max-md:flex-col md:mt-20 md:aspect-video">
        {/* Latest recap: full-bleed → tile, top-left */}
        <motion.div
          style={{ width, height }}
          className="relative overflow-hidden bg-black/40 max-md:aspect-video max-md:!h-auto max-md:!w-full"
        >
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full"
            src={SHOWREEL.embed}
            title={`${SHOWREEL.name} recap`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </motion.div>

        {/* Caption: parenthetical + narrative, top-right */}
        <motion.div
          style={{ opacity: captionOpacity, y: captionY }}
          className="mt-8 flex flex-col gap-6 max-md:!translate-y-0 max-md:!opacity-100 md:absolute md:right-0 md:top-0 md:mt-0 md:h-[48%] md:w-[46%] md:justify-center"
        >
          <a
            href={SHOWREEL.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center font-body text-sm tracking-wide text-[var(--text-secondary)] hover:underline underline-offset-4 sm:text-base"
          >
            {SHOWREEL.name}
          </a>
          <StatsRow stats={SHOWREEL.stats} />
        </motion.div>

        {/* Previous recap: mirrored row in the freed bottom half */}
        <motion.div
          style={{ opacity: secondOpacity, y: secondY }}
          className="mt-8 flex flex-col gap-6 max-md:order-4 max-md:!translate-y-0 max-md:!opacity-100 md:absolute md:bottom-0 md:left-0 md:mt-0 md:h-[48%] md:w-[46%] md:justify-center"
        >
          <a
            href={PREVIOUS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center font-body text-sm tracking-wide text-[var(--text-secondary)] hover:underline underline-offset-4 sm:text-base"
          >
            {PREVIOUS.name}
          </a>
          <StatsRow stats={PREVIOUS.stats} />
        </motion.div>

        <motion.div
          style={{ opacity: secondOpacity, y: secondY }}
          className="relative mt-8 aspect-video w-full overflow-hidden bg-black/40 max-md:order-3 max-md:!translate-y-0 max-md:!opacity-100 md:absolute md:bottom-0 md:right-0 md:mt-0 md:aspect-auto md:h-[48%] md:w-[48%]"
        >
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full"
            src={PREVIOUS.embed}
            title={`${PREVIOUS.name} recap`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>

      {/* What OCC Hacks is + why join: description on the left, stacked
          benefits on the right */}
      <div className="mt-14 flex w-full flex-col gap-10 md:mt-20 md:flex-row md:items-start md:gap-12">
        <RevealLines
          delay={0.15}
          className="flex-1 font-body text-lg leading-relaxed text-[var(--text-primary)] sm:text-xl"
          lines={[
            <span
              key="heading"
              className="block pb-4 font-header text-3xl tracking-wider text-[var(--text-primary)]"
            >
              about us
            </span>,
            <span key="1">
              OCC Hacks is a hackathon where individuals or teams collaborate
              to build innovative solutions to real-world challenges within a
              limited timeframe. Participants design, develop, and present
              their projects while learning new skills, networking with
              others, and competing for prizes.
            </span>,
            <span key="2" className="block pt-4">
              This year, we&apos;ve configured the logistics to accommodate up to 150
              hackers, secured more funding than ever, and taken every lesson
              from previous years to make this the biggest and baddest one
              yet.
            </span>,
          ]}
        />

        <RevealLines
          delay={0.35}
          className="flex-1 font-body text-lg text-[var(--text-primary)] sm:text-xl"
          lineClassName="py-1"
          lines={[
            <span
              key="heading"
              className="block pb-4 text-center font-header text-3xl tracking-wider text-[var(--text-primary)]"
            >
              Why OCC Hacks?
            </span>,
            ...Array.from(
              { length: Math.ceil(BENEFITS.length / 2) },
              (_, i) => BENEFITS.slice(i * 2, i * 2 + 2),
            ).map((pair) => (
              <span key={pair[0]} className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {pair.map((benefit) => (
                  <span key={benefit} className="group flex items-center gap-4">
                    <span className="flex w-10 shrink-0 items-center justify-center font-header text-4xl leading-none text-[var(--text-primary)] transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-125">
                      +
                    </span>
                    <span>{benefit}</span>
                  </span>
                ))}
              </span>
            )),
          ]}
        />
      </div>
    </section>
  );
}
