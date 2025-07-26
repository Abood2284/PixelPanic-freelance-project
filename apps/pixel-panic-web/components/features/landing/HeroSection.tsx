// apps/pixel-panic-web/components/features/landing/HeroSection.tsx
"use client";

import { ViewCanvas } from "@/components/canvas/View-Canvas";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useCallback, useEffect } from "react";
import type { Group } from "three";

gsap.registerPlugin(ScrollTrigger);

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<Group>(null);
  const [isIphoneLoaded, setIsIphoneLoaded] = useState(false);
  const hasSpunRef = useRef(false);
  const [parallaxEnabled, setParallaxEnabled] = useState(false);

  const handleIphoneLoaded = useCallback(() => {
    if (iphoneRef.current) iphoneRef.current.rotation.y = Math.PI;
    setIsIphoneLoaded(true);
  }, []);

  // 1. Lock scroll after mount, until allowed
  useEffect(() => {
    if (!isIphoneLoaded) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isIphoneLoaded]);

  // 2. Animate intro spin, then enable scroll & parallax
  useGSAP(
    () => {
      if (!iphoneRef.current || !isIphoneLoaded || hasSpunRef.current) return;
      hasSpunRef.current = true;

      setTimeout(() => {
        if (!iphoneRef.current) return;
        iphoneRef.current.rotation.y = Math.PI; // Always start upright

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          onComplete: () => {
            // 3. Unlock scroll & enable parallax
            document.body.style.overflow = "";
            setParallaxEnabled(true);
          },
        });

        // 1. Spin the iPhone on Y axis (2.5 full rotations)
        tl.to(iphoneRef.current.rotation, {
          y: "+=" + Math.PI * 2 * 2.5,
          duration: 1.5,
        });

        // 2. Animate in the hero text content
        tl.fromTo(
          "#hero-text-content",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.7 },
          ">"
        );
      }, 200); // 200ms micro-delay after model load
    },
    { scope: sectionRef, dependencies: [isIphoneLoaded, iphoneRef.current] }
  );

  // 3. Enable parallax scroll effects after intro is finished
  useGSAP(
    () => {
      if (!parallaxEnabled || !iphoneRef.current || !sectionRef.current) return;

      // 1. iPhone grows with scroll (scale)
      gsap.to(iphoneRef.current.scale, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "30% top", // first 30% of section scroll
          scrub: true,
        },
        x: 2,
        y: 2,
        z: 2, // Adjust as you like for bigger effect
      });

      // 2. iPhone moves down as you scroll
      gsap.to(iphoneRef.current.position, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "50% top", // adjust for effect
          scrub: true,
        },
        y: -2, // In Three.js space; negative moves down
      });

      // 3. iPhone lays flat as you keep scrolling
      gsap.to(iphoneRef.current.rotation, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "45% top",
          end: "bottom top",
          scrub: true,
        },
        x: -Math.PI / 2,
      });

      // 4. Fade hero text out with scroll
      gsap.utils.toArray(".hero-line").forEach((el, i) => {
        gsap.to(el as Element, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "30% top",
            end: "bottom top",
            scrub: true,
          },
          opacity: 0,
          y: -50 - i * 10,
          ease: "power1.out",
        });
      });

      // Cleanup on unmount
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { dependencies: [parallaxEnabled] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center"
      style={{ overscrollBehavior: "none" }} // Reduce overscroll bounce
    >
      <div className="flex flex-col items-center w-full pt-8 pb-4">
        <div
          className="w-full flex justify-center"
          style={{ minHeight: 260, maxHeight: 340 }}
        >
          <ViewCanvas modelRef={iphoneRef} onLoaded={handleIphoneLoaded} />
        </div>
        <div
          id="hero-text-content"
          className="z-10 flex flex-col items-center w-full max-w-full px-4 text-center mt-6"
        >
          <h1 className="leading-tight text-5xl font-yeager">
            <span className="block text-black font-extrabold tracking-tight hero-line">
              Repair Your Device
            </span>
            <span
              className="block text-black font-extrabold tracking-tight opacity-20 hero-line"
              style={{ lineHeight: 0.6 }}
            >
              Hassle-Free
            </span>
          </h1>
          <p className="mt-4 text-base text-black/70 font-medium font-yeager hero-line">
            6-month warranty. Bilkul no tension
          </p>
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
