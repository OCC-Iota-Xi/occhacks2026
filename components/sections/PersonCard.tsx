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
 * The orbit rings. Each tilt lives in an inline transform and every hover
 * change is a class touching only inset, opacity and border — never transform,
 * because an inline transform silently beats a utility class that sets one.
 * At rest a single ring shows; hovering opens the outer two.
 */
const RINGS = [
  {
    tilt: "rotate(-12deg) scaleY(0.92)",
    className:
      "border-white/15 transition-[inset,border-color] duration-500 ease-out group-hover:inset-[-15px] group-hover:border-white/30",
  },
  {
    tilt: "rotate(26deg) scaleY(0.7)",
    className:
      "border-ring/30 opacity-0 transition-[inset,opacity] duration-500 ease-out group-hover:inset-[-24px] group-hover:opacity-100",
  },
  {
    tilt: "rotate(-48deg) scaleY(0.52)",
    className:
      "border-white/12 opacity-0 transition-[inset,opacity] delay-75 duration-700 ease-out group-hover:inset-[-34px] group-hover:opacity-100",
  },
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
  roles: string[];
  involvement: Involvement[];
  palette: number;
  /** Path under /public. Without one the card falls back to an initials planet. */
  photo?: string;
}

/** Mentoring is the quiet one; being on stage takes the gold. */
const isSpeaking = (involvement: Involvement) => involvement !== "mentor";

/**
 * One round "planet" avatar with name, title and tags for what this person is
 * doing. At rest it is just the portrait and a single orbit ring; hovering
 * opens two more rings, pulls the portrait toward the cursor, and pops the
 * tags up underneath — each tag magnetic in its own right.
 *
 * The tags only hide on devices that actually have a hover state. On touch
 * there is no way to reveal them, so they stay visible.
 */
export default function PersonCard({ person }: { person: Person }) {
  return (
    <div className="group flex h-full flex-col items-center gap-4 text-center">
      <Magnetic className="block" strength={0.25}>
        <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
          {RINGS.map((ring) => (
            <span
              key={ring.tilt}
              aria-hidden
              className={`pointer-events-none absolute inset-[-10px] rounded-full border ${ring.className}`}
              style={{ transform: ring.tilt }}
            />
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
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ transform: "rotate(-12deg)" }}
              >
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
      </Magnetic>

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
