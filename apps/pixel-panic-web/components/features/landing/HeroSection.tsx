// apps/pixel-panic-web/components/features/landing/HeroSection.tsx
"use client";

import { ViewCanvas } from "@/components/canvas/View-Canvas";
import { yeagerOne, ptSerif } from "@/public/fonts/fonts";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Group } from "three";

const SPINS_ON_CHANGE = 1;

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
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden pt-24 sm:pt-28"
      style={{
        background: "white",
        overscrollBehavior: "none",
      }}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-300/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-100/30 rounded-full blur-md animate-pulse delay-500"></div>
      </div>

      {/* 3D Model Container */}
      <div className="relative h-[56vh] w-full sm:h-100">
        <ViewCanvas modelRef={iphoneRef} onLoaded={handleIphoneLoaded} />
      </div>

      {/* Hero Text Content */}
      <div
        id="hero-text-content"
        className="flex flex-col items-center w-full max-w-2xl px-4 text-center mt-12"
      >
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          <span className="block text-black">Repair Your Device</span>
          <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Hassle-Free
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-black/70 font-medium mb-6">
          Select Your Brand Below.{" "}
          {/* <span className="font-semibold text-orange-600">
            Bilkul no tension
          </span> */}
        </p>
      </div>

      {/* Feature indicators at bottom */}
      <div className="flex items-center justify-center space-x-8 text-sm pb-6">
        <div className="flex flex-col items-center space-y-1 text-black/70">
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-xs">Expert Service</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-black/70">
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-xs">Same Day</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-black/70">
          <svg
            className="w-4 h-4 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="font-medium text-xs">Warranty</span>
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
