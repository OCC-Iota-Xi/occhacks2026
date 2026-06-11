"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1HeroBackground from "@/components/three/Scene1HeroBackground";
import Navbar from "@/components/Navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const isScrolled = typeof window !== "undefined" && window.scrollY > 20;

    if (isScrolled) {
      gsap.set(textRef.current, {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
      });
    } else {
      // Start text hidden, shifted left, and blurred
      gsap.set(textRef.current, {
        opacity: 0,
        x: -50,
        filter: "blur(10px)",
      });

      // Animate text in after the ship settles
      const textAnim = gsap.to(textRef.current, {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 1.0,
        delay: 0.7, // Corresponds to the ship slowing down
        ease: "power3.out",
      });

      // If user scrolls before text finishes animating, complete it immediately
      ScrollTrigger.create({
        trigger: "#section-2",
        start: "top bottom",
        onEnter: () => {
          if (textAnim.isActive()) {
            textAnim.progress(1);
            textAnim.kill();
          }
        }
      });
    }

    // Animate Section 2 styling custom properties on scroll
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-2",
        start: "top bottom",
        end: "top top",
        scrub: 1.2,
      }
    });

    scrollTl.to(container.current, {
      "--text-primary": "#0f172a",
      "--text-secondary": "#475569",
      "--text-accent": "#0891b2",
      "--card-bg": "rgba(255, 255, 255, 0.75)",
      "--card-border": "rgba(15, 23, 42, 0.08)",
      "--card-desc": "#334155",
      "--card-1-accent": "#d97706",
      "--card-2-accent": "#0891b2",
      "--card-3-accent": "#7c3aed",
      "--nav-bg": "rgba(255, 255, 255, 0.75)",
      "--nav-border": "rgba(15, 23, 42, 0.08)",
      ease: "power2.inOut",
    }, 0);
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <main 
      ref={container} 
      className="relative flex flex-col min-h-screen"
      style={{
        "--text-primary": "#ffffff",
        "--text-secondary": "#d1d5db",
        "--text-accent": "#22d3ee",
        "--card-bg": "rgba(0, 0, 0, 0.4)",
        "--card-border": "rgba(255, 255, 255, 0.1)",
        "--card-desc": "#d1d5db",
        "--card-1-accent": "#fbbf24",
        "--card-2-accent": "#22d3ee",
        "--card-3-accent": "#c084fc",
        "--nav-bg": "rgba(5, 5, 9, 0)",
        "--nav-border": "rgba(255, 255, 255, 0)",
      } as React.CSSProperties}
    >
      {/* Aurora Background Layer (behind everything, revealed as space wipes away) */}
      <AuroraBackground showRadialGradient={true} className="!fixed !inset-0 !-z-20 !h-screen">
        <span />
      </AuroraBackground>

      {/* 3D Scene Layer (Fixed Background Canvas) */}
      <Scene1HeroBackground />

      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-between">
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
                href="#section-2"
                className="inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-semibold text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
              >
                Explore Tracks
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10px] tracking-[0.2em] text-gray-400 font-medium z-10 animate-pulse select-none">
          <span>SCROLL DOWN</span>
          <span className="h-4 w-[2px] bg-amber-500/60 rounded"></span>
        </div>
      </section>

      {/* Section 2: Tracks & Details */}
      <section id="section-2" className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-20 z-10">
        <div className="max-w-2xl text-left flex flex-col gap-6">
          <span className="inline-block text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text-accent)] font-bold mb-1">
            Choose Your Adventure
          </span>
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            Epic <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">Hackathon Tracks</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Whether you&apos;re a first-time coder or a veteran build-master, we have a track tailored for your crew. Claim bounty, win prizes, and push limits.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {/* Card 1 */}
            <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-1-accent)]/40 backdrop-blur-md p-5 rounded-xl transition-all duration-300 hover:translate-x-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--card-1-accent)] tracking-wider font-mono">01 // COSMOS CADET (BEGINNER)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--card-1-accent)]/10 border border-[var(--card-1-accent)]/20 text-[var(--card-1-accent)] rounded-full font-semibold">Starter Friendly</span>
              </div>
              <p className="text-sm text-[var(--card-desc)]">
                First time hacking? Build any web or mobile project, explore new frameworks, and learn from our mentors. No experience required.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/40 backdrop-blur-md p-5 rounded-xl transition-all duration-300 hover:translate-x-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--card-2-accent)] tracking-wider font-mono">02 // DEEP SPACE VOYAGE (SE)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--card-2-accent)]/10 border border-[var(--card-2-accent)]/20 text-[var(--card-2-accent)] rounded-full font-semibold">General Dev</span>
              </div>
              <p className="text-sm text-[var(--card-desc)]">
                Design scalable APIs, clean frontends, or full-stack tools. Tackle complex system integrations, dev tools, or community solutions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-3-accent)]/40 backdrop-blur-md p-5 rounded-xl transition-all duration-300 hover:translate-x-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--card-3-accent)] tracking-wider font-mono">03 // CYBER BOUNTY (AI / WEB3)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--card-3-accent)]/10 border border-[var(--card-3-accent)]/20 text-[var(--card-3-accent)] rounded-full font-semibold">Advanced Tech</span>
              </div>
              <p className="text-sm text-[var(--card-desc)]">
                Integrate large language models, build autonomous AI agents, train custom models, or create decentralized web3 applications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
