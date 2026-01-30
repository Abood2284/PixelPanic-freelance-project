// apps/pixel-panic-web/components/features/landing/HeroSectionNew.tsx
"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import Particles from "@/components/Particles";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function HeroSectionNew() {
  const heroRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        delay: 0.6,
        defaults: { ease: "power3.out" },
      });

      if (headingRef.current) {
        timeline.fromTo(
          headingRef.current,
          { opacity: 0, yPercent: 18 },
          { opacity: 1, yPercent: 0, duration: 1.1 }
        );
      }

      if (subheadingRef.current) {
        timeline.fromTo(
          subheadingRef.current,
          { opacity: 0, yPercent: 16 },
          { opacity: 0.88, yPercent: 0, duration: 0.95 },
          "-=0.65"
        );
      }
    },
    { scope: heroRef }
  );

  return (
    <div className="bg-[#efe7d9]">
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden bg-black text-[#E8EAED] rounded-b-[6rem] sm:rounded-b-[8rem] md:rounded-b-[10rem] lg:rounded-b-[12rem]"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <Particles
            particleCount={320}
            particleSpread={8}
            speed={0.22}
            particleColors={["#FFFFFF"]}
            moveParticlesOnHover
            particleHoverFactor={0.45}
            particleBaseSize={96}
            sizeRandomness={0.8}
            alphaParticles={false}
            cameraDistance={18}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 sm:py-24">
          <div className="flex w-full max-w-4xl sm:max-w-5xl md:max-w-6xl flex-col items-center text-center">
            <h1
              ref={headingRef}
              className={cn(
                "font-display font-bold text-4xl leading-[1.05] tracking-[-0.01em] text-[#F5F7FA] sm:text-5xl sm:leading-[0.98] sm:tracking-[-0.02em] md:text-6xl lg:text-7xl",
                "will-change-transform"
              )}
            >
              Your phone's second&nbsp;life.
              <br />
              Begins{" "}
              <PointerHighlight
                rectangleClassName="border-pixel-cyan/60"
                pointerClassName="text-pixel-cyan"
              >
                <span className="text-pixel-cyan">here</span>
              </PointerHighlight>
              .
            </h1>
            <p
              ref={subheadingRef}
              className={cn(
                "mt-6 max-w-sm text-sm text-[#D8DBE3] sm:max-w-xl sm:text-base md:text-lg lg:text-xl",
                "will-change-transform"
              )}
            >
              Precision restoration from
              <br className="sm:hidden" /> fallen pixels to flawless glass.
            </p>
            <Link
              href="/device"
              className={cn(
                "mt-8 inline-flex items-center justify-center rounded-full border border-pixel-cyan/60 bg-pixel-cyan/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-pixel-cyan transition",
                "sm:mt-10 sm:px-8 sm:tracking-[0.24em]",
                "hover:-translate-y-0.5 hover:bg-pixel-cyan/25 hover:text-[#F5F7FA] hover:shadow-[0_0_25px_rgba(6,215,242,0.35)]",
                "will-change-transform cursor-pointer min-h-[44px] min-w-[44px]"
              )}
            >
              Start a repair
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
