import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  plain: string;
  accent: string;
  className?: string;
  /** "column" steps the size down for headings that share a row. */
  size?: "page" | "column";
}

const SIZES = {
  page: "text-4xl sm:text-5xl md:text-6xl",
  column: "text-3xl sm:text-4xl",
} as const;

/**
 * The site's one heading pattern: centered Bruno Ace with the accent
 * phrase in gold. No labels above.
 */
export default function SectionHeading({
  plain,
  accent,
  className,
  size = "page",
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("text-center", className)}>
      <h2 className={cn("font-display tracking-tight text-foreground", SIZES[size])}>
        {plain} <span className="text-ring">{accent}</span>
      </h2>
    </Reveal>
  );
}
