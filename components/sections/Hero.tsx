"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

/**
 * The original space pirate hero: left-aligned OCCHacks title with the gold
 * gradient sweep, date line, and the clipped cyber CTAs. The backdrop is the
 * global WebGL particle field rendered in the root layout.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden min-h-screen flex flex-col justify-between"
    >
      {/* Main content container */}
      <div className="flex-1 flex items-center px-6 sm:px-12 md:px-24 z-10">
        <motion.div
          className="max-w-3xl w-full text-left translate-y-10 md:translate-y-14"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: -50, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.7, duration: 1.0, ease: [0.215, 0.61, 0.355, 1] }}
        >
          {/* Main Title (Bruno Ace SC font) */}
          <h1 className="font-header text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] 2xl:text-[6.5rem] mb-1 md:mb-1 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] tracking-wider leading-none">
            OCC<AnimatedGradientText
              style={{
                backgroundImage:
                  "linear-gradient(to right, #f97316 0%, #ffe259 25%, #ffffff 40%, #ffe259 55%, #f97316 70%, #ea580c 85%, #f97316 100%)",
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
              href="/register"
              onMouseMove={handleMouseMove}
              className="group relative inline-flex items-center justify-center font-header font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white select-none cursor-pointer focus:outline-none transition-all duration-300 active:scale-[0.97]"
            >
              {/* Clipped background and light sweep wrapper */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath:
                    "polygon(4px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 14px 100%, 0 calc(100% - 14px), 0 4px)",
                }}
              >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-[#ff8800]/10 group-hover:bg-[#ff8800]/20 transition-all duration-300" />

                {/* Mouse-tracking shine */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 136, 0, 0.45) 0%, rgba(255, 136, 0, 0.1) 45%, transparent 70%)",
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
              onMouseMove={handleMouseMove}
              className="group relative inline-flex items-center justify-center font-header font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white select-none cursor-pointer focus:outline-none transition-all duration-300 active:scale-[0.97]"
            >
              {/* Clipped background and light sweep wrapper */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath:
                    "polygon(4px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 14px 100%, 0 calc(100% - 14px), 0 4px)",
                }}
              >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all duration-300" />

                {/* Mouse-tracking shine */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)",
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
        </motion.div>
      </div>
    </section>
  );
}
