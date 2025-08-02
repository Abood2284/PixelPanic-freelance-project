// apps/pixel-panic-web/components/features/landing/HeroSection.tsx
"use client";

import { ViewCanvas } from "@/components/canvas/View-Canvas";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Group } from "three";

const SPINS_ON_CHANGE = 2;

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<Group>(null);
  const [isIphoneLoaded, setIsIphoneLoaded] = useState(false);
  const hasSpunRef = useRef(false);

  const handleIphoneLoaded = useCallback(() => {
    if (iphoneRef.current) iphoneRef.current.rotation.y = 0;
    setIsIphoneLoaded(true);
  }, []);

  // Lock scroll after mount, until allowed
  useEffect(() => {
    if (!isIphoneLoaded) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isIphoneLoaded]);

  // Animate intro spin, then enable scroll
  useGSAP(
    () => {
      if (!iphoneRef.current || !isIphoneLoaded || hasSpunRef.current) return;
      hasSpunRef.current = true;

      setTimeout(() => {
        if (!iphoneRef.current) return;
        iphoneRef.current.rotation.y = -0.8; // Always start facing forward

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          onComplete: () => {
            // Unlock scroll
            document.body.style.overflow = "";
          },
        });

        // Spin the iPhone using the same logic as the soda can
        tl.to(
          iphoneRef.current.rotation,
          {
            y: `+=${Math.PI * 2 * SPINS_ON_CHANGE}`,
            ease: "power2.inOut",
            duration: 1.5,
          },
          0
        );
      }, 200); // 200ms micro-delay after model load
    },
    { scope: sectionRef, dependencies: [isIphoneLoaded, iphoneRef.current] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white"
      style={{ overscrollBehavior: "none" }}
    >
      {/* 3D Model Container */}
      <div className="relative h-[45vh] w-full sm:h-96">
        <ViewCanvas modelRef={iphoneRef} onLoaded={handleIphoneLoaded} />
      </div>

      {/* Hero Text Content */}
      <div
        id="hero-text-content"
        className="flex flex-col items-center w-full max-w-full px-4 text-center mt-6 mb-12"
      >
        <h1 className="leading-tight text-5xl font-yeager">
          <span className="block text-black font-extrabold tracking-tight">
            Repair Your Device
          </span>
          <span
            id="hassle-free-text"
            className="block text-black font-extrabold tracking-tight"
            style={{ lineHeight: 0.6 }}
          >
            Hassle-Free
          </span>
        </h1>
        <p className="mt-4 text-base text-black/70 font-medium font-yeager">
          6-month warranty. Bilkul no tension
        </p>
      </div>
    </section>
  );
}

export { HeroSection };
