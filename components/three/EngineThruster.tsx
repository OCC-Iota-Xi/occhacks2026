"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Color palettes for Warp (Blue) vs. Settle (Red Simmer)
const colors = {
  outer: {
    colorWarp: new THREE.Color("#00aaff"),
    colorSettle: new THREE.Color("#ff2200"),
    emissiveWarp: new THREE.Color("#0044ff"),
    emissiveSettle: new THREE.Color("#990000"),
  },
  inner: {
    colorWarp: new THREE.Color("#ffffff"),
    colorSettle: new THREE.Color("#ffaa00"),
    emissiveWarp: new THREE.Color("#00ffff"),
    emissiveSettle: new THREE.Color("#ff1100"),
  },
  ring: {
    colorWarp: new THREE.Color("#ffffff"),
    colorSettle: new THREE.Color("#ff3300"),
    emissiveWarp: new THREE.Color("#00aaff"),
    emissiveSettle: new THREE.Color("#990000"),
  },
  light: {
    colorWarp: new THREE.Color("#0088ff"),
    colorSettle: new THREE.Color("#ff3300"),
  }
};

interface EngineThrusterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  progressRef?: React.RefObject<{ value: number }>;
}

export default function EngineThruster({ 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  progressRef
}: EngineThrusterProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  
  const outerMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const innerMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Check if this thruster is visible by checking parent visibility recursively
    let isVisible = true;
    if (lightRef.current) {
      let parent = lightRef.current.parent;
      while (parent) {
        if (parent.visible === false) {
          isVisible = false;
          break;
        }
        parent = parent.parent;
      }
    }

    if (!isVisible) {
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    // progress: 0 = blue/big (warp), 1 = red/simmer (settled)
    const p = progressRef?.current?.value ?? 1;
    const clampedP = Math.max(0, Math.min(1, p));

    // Calculate fade factor for negative p values (fade out as the engine expands off-screen)
    const fadeFactor = p < 0 ? Math.max(0, 1 + p / 3.0) : 1.0;

    // Separate scale multipliers: extremely long at warp, but only moderately wide
    // Increased starting widthScale to 22.0 to make the initial thruster radius much larger.
    // Increased ending lengthScale to 7.5 to make the finishing thruster flame longer.
    const lengthScale = THREE.MathUtils.lerp(90.0, 7.5, p);
    const widthScale = THREE.MathUtils.lerp(22.0, 1.05, p);

    // Soft, slow hum/pulsing with very minor heat shimmer (max 3% variance)
    const flicker = Math.sin(t * 12.0) * 0.02 + Math.cos(t * 5.0) * 0.01 + (Math.random() - 0.5) * 0.005;

    // Dynamic light color, intensity, and range
    if (lightRef.current) {
      lightRef.current.color.copy(colors.light.colorWarp).lerp(colors.light.colorSettle, clampedP);
      const baseIntensity = THREE.MathUtils.lerp(150, 5.5, clampedP);
      // Soft light intensity fluctuation (max 1.5% fluctuation for comfortable view)
      lightRef.current.intensity = baseIntensity * (1.0 + flicker * 0.5) * fadeFactor;
      lightRef.current.distance = THREE.MathUtils.lerp(300, 35, clampedP);
    }

    // High-frequency jitter and scale for the outer plasma plume
    if (outerMeshRef.current && outerMatRef.current) {
      // Y-axis is length, X/Z are width in local mesh coordinates due to rotation
      outerMeshRef.current.scale.y = (1 + Math.sin(t * 25) * 0.02 + Math.cos(t * 8) * 0.01) * lengthScale;
      outerMeshRef.current.scale.x = (1 + Math.sin(t * 15) * 0.01) * widthScale;
      outerMeshRef.current.scale.z = (1 + Math.sin(t * 15) * 0.01) * widthScale;
      
      // Shift position so it stays anchored to the engine nozzle
      outerMeshRef.current.position.z = 5 * lengthScale;
      
      // Interpolate colors and emissive properties with flickering
      outerMatRef.current.color.copy(colors.outer.colorWarp).lerp(colors.outer.colorSettle, clampedP);
      outerMatRef.current.emissive.copy(colors.outer.emissiveWarp).lerp(colors.outer.emissiveSettle, clampedP);
      
      const baseEmissive = THREE.MathUtils.lerp(18, 1.8, clampedP);
      outerMatRef.current.emissiveIntensity = baseEmissive * (1.0 + flicker * 0.2) * fadeFactor;
      outerMatRef.current.opacity = THREE.MathUtils.lerp(0.95, 0.55, clampedP) * fadeFactor;
    }

    // Faster, tighter pulse for the inner core
    if (innerMeshRef.current && innerMatRef.current) {
      innerMeshRef.current.scale.y = (1 + Math.sin(t * 30) * 0.02) * lengthScale;
      innerMeshRef.current.scale.x = (1 + Math.cos(t * 20) * 0.01) * widthScale;
      innerMeshRef.current.scale.z = (1 + Math.cos(t * 20) * 0.01) * widthScale;
      
      // Anchor to the engine nozzle
      innerMeshRef.current.position.z = 2.5 * lengthScale;
      
      // Interpolate core colors and emissive properties with flickering
      innerMatRef.current.color.copy(colors.inner.colorWarp).lerp(colors.inner.colorSettle, clampedP);
      innerMatRef.current.emissive.copy(colors.inner.emissiveWarp).lerp(colors.inner.emissiveSettle, clampedP);
      
      const baseInnerEmissive = THREE.MathUtils.lerp(25, 3.2, clampedP);
      innerMatRef.current.emissiveIntensity = baseInnerEmissive * (1.0 + flicker * 0.15) * fadeFactor;
      innerMatRef.current.opacity = (1.0 - clampedP) * fadeFactor;
    }

    // Interpolate base engine ring glow with slight flickering sync
    if (ringMatRef.current) {
      ringMatRef.current.color.copy(colors.ring.colorWarp).lerp(colors.ring.colorSettle, clampedP);
      ringMatRef.current.emissive.copy(colors.ring.emissiveWarp).lerp(colors.ring.emissiveSettle, clampedP);
      const baseRingEmissive = THREE.MathUtils.lerp(30, 3.0, clampedP);
      ringMatRef.current.emissiveIntensity = baseRingEmissive * (1.0 + flicker * 0.1) * fadeFactor;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Dynamic Engine Light casting onto the hull */}
      <pointLight ref={lightRef} distance={30} decay={1.5} />
      
      {/* Outer Plasma Plume (Cone points UP by default, rotated to Z+) */}
      <mesh ref={outerMeshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 5]}>
        <coneGeometry args={[0.6, 10, 32]} />
        <meshStandardMaterial 
          ref={outerMatRef}
          transparent 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner Ultra-Hot Core */}
      <mesh ref={innerMeshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 2.5]}>
        <cylinderGeometry args={[0.2, 0.4, 5, 16]} />
        <meshStandardMaterial 
          ref={innerMatRef}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Base Engine Ring Glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
        <torusGeometry args={[0.45, 0.08, 16, 32]} />
        <meshStandardMaterial 
          ref={ringMatRef}
        />
      </mesh>
    </group>
  );
}
