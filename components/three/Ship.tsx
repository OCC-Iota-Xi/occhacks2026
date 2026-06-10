"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EngineThruster from "./EngineThruster";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Ship() {
  const shipRef = useRef<Group>(null);
  const floatGroupRef = useRef<Group>(null);
  const modelGroupRef = useRef<Group>(null);
  const progressRef = useRef({ value: 0 });
  const isMobileRef = useRef(false);

  // Track isMobile via ref (no state → no re-renders)
  useEffect(() => {
    const update = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load the model
  const { scene } = useGLTF("/3d_model/d.s.s._harbinger_battle_cruiser.glb");

  useGSAP(() => {
    const ship = shipRef.current;
    const modelGroup = modelGroupRef.current;
    const floatGroup = floatGroupRef.current;

    if (!ship || !modelGroup || !floatGroup) return;

    const mobile = isMobileRef.current;

    const startPos = mobile ? { x: -1.0, y: 3.4, z: -8.0 } : { x: -1.30, y: 1.10, z: -6.90 };
    const startScale = mobile ? 0.020 : 0.040;

    const midPos = mobile ? { x: -0.2, y: 3.0, z: -5.0 } : { x: 3.20, y: 0.80, z: -5.20 };
    const midScale = mobile ? 0.048 : 0.11;

    const endPos = mobile ? { x: 0.2, y: 2.7, z: -3.0 } : { x: 5.20, y: 0.40, z: -3.00 };
    const endScale = mobile ? 0.048 : 0.11;

    // Position 1: Starting position (warp in start)
    gsap.set(ship.position, startPos);
    gsap.set(ship.rotation, { x: 0.20, y: -1.50, z: 0.20 });
    gsap.set(modelGroup.rotation, { x: -0.05, y: 0.10, z: -0.10 });
    gsap.set(modelGroup.scale, { x: startScale, y: startScale, z: startScale });
    gsap.set(progressRef.current, { value: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (!ship || !modelGroup || !floatGroup) return;

        // Infinite floating yo-yo
        gsap.to(floatGroup.position, {
          y: "+=0.10",
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        
        gsap.to(floatGroup.rotation, {
          z: "+=0.015",
          x: "-=0.01",
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Scroll trigger transition for Section 2
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#section-2",
            start: "top bottom",
            end: "top top",
            scrub: 1.2,
          }
        });

        scrollTl.to(ship.rotation, {
          x: 0.25, y: -1.55, z: 0.10,
          ease: "power2.inOut",
        }, 0)
        .to(modelGroup.rotation, {
          x: -0.10, y: 1.30, z: -0.00,
          ease: "power2.inOut",
        }, 0)
        .to(modelGroup.scale, {
          x: mobile ? 0.048 : 0.110,
          y: mobile ? 0.048 : 0.110,
          z: mobile ? 0.048 : 0.110,
          ease: "power2.inOut",
        }, 0);

        // Thruster intensity during scroll
        scrollTl.to(progressRef.current, {
          value: 0.0,
          duration: 0.5,
          ease: "power1.in",
        }, 0)
        .to(progressRef.current, {
          value: 0.3,
          duration: 0.5,
          ease: "power1.out",
        }, 0.5);

        ScrollTrigger.refresh();
      }
    });

    // Fly from Pos 1 to Pos 2 (warp)
    tl.to(ship.position, {
      ...midPos, duration: 1.2, ease: "power2.in",
    }, 0)
    .to(ship.rotation, {
      x: 0.15, y: -1.65, z: 0.20,
      duration: 1.2, ease: "power2.in",
    }, 0)
    .to(modelGroup.rotation, {
      x: 0.20, y: 0.15, z: -0.35,
      duration: 1.2, ease: "power2.in",
    }, 0)
    .to(modelGroup.scale, {
      x: midScale, y: midScale, z: midScale,
      duration: 1.2, ease: "power2.in",
    }, 0);

    // Fly from Pos 2 to Pos 3 (settle for hero)
    tl.to(ship.position, {
      ...endPos, duration: 3, ease: "power3.out",
    }, ">")
    .to(ship.rotation, {
      x: 0.25, y: -1.55, z: 0.25,
      duration: 3, ease: "power3.out",
    }, "<")
    .to(modelGroup.rotation, {
      x: -0.05, y: -0.05, z: -0.30,
      duration: 3, ease: "power3.out",
    }, "<")
    .to(modelGroup.scale, {
      x: endScale, y: endScale, z: endScale,
      duration: 3, ease: "power3.out",
    }, "<")
    .to(progressRef.current, {
      value: 1, duration: 3, ease: "power3.out",
    }, "<");

  }); // No deps — useGSAP handles Strict Mode naturally

  return (
    <group
      ref={shipRef}
      dispose={null}
      position={[5.20, 0.40, -3.00]}
      rotation={[0.25, -1.55, 0.25]}
    >
      <group ref={floatGroupRef}>
        <group
          ref={modelGroupRef}
          scale={0.11}
          rotation={[-0.05, -0.05, -0.30]}
        >
          <primitive object={scene} />
          
          {/* 1 - Far Left Thruster */}
          <EngineThruster 
            position={[-122.00, 14.03, -44.89]} 
            rotation={[0.00, -1.57, 0.00]} 
            progressRef={progressRef}
          />
          
          {/* 2 - Mid Left Thruster */}
          <EngineThruster 
            position={[-126.20, 11.90, -21.21]} 
            rotation={[0.00, -1.57, 0.00]} 
            progressRef={progressRef}
          />
          
          {/* 3 - Center Thruster */}
          <EngineThruster 
            position={[-131.47, 9.82, 0.73]} 
            rotation={[0.00, -1.57, 0.00]} 
            progressRef={progressRef}
          />
          
          {/* 4 - Mid Right Thruster */}
          <EngineThruster 
            position={[-126.20, 8.29, 23.01]} 
            rotation={[0.00, -1.57, 0.00]} 
            progressRef={progressRef}
          />
          
          {/* 5 - Far Right Thruster */}
          <EngineThruster 
            position={[-122.00, 7.06, 46.76]} 
            rotation={[0.00, -1.57, 0.00]} 
            progressRef={progressRef}
          />
        </group>
      </group>
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
