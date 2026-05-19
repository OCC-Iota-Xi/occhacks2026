"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EngineThrusterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function EngineThruster({ 
  position = [0, 0, 0],
  rotation = [0, 0, 0] 
}: EngineThrusterProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Intense chaotic flicker for the light source
    if (lightRef.current) {
      lightRef.current.intensity = 5 + Math.random() * 5;
    }

    // High-frequency jitter for the outer plasma plume (creates a burning effect)
    if (outerMeshRef.current) {
      outerMeshRef.current.scale.y = 1 + Math.sin(t * 40) * 0.05 + Math.random() * 0.1;
      outerMeshRef.current.scale.x = 1 + Math.random() * 0.05;
      outerMeshRef.current.scale.z = 1 + Math.random() * 0.05;
    }

    // Faster, tighter pulse for the ultra-hot inner core
    if (innerMeshRef.current) {
      innerMeshRef.current.scale.y = 1 + Math.sin(t * 50) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Dynamic Engine Light casting onto the hull */}
      <pointLight ref={lightRef} color="#ff4400" distance={25} decay={1.5} />
      
      {/* Outer Plasma Plume (Orange/Red) */}
      {/* Note: Cylinder/Cone points UP (Y-axis) by default, rotated to point Z+ */}
      <mesh ref={outerMeshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 5]}>
        <coneGeometry args={[0.6, 10, 32]} />
        <meshStandardMaterial 
          color="#ff5500" 
          emissive="#ff2200" 
          emissiveIntensity={5} 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner Ultra-Hot Core (White/Yellow) */}
      <mesh ref={innerMeshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 2.5]}>
        <cylinderGeometry args={[0.2, 0.4, 5, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffcc00" 
          emissiveIntensity={10} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Base Engine Ring Glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
        <torusGeometry args={[0.45, 0.08, 16, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ff4400" 
          emissiveIntensity={15} 
        />
      </mesh>
    </group>
  );
}
