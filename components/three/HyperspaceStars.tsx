"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function HyperspaceStars({ count = 3000 }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  // Speed goes from fast (warp) to slow (idle)
  const speedRef = useRef({ value: 20 });

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.to(speedRef.current, {
      value: 20,
      duration: 0.5, // Stay fast during initial warp
      ease: "none"
    })
      .to(speedRef.current, {
        value: 0.1,
        duration: 0.5, // Slow down as the ship settles
        ease: "power3.out",
      });
  }, []);

  const [geometry, speeds] = useMemo(() => {
    // 2 vertices per line (start and end), 3 coordinates per vertex
    const pos = new Float32Array(count * 2 * 3);
    const spds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      
      // Point 1 (head)
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      
      // Point 2 (tail)
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z;
      
      spds[i] = Math.random() * 0.5 + 0.5; // individual variance
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    return [geo, spds];
  }, [count]);

  useFrame((state, delta) => {
    if (!linesRef.current) return;
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
        TWEAK THE STAR ORIGIN (VANISHING POINT) HERE:
        The rotation prop below controls where the stars appear to come from.
        Format is [X, Y, Z] in radians.
        
        - Y-Axis (middle value):
          Positive (e.g. 0.3) = stars originate from the right
          Negative (e.g. -0.3) = stars originate from the left
        
        - X-Axis (first value):
          Positive = stars originate from below
          Negative = stars originate from above
      */}
      <lineSegments ref={linesRef} rotation={[0, 0.3, 0]} geometry={geometry}>
        <lineBasicMaterial
          color="#aaccff"
          transparent
          opacity={0.7}
        />
      </lineSegments>
    </>
  );
}
