import Image from "next/image";

/** Flat-art gradient discs echoing the track planets: earth, saturn, pluto, gold. */
const PALETTES = [
  "radial-gradient(circle at 35% 30%, #4f8fd9, #1e4e8f 70%)",
  "radial-gradient(circle at 35% 30%, #e8c97a, #a9822f 70%)",
  "radial-gradient(circle at 35% 30%, #d9c6ae, #8f7a5e 70%)",
  "radial-gradient(circle at 35% 30%, #fcd34d, #b45309 70%)",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export interface Person {
  name: string;
  roles: string[];
  palette: number;
  /** Path under /public. Without one the card falls back to an initials disc. */
  photo?: string;
}

/**
 * One round "planet" avatar with an orbit ring — a photo where we have one,
 * otherwise initials on a gradient disc — plus name and title. Shared by the
 * mentors grid and the keynote panel.
 */
export default function PersonCard({ person, className }: { person: Person; className?: string }) {
  return (
    <div className={`group flex flex-col items-center gap-4 text-center ${className ?? ""}`}>
      <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-10px] rounded-full border border-white/15 transition-transform duration-500 ease-out group-hover:rotate-45"
          style={{ transform: "rotate(-12deg) scaleY(0.92)" }}
        />
        {person.photo ? (
          <div className="relative h-full w-full overflow-hidden rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110">
            <Image src={person.photo} alt={person.name} fill sizes="112px" className="object-cover" />
          </div>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
            style={{ background: PALETTES[person.palette] }}
          >
            <span className="font-header text-2xl tracking-wider text-[#0b0d17] sm:text-3xl">
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
    </div>
  );
}
