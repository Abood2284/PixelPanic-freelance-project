// apps/pixel-panic-web/components/canvas/iphone-16.tsx
"use client";

import React, { useRef, forwardRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

// Preload the iPhone 16 model
useGLTF.preload("/models/iphone-16.glb");

// Define all available template textures for iPhone 16
const templateTextures = {
  "gold-shine": "/templates-screenshots/gold-shine-iphone12.png",
  minima: "/templates-screenshots/minima-iphone12.png",
  "seaside-retreat": "/templates-screenshots/seaside-iphone12.png",
  batcave: "/templates-screenshots/batcave-iphone12.png",
};

export type Iphone16Props = {
  template?: keyof typeof templateTextures;
  scale?: number;
  instagramData?: any;
  onLoaded?: () => void;
} & React.ComponentProps<"group">;

export const Iphone16 = forwardRef<THREE.Group, Iphone16Props>(
  (
    { template = "batcave", scale = 6, instagramData, onLoaded, ...props },
    ref
  ) => {
    const { nodes, materials } = useGLTF("/models/iphone-16.glb");
    React.useEffect(() => {
      if (nodes && materials && onLoaded) onLoaded();
    }, [nodes, materials, onLoaded]);

    // Load all template textures
    const templates = useTexture(templateTextures);

    // Fix upside down templates - similar to soda can labels
    // templates["gold-shine"].flipY = false;
    // templates.minima.flipY = false;
    // templates["seaside-retreat"].flipY = false;
    // templates.batcave.flipY = false;

    // Get the current template texture
    const currentTemplate = templates[template];

    // Create a canvas texture for the instagram data
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 1024;

    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.font = "48px sans-serif";
      ctx.fillText(instagramData?.profile?.name || "Your Name", 50, 100);
      ctx.font = "24px sans-serif";
      ctx.fillText(instagramData?.profile?.bio || "Your Bio", 50, 150);
      instagramData?.links?.forEach((link: any, index: number) => {
        ctx.fillText(link.title, 50, 200 + index * 50);
      });
    }

    const texture = new THREE.CanvasTexture(canvas);

    return (
      <group
        ref={ref}
        {...props}
        dispose={null}
        scale={scale}
        // rotation={[0.3, (-3 * Math.PI) / 4, 0]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009 as THREE.Mesh)?.geometry}
          material={materials["16_Body_1_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_1 as THREE.Mesh)?.geometry}
          material={materials["16_Body_2_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_2 as THREE.Mesh)?.geometry}
          material={materials["16_Body_3_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_3 as THREE.Mesh)?.geometry}
          material={materials["16_Body_4_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_4 as THREE.Mesh)?.geometry}
          material={materials["16_apple_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_5 as THREE.Mesh)?.geometry}
          material={materials["16_black"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_6 as THREE.Mesh)?.geometry}
          material={materials["16_cam2"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_7 as THREE.Mesh)?.geometry}
          material={materials["16_lens"]}
        />
        {/* Screen mesh with custom material for template texture */}
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_8 as THREE.Mesh)?.geometry}
        >
          <meshStandardMaterial
            map={instagramData ? texture : currentTemplate}
            roughness={0.1}
            metalness={0.0}
            transparent={false}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_9 as THREE.Mesh)?.geometry}
          material={materials["16_Glass"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_10 as THREE.Mesh)?.geometry}
          material={materials["16_wire"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_11 as THREE.Mesh)?.geometry}
          material={materials["16_1111"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_12 as THREE.Mesh)?.geometry}
          material={materials["16_16fs"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_13 as THREE.Mesh)?.geometry}
          material={materials["16_16fs1"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_14 as THREE.Mesh)?.geometry}
          material={materials["16_g"]}
        />
      </group>
    );
  }
);

Iphone16.displayName = "Iphone16";
