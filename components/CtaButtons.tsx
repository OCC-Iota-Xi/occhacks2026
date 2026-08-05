"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CTAS = [
  { label: "Become a Hacker", href: "/register", primary: true },
  { label: "Join as a Volunteer/Mentor", href: "/volunteer" },
  {
    label: "Sponsor Us",
    href: "mailto:lnguyen1509@student.cccd.edu?subject=Sponsoring%20OCC%20Hacks%202026",
  },
];

/**
 * The site's one CTA set — register / volunteer / mentor / sponsor — as
 * liquid-glass pills, shared by the hero and the join section.
 */
export default function CtaButtons({ className }: { className?: string }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-4 md:gap-6", className)}>
      {CTAS.map((cta) => (
        <Button
          key={cta.label}
          variant="ghost"
          className={cn(
            "h-auto cursor-pointer rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03] md:px-8 md:py-4 md:text-base",
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
              {...(cta.primary
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {cta.label}
            </Link>
          ) : (
            <a href={cta.href}>{cta.label}</a>
          )}
        </Button>
      ))}
    </div>
  );
}
