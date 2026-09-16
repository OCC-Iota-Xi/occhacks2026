"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** Flat-art gradient discs echoing the track planets: earth, saturn, pluto, gold. */
const PALETTES = [
  "radial-gradient(circle at 35% 30%, #4f8fd9, #1e4e8f 70%)",
  "radial-gradient(circle at 35% 30%, #e8c97a, #a9822f 70%)",
  "radial-gradient(circle at 35% 30%, #d9c6ae, #8f7a5e 70%)",
  "radial-gradient(circle at 35% 30%, #fcd34d, #b45309 70%)",
];

/** Where each satellite sits on the orbit, in degrees from the top. */
const SATELLITE_ANGLES = [-34, 68, 176];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

/** What someone is doing at the event. Someone can be doing more than one. */
export type Involvement = "keynote panel" | "fireside chat" | "mentor";

export interface Person {
  /** Stable key. Names are shortened to first names on the page, so they collide. */
  id: string;
  name: string;
  roles: string[];
  involvement: Involvement[];
  palette: number;
  /** Path under /public. Without one the card falls back to an initials planet. */
  photo?: string;
}

/** Mentoring is the quiet one; being on stage takes the gold. */
const isSpeaking = (involvement: Involvement) => involvement !== "mentor";

/**
 * One round "planet" avatar with a tilted orbit that carries a small satellite
 * for each thing this person is doing, plus name, title and matching tags.
 *
 * The orbit is three nested layers on purpose: hover scale, then the static
 * tilt, then the spin. Stacking them onto one element means the inline tilt
 * transform silently wins over everything else.
 */
export default function PersonCard({
  person,
  /** Staggers the orbit speeds so a grid of these doesn't march in lockstep. */
  orbitSeconds = 32,
}: {
  person: Person;
  orbitSeconds?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="group flex h-full flex-col items-center gap-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-10px] transition-transform duration-500 ease-out group-hover:scale-105"
        >
          {/* Tilt, so the orbit reads as an ellipse seen edge-on. */}
          <div className="absolute inset-0" style={{ transform: "rotate(-12deg) scaleY(0.92)" }}>
            <motion.div
              className="absolute inset-0"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: orbitSeconds, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border border-white/15" />
              {person.involvement.map((involvement, i) => (
                <span
                  key={involvement}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${SATELLITE_ANGLES[i] ?? 0}deg)` }}
                >
                  <span
                    className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: isSpeaking(involvement) ? "#fbbf24" : "#9aa0b8" }}
                  />
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {person.photo ? (
          <div className="relative h-full w-full overflow-hidden rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110">
            <Image src={person.photo} alt={person.name} fill sizes="112px" className="object-cover" />
          </div>
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
            style={{ background: PALETTES[person.palette] }}
          >
            {/* Craters, so a card without a photo still reads as a planet. */}
            <span
              aria-hidden
              className="absolute left-[14%] top-[18%] h-3.5 w-5 rounded-full bg-[rgba(120,70,50,0.3)]"
            />
            <span
              aria-hidden
              className="absolute bottom-[16%] right-[18%] h-2.5 w-3.5 rounded-full bg-[rgba(120,70,50,0.3)]"
            />
            <span className="relative font-header text-2xl tracking-wider text-[#0b0d17] sm:text-3xl">
              {initials(person.name)}
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-header text-base tracking-wider text-[var(--text-primary)] sm:text-lg">
          {person.name}
        </h3>
        {person.roles.map((role) => (
          <p
            key={role}
            className="mt-1 text-sm text-muted-foreground/80 transition-colors duration-300 group-hover:text-foreground sm:text-base"
          >
            {role}
          </p>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-1">
        {person.involvement.map((involvement) => (
          <span
            key={involvement}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide ${
              isSpeaking(involvement)
                ? "border-ring/30 bg-ring/10 text-[#fcd34d]"
                : "border-white/15 text-muted-foreground"
            }`}
          >
            {involvement}
          </span>
        ))}
      </div>
    </div>
  );
}
