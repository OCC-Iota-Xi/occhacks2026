"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import CtaButtons from "@/components/CtaButtons";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { TrackPlanet } from "@/components/sections/Tracks";

/* lucide-react no longer ships brand icons, so these are drawn in the
   same style (24x24 viewBox, stroke currentColor) as drop-in equivalents. */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  /* The official Discord mark needs a filled path to be recognizable. */
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.291.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function DevpostIcon({ className }: { className?: string }) {
  /* Like Discord, the Devpost mark needs its filled hexagon-D path. */
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.002 1.61 0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31 0 4.436-3.21 6.302-6.456 6.302H7.595zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861.009-2.569-1.096-3.853-3.767-3.853z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/cshs_occ/", Icon: InstagramIcon },
  { label: "Discord", href: "https://discord.gg/Qn638vTzp2", Icon: DiscordIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/106461068/", Icon: LinkedinIcon },
  { label: "Devpost", href: "https://occhacks-2026.devpost.com/", Icon: DevpostIcon },
];

/**
 * The closing call to action and the footer, as one landing: the page scrolls
 * up off it rather than pushing it down, and the contents resolve as it is
 * uncovered.
 *
 * It gets its own backdrop — a gold glow rising off the bottom edge like
 * sunrise over a planet's rim — instead of the starfield, which lives inside
 * <main> and stops where the page does.
 *
 * Static below md: the stacked call-to-action buttons make this taller than a
 * short phone screen, and a sticky block taller than the viewport would keep
 * its own top permanently off-screen.
 */
export default function Closer() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  /*
   * How much of the footer the page has uncovered, 0 to 1.
   *
   * This can't come from useScroll's target offsets: while the footer is stuck
   * to the bottom of the viewport its rect never moves, so every offset pair
   * reads as a constant. What does change is the scroll position, and the
   * footer is uncovered over exactly the last footer-height pixels of it.
   * Layout is clean during scroll, so reading these two values per frame does
   * not force a reflow.
   */
  const revealed = useTransform(scrollY, (y) => {
    const el = ref.current;
    if (!el) return 0;
    const height = el.offsetHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (height <= 0 || maxScroll <= 0) return 1;
    return Math.min(1, Math.max(0, (y - (maxScroll - height)) / height));
  });

  const opacity = useTransform(revealed, [0, 0.8], reduceMotion ? [1, 1] : [0, 1]);
  const y = useTransform(revealed, [0, 0.8], reduceMotion ? [0, 0] : [28, 0]);

  return (
    <footer
      ref={ref}
      className="relative z-0 overflow-hidden px-6 pb-12 pt-20 md:sticky md:bottom-0 md:pt-24"
    >
      {/* Horizon glow, rising off the bottom edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 118%, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 38%, rgba(251, 191, 36, 0.03) 58%, transparent 74%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-ring/40 to-transparent"
      />

      {/* Flanking planets, tucked behind the copy on wide screens */}
      <div className="pointer-events-none absolute left-[4%] top-[34%] hidden -translate-y-1/2 scale-[0.55] opacity-70 lg:block xl:left-[9%]">
        <TrackPlanet variant="saturn" />
      </div>
      <div className="pointer-events-none absolute right-[4%] top-[34%] hidden -translate-y-1/2 scale-[0.45] opacity-70 lg:block xl:right-[9%]">
        <TrackPlanet variant="pluto" />
      </div>

      <motion.div style={{ opacity, y }} className="relative">
        <div id="join" className="scroll-mt-24">
          <SectionHeading plain="Join Now" accent="" className="mb-10" />

          <Reveal delay={0.1}>
            <CtaButtons className="justify-center" />
          </Reveal>
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-3xl flex-col items-center gap-5 border-t border-white/10 pt-10 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="select-none font-header text-lg tracking-wider text-[var(--text-primary)] transition-opacity hover:opacity-85"
          >
            OCC<span className="text-amber-500">Hacks</span>
          </Link>
          <div className="flex items-center gap-6">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="transition-colors hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p>
            organized by the Iota Xi (ΙΞ) Society at{" "}
            <a
              href="https://orangecoastcollege.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Orange Coast College
            </a>
          </p>
          <p className="text-muted-foreground/60">occ hacks 2026 · costa mesa, ca</p>
        </div>
      </motion.div>
    </footer>
  );
}
