"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1HeroBackground from "@/components/three/Scene1HeroBackground";
import Navbar from "@/components/Navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

// Modular Sections
import AboutSection from "@/components/sections/AboutSection";
import TracksSection from "@/components/sections/TracksSection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

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

    // Avoid a flash of visible content before the scrubbed timeline initializes
    gsap.set(".about-text-content", { x: -80, opacity: 0 });
    gsap.set(".about-video-panel", { x: 80, opacity: 0 });

    // Single scrubbed timeline: the background color transition AND the About
    // content slide in together, driven by scroll position.
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-2",
        start: "top 85%", // Begin as the About section starts entering view
        end: "top 15%",   // Complete shortly before it reaches the top
        scrub: 0.8,       // Smooth scrub tied directly to scroll, no snapping
      }
    });

    // Background / theme color transition (dark space -> light aurora)
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
      "--nav-blur": "12px",
      ease: "power2.inOut",
    }, 0);

    // Fade out and float up the Hero text block as we scroll to Section 2
    scrollTl.to(textRef.current, {
      opacity: 0,
      y: -30,
      ease: "power1.out",
    }, 0);

    // About narrative slides in from the left, in sync with the bg transition
    scrollTl.fromTo(".about-text-content",
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, ease: "power3.out" },
      0.1
    );

    // Past Hackathons panel slides in from the right at the same time
    scrollTl.fromTo(".about-video-panel",
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, ease: "power3.out" },
      0.1
    );
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
        "--nav-bg": "rgba(9, 9, 11, 0)",
        "--nav-border": "rgba(255, 255, 255, 0)",
        "--nav-blur": "0px",
      } as React.CSSProperties}
    >
      {/* Aurora Background Layer (behind everything, revealed as space wipes away) */}
      <AuroraBackground showRadialGradient={true} className="!fixed !inset-0 !-z-20 !h-screen">
        <span />
      </AuroraBackground>

      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-screen flex flex-col justify-between">
        {/* 3D Scene Layer — confined to the hero viewport, scrolls away with it */}
        <Scene1HeroBackground />

        {/* Main content container */}
        <div className="flex-1 flex items-center px-6 sm:px-12 md:px-24 z-10">
          <div ref={textRef} className="max-w-3xl w-full text-left translate-y-10 md:translate-y-14">

            {/* Main Title (Bruno Ace SC font) */}
            <h1 className="font-header text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] 2xl:text-[6.5rem] mb-1 md:mb-1 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] tracking-wider leading-none">
              OCC<AnimatedGradientText
                style={{
                  backgroundImage: "linear-gradient(to right, #f97316 0%, #ffe259 25%, #ffffff 40%, #ffe259 55%, #f97316 70%, #ea580c 85%, #f97316 100%)"
                }}
              >Hacks</AnimatedGradientText>
            </h1>

            {/* Event Details */}
            <div className="mb-6 md:mb-8 font-header text-left">
              <span className="pl-1.5 text-xs sm:text-xs md:text-sm text-white tracking-[0.15em] font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] block">
                October 11-12th, 2026 @{" "}
                <a
                  href="https://orangecoastcollege.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-2"
                >
                  Orange Coast College
                </a>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <a
                href="#register"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                }}
                className="group relative inline-flex items-center justify-center font-header font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white select-none cursor-pointer focus:outline-none transition-all duration-300 active:scale-[0.97]"
              >
                {/* Clipped background and light sweep wrapper */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: "polygon(4px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 14px 100%, 0 calc(100% - 14px), 0 4px)",
                  }}
                >
                  {/* Background overlay */}
                  <div className="absolute inset-0 bg-[#ff8800]/10 group-hover:bg-[#ff8800]/20 transition-all duration-300" />
                  
                  {/* Mouse-tracking shine */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 136, 0, 0.45) 0%, rgba(255, 136, 0, 0.1) 45%, transparent 70%)"
                    }}
                  />
                </div>

                {/* Content */}
                <span className="relative z-10 px-7 py-3 sm:px-9 sm:py-3.5 flex items-center justify-center gap-2 text-[#ff8800] group-hover:text-[#ffaa33] transition-colors duration-300">
                  {/* Cyber Icon with Shifting Lights */}
                  <div className="relative w-3.5 h-4 flex-shrink-0 mr-1">
                    <div className="absolute w-1 h-1 top-0 left-0 bg-current opacity-80 cyber-light-1" />
                    <div className="absolute w-1 h-1 top-0 right-0 bg-current opacity-30 cyber-light-2" />
                    <div className="absolute w-1 h-1 left-0 top-1/2 -translate-y-1/2 bg-current opacity-40 cyber-light-3" />
                    <div className="absolute w-1 h-1 right-0 top-1/2 -translate-y-1/2 bg-current opacity-70 cyber-light-1" />
                    <div className="absolute w-1 h-1 bottom-0 left-0 bg-current opacity-60 cyber-light-2" />
                    <div className="absolute w-1 h-1 bottom-0 right-0 bg-current opacity-30 cyber-light-3" />
                  </div>
                  Register Now
                </span>

                {/* SVG Border Outline */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 187.21875 40.796875"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 4,0 Q 0,0 0,4 L 0,24.478125 Q 0,26.599562499999998 1.0933562500000003,27.741875 L 13.055000000000001,39.70351875 Q 14.1973125,40.796875 16.31875,40.796875 L 183.21875,40.796875 Q 187.21875,40.796875 187.21875,36.796875 L 187.21875,16.31875 Q 187.21875,14.1973125 186.12539375,13.055000000000001 L 174.16375,1.0933562500000003 Q 173.0214375,0 170.9,0 Z"
                    fill="none"
                    stroke="rgba(255, 136, 0, 0.3)"
                    strokeWidth="1.5"
                    className="group-hover:stroke-[#ff8800] group-hover:stroke-opacity-95 transition-all duration-300"
                  />
                </svg>
              </a>

              <a
                href="#about"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                }}
                className="group relative inline-flex items-center justify-center font-header font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white select-none cursor-pointer focus:outline-none transition-all duration-300 active:scale-[0.97]"
              >
                {/* Clipped background and light sweep wrapper */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: "polygon(4px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 14px 100%, 0 calc(100% - 14px), 0 4px)",
                  }}
                >
                  {/* Background overlay */}
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all duration-300" />
                  
                  {/* Mouse-tracking shine */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)"
                    }}
                  />
                </div>

                {/* Content */}
                <span className="relative z-10 px-7 py-3 sm:px-9 sm:py-3.5 flex items-center justify-center gap-2 text-gray-400 group-hover:text-white transition-colors duration-300">
                  {/* Cyber Icon with Shifting Lights */}
                  <div className="relative w-3.5 h-4 flex-shrink-0 mr-1">
                    <div className="absolute w-1 h-1 top-0 left-0 bg-current opacity-80 cyber-light-2" />
                    <div className="absolute w-1 h-1 top-0 right-0 bg-current opacity-30 cyber-light-3" />
                    <div className="absolute w-1 h-1 left-0 top-1/2 -translate-y-1/2 bg-current opacity-40 cyber-light-1" />
                    <div className="absolute w-1 h-1 right-0 top-1/2 -translate-y-1/2 bg-current opacity-70 cyber-light-2" />
                    <div className="absolute w-1 h-1 bottom-0 left-0 bg-current opacity-60 cyber-light-3" />
                    <div className="absolute w-1 h-1 bottom-0 right-0 bg-current opacity-30 cyber-light-1" />
                  </div>
                  Learn More
                </span>

                {/* SVG Border Outline */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 187.21875 40.796875"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 4,0 Q 0,0 0,4 L 0,24.478125 Q 0,26.599562499999998 1.0933562500000003,27.741875 L 13.055000000000001,39.70351875 Q 14.1973125,40.796875 16.31875,40.796875 L 183.21875,40.796875 Q 187.21875,40.796875 187.21875,36.796875 L 187.21875,16.31875 Q 187.21875,14.1973125 186.12539375,13.055000000000001 L 174.16375,1.0933562500000003 Q 173.0214375,0 170.9,0 Z"
                    fill="none"
                    stroke="rgba(213, 224, 255, 0.15)"
                    strokeWidth="1.5"
                    className="group-hover:stroke-white group-hover:stroke-opacity-50 transition-all duration-300"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About Us */}
      <AboutSection aboutTextRef={aboutTextRef} videoContainerRef={videoContainerRef} />

      {/* Section 3: Tracks */}
      <TracksSection />

      {/* Section 4: Sponsors */}
      <SponsorsSection />

      {/* Section 5: FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
