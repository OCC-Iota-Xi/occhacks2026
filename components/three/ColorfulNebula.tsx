"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  attribute vec3 color;
  uniform float uTime;
  uniform float uScroll;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec3 pos = position;
    
    // Slow organic drift motion
    pos.x += sin(uTime * 0.08 + position.z * 0.05) * 4.0;
    pos.y += cos(uTime * 0.06 + position.x * 0.05) * 4.0;
    pos.z += sin(uTime * 0.04 + position.y * 0.05) * 2.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size depends on depth and scroll
    gl_PointSize = (35.0 + sin(uTime * 0.5 + position.x) * 12.0) * (300.0 / -mvPosition.z) * (0.1 + 0.9 * uScroll);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  uniform float uScroll;

  void main() {
    // Soft circular mask
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Alpha falloff for smooth gas cloud look
    float alpha = smoothstep(0.5, 0.08, dist);
    
    // Blend color with a nice soft emission
    gl_FragColor = vec4(vColor, alpha * uScroll * 0.65);
  }
`;

// A simple deterministic pseudo-random generator to satisfy React's render purity rules
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function ColorfulNebula() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Initialize scroll uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
  }), []);

  useGSAP(() => {
    if (!shaderRef.current) return;
    
    gsap.to(shaderRef.current.uniforms.uScroll, {
      value: 1.0,
      scrollTrigger: {
        trigger: "#section-2",
        start: "top bottom", // when Section 2 enters screen
        end: "top center",   // fully visible when Section 2 reaches center of screen
        scrub: true,
      }
    });
  }, []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const [geometry] = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const random = createSeededRandom(42);

    // Premium sci-fi/nebula palette (warm oranges matching thrusters + cyan + neon purple/pink)
    const palette = [
      new THREE.Color("#ffaa00"), // Amber (thruster match)
      new THREE.Color("#ff3c00"), // Intense orange (thruster match)
      new THREE.Color("#00d8ff"), // Cyan
      new THREE.Color("#bd00ff"), // Vivid purple
      new THREE.Color("#ff007c"), // Deep pink
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a wider field around the screen
      positions[i * 3] = (random() - 0.5) * 120;
      positions[i * 3 + 1] = (random() - 0.5) * 80;
      positions[i * 3 + 2] = (random() - 0.8) * 80; // mostly behind the ship

      const color = palette[Math.floor(random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return [geo];
  }, []);

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
