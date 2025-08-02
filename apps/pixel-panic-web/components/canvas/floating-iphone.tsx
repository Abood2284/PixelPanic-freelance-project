// apps/pixel-panic-web/components/canvas/floating-iphone.tsx
"use client";

import { forwardRef } from "react";
import { Float } from "@react-three/drei";
import { Group } from "three";
import { Iphone16 } from "./iphone-16";

type FloatingIphoneProps = {
  template?: "batcave" | "default";
  floatSpeed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
  floatRange?: [number, number];
  children?: React.ReactNode;
  scale?: number;
  onLoaded?: () => void;
};

const FloatingIphone = forwardRef<Group, FloatingIphoneProps>(
  (
    {
      template = "batcave",
      floatSpeed = 0.5, // Slowed down for a more luxe feel
      floatIntensity = 0.5,
      rotationIntensity = 0.5,
      children,
      onLoaded,
      scale,
      ...props
    },
    ref
  ) => {
    return (
      <group ref={ref} {...props}>
        <Float
          speed={floatSpeed}
          rotationIntensity={rotationIntensity}
          floatIntensity={floatIntensity}
        >
          {children}
          <Iphone16 onLoaded={onLoaded} scale={scale} />
        </Float>
      </group>
    );
  }
);

FloatingIphone.displayName = "FloatingIphone";

export default FloatingIphone;
