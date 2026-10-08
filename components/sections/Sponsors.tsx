import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { PRESENTING_SPONSOR } from "@/lib/sponsors";

/** Full-color logos wherever we have them; white only as a fallback. */
const SPONSORS: {
  name: string;
  logo: string;
  width: number;
  height: number;
  wide?: boolean;
  /** Gentler hover brightening, so colored logos don't wash out. */
  subtleHover?: boolean;
  href: string;
}[] = [
  {
    name: "Iota Xi",
    logo: "/sponsors/ix_color.png",
    width: 1563,
    height: 1563,
    subtleHover: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/iota-xi.html",
  },
  {
    name: "Community Innovations Foundation",
    logo: "/sponsors/cif.svg",
    width: 437,
    height: 87,
    wide: true,
    subtleHover: true,
    href: "https://cifdn.org",
  },
  {
    name: "Mu Alpha Theta",
    logo: "/sponsors/mat_color.png",
    width: 374,
    height: 434,
    subtleHover: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/mu-alpha-theta/index.html",
  },
  {
    name: "Phi Theta Kappa",
    logo: "/sponsors/PTK Logo white.svg",
    width: 85,
    height: 188,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/phi-theta-kappa/index.html",
  },
];

export default function Sponsors() {
  return (
    <section id="sponsors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Sponsors" accent="" className="mb-6" />
      {/* Presenting sponsor on the left, everyone else on the right; stacked on small screens */}
      <div className="mx-auto mt-14 grid max-w-6xl items-center gap-12 md:grid-cols-[2fr_3fr] md:gap-10 lg:gap-16">
        <Reveal className="flex justify-center" delay={0.05}>
          <a
            href={PRESENTING_SPONSOR.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-5 px-4 text-center"
          >
            <Image
              src={PRESENTING_SPONSOR.logo}
              alt={`${PRESENTING_SPONSOR.name} logo`}
              width={PRESENTING_SPONSOR.width}
              height={PRESENTING_SPONSOR.height}
              className="h-52 w-auto object-contain transition duration-300 ease-out group-hover:scale-105 group-hover:brightness-110 sm:h-64 lg:h-72"
            />
            <span className="flex flex-col items-center gap-1">
              <span className="font-display text-xl text-balance text-foreground sm:text-2xl">
                {PRESENTING_SPONSOR.name}
              </span>
              <span className="text-sm text-ring">Presenting sponsor</span>
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            {SPONSORS.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-4 px-4 text-center"
              >
                <Image
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  width={sponsor.width}
                  height={sponsor.height}
                  unoptimized={sponsor.logo.endsWith(".svg")}
                  className={`object-contain transition duration-300 ease-out group-hover:scale-110 ${
                    sponsor.wide ? "h-auto w-full max-w-[18rem]" : "h-32 w-auto sm:h-40"
                  } ${sponsor.subtleHover ? "group-hover:brightness-110" : "group-hover:brightness-150"}`}
                />
                <span className="text-sm text-muted-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                  {sponsor.name}
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-14 text-center" delay={0.15}>
        <Button
          asChild
          className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85"
        >
          <a href="mailto:lnguyen1509@student.cccd.edu?subject=Sponsoring%20OCC%20Hacks%202026">sponsor us</a>
        </Button>
      </Reveal>
    </section>
  );
}
