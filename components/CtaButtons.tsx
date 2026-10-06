"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APPLY = { label: "Become a Hacker", href: "/register", primary: true };
/** Takes the apply button's place once the deadline passes. */
const STATUS = { label: "Check Your Status", href: "/status", primary: true };
const SPONSOR = {
  label: "Sponsor Us",
  href: "mailto:lnguyen1509@student.cccd.edu?subject=Sponsoring%20OCC%20Hacks%202026",
  primary: false,
};

/**
 * The site's one CTA set — register / sponsor — as liquid-glass pills,
 * shared by the hero and the join section. After the application deadline the
 * register pill becomes a status check.
 *
 * `location` tags the cta_clicked event, the first step of the registration
 * funnel in PostHog.
 */
export default function CtaButtons({
  className,
  location,
  closed,
}: {
  className?: string;
  location: "hero" | "join";
  /** Past the application deadline — the caller keeps this live. */
  closed: boolean;
}) {
  const ctas = [closed ? STATUS : APPLY, SPONSOR];

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const track = (label: string) => posthog.capture("cta_clicked", { cta: label, location });

  return (
    <div className={cn("flex flex-wrap items-center gap-4 md:gap-6", className)}>
      {ctas.map((cta) => (
        <Button
          key={cta.label}
          variant="ghost"
          className={cn(
            "h-auto cursor-pointer rounded-full px-8 py-4 text-base font-medium transition-transform hover:scale-[1.03] md:px-10 md:py-5 md:text-lg",
            cta.primary
              ? "liquid-glass glass-gold text-[#fcd34d]"
              : "liquid-glass glass-visible text-[var(--text-primary)]"
          )}
          onMouseMove={handleMouseMove}
          asChild
        >
          {cta.href.startsWith("/") ? (
            <Link
              href={cta.href}
              onClick={() => track(cta.label)}
              {...(cta.primary
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {cta.label}
            </Link>
          ) : (
            <a href={cta.href} onClick={() => track(cta.label)}>
              {cta.label}
            </a>
          )}
        </Button>
      ))}
    </div>
  );
}
