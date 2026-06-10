"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect } from "react";
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
        end: "top top",
        scrub: 1.2,
      }
    });

    // End positions for camera position and look-at point
    // Matches the ship's relative position [17.60, -2.00, 4.40] on desktop
    const endCamX = isMobile ? -4.8 : -20;
    const endCamY = isMobile ? 1.7 : 5;
    const endCamZ = isMobile ? -1.0 : 5;

    const endLookX = isMobile ? 0.2 : 5.2;
    const endLookY = isMobile ? 2.7 : 0.4;
    const endLookZ = -3.0;

    scrollTl.to(baseCameraPos.current, {
      x: endCamX,
      y: endCamY,
      z: endCamZ,
      ease: "power2.inOut",
    }, 0)
      .to(baseLookAt.current, {
        x: endLookX,
        y: endLookY,
        z: endLookZ,
        ease: "power2.inOut",
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

    // Look at the animated base look-at target
    camera.lookAt(baseLookAt.current.x, baseLookAt.current.y, baseLookAt.current.z);

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
    <div className="fixed inset-0 -z-10 bg-[#050509] overflow-hidden">
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
        {/* <ColorfulNebula /> */}
        <Suspense fallback={null}>
          <Ship />
        </Suspense>
      </Canvas>
    </div>
  );
}
