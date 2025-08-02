"use client";

import React, { forwardRef, useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

// 1. We've updated the path to your new, 1.75MB transformed and Draco-compressed model.
//    (I recommend renaming the file to something clean like 'iphone-16-final.glb')
const modelPath = "/models/iphone-16-final.glb";
useGLTF.preload(modelPath);

const templateTextures = {
  default: "/images/logo.png",
};

// Define the component's props, keeping the essential `onLoaded`.
export type Iphone16Props = {
  onLoaded?: () => void;
  scale?: number;
} & React.ComponentProps<"group">;

export const Iphone16 = forwardRef<THREE.Group, Iphone16Props>(
  ({ onLoaded, scale = 8, ...props }, ref) => {
    // Load the new, optimized model
    const { nodes, materials } = useGLTF(modelPath);

    // Load the texture
    const texture = useTexture(templateTextures.default);
    texture.flipY = false;

    // This useEffect is still crucial. It tells HeroSection when the model is ready.
    useEffect(() => {
      if (nodes && materials && onLoaded) onLoaded();
    }, [nodes, materials, onLoaded]);

    return (
      // We keep the main group with the ref, which GSAP needs to control the animation.
      <group ref={ref} {...props} dispose={null} scale={scale}>
        {/*
          2. This is the new, simpler mesh structure from your auto-generated file.
             It correctly represents your optimized model.
        */}
        <mesh
          geometry={(nodes.Cube009 as THREE.Mesh).geometry}
          material={materials["16_screen"]}
        >
          <meshStandardMaterial
            map={texture}
            roughness={0.1}
            metalness={0.0}
            transparent={false}
          />
        </mesh>
        <mesh
          geometry={(nodes.Cube009_1 as THREE.Mesh).geometry}
          material={materials.PaletteMaterial002}
        />
        <mesh
          geometry={(nodes.Cube009_2 as THREE.Mesh).geometry}
          material={materials["16_wire"]}
        />
        <mesh
          geometry={(nodes.Cube009_3 as THREE.Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      </group>
    );
  }
);

Iphone16.displayName = "Iphone16";
