"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

const LINKS = [
  { href: "#about", label: "about" },
  { href: "#tracks", label: "tracks" },
  { href: "#schedule", label: "schedule" },
  { href: "#faq", label: "faq" },
];

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        d="M.5.24l10 11m0-9.24l.14 9.38H1"
      />
    </svg>
  );
}

/**
 * Reference nav: fixed, fully transparent, no borders. Wordmark left,
 * links stacked vertically top-right, staggered in on load.
 * mix-blend-difference flips the ink to paper over the dark closer.
 */
export default function Navbar() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const enter = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: EASE },
        };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <nav className="flex items-start justify-between px-6 py-5 text-white sm:px-10">
          <motion.a
            href="#top"
            className="pointer-events-auto text-sm"
            {...enter(0.3)}
          >
            occ hacks
          </motion.a>

          {/* Stacked link column (desktop) */}
          <div className="hidden flex-col items-end gap-1.5 text-right text-sm md:flex">
            {LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="group pointer-events-auto leading-none"
                {...enter(0.4 + i * 0.05)}
              >
                <span className="relative">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </span>
              </motion.a>
            ))}
            <motion.a
              href="#register"
              className="group pointer-events-auto mt-3 inline-flex items-center gap-1.5 leading-none"
              {...enter(0.7)}
            >
              <span className="relative">
                register
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </span>
              <ArrowIcon className="size-2.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </motion.a>
          </div>

          {/* Mobile trigger */}
          <motion.button
            type="button"
            className="pointer-events-auto text-sm md:hidden"
            onClick={() => setOpen(true)}
            {...enter(0.4)}
          >
            menu
          </motion.button>
        </nav>
      </header>

      {/* Mobile sheet: full-screen paper with the same stacked links, large */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-background px-6 py-5 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start justify-between text-sm">
              <span>occ hacks</span>
              <button type="button" onClick={() => setOpen(false)}>
                close
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="text-4xl tracking-tight"
                  onClick={() => setOpen(false)}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#register"
                className="mt-4 inline-flex items-center gap-2 text-4xl tracking-tight text-ring"
                onClick={() => setOpen(false)}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
              >
                register <ArrowIcon className="size-5" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
