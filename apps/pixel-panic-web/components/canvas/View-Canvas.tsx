// apps/pixel-panic-web/components/canvas/View-Canvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls, Bounds } from "@react-three/drei";
import FloatingIphone from "./floating-iphone";
import type { Group } from "three";
import type { ForwardedRef } from "react";

interface ViewCanvasProps {
  modelRef: ForwardedRef<Group>;
  onLoaded?: () => void;
}

export function ViewCanvas({ modelRef, onLoaded }: ViewCanvasProps) {
  return (
    <>
      <Canvas
        camera={{ fov: 35, position: [0, 0, 10] }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        {/* UPDATED: The <Bounds> component automatically fits the camera to the model.
          This ensures the iPhone is always perfectly framed and large enough,
          regardless of the screen's aspect ratio. */}
        <Bounds fit clip observe margin={1.2}>
          <FloatingIphone ref={modelRef} scale={8} onLoaded={onLoaded} />
        </Bounds>
        <Environment files="/hdr/lobby.hdr" environmentIntensity={1.2} />
        <OrbitControls
          makeDefault // Important for Bounds to work correctly
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 + Math.PI / 4}
        />
      </Canvas>
      <Loader />
    </>
  );
}
