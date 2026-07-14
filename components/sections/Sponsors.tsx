import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const SPONSORS = [
  { name: "Iota Xi", logo: "/Offical IX Logo.svg", width: 192, height: 192 },
  { name: "Phi Theta Kappa", logo: "/PTK Logo white.svg", width: 85, height: 188 },
  { name: "Alpha Beta Gamma", logo: "/ABG Logo.svg", width: 166, height: 165 },
  {
    name: "National Technical Honor Society",
    logo: "/MAT Logo.svg",
    width: 138,
    height: 150,
  },
];

export default function Sponsors() {
  return (
    <section id="sponsors" className="scroll-mt-24 px-6 py-24 md:py-32">
      <SectionHeading plain="Sponsors" accent="" className="mb-6" />
      <Reveal className="mx-auto mt-14 max-w-4xl" delay={0.1}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {SPONSORS.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex flex-col items-center justify-center gap-4 px-4 text-center"
            >
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                width={sponsor.width}
                height={sponsor.height}
                unoptimized
                className="h-28 w-auto object-contain transition-transform duration-300 ease-out hover:scale-110 sm:h-32"
              />
              <span className="text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground">
                {sponsor.name}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-14 text-center" delay={0.15}>
        <Button
          asChild
          className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85"
        >
          <a href="mailto:sponsor@occhacks.com">sponsor us</a>
        </Button>
      </Reveal>
    </section>
  );
}
