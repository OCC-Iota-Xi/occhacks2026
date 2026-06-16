"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// A simple deterministic pseudo-random generator to satisfy React's render purity rules
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function HyperspaceStars({ count = 3000 }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  // Speed goes from fast (warp) to slow (idle)
  const speedRef = useRef({ value: 20 });

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.to(speedRef.current, {
      value: 20,
      duration: 0.2, // Stay fast during initial warp
      ease: "none"
    })
      .to(speedRef.current, {
        value: 0.1,
        duration: 0.4, // Slow down as the ship settles
        ease: "power3.out",
      });

    // Fade & warp stars out as we scroll to Section 2
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-2",
        start: "top bottom",
        end: "top center",
        scrub: 1.2,
      }
    });

    // Animate star speed to a moderate speed-up
    scrollTl.to(speedRef.current, {
      value: 12,
      ease: "power1.in",
    }, 0);

    if (linesRef.current) {
      // Gently rotate the star field to shift the vanishing point to the left
      scrollTl.to(linesRef.current.rotation, {
        x: 0.1, // Keep original vertical rotation
        y: 0.35, // Gentle shift to the left
        z: 0.0,
        ease: "power1.out",
      }, 0);

      // Slide the entire star field subtly to the left
      scrollTl.to(linesRef.current.position, {
        x: -20,
        y: 0,
        ease: "power1.inOut",
      }, 0);

      // Fade out opacity as transition completes
      scrollTl.to(linesRef.current.material, {
        opacity: 0,
        ease: "power1.inOut",
      }, 0.25);
    }
  }, []);

  const [geometry, speeds] = useMemo(() => {
    const random = createSeededRandom(42);
    // 2 vertices per line (start and end), 3 coordinates per vertex
    const pos = new Float32Array(count * 2 * 3);
    const colors = new Float32Array(count * 2 * 3);
    const spds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (random() - 0.5) * 200;
      const y = (random() - 0.5) * 200;
      const z = (random() - 0.5) * 200;

      // Point 1 (head)
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      // Point 2 (tail)
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z;

      // Size and Speed Category Variance
      const rand = random();
      let r = 1.0, g = 1.0, b = 1.0;

      if (rand > 0.92) {
        // Large, bright close-up stars (8% of stars)
        spds[i] = random() * 1.5 + 1.5; // speed factor 1.5 to 3.0
        r = 1.0; g = 1.0; b = 1.0;
      } else if (rand > 0.75) {
        // Medium bright stars (17% of stars)
        spds[i] = random() * 0.5 + 0.8; // speed factor 0.8 to 1.3
        r = 0.7; g = 0.85; b = 1.0;
      } else {
        // Tiny, distant background stars (75% of stars)
        spds[i] = random() * 0.3 + 0.2; // speed factor 0.2 to 0.5
        r = 0.25; g = 0.4; b = 0.65;
      }

      // Assign colors to both head and tail vertices
      colors[i * 6] = r;
      colors[i * 6 + 1] = g;
      colors[i * 6 + 2] = b;
      colors[i * 6 + 3] = r;
      colors[i * 6 + 4] = g;
      colors[i * 6 + 5] = b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return [geo, spds];
  }, [count]);

  useFrame((state, delta) => {
    if (!linesRef.current) return;

    // Performance optimization: bypass loops if stars are completely invisible
    const material = linesRef.current.material as THREE.LineBasicMaterial;
    if (material && material.opacity === 0) return;

    const pos = linesRef.current.geometry.attributes.position.array as Float32Array;

    const speed = speedRef.current.value;
    // Stretch multiplier. When speed is 0.1, stretch is very tiny (looks like a dot)
    // When speed is 20, stretch is long (looks like a line)
    const stretchLength = speed * 2;

    for (let i = 0; i < count; i++) {
      const i6 = i * 6;

      // Move head away from camera (-z)
      pos[i6 + 2] -= speed * speeds[i] * delta * 60;

      // Reset if head goes too far back
      if (pos[i6 + 2] < -150) {
        pos[i6 + 2] = 50;
      }

      // Tail follows head but stretched forwards along Z axis (since it's moving backwards, the tail trails behind in the +z direction)
      pos[i6 + 3] = pos[i6];     // x
      pos[i6 + 4] = pos[i6 + 1]; // y
      pos[i6 + 5] = pos[i6 + 2] + stretchLength * speeds[i]; // tail z
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      {/* 
        TWEAK THE STAR CONVERGENCE / VANISHING POINT HERE:
        
        The stars travel along the Z-axis in their local coordinates. By rotating this 
        entire group, you change the travel angle of the stars relative to the camera,
        which shifts where they appear to converge (the vanishing point).
        
        Format: rotation={[X, Y, Z]} in radians.
        
        How to adjust the vanishing point:
        - To shift the convergence point further LEFT:
          Increase the Y-rotation (second value), e.g. [0, 0.5, 0]
        - To shift the convergence point further RIGHT:
          Decrease the Y-rotation (second value), e.g. [0, -0.1, 0]
        - To shift the convergence point further UP:
          Decrease the X-rotation (first value), e.g. [-0.2, 0.3, 0]
        - To shift the convergence point further DOWN:
          Increase the X-rotation (first value), e.g. [0.2, 0.3, 0]
          
        Adjust in small increments (e.g. +/- 0.05 or 0.1) to fine-tune the angle.
      */}
      <lineSegments ref={linesRef} rotation={[0.1, 0.1, 0]} geometry={geometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.8}
        />
      </lineSegments>
    </>
  );
}
