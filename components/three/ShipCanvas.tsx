"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import PirateShipModel from "./PirateShipModel";
import * as THREE from "three";

interface ShipCanvasProps {
  scrollProgress?: number;
  section?: "hero" | "voyage";
}

function ShipScene({ scrollProgress = 0, section = "hero" }: ShipCanvasProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#5B7FA5" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#C9A84C"
        castShadow
      />
      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.4}
        color="#5B7FA5"
      />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#C9A84C" distance={15} />

      {/* Stars */}
      <Stars
        radius={100}
        depth={60}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Fog */}
      <fog attach="fog" args={["#050509", 20, 80]} />

      {/* Ship */}
      <Suspense fallback={null}>
        <PirateShipModel scrollProgress={scrollProgress} section={section} />
      </Suspense>
    </>
  );
}

export default function ShipCanvas({ scrollProgress = 0, section = "hero" }: ShipCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 45 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: "transparent" }}
    >
      <ShipScene scrollProgress={scrollProgress} section={section} />
    </Canvas>
  );
}
