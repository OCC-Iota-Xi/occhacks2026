"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ShipSandbox from "@/components/three/ShipSandbox";
import HyperspaceStars from "@/components/three/HyperspaceStars";
import { Environment, OrbitControls } from "@react-three/drei";

export default function SandboxPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050509]">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={["#050509"]} />
          
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={2} color="#4b83f5" />
          
          <Environment preset="city" />
          <OrbitControls makeDefault />

          <HyperspaceStars count={10000} />
          <Suspense fallback={null}>
            <ShipSandbox />
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
}
