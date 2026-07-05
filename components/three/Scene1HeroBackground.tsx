"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState } from "react";
import Ship from "./Ship";
import HyperspaceStars from "./HyperspaceStars";
import ColorfulNebula from "./ColorfulNebula";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(useGSAP, ScrollTrigger);

function InteractiveSetup() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Refs to store base camera position and look-at point (animated by GSAP)
  const baseCameraPos = useRef(new THREE.Vector3(0, 0, 10));
  const baseLookAt = useRef(new THREE.Vector3(1.5, 0.2, -1.0));

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

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // Initialize base camera and look-at targets
    baseCameraPos.current.set(0, 0, 10);
    baseLookAt.current.set(isMobile ? 0.2 : 1.5, isMobile ? 0.5 : 0.2, -1.0);

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-2",
        start: "top bottom",
        end: "top center",
        scrub: 1.2,
      }
    });

    // Camera moves to the side of the ship as it turns sideways (0.0 - 0.25)
    scrollTl.to(baseCameraPos.current, {
      x: isMobile ? 2.0 : 5.0,
      y: isMobile ? 0.8 : 2.5,
      z: isMobile ? 11.0 : 10.0,
      duration: 0.25,
      ease: "none",
    }, 0)
      .to(baseLookAt.current, {
        x: isMobile ? 2.0 : 5.2,
        y: isMobile ? 0.5 : 0.4,
        z: isMobile ? -3.0 : -3.0,
        duration: 0.25,
        ease: "none",
      }, 0);

  });

  useFrame(({ camera }) => {
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // Parallax Camera movement based on mouse
    const parallaxX = mx * (isMobile ? 0.4 : 1.5);
    const parallaxY = my * (isMobile ? 0.4 : 1.5);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, baseCameraPos.current.x + parallaxX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseCameraPos.current.y + parallaxY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseCameraPos.current.z, 0.05);

    // Look at the base look-at target
    camera.lookAt(baseLookAt.current.x, baseLookAt.current.y, baseLookAt.current.z);

    // Dynamic Lighting (directional key light moves slightly with mouse)
    if (lightRef.current) {
      const lightTargetX = 10 + mx * 6;
      const lightTargetY = 10 + my * 6;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, lightTargetX, 0.05);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, lightTargetY, 0.05);
    }

    // Dynamic Point Light tracks the ship group's position dynamically in real-time
    const shipObj = camera.parent?.getObjectByName("ship-group");
    const shipX = shipObj ? shipObj.position.x : (isMobile ? 0.2 : 4.8);
    const shipY = shipObj ? shipObj.position.y : (isMobile ? 2.7 : 1.0);
    const shipZ = shipObj ? shipObj.position.z : -3.0;

    if (pointLightRef.current) {
      if (shipObj && shipObj.visible === false) {
        pointLightRef.current.intensity = 0;
      } else {
        const targetPX = shipX + mx * 3.5;
        const targetPY = shipY + 0.6 + my * 3.0;
        const targetPZ = shipZ + 3.5; // In front of the ship's Z position
        pointLightRef.current.position.x = THREE.MathUtils.lerp(pointLightRef.current.position.x, targetPX, 0.05);
        pointLightRef.current.position.y = THREE.MathUtils.lerp(pointLightRef.current.position.y, targetPY, 0.05);
        pointLightRef.current.position.z = THREE.MathUtils.lerp(pointLightRef.current.position.z, targetPZ, 0.05);
        
        // Restore standard intensity (1.5)
        pointLightRef.current.intensity = THREE.MathUtils.lerp(pointLightRef.current.intensity, 1.5, 0.05);
      }
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[10, 10, 5]}
        intensity={0.1}
        color="#ffffff"
      />
      {/* Interactive hull light sweep */}
      <pointLight
        ref={pointLightRef}
        position={[4.8, 1.0, 0.5]}
        intensity={1.5}
        distance={25}
        decay={1.8}
        color="#ffffff"
      />
    </>
  );
}

export default function Scene1HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Only render frames while the hero canvas is actually on screen. Once it
  // scrolls out of view the render loop is parked so the GPU goes idle.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden scene-bg-wrapper"
      style={{
        background: "oklch(14.1% 0.005 285.823)",
      } as React.CSSProperties}
    >
      <Canvas dpr={[1, 2]} frameloop={onScreen ? "always" : "never"} camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
        {/* Transparent background canvas - background color is handled by parent div */}

        {/* Dramatic Space Lighting */}
        <ambientLight intensity={0.015} />

        {/* Dynamic Key Light & Camera Parallax */}
        <InteractiveSetup />

        {/* Soft starlight rim light from below/behind */}
        <directionalLight position={[-10, -10, -5]} intensity={0.15} color="#dce6ff" />

        {/* Environment map for realistic metallic reflections */}
        <Environment preset="studio" environmentIntensity={0.1} />

        {/* Scene Objects */}
        <HyperspaceStars count={5000} />
        {/* <ColorfulNebula /> */}
        <Suspense fallback={null}>
          <Ship />
        </Suspense>
      </Canvas>
    </div>
  );
}
