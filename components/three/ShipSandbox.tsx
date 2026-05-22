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
  const { 
    pX, pY, pZ, 
    rX, rY, rZ, 
    sScale, 
    oRX, oRY, oRZ,
    t1X, t1Y, t1Z,
    t2X, t2Y, t2Z,
    t3X, t3Y, t3Z,
    t4X, t4Y, t4Z,
    t5X, t5Y, t5Z,
    trX, trY, trZ
  } = useControls("Ship Sandbox", {
    Position: folder({
      pX: { value: -1.30, step: 0.1 },
      pY: { value: 1.10, step: 0.1 },
      pZ: { value: -6.90, step: 0.1 },
    }),
    GroupRotation: folder({
      rX: { value: 0.20, step: 0.05 },
      rY: { value: -1.50, step: 0.05 },
      rZ: { value: 0.20, step: 0.05 },
    }),
    ObjectRotation: folder({
      oRX: { value: -0.05, step: 0.05 },
      oRY: { value: 0.10, step: 0.05 },
      oRZ: { value: -0.10, step: 0.05 },
    }),
    Scaling: folder({
      sScale: { value: 0.025, step: 0.005, min: 0.01, max: 0.2 },
    }),
    "1 - Far Left Thruster": folder({
      t1X: { value: -122.00, step: 0.1, min: -200, max: 200 },
      t1Y: { value: 14.03, step: 0.1, min: -100, max: 100 },
      t1Z: { value: -44.89, step: 0.1, min: -100, max: 100 },
    }),
    "2 - Mid Left Thruster": folder({
      t2X: { value: -126.20, step: 0.1, min: -200, max: 200 }, // User adjusted
      t2Y: { value: 11.90, step: 0.1, min: -100, max: 100 },  // User adjusted
      t2Z: { value: -21.21, step: 0.1, min: -100, max: 100 }, // User adjusted
    }),
    "3 - Center Thruster": folder({
      t3X: { value: -131.47, step: 0.1, min: -200, max: 200 },
      t3Y: { value: 9.82, step: 0.1, min: -100, max: 100 },
      t3Z: { value: 0.73, step: 0.1, min: -100, max: 100 },
    }),
    "4 - Mid Right Thruster": folder({
      t4X: { value: -126.20, step: 0.1, min: -200, max: 200 }, // User adjusted
      t4Y: { value: 8.29, step: 0.1, min: -100, max: 100 },   // User adjusted
      t4Z: { value: 23.01, step: 0.1, min: -100, max: 100 },  // User adjusted
    }),
    "5 - Far Right Thruster": folder({
      t5X: { value: -122.00, step: 0.1, min: -200, max: 200 },
      t5Y: { value: 7.06, step: 0.1, min: -100, max: 100 },
      t5Z: { value: 46.76, step: 0.1, min: -100, max: 100 },
    }),
    ThrusterRotation: folder({
      trX: { value: 0.00, step: 0.05 },
      trY: { value: -1.57, step: 0.05 }, // User adjusted
      trZ: { value: 0.00, step: 0.05 },
    }),
  });

  useGSAP(() => {
    // TEMPORARILY DISABLED GSAP so you can use the Leva controls
    return;
  }, []);

  // Format the output text for easy copy-pasting
  const copyText = `// Far Left Thruster
position: [${t1X.toFixed(2)}, ${t1Y.toFixed(2)}, ${t1Z.toFixed(2)}],

// Mid Left Thruster
position: [${t2X.toFixed(2)}, ${t2Y.toFixed(2)}, ${t2Z.toFixed(2)}],

// Center Thruster
position: [${t3X.toFixed(2)}, ${t3Y.toFixed(2)}, ${t3Z.toFixed(2)}],

// Mid Right Thruster
position: [${t4X.toFixed(2)}, ${t4Y.toFixed(2)}, ${t4Z.toFixed(2)}],

// Far Right Thruster
position: [${t5X.toFixed(2)}, ${t5Y.toFixed(2)}, ${t5Z.toFixed(2)}],

// Thrusters Rotation
rotation: [${trX.toFixed(2)}, ${trY.toFixed(2)}, ${trZ.toFixed(2)}]`;

  return (
    <group
      ref={shipRef}
      dispose={null}
      position={[pX, pY, pZ]}
      rotation={[rX, rY, rZ]}
    >
      {/* Ship and thrusters grouped as 1 so they scale and rotate together */}
      <group scale={sScale} rotation={[oRX, oRY, oRZ]}>
        <primitive object={scene} />
        
        {/* 1 - Far Left Thruster */}
        <EngineThruster 
          position={[t1X, t1Y, t1Z]} 
          rotation={[trX, trY, trZ]} 
        />
        
        {/* 2 - Mid Left Thruster */}
        <EngineThruster 
          position={[t2X, t2Y, t2Z]} 
          rotation={[trX, trY, trZ]} 
        />
        
        {/* 3 - Center Thruster */}
        <EngineThruster 
          position={[t3X, t3Y, t3Z]} 
          rotation={[trX, trY, trZ]} 
        />
        
        {/* 4 - Mid Right Thruster */}
        <EngineThruster 
          position={[t4X, t4Y, t4Z]} 
          rotation={[trX, trY, trZ]} 
        />
        
        {/* 5 - Far Right Thruster */}
        <EngineThruster 
          position={[t5X, t5Y, t5Z]} 
          rotation={[trX, trY, trZ]} 
        />
      </group>

      {/* Floating UI to copy coordinates */}
      <Html position={[0, -3.5, 0]} center>
        <div className="bg-black/90 p-4 border border-amber-500 rounded shadow-xl text-amber-500 font-mono text-xs w-96 pointer-events-auto select-all cursor-text flex flex-col">
          <span className="text-white text-xs mb-2 opacity-50 select-none text-center">Click box to copy coordinates</span>
          <pre className="whitespace-pre-wrap">{copyText}</pre>
        </div>
      </Html>
    </group>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
