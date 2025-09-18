// apps/pixel-panic-web/components/features/landing/HeroSection.tsx
"use client";

import { ViewCanvas } from "@/components/canvas/View-Canvas";
import { yeagerOne, ptSerif } from "@/public/fonts/fonts";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Group } from "three";
import Image from "next/image";

const SPINS_ON_CHANGE = 1;

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<Group>(null);
  const [isIphoneLoaded, setIsIphoneLoaded] = useState(false);
  const hasSpunRef = useRef(false);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    // Defer loading 3D until the browser is idle or 400ms fallback
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setShow3D(true));
    } else {
      setTimeout(() => setShow3D(true), 400);
    }
  }, []);

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
        {/* Show WebP while 3D is not mounted */}
        {!show3D && (
          <Image
            src="https://pub-e75db92e1a5e4c81aa5e94b6ad9d0a98.r2.dev/models/iphone-16-final.webp"
            alt="3D iPhone Hero"
            fill // or use width/height if you prefer
            unoptimized
            priority // Ensures it's LCP!
            style={{
              objectFit: "contain", // Adjust based on design
              zIndex: 2,
              transition: "opacity 0.5s",
              opacity: show3D ? 0 : 1,
              pointerEvents: "none",
            }}
          />
        )}
        {/* Lazy-load the 3D scene only after idle */}
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: show3D ? 1 : 0,
            transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
            position: "absolute", // stack on top for fade
            top: 0,
            left: 0,
          }}
        >
          {show3D && (
            <ViewCanvas modelRef={iphoneRef} onLoaded={handleIphoneLoaded} />
          )}
        </div>
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
