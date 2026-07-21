"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Sponsors", href: "/#sponsors" },
  { label: "FAQs", href: "/#faq" },
];

/** Cursor within this many px of the top edge keeps the nav shown. */
const HOVER_ZONE = 80;

export default function Navbar() {
  // Shown on load; hides on scroll down, returns on any scroll up or when
  // the cursor sits near the top edge.
  const [scrollVisible, setScrollVisible] = useState(true);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      if (y < 10) setScrollVisible(true);
      else if (y > lastY.current) setScrollVisible(false);
      else if (y < lastY.current) setScrollVisible(true);
      lastY.current = y;
    };

    const onMouseMove = (e: MouseEvent) => {
      setHoverVisible(e.clientY <= HOVER_ZONE);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const visible = scrollVisible || hoverVisible || menuOpen;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <header
      style={{
        backdropFilter: "blur(var(--nav-blur, 0px))",
        WebkitBackdropFilter: "blur(var(--nav-blur, 0px))",
      }}
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-[var(--nav-bg)] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full sm:px-8 md:justify-end">
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="-ml-2 p-2 text-[var(--text-primary)] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Links and CTA grouped on the right */}
        <div className="flex items-center gap-8">
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  i === 0
                    ? "text-sm font-medium text-[var(--text-primary)] transition-opacity hover:opacity-85"
                    : "text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button using shadcn/ui Button */}
          <Button
            variant="ghost"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-[var(--text-primary)] hover:scale-[1.03] transition-transform cursor-pointer font-medium"
            onMouseMove={handleMouseMove}
            asChild
          >
            <Link href="/register">
              Register Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 text-base text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
