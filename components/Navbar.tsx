"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
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
      className="fixed top-0 left-0 right-0 z-50 w-full bg-[var(--nav-bg)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between w-full">
        {/* Logo */}
        <Link
          href="#"
          className="text-2xl tracking-widest text-[var(--text-primary)] select-none font-header transition-colors duration-300 hover:text-amber-500"
        >
          <span className="text-amber-500 font-bold mr-1">[</span>logo<span className="text-amber-500 font-bold ml-1">]</span>
        </Link>

        {/* Links and CTA grouped on the right */}
        <div className="flex items-center gap-8">
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="#" 
              className="text-sm font-medium text-[var(--text-primary)] transition-opacity hover:opacity-85"
            >
              Home
            </Link>
            <Link 
              href="#about" 
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              About
            </Link>
            <Link 
              href="#tracks" 
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Tracks
            </Link>
            <Link 
              href="#sponsors" 
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Sponsors
            </Link>
            <Link 
              href="#faq" 
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              FAQs
            </Link>
          </div>

          {/* CTA Button using shadcn/ui Button */}
          <Button 
            variant="ghost" 
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-[var(--text-primary)] hover:scale-[1.03] transition-transform cursor-pointer font-medium"
            onMouseMove={handleMouseMove}
            asChild
          >
            <Link href="#register">
              Register Now
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
