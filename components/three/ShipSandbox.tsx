"use client";

import { useRef } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { Group } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useControls, folder } from "leva";
import EngineThruster from "./EngineThruster";

gsap.registerPlugin(useGSAP);

export default function ShipSandbox() {
  const shipRef = useRef<Group>(null);

  // Load the model
  const { scene } = useGLTF("/3d_model/d.s.s._harbinger_battle_cruiser.glb");

  // LEVA CONTROLS
  const { pX, pY, pZ, rX, rY, rZ, sScale, oRX, oRY, oRZ } = useControls("Ship Sandbox", {
    Position: folder({
      pX: { value: 5, step: 0.1 },
      pY: { value: 0, step: 0.1 },
      pZ: { value: 0, step: 0.1 },
    }),
    GroupRotation: folder({
      rX: { value: 0.15, step: 0.05 },
      rY: { value: -1.6, step: 0.05 },
      rZ: { value: -0.15, step: 0.05 },
    }),
    ObjectRotation: folder({
      oRX: { value: 0, step: 0.05 },
      oRY: { value: 0, step: 0.05 },
      oRZ: { value: 0, step: 0.05 },
    }),
    Scaling: folder({
      sScale: { value: 0.05, step: 0.005, min: 0.01, max: 0.2 },
    })
  });

  useGSAP(() => {
    // TEMPORARILY DISABLED GSAP so you can use the Leva controls
    return;
  }, []);

  // Format the output text for easy copy-pasting
  const copyText = `// Position\nx: ${pX.toFixed(2)},\ny: ${pY.toFixed(2)},\nz: ${pZ.toFixed(2)},\n\n// Group Rotation\nx: ${rX.toFixed(2)},\ny: ${rY.toFixed(2)},\nz: ${rZ.toFixed(2)},\n\n// Object Rotation\nx: ${oRX.toFixed(2)},\ny: ${oRY.toFixed(2)},\nz: ${oRZ.toFixed(2)},\n\n// Scale\nscale: ${sScale.toFixed(3)}`;

  return (
    <group
      ref={shipRef}
      dispose={null}
      position={[pX, pY, pZ]}
      rotation={[rX, rY, rZ]}
    >
      <primitive object={scene} scale={sScale} rotation={[oRX, oRY, oRZ]} />

      {/* Floating UI to copy coordinates */}
      <Html position={[0, -3, 0]} center>
        <div className="bg-black/90 p-4 border border-amber-500 rounded shadow-xl text-amber-500 font-mono text-sm w-48 pointer-events-auto select-all cursor-text flex flex-col">
          <span className="text-white text-xs mb-2 opacity-50 select-none">Click box to copy all</span>
          {copyText}
        </div>
      </Html>
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
