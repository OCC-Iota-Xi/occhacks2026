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
    <nav className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex items-center justify-between bg-transparent w-full">
      {/* Logo */}
      <Link
        href="#"
        className="text-2xl tracking-widest text-foreground select-none font-header transition-colors duration-300 hover:text-amber-500"
      >
        <span className="text-amber-500 font-bold mr-1">[</span>logo<span className="text-amber-500 font-bold ml-1">]</span>
      </Link>

      {/* Links and CTA grouped on the right */}
      <div className="flex items-center gap-8">
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="#" 
            className="text-sm font-medium text-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link 
            href="#tracks" 
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Tracks
          </Link>
          <Link 
            href="#faqs" 
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQs
          </Link>
        </div>

        {/* CTA Button using shadcn/ui Button */}
        <Button 
          variant="ghost" 
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer font-medium"
          onMouseMove={handleMouseMove}
          asChild
        >
          <Link href="#register">
            Register Now
          </Link>
        </Button>
      </div>
    </nav>
  );
}
