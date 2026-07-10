import Marquee from "@/components/motion/Marquee";

const ITEMS = [
  "occ hacks 2026",
  "oct 11–12",
  "orange coast college",
  "free to board",
  "the future is uncharted",
];

export default function MarqueeStrip() {
  return (
    <Marquee className="border-y border-border py-2.5" duration={40}>
      <span className="text-sm text-muted-foreground">
        {Array.from({ length: 4 }, () => ITEMS)
          .flat()
          .map((item, i) => (
            <span key={i}>
              <span className="mx-4">{item}</span>·
            </span>
          ))}
      </span>
    </Marquee>
  );
}
