// apps/pixel-panic-web/components/canvas/View-Canvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls, Bounds } from "@react-three/drei";
import FloatingIphone from "./floating-iphone";
import type { Group } from "three";
import type { ForwardedRef } from "react";
import { useEffect, useState } from "react";

interface ViewCanvasProps {
  modelRef: ForwardedRef<Group>;
  onLoaded?: () => void;
}

export function ViewCanvas({ modelRef, onLoaded }: ViewCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <Canvas
        camera={{
          fov: isMobile ? 40 : 35,
          position: [0, 0, isMobile ? 12 : 10],
          near: 0.1,
          far: 1000,
        }}
        shadows
        dpr={isMobile ? [1, 1.2] : [1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }}
      >
        <Bounds fit clip observe margin={isMobile ? 1.0 : 1.2}>
          <FloatingIphone
            ref={modelRef}
            scale={isMobile ? 9 : 8}
            onLoaded={onLoaded}
            floatSpeed={isMobile ? 0.3 : 0.5}
            floatIntensity={isMobile ? 0.3 : 0.5}
          />
        </Bounds>
        <Environment
          files="/hdr/lobby.hdr"
          environmentIntensity={isMobile ? 0.8 : 1.2}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 + Math.PI / 4}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      <Loader />
    </>
  );
}
