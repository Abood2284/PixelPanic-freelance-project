// apps/pixel-panic-web/components/canvas/floating-iphone.tsx
"use client";

import { forwardRef } from "react";
import { Float } from "@react-three/drei";
import { Group } from "three";
import { Iphone16, type Iphone16Props } from "./iphone-16";

type FloatingIphoneProps = {
  template?: Iphone16Props["template"];
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
          <Iphone16 template={template} onLoaded={onLoaded} />
        </Float>
      </group>
    );
  }
);

FloatingIphone.displayName = "FloatingIphone";

export default FloatingIphone;
