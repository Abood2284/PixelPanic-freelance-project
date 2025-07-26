// apps/pixel-panic-web/components/canvas/View-Canvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls } from "@react-three/drei";
import FloatingIphone from "./floating-iphone";
import type { Group } from "three";
// No longer need to import RefObject, as we can use React.ForwardedRef for better type inference with forwardRef
import type { ForwardedRef } from "react";

interface ViewCanvasProps {
  // CORRECTED TYPE: This now correctly handles the ref created with useRef(null)
  modelRef: ForwardedRef<Group>;
  onLoaded?: () => void;
}

export function ViewCanvas({ modelRef, onLoaded }: ViewCanvasProps) {
  return (
    <>
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "auto",
        }}
        camera={{ fov: 35 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <FloatingIphone ref={modelRef} scale={1.5} onLoaded={onLoaded} />
        <Environment files="/hdr/lobby.hdr" environmentIntensity={1.2} />
        <OrbitControls
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
