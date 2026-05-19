"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Scene1HeroBackground from "@/components/three/Scene1HeroBackground";

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

  return (
    <main ref={container} className="relative flex min-h-screen items-center px-12 md:px-24">
      {/* 3D Scene Layer */}
      <Scene1HeroBackground />

      {/* Content Layer (Temporarily disabled)
      <div ref={textRef} className="max-w-2xl text-left z-10 pt-20">
        <h1 className="font-header text-6xl md:text-8xl mb-6 text-white drop-shadow-2xl tracking-wider leading-tight">
          OCC Hacks <br /><span className="text-amber-500">2026</span>
        </h1>
        <h2 className="font-accent text-4xl md:text-5xl mb-8 text-amber-500/90 drop-shadow-lg tracking-wide">
          The Space Pirate Hackathon
        </h2>
        <div className="border-l-4 border-amber-500/50 pl-6 py-2 bg-black/20 backdrop-blur-sm rounded-r-lg max-w-xl">
          <p className="font-body text-xl text-gray-300 drop-shadow-sm leading-relaxed">
            Gather your crew, board the ship, and build something bold at Orange Coast College's premier space pirate hackathon. 30 hours of building, learning, and competing.
          </p>
        </div>
      </div>
      */}
    </main >
  );
}
