"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect } from "react";
import Ship from "./Ship";
import HyperspaceStars from "./HyperspaceStars";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
 
function InteractiveSetup() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert client coordinates to normalized device coordinates (-1 to 1)
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  
  useFrame(({ camera }) => {
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // Parallax Camera movement (camera shifts slightly based on mouse, scaled down on mobile)
    const targetX = mx * (isMobile ? 0.4 : 1.5);
    const targetY = my * (isMobile ? 0.4 : 1.5);
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    
    // Look at a target point centered on the ship's final layout position (different for mobile vs desktop)
    const lookAtX = isMobile ? 0.2 : 1.5;
    const lookAtY = isMobile ? 0.5 : 0.2;
    camera.lookAt(lookAtX, lookAtY, -1.0);
    
    // Dynamic Lighting (directional key light moves slightly with mouse)
    if (lightRef.current) {
      const lightTargetX = 10 + mx * 6;
      const lightTargetY = 10 + my * 6;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, lightTargetX, 0.05);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, lightTargetY, 0.05);
    }

    // Dynamic Point Light (casts strong highlights on the front of the ship)
    if (pointLightRef.current) {
      const targetPX = (isMobile ? 0.2 : 4.8) + mx * 3.5;
      const targetPY = (isMobile ? 2.7 : 1.0) + my * 3.0;
      const targetPZ = 0.5; // In front of the ship's Z position (-3.0)
      pointLightRef.current.position.x = THREE.MathUtils.lerp(pointLightRef.current.position.x, targetPX, 0.05);
      pointLightRef.current.position.y = THREE.MathUtils.lerp(pointLightRef.current.position.y, targetPY, 0.05);
      pointLightRef.current.position.z = THREE.MathUtils.lerp(pointLightRef.current.position.z, targetPZ, 0.05);
    }
  });

  return (
    <>
      <directionalLight 
        ref={lightRef} 
        position={[10, 10, 5]} 
        intensity={1.8} 
        color="#ffffff" 
      />
      {/* Interactive hull light sweep */}
      <pointLight
        ref={pointLightRef}
        position={[4.8, 1.0, 0.5]}
        intensity={20}
        distance={25}
        decay={1.8}
        color="#aaccff"
      />
    </>
  );
}

export default function Scene1HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#050509] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={["#050509"]} />
        
        {/* Dramatic Space Lighting */}
        <ambientLight intensity={0.08} />
        
        {/* Dynamic Key Light & Camera Parallax */}
        <InteractiveSetup />
        
        {/* Blue Rim Light from below/behind for sci-fi look */}
        <directionalLight position={[-10, -10, -5]} intensity={1.2} color="#4b83f5" />
        
        {/* Environment map for realistic metallic reflections */}
        <Environment preset="city" environmentIntensity={0.35} />

        {/* Scene Objects */}
        <HyperspaceStars count={10000} />
        <Suspense fallback={null}>
          <Ship />
        </Suspense>
      </Canvas>
    </div>
  );
}
