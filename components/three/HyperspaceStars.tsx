"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function HyperspaceStars({ count = 3000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const speedRef = useRef({ value: 15 }); // Start very fast for hyperspace

  useGSAP(() => {
    // Slow down over 3 seconds as the ship arrives
    gsap.to(speedRef.current, {
      value: 0.1,
      duration: 3,
      ease: "power4.out",
    });
  }, []);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
      spds[i] = Math.random() * 0.5 + 0.5; // individual variance
    }
    return [pos, spds];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Move stars towards camera (+z)
      positions[i3 + 2] += speedRef.current.value * speeds[i] * delta * 60;
      
      // Reset if they pass the camera
      if (positions[i3 + 2] > 20) {
        positions[i3 + 2] = -50;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
