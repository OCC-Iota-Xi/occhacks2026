import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  plain: string;
  accent: string;
  className?: string;
}

/**
 * The site's one heading pattern: centered Bruno Ace with the accent
 * phrase in gold. No labels above.
 */
export default function SectionHeading({ plain, accent, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn("text-center", className)}>
      <h2 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {plain}{" "}
        <span className="text-ring">{accent}</span>
      </h2>
    </Reveal>
  );
}
