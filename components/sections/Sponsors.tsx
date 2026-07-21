import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const SPONSORS = [
  {
    name: "Iota Xi",
    logo: "/sponsors/Offical IX Logo.svg",
    width: 192,
    height: 192,
    href: "https://orangecoastcollege.edu/academics/honor-societies/societies/iota-xi.html",
  },
  {
    name: "Phi Theta Kappa",
    logo: "/sponsors/PTK Logo white.svg",
    width: 85,
    height: 188,
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

export default function Sponsors() {
  return (
    <section id="sponsors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Sponsors" accent="" className="mb-6" />
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
                className={`h-28 w-auto object-contain transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-150 sm:h-32 ${
                  sponsor.grayscale ? "grayscale" : ""
                }`}
              />
              <span className="text-sm text-muted-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </Reveal>

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
