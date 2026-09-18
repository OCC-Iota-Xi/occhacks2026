"use client";

import Image from "next/image";
import Magnetic from "@/components/motion/Magnetic";

/** Flat-art gradient discs echoing the track planets: earth, saturn, pluto, gold. */
const PALETTES = [
  "radial-gradient(circle at 35% 30%, #4f8fd9, #1e4e8f 70%)",
  "radial-gradient(circle at 35% 30%, #e8c97a, #a9822f 70%)",
  "radial-gradient(circle at 35% 30%, #d9c6ae, #8f7a5e 70%)",
  "radial-gradient(circle at 35% 30%, #fcd34d, #b45309 70%)",
];

/*
 * The spark's trail: a conic gradient with one bright arc and the rest
 * transparent, masked down to the ring's own line. Rotating the element
 * carries the gradient with it, so the arc travels; the plain ring underneath
 * shows through everywhere the arc has left, which is what makes the line
 * settle back to its own colour behind it.
 *
 * It warms from nothing through the site's gold to near-white at the head, so
 * the leading edge reads as the hot end and the tail as its wake. The last
 * stop lands exactly on 360deg — the hard seam back to transparent is the
 * head's leading edge, and softening it would blunt the spark.
 */
const PULSE = [
  "conic-gradient(from 0deg,",
  "transparent 0deg 296deg,",
  "rgba(251, 191, 36, 0) 300deg,",
  "rgba(251, 191, 36, 0.5) 324deg,",
  "#fbbf24 340deg,",
  "#fde68a 352deg,",
  "#fffbeb 360deg)",
].join(" ");

/** Keeps only the outer 2px of the box, turning a filled disc into a line. */
const RING_MASK =
  "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))";

/*
 * The resting ring: always there, never pulsed. On hover it widens, brightens
 * and swings round, which reads as the ellipse squeezing as its long axis
 * turns.
 *
 * The tilt is an inline transform and the swing is Tailwind's rotate utility,
 * which in v4 compiles to the standalone `rotate` property. Individual
 * transform properties apply before `transform`, so the two compose instead of
 * one clobbering the other — the ring keeps its tilt and squash while it turns.
 */
const REST_RING = {
  tilt: "rotate(-12deg) scaleY(0.94)",
  className:
    "inset-[-10px] border-white/15 transition-[inset,border-color,rotate] duration-500 ease-out group-hover:inset-[-15px] group-hover:rotate-45 group-hover:border-white/30 motion-reduce:transition-none",
};

/** One shape for both orbits, flat enough that the tilt is legible. */
const ORBIT_CURVE = "scaleY(0.42)";

/*
 * The orbits that open on hover: the same ellipse at evenly spaced
 * inclinations. An ellipse repeats every 180 degrees, so two of them sit 90
 * apart. Each ellipse crosses the avatar twice, so two rings read as four
 * lobes — three rings made six, which was busier than it needed to be.
 *
 * Each pulse gets its own period and its own lead-in, so the darts never fire
 * together.
 */
const ORBITS = [
  { angle: -45, pulse: "6s", delay: "0.2s", border: "border-ring/30" },
  { angle: 45, pulse: "9s", delay: "1.8s", border: "border-white/15" },
];

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
  /** Job title, line one under the name. */
  title: string;
  /** Always its own line, so every card's text block is the same shape. */
  company: string;
  involvement: Involvement[];
  palette: number;
  /** Path under /public. Without one the card falls back to an initials planet. */
  photo?: string;
}

/** Mentoring is the quiet one; being on stage takes the gold. */
const isSpeaking = (involvement: Involvement) => involvement !== "mentor";

/**
 * One round "planet" avatar with name, title and tags for what this person is
 * doing. At rest it is just the portrait and a single plain ring; hovering
 * opens two orbits at evenly spaced inclinations, sends an occasional
 * yellow-white spark around each, and pops the tags up underneath — each tag
 * magnetic in its own right. The portrait itself stays put.
 *
 * The tags only hide on devices that actually have a hover state. On touch
 * there is no way to reveal them, so they stay visible.
 */
export default function PersonCard({ person }: { person: Person }) {
  return (
    <div className="group flex h-full flex-col items-center gap-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        <span
          aria-hidden
          className={`pointer-events-none absolute rounded-full border ${REST_RING.className}`}
          style={{ transform: REST_RING.tilt }}
        />

        {ORBITS.map((orbit, i) => (
          <span
            key={orbit.angle}
            aria-hidden
            className={`pointer-events-none absolute inset-[-10px] rounded-full border opacity-0 transition-[inset,opacity] duration-500 ease-out group-hover:inset-[-26px] group-hover:opacity-100 motion-reduce:transition-none ${orbit.border}`}
            style={{
              transform: `rotate(${orbit.angle}deg) ${ORBIT_CURVE}`,
              transitionDelay: `${i * 75}ms`,
            }}
          >
            {/* Named only while hovered, so the dart restarts with the hover
                instead of resuming wherever it was paused — and so nothing
                animates on the eight cards nobody is pointing at. Longhands
                only: the animation shorthand would reset the name set here. */}
            <span
              className="absolute inset-0 opacity-0 [animation-iteration-count:infinite] [animation-timing-function:linear] group-hover:[animation-name:orbit-pulse] motion-reduce:group-hover:[animation-name:none]"
              style={{ animationDuration: orbit.pulse, animationDelay: orbit.delay }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: PULSE,
                  WebkitMaskImage: RING_MASK,
                  maskImage: RING_MASK,
                }}
              />
              {/* The head, sitting where the gradient is hottest: the trail
                  ends on 360deg and a conic gradient starts at twelve
                  o'clock, so that is the leading edge. It carries the glow —
                  the trail cannot, because a filter would be applied before
                  the mask and clipped straight back off. */}
              <span
                className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fffbeb]"
                style={{ boxShadow: "0 0 5px 1.5px rgba(253, 230, 138, 0.8)" }}
              />
            </span>
          </span>
        ))}

        {person.photo ? (
          <div className="relative h-full w-full overflow-hidden rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110">
            <Image
              src={person.photo}
              alt={person.name}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="relative h-full w-full overflow-hidden rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
            style={{ background: PALETTES[person.palette] }}
          >
            {/* Banded like the track planets rather than speckled — the flat
                  art on this site has no loose dots on a planet's surface. */}
            <span aria-hidden className="absolute inset-0" style={{ transform: "rotate(-12deg)" }}>
              <span className="absolute left-[-20%] top-[24%] h-[7%] w-[140%] rounded-full bg-white/25" />
              <span className="absolute left-[-20%] top-[45%] h-[11%] w-[140%] rounded-full bg-black/10" />
              <span className="absolute left-[-20%] top-[68%] h-[6%] w-[140%] rounded-full bg-white/15" />
            </span>
            <span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "inset -14px -10px 0 rgba(0, 0, 0, 0.18)" }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-header text-2xl tracking-wider text-[#0b0d17] sm:text-3xl">
              {initials(person.name)}
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-header text-base tracking-wider text-[var(--text-primary)] sm:text-lg">
          {person.name}
        </h3>
        <p className="mt-1 text-balance text-sm text-muted-foreground/80 transition-colors duration-300 group-hover:text-foreground sm:text-base">
          {person.title}
        </p>
        <p className="text-sm text-muted-foreground/80 transition-colors duration-300 group-hover:text-foreground sm:text-base">
          {person.company}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-1 transition-all duration-300 ease-out [@media(hover:hover)]:translate-y-1.5 [@media(hover:hover)]:scale-95 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
        {person.involvement.map((involvement) => (
          <Magnetic key={involvement} className="block" strength={0.4}>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide ${
                isSpeaking(involvement)
                  ? "border-ring/30 bg-ring/10 text-[#fcd34d]"
                  : "border-white/15 text-muted-foreground"
              }`}
            >
              {involvement}
            </span>
          </Magnetic>
        ))}
      </div>
    </div>
  );
}
