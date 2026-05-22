"use client";

import { useRef, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import EngineThruster from "./EngineThruster";

gsap.registerPlugin(useGSAP);

export default function Ship() {
  const shipRef = useRef<Group>(null);
  const modelGroupRef = useRef<Group>(null);
  const progressRef = useRef({ value: 0 });

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Set initial value on client mount
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load the model
  const { scene } = useGLTF("/3d_model/d.s.s._harbinger_battle_cruiser.glb");

  useGSAP(() => {
    if (isMobile === null) return;
    if (!shipRef.current || !modelGroupRef.current) return;

    const startPos = isMobile ? { x: -1.0, y: 3.4, z: -8.0 } : { x: -1.30, y: 1.10, z: -6.90 };
    const startScale = isMobile ? 0.020 : 0.040;

    const midPos = isMobile ? { x: -0.2, y: 3.0, z: -5.0 } : { x: 3.20, y: 0.80, z: -5.20 };
    const midScale = isMobile ? 0.048 : 0.11;

    const endPos = isMobile ? { x: 0.2, y: 2.7, z: -3.0 } : { x: 5.20, y: 0.40, z: -3.00 };
    const endScale = isMobile ? 0.048 : 0.11;

    // Position 1: Starting position (warp in start)
    gsap.set(shipRef.current.position, startPos);
    gsap.set(shipRef.current.rotation, { x: 0.20, y: -1.50, z: 0.20 });
    gsap.set(modelGroupRef.current.rotation, { x: -0.05, y: 0.10, z: -0.10 });
    gsap.set(modelGroupRef.current.scale, { x: startScale, y: startScale, z: startScale });
    gsap.set(progressRef.current, { value: 0 });

    const tl = gsap.timeline();

    // Fly from Pos 1 to Pos 2 (warp)
    tl.to(shipRef.current.position, {
      ...midPos,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(shipRef.current.rotation, {
      x: 0.15, y: -1.65, z: 0.20,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(modelGroupRef.current.rotation, {
      x: 0.20, y: 0.15, z: -0.35,
      duration: 1.2,
      ease: "power2.in",
    }, 0)
    .to(modelGroupRef.current.scale, {
      x: midScale, y: midScale, z: midScale,
      duration: 1.2,
      ease: "power2.in",
    }, 0);

    // Fly from Pos 2 to Pos 3 (settle for hero)
    tl.to(shipRef.current.position, {
      ...endPos,
      duration: 3,
      ease: "power3.out",
    }, ">")
    .to(shipRef.current.rotation, {
      x: 0.25, y: -1.55, z: 0.25,
      duration: 3,
      ease: "power3.out",
    }, "<")
    .to(modelGroupRef.current.rotation, {
      x: -0.05, y: -0.05, z: -0.30,
      duration: 3,
      ease: "power3.out",
    }, "<")
    .to(modelGroupRef.current.scale, {
      x: endScale, y: endScale, z: endScale,
      duration: 3,
      ease: "power3.out",
    }, "<")
    .to(progressRef.current, {
      value: 1,
      duration: 3,
      ease: "power3.out",
    }, "<");

    // Infinite floating yo-yo effect (added directly to the timeline for clean garbage collection/cleanup)
    tl.to(shipRef.current.position, {
      y: "+=0.10",
      duration: 3.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }, ">")
    .to(shipRef.current.rotation, {
      z: "+=0.015",
      x: "-=0.01",
      duration: 4.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }, "<");
  }, [isMobile]);

  return (
    <group ref={shipRef} dispose={null}>
      {/* Ship and thrusters grouped as 1 so they scale and rotate together */}
      <group ref={modelGroupRef}>
        <primitive object={scene} />
        
        {/* 1 - Far Left Thruster */}
        <EngineThruster 
          position={[-122.30, 13.73, -45.39]} 
          rotation={[0.00, -1.57, 0.00]} 
          progressRef={progressRef}
        />
        
        {/* 2 - Mid Left Thruster */}
        <EngineThruster 
          position={[-126.50, 11.60, -21.31]} 
          rotation={[0.00, -1.57, 0.00]} 
          progressRef={progressRef}
        />
        
        {/* 3 - Center Thruster */}
        <EngineThruster 
          position={[-131.27, 9.82, 0.73]} 
          rotation={[0.00, -1.57, 0.00]} 
          progressRef={progressRef}
        />
        
        {/* 4 - Mid Right Thruster */}
        <EngineThruster 
          position={[-125.50, 8.19, 23.01]} 
          rotation={[0.00, -1.57, 0.00]} 
          progressRef={progressRef}
        />
        
        {/* 5 - Far Right Thruster */}
        <EngineThruster 
          position={[-120.30, 6.96, 46.86]} 
          rotation={[0.00, -1.57, 0.00]} 
          progressRef={progressRef}
        />
      </group>
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
