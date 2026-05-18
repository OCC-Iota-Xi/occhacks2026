"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface PirateShipModelProps {
  scrollProgress?: number;
  section?: "hero" | "voyage";
}

export default function PirateShipModel({
  scrollProgress = 0,
  section = "hero",
}: PirateShipModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/3d_model/empty_ship.glb");

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (section === "hero") {
      // Idle floating animation
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.15;
      groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.03;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05 + Math.PI * 0.1;
    } else if (section === "voyage") {
      // Scroll-driven horizontal movement
      const x = THREE.MathUtils.lerp(-4, 4, scrollProgress);
      groupRef.current.position.x = x;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.1;
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
      groupRef.current.rotation.y = Math.PI * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]} position={[0, -0.5, 0]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/empty_ship.glb");
