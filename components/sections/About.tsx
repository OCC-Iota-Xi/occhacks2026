import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import SectionHeading from "@/components/SectionHeading";

const STATS = [
  { value: <CountUp to={150} suffix="+" />, label: "crew members" },
  { value: <CountUp to={24} />, label: "hours" },
  { value: "all", label: "meals covered" },
  { value: "yes", label: "beginner friendly" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 px-6 py-24 md:py-32">
      <SectionHeading plain="built by students, for" accent="students" />

      <Reveal className="mx-auto mt-10 max-w-2xl text-center" delay={0.1}>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          OCC Hacks is Orange Coast College&apos;s official hackathon, held at the OCC
          Ballroom in Costa Mesa. For one weekend the room becomes the deck of our
          ship: 150+ students from across Southern California building, learning, and
          shipping side by side — with workshops, mentors, and every meal on us.
          First hackathon? Perfect. Every pirate starts somewhere.
        </p>
      </Reveal>

      <Reveal className="mx-auto mt-16 max-w-4xl" delay={0.15}>
        <div className="grid grid-cols-2 border-y border-border md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-8 text-center ${i > 0 ? "border-l border-border max-md:[&:nth-child(3)]:border-l-0" : ""} ${i >= 2 ? "max-md:border-t max-md:border-border" : ""}`}
            >
              <p className="text-3xl tabular-nums sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
