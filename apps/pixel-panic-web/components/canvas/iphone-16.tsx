// apps/pixel-panic-web/components/canvas/iphone-16.tsx
"use client";

import React, { forwardRef, useEffect } from "react";
import { useGLTF, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

// 1. Define the path to your video file.
//    Ensure this video is placed in your `/public` directory.
const videoPath =
  "https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/pixel-panic.mp4";
const modelPath =
  "https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/iphone-16-final.glb";

// Preload assets for faster initial rendering
useGLTF.preload(modelPath);
// Note: useVideoTexture does not have a preload helper,
// but modern browsers are efficient at loading video.

export type Iphone16Props = {
  onLoaded?: () => void;
  scale?: number;
} & React.ComponentProps<"group">;

export const Iphone16 = forwardRef<Group, Iphone16Props>(
  ({ onLoaded, scale = 8, ...props }, ref) => {
    const { nodes, materials } = useGLTF(modelPath);

    // 2. Use the `useVideoTexture` hook.
    //    We pass the video path and set properties for autoplay.
    //    `muted` and `playsInline` are crucial for autoplay on most browsers.
    const videoTexture = useVideoTexture(videoPath, {
      loop: true,
      muted: true,
      playsInline: true,
      crossOrigin: "anonymous", // Needed for most hosted/video CORS compatibility
    });

    videoTexture.flipY = false;

    // This effect notifies the parent component once the model's data is available.
    useEffect(() => {
      if (nodes && materials && onLoaded) onLoaded();
    }, [nodes, materials, onLoaded]);

    return (
      <group ref={ref} {...props} dispose={null} scale={scale}>
        <mesh
          geometry={(nodes.Cube009 as THREE.Mesh).geometry}
          material={materials["16_screen"]}
        >
          {/* 3. Apply the video texture to the screen's material map. */}
          <meshStandardMaterial
            map={videoTexture}
            roughness={0.1}
            metalness={0.0}
            emissive={"#000000"} // Set emissive to black to avoid glow
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
