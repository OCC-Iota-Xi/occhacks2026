"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Ship from "./Ship";
import HyperspaceStars from "./HyperspaceStars";
import { Environment } from "@react-three/drei";

export default function Scene1HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#050509] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={["#050509"]} />
        
        {/* Dramatic Space Lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Main Key Light (Sun-like) */}
        <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
        
        {/* Blue Rim Light from below/behind for sci-fi look */}
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#4b83f5" />
        
        {/* Environment map for realistic metallic reflections */}
        <Environment preset="city" />

        {/* Scene Objects */}
        <HyperspaceStars count={10000} />
        <Suspense fallback={null}>
          <Ship />
        </Suspense>
      </Canvas>
    </div>
  );
}
