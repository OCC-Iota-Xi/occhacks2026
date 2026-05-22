"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Scene1HeroBackground from "@/components/three/Scene1HeroBackground";
import Navbar from "@/components/Navbar";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Start text hidden, shifted left, and blurred
    gsap.set(textRef.current, {
      opacity: 0,
      x: -50,
      filter: "blur(10px)",
    });

    // Animate text in after the ship settles
    gsap.to(textRef.current, {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      duration: 1.5,
      delay: 1.5, // Corresponds to the ship slowing down
      ease: "power3.out",
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <main ref={container} className="relative flex flex-col min-h-screen">
      {/* 3D Scene Layer */}
      <Scene1HeroBackground />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main content container */}
      <div className="flex-1 flex items-end pb-12 md:items-center md:pb-0 px-6 sm:px-12 md:px-24 z-10">
        <div ref={textRef} className="max-w-3xl text-left py-8 md:py-20">
          {/* Eyebrow */}
          <span className="inline-block text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-amber-500 font-bold mb-3 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
            Orange Coast College Hackathon (OCC Hacks)
          </span>

          {/* Main Title (Bruno Ace SC font) */}
          <h1 className="font-header text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] tracking-wider leading-none">
            OCCHacks <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">2026</span>
          </h1>

          {/* Subtext with glassmorphic boundary accent */}
          <div className="border-l-3 border-amber-500/60 pl-4 md:pl-5 py-1 md:py-1.5 bg-black/30 backdrop-blur-xs rounded-r-lg max-w-xl mb-6 md:mb-8">
            <p className="font-body text-sm sm:text-lg md:text-xl text-gray-200 drop-shadow-sm leading-relaxed">
              Beginner-friendly hackathon hosted mid-October at the OCC Ballroom.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            <a
              href="#register"
              onMouseMove={handleMouseMove}
              className="liquid-glass inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-semibold text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Register Now
            </a>
            <a
              href="#details"
              className="inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-semibold text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
