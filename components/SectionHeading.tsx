import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  plain: string;
  accent: string;
  className?: string;
  /**
   * The ground the heading sits on, not the ink. Everything on the page is
   * paper-on-space except the white mentors band, which needs the reverse.
   */
  ground?: "dark" | "light";
}

/**
 * The site's one heading pattern: centered Bruno Ace with the accent
 * phrase in gold. No labels above.
 */
export default function SectionHeading({
  plain,
  accent,
  className,
  ground = "dark",
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("text-center", className)}>
      <h2
        className={cn(
          "font-display text-4xl tracking-tight sm:text-5xl md:text-6xl",
          ground === "light" ? "text-[#0a0a0a]" : "text-foreground"
        )}
      >
        {plain}{" "}
        <span className="text-ring">{accent}</span>
      </h2>
    </Reveal>
  );
}
