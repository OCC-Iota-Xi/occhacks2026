import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

/**
 * `invert` marks the marks that ship as white-on-transparent silhouettes.
 * They were drawn for the dark page and go completely invisible on the white
 * mentors band, so they're flipped to ink there — the shapes are flat single
 * tones, which is exactly the case `invert()` handles cleanly. The two that
 * carry their own dark values (Alpha Beta Gamma's black roundel, NTHS's full
 * colour art) are left alone; inverting those would wreck them.
 */
const SPONSORS = [
  {
    name: "Iota Xi",
    logo: "/sponsors/Offical IX Logo.svg",
    width: 192,
    height: 192,
    invert: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/iota-xi.html",
  },
  {
    name: "Phi Theta Kappa",
    logo: "/sponsors/PTK Logo white.svg",
    width: 85,
    height: 188,
    invert: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/phi-theta-kappa/index.html",
  },
  {
    name: "Alpha Beta Gamma",
    logo: "/sponsors/ABG Logo.svg",
    width: 166,
    height: 165,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/alpha-beta-gamma.html",
  },
  {
    name: "Mu Alpha Theta",
    logo: "/sponsors/MAT Logo.svg",
    width: 138,
    height: 150,
    invert: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/mu-alpha-theta/index.html",
  },
  {
    name: "National Technical Honor Society",
    logo: "/sponsors/nths.png",
    width: 515,
    height: 1000,
    grayscale: true,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/nths.html",
  },
];

/**
 * Sponsors, rendered inside the white mentors band rather than as a section of
 * its own — so every colour here is ink-on-paper, the reverse of the rest of
 * the page. It keeps its own `id` and scroll offset, so the nav's link still
 * lands on it. No horizontal padding: it takes the band's.
 */
export default function Sponsors() {
  return (
    <section id="sponsors" className="scroll-mt-24">
      <SectionHeading plain="Sponsors" accent="" ground="light" className="mb-6" />
      <Reveal className="mx-auto mt-14 max-w-5xl" delay={0.1}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
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
                unoptimized
                className={`h-28 w-auto object-contain transition duration-300 ease-out group-hover:scale-110 sm:h-32 ${
                  sponsor.invert ? "invert" : ""
                } ${sponsor.grayscale ? "grayscale" : ""}`}
              />
              <span className="text-sm text-[#6b6b6b] transition-colors duration-300 group-hover:text-[#0a0a0a]">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-14 text-center" delay={0.15}>
        <Button
          asChild
          className="h-auto rounded-full bg-[#0a0a0a] px-8 py-3 text-sm text-white hover:bg-[#0a0a0a]/85"
        >
          <a href="mailto:lnguyen1509@student.cccd.edu?subject=Sponsoring%20OCC%20Hacks%202026">sponsor us</a>
        </Button>
      </Reveal>
    </section>
  );
}
