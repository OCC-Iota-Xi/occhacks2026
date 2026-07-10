"use client";

import { motion } from "motion/react";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const SOCIALS = [
  { label: "instagram", href: "https://instagram.com" },
  { label: "discord", href: "https://discord.gg" },
  { label: "github", href: "https://github.com" },
];

/** The closing beat: giant type over the same deep space, then the footer. */
export default function Closer() {
  return (
    <section
      id="register"
      className="scroll-mt-24 px-6 pt-24 pb-10 md:pt-32"
    >
      <RevealLines
        className="text-center font-display text-6xl leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
        lines={[
          <span key="1">
            join the{" "}
            <span className="font-serif text-[1.06em] text-ring">crew</span>.
          </span>,
        ]}
      />

      <Reveal className="mt-10 flex flex-col items-center gap-6" delay={0.15}>
        <p className="text-base tabular-nums text-muted-foreground">
          oct 11–12, 2026 · orange coast college ballroom
        </p>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            asChild
            className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85"
          >
            <a href="/register">
              board the ship
            </a>
          </Button>
        </motion.div>
      </Reveal>

      <footer className="mt-24 border-t border-border pt-8">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <span>occ hacks</span>
          <div className="flex items-center gap-6">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
          <p>
            organized by the{" "}
            <a
              href="https://orangecoastcollege.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Orange Coast College
            </a>{" "}
            CS Club
          </p>
          <p className="text-muted-foreground/60">occ hacks 2026 · costa mesa, ca</p>
        </div>
      </footer>
    </section>
  );
}
