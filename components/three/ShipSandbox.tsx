"use client";

import { useRef, useMemo } from "react";
import { useGLTF, Html, OrbitControls } from "@react-three/drei";
import { Group } from "three";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls, folder, button } from "leva";
import EngineThruster from "./EngineThruster";

export default function ShipSandbox() {
  const shipRef = useRef<Group>(null);
  const modelGroupRef = useRef<Group>(null);
  const progressRef = useRef({ value: 1.0 });
  const controlsRef = useRef<any>(null);

  // Access the canvas three.js camera context
  const { camera } = useThree();

  // Load the model
  const { scene } = useGLTF("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // LEVA CONTROLS
  const [controls, setControls] = useControls("Ship Animation Designer", () => ({
    "Playback Controls": folder({
      scrollProgress: { value: 0, min: 0, max: 1, step: 0.01, label: "Scroll Progress (0-1)" },
      playAnimation: { value: false, label: "Auto-Loop Playback" },
      cameraMode: { value: "Orbit Controls", options: ["Orbit Controls", "Animated Camera"], label: "Camera Viewpoint" },
    }),
    "Camera Capture Tools": folder({
      "Capture Current as START Camera": button(() => {
        if (!camera) return;
        const target = controlsRef.current?.target || new THREE.Vector3(1.5, 0.2, -1.0);
        setControls({
          cam_sPX: camera.position.x,
          cam_sPY: camera.position.y,
          cam_sPZ: camera.position.z,
          cam_sLX: target.x,
          cam_sLY: target.y,
          cam_sLZ: target.z,
        });
      }),
      "Capture Current as END Camera": button(() => {
        if (!camera) return;
        const target = controlsRef.current?.target || new THREE.Vector3(5.2, 0.4, -3.0);
        setControls({
          cam_ePX: camera.position.x,
          cam_ePY: camera.position.y,
          cam_ePZ: camera.position.z,
          cam_eLX: target.x,
          cam_eLY: target.y,
          cam_eLZ: target.z,
        });
      }),
    }),
    "START State (Scroll = 0)": folder({
      s_pX: { value: 5.20, step: 0.1, label: "Ship Pos X" },
      s_pY: { value: 0.40, step: 0.1, label: "Ship Pos Y" },
      s_pZ: { value: -3.00, step: 0.1, label: "Ship Pos Z" },
      s_rX: { value: 0.25, step: 0.05, label: "Ship Rot X" },
      s_rY: { value: -1.55, step: 0.05, label: "Ship Rot Y" },
      s_rZ: { value: 0.25, step: 0.05, label: "Ship Rot Z" },
      s_sScale: { value: 0.11, step: 0.005, min: 0.01, max: 0.3, label: "Model Scale" },
      s_oRX: { value: -0.05, step: 0.05, label: "Model Rot X" },
      s_oRY: { value: -0.05, step: 0.05, label: "Model Rot Y" },
      s_oRZ: { value: -0.30, step: 0.05, label: "Model Rot Z" },
      cam_sPX: { value: 0.0, step: 0.5, label: "Cam Pos X" },
      cam_sPY: { value: 0.0, step: 0.5, label: "Cam Pos Y" },
      cam_sPZ: { value: 10.0, step: 0.5, label: "Cam Pos Z" },
      cam_sLX: { value: 1.5, step: 0.1, label: "Cam Look X" },
      cam_sLY: { value: 0.2, step: 0.1, label: "Cam Look Y" },
      cam_sLZ: { value: -1.0, step: 0.1, label: "Cam Look Z" },
    }),
    "END State (Scroll = 1)": folder({
      e_pX: { value: 50.0, step: 1.0, label: "Ship Pos X" },
      e_pY: { value: 0.50, step: 0.1, label: "Ship Pos Y" },
      e_pZ: { value: 3.00, step: 0.1, label: "Ship Pos Z" },
      e_rX: { value: 0.00, step: 0.05, label: "Ship Rot X" },
      e_rY: { value: 0.00, step: 0.05, label: "Ship Rot Y" },
      e_rZ: { value: 0.00, step: 0.05, label: "Ship Rot Z" },
      e_eScale: { value: 0.13, step: 0.005, min: 0.01, max: 0.3, label: "Model Scale" },
      e_oRX: { value: 0.00, step: 0.05, label: "Model Rot X" },
      e_oRY: { value: 0.00, step: 0.05, label: "Model Rot Y" },
      e_oRZ: { value: -0.10, step: 0.05, label: "Model Rot Z" },
      cam_ePX: { value: 5.0, step: 0.5, label: "Cam Pos X" },
      cam_ePY: { value: 0.5, step: 0.5, label: "Cam Pos Y" },
      cam_ePZ: { value: 4.0, step: 0.5, label: "Cam Pos Z" },
      cam_eLX: { value: 5.2, step: 0.1, label: "Cam Look X" },
      cam_eLY: { value: 0.4, step: 0.1, label: "Cam Look Y" },
      cam_eLZ: { value: -3.0, step: 0.1, label: "Cam Look Z" },
    }),
    "Thrusters Position Offsets": folder({
      t1X: { value: -122.00, step: 0.1, min: -200, max: 200 },
      t1Y: { value: 14.03, step: 0.1, min: -100, max: 100 },
      t1Z: { value: -44.89, step: 0.1, min: -100, max: 100 },
      t2X: { value: -126.20, step: 0.1, min: -200, max: 200 },
      t2Y: { value: 11.90, step: 0.1, min: -100, max: 100 }, 
      t2Z: { value: -21.21, step: 0.1, min: -100, max: 100 },
      t3X: { value: -131.47, step: 0.1, min: -200, max: 200 },
      t3Y: { value: 9.82, step: 0.1, min: -100, max: 100 },
      t3Z: { value: 0.73, step: 0.1, min: -100, max: 100 },
      t4X: { value: -126.20, step: 0.1, min: -200, max: 200 },
      t4Y: { value: 8.29, step: 0.1, min: -100, max: 100 }, 
      t4Z: { value: 23.01, step: 0.1, min: -100, max: 100 }, 
      t5X: { value: -122.00, step: 0.1, min: -200, max: 200 },
      t5Y: { value: 7.06, step: 0.1, min: -100, max: 100 },
      t5Z: { value: 46.76, step: 0.1, min: -100, max: 100 },
    }),
    "Thrusters Rotation Offset": folder({
      trX: { value: 0.00, step: 0.05 },
      trY: { value: -1.57, step: 0.05 },
      trZ: { value: 0.00, step: 0.05 },
    }),
  }));

  const { 
    scrollProgress, playAnimation, cameraMode,
    s_pX, s_pY, s_pZ, s_rX, s_rY, s_rZ, s_sScale, s_oRX, s_oRY, s_oRZ, cam_sPX, cam_sPY, cam_sPZ, cam_sLX, cam_sLY, cam_sLZ,
    e_pX, e_pY, e_pZ, e_rX, e_rY, e_rZ, e_eScale, e_oRX, e_oRY, e_oRZ, cam_ePX, cam_ePY, cam_ePZ, cam_eLX, cam_eLY, cam_eLZ,
    t1X, t1Y, t1Z, t2X, t2Y, t2Z, t3X, t3Y, t3Z, t4X, t4Y, t4Z, t5X, t5Y, t5Z, trX, trY, trZ
  } = controls;

  useFrame(({ camera }) => {
    // 1. Calculate active interpolation parameter
    let p = scrollProgress;
    if (playAnimation) {
      const time = Date.now() / 1000;
      // Oscillate between 0 and 1 every 4 seconds
      p = (Math.sin(time * Math.PI * 0.5) + 1) / 2;
    }

    // 2. Interpolate Ship Group Position & Rotation
    if (shipRef.current) {
      shipRef.current.position.x = THREE.MathUtils.lerp(s_pX, e_pX, p);
      shipRef.current.position.y = THREE.MathUtils.lerp(s_pY, e_pY, p);
      shipRef.current.position.z = THREE.MathUtils.lerp(s_pZ, e_pZ, p);

      shipRef.current.rotation.x = THREE.MathUtils.lerp(s_rX, e_rX, p);
      shipRef.current.rotation.y = THREE.MathUtils.lerp(s_rY, e_rY, p);
      shipRef.current.rotation.z = THREE.MathUtils.lerp(s_rZ, e_rZ, p);
    }

    // 3. Interpolate Model Group Rotation & Scale
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(s_oRX, e_oRX, p);
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(s_oRY, e_oRY, p);
      modelGroupRef.current.rotation.z = THREE.MathUtils.lerp(s_oRZ, e_oRZ, p);

      const currentScale = THREE.MathUtils.lerp(s_sScale, e_eScale, p);
      modelGroupRef.current.scale.set(currentScale, currentScale, currentScale);
    }

    // 4. Interpolate Engine Intensity (1.0 = simmer/red, 0.0 = warp/blue)
    progressRef.current.value = THREE.MathUtils.lerp(1.0, 0.0, p);

    // 5. Interpolate Camera position & lookAt target (if animated camera is selected)
    if (cameraMode === "Animated Camera") {
      const targetCamX = THREE.MathUtils.lerp(cam_sPX, cam_ePX, p);
      const targetCamY = THREE.MathUtils.lerp(cam_sPY, cam_ePY, p);
      const targetCamZ = THREE.MathUtils.lerp(cam_sPZ, cam_ePZ, p);

      const targetLookX = THREE.MathUtils.lerp(cam_sLX, cam_eLX, p);
      const targetLookY = THREE.MathUtils.lerp(cam_sLY, cam_eLY, p);
      const targetLookZ = THREE.MathUtils.lerp(cam_sLZ, cam_eLZ, p);

      camera.position.set(targetCamX, targetCamY, targetCamZ);
      camera.lookAt(targetLookX, targetLookY, targetLookZ);
    }
  });

  // Calculate current progress to show in UI
  const currentP = playAnimation ? ((Math.sin((Date.now() / 1000) * Math.PI * 0.5) + 1) / 2) : scrollProgress;

  // Format the output text for easy copy-pasting
  const copyText = `// COPY AND PASTE THIS TO ANTIGRAVITY:
// ==========================================

// --- SHIP START (HERO) STATE ---
shipStartPos: [${s_pX.toFixed(2)}, ${s_pY.toFixed(2)}, ${s_pZ.toFixed(2)}],
shipStartRot: [${s_rX.toFixed(2)}, ${s_rY.toFixed(2)}, ${s_rZ.toFixed(2)}],
modelStartRot: [${s_oRX.toFixed(2)}, ${s_oRY.toFixed(2)}, ${s_oRZ.toFixed(2)}],
modelStartScale: ${s_sScale.toFixed(3)},

// --- CAMERA START (HERO) STATE ---
cameraStartPos: [${cam_sPX.toFixed(2)}, ${cam_sPY.toFixed(2)}, ${cam_sPZ.toFixed(2)}],
cameraStartLook: [${cam_sLX.toFixed(2)}, ${cam_sLY.toFixed(2)}, ${cam_sLZ.toFixed(2)}],

// --- SHIP END (EXIT) STATE ---
shipEndPos: [${e_pX.toFixed(2)}, ${e_pY.toFixed(2)}, ${e_pZ.toFixed(2)}],
shipEndRot: [${e_rX.toFixed(2)}, ${e_rY.toFixed(2)}, ${e_rZ.toFixed(2)}],
modelEndRot: [${e_oRX.toFixed(2)}, ${e_oRY.toFixed(2)}, ${e_oRZ.toFixed(2)}],
modelEndScale: ${e_eScale.toFixed(3)},

// --- CAMERA END (EXIT) STATE ---
cameraEndPos: [${cam_ePX.toFixed(2)}, ${cam_ePY.toFixed(2)}, ${cam_ePZ.toFixed(2)}],
cameraEndLook: [${cam_eLX.toFixed(2)}, ${cam_eLY.toFixed(2)}, ${cam_eLZ.toFixed(2)}],

// --- THRUSTERS CONFIG ---
t1: [${t1X.toFixed(2)}, ${t1Y.toFixed(2)}, ${t1Z.toFixed(2)}],
t2: [${t2X.toFixed(2)}, ${t2Y.toFixed(2)}, ${t2Z.toFixed(2)}],
t3: [${t3X.toFixed(2)}, ${t3Y.toFixed(2)}, ${t3Z.toFixed(2)}],
t4: [${t4X.toFixed(2)}, ${t4Y.toFixed(2)}, ${t4Z.toFixed(2)}],
t5: [${t5X.toFixed(2)}, ${t5Y.toFixed(2)}, ${t5Z.toFixed(2)}],
thrusterRot: [${trX.toFixed(2)}, ${trY.toFixed(2)}, ${trZ.toFixed(2)}]`;

  return (
    <>
      {/* Conditionally mount OrbitControls when in manual inspect mode */}
      {cameraMode === "Orbit Controls" && <OrbitControls ref={controlsRef} makeDefault />}

      <group ref={shipRef} dispose={null}>
        {/* Ship and thrusters grouped as 1 so they scale and rotate together */}
        <group ref={modelGroupRef}>
          <primitive object={clonedScene} />
          
          {/* 1 - Far Left Thruster */}
          <EngineThruster 
            position={[t1X, t1Y, t1Z]} 
            rotation={[trX, trY, trZ]} 
            progressRef={progressRef}
          />
          
          {/* 2 - Mid Left Thruster */}
          <EngineThruster 
            position={[t2X, t2Y, t2Z]} 
            rotation={[trX, trY, trZ]} 
            progressRef={progressRef}
          />
          
          {/* 3 - Center Thruster */}
          <EngineThruster 
            position={[t3X, t3Y, t3Z]} 
            rotation={[trX, trY, trZ]} 
            progressRef={progressRef}
          />
          
          {/* 4 - Mid Right Thruster */}
          <EngineThruster 
            position={[t4X, t4Y, t4Z]} 
            rotation={[trX, trY, trZ]} 
            progressRef={progressRef}
          />
          
          {/* 5 - Far Right Thruster */}
          <EngineThruster 
            position={[t5X, t5Y, t5Z]} 
            rotation={[trX, trY, trZ]} 
            progressRef={progressRef}
          />
        </group>

        {/* Floating UI to copy coordinates */}
        <Html position={[0, -4.5, 0]} center>
          <div className="bg-black/95 p-4 border border-blue-500 rounded-lg shadow-2xl text-blue-400 font-mono text-xs w-[440px] pointer-events-auto select-all cursor-text flex flex-col backdrop-blur-sm">
            <span className="text-white text-xs mb-1 font-bold text-center">
              Ship Scroll Transition Designer
            </span>
            <span className="text-gray-400 text-[10px] mb-3 text-center">
              Active Progress: <span className="text-amber-400 font-bold">{(currentP * 100).toFixed(0)}%</span> {playAnimation && "(Looping)"}
            </span>
            <pre className="whitespace-pre-wrap select-all cursor-text bg-gray-950 p-3 rounded border border-gray-800 text-[10px] leading-relaxed max-h-60 overflow-y-auto">
              {copyText}
            </pre>
            <span className="text-gray-500 text-[9px] mt-2 text-center select-none">
              Click box to select all, then paste into our chat!
            </span>
          </div>
        </Html>
      </group>
    </>
  );
}

// Preload the model
useGLTF.preload("/3d_model/d.s.s._harbinger_battle_cruiser.glb");
