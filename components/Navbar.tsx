"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Mentors", href: "/#mentors" },
  { label: "Sponsors", href: "/#sponsors" },
  { label: "FAQs", href: "/#faq" },
];

/**
 * Scrolls to a same-page link's section and returns true, or returns false
 * when the link leads to another page. Done here instead of through the
 * router: the router skips scrolling when the URL already ends in that hash
 * (a second tap on "FAQs" did nothing), and the mobile menu's scroll lock has
 * to lift before the scroll starts or it can cut the smooth scroll short.
 */
function scrollToSamePageLink(href: string) {
  const url = new URL(href, window.location.href);
  if (url.pathname !== window.location.pathname) return false;

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  const nextUrl = url.pathname + url.hash;
  if (window.location.pathname + window.location.hash !== nextUrl) {
    window.history.pushState(null, "", nextUrl);
  }
  // Scroll right away: the header is fixed, so closing the menu doesn't
  // shift the page, and waiting a frame would stall in background tabs.
  const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
  if (target) target.scrollIntoView({ block: "start" });
  else window.scrollTo({ top: 0 });
  return true;
}

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

  // While the mobile menu is open: lock page scroll, close on Escape, and
  // close if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!menuOpen) return;
    // Lock both <html> and <body>: which one scrolls varies by browser, and
    // iOS Safari still pans the page when only <body> is locked.
    const root = document.documentElement;
    const previousOverflow = { root: root.style.overflow, body: document.body.style.overflow };
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      root.style.overflow = previousOverflow.root;
      document.body.style.overflow = previousOverflow.body;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  const visible = scrollVisible || hoverVisible || menuOpen;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (scrollToSamePageLink(href)) e.preventDefault();
  };

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
      className={`fixed top-0 left-0 right-0 z-50 flex w-full flex-col transition-all duration-300 ${
        menuOpen ? "h-dvh touch-none overscroll-none bg-background" : "bg-[var(--nav-bg)]"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full sm:px-8 md:justify-end">
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="-ml-2 p-2 text-[var(--text-primary)] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Links and CTA grouped on the right */}
        <div className="mr-2 flex items-center gap-8 md:mr-0">
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
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
            className="liquid-glass glass-gold rounded-full px-6 py-2.5 text-sm text-[#fcd34d] hover:scale-[1.03] transition-transform cursor-pointer font-medium"
            onMouseMove={handleMouseMove}
            asChild
          >
            <Link
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture("cta_clicked", { cta: "Register Now", location: "nav" })}
            >
              Register Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu: a solid full-height sheet under the bar, so the page never shows through. */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="flex flex-1 flex-col gap-1 overflow-hidden border-t border-white/10 px-6 py-6 md:hidden"
        >
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-md px-2 py-3 text-lg text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
