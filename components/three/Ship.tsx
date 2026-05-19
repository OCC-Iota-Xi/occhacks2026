"use client";

import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Ship() {
  const shipRef = useRef<Group>(null);
  const primitiveRef = useRef<any>(null);

  // Load the model
  const { scene } = useGLTF("/3d_model/d.s.s._harbinger_battle_cruiser.glb");

  useGSAP(() => {
    if (!shipRef.current || !primitiveRef.current) return;

    // Position 1: Starting position (warp in start)
    // x: -1.30, y: 1.10, z: -6.90
    // Group Rotation x: 0.20, y: -1.50, z: 0.20
    // Object Rotation x: -0.05, y: 0.10, z: -0.10
    // Scale scale: 0.025
    gsap.set(shipRef.current.position, { x: -1.30, y: 1.10, z: -6.90 });
    gsap.set(shipRef.current.rotation, { x: 0.20, y: -1.50, z: 0.20 });
    gsap.set(primitiveRef.current.rotation, { x: -0.05, y: 0.10, z: -0.10 });
    gsap.set(primitiveRef.current.scale, { x: 0.025, y: 0.025, z: 0.025 });

    const tl = gsap.timeline();

    // Fly from Pos 1 to Pos 2 (warp)
    // Position x: 3.20, y: 0.80, z: -5.20
    // Group Rotation x: 0.15, y: -1.65, z: 0.20
    // Object Rotation x: 0.20, y: 0.15, z: -0.35
    // Scale scale: 0.070
    tl.to(shipRef.current.position, {
      x: 3.20, y: 0.80, z: -5.20,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(shipRef.current.rotation, {
      x: 0.15, y: -1.65, z: 0.20,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(primitiveRef.current.rotation, {
      x: 0.20, y: 0.15, z: -0.35,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(primitiveRef.current.scale, {
      x: 0.070, y: 0.070, z: 0.070,
      duration: 1.2,
      ease: "power2.in",
    }, 0);

    // Fly from Pos 2 to Pos 3 (settle for hero)
    // Position x: 5.20, y: 0.40, z: -3.00
    // Group Rotation x: 0.25, y: -1.55, z: 0.25
    // Object Rotation x: -0.05, y: -0.05, z: -0.30
    // Scale scale: 0.070
    tl.to(shipRef.current.position, {
      x: 5.20, y: 0.40, z: -3.00,
      duration: 3,
      ease: "power3.out",
    }, ">")
    .to(shipRef.current.rotation, {
      x: 0.25, y: -1.55, z: 0.25,
      duration: 3,
      ease: "power3.out",
    }, "<")
    .to(primitiveRef.current.rotation, {
      x: -0.05, y: -0.05, z: -0.30,
      duration: 3,
      ease: "power3.out",
    }, "<")
    // Scale stays the same for pos 3
  }, []);

  return (
    <group ref={shipRef} dispose={null}>
      <primitive ref={primitiveRef} object={scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
