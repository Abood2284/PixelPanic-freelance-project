// apps/pixel-panic-web/app/(marketing)/page.tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger, ScrollSmoother } from "gsap/all";
import { HeroSection } from "@/components/features/landing/HeroSection";
import BrandSelector from "@/components/features/landing/BrandSelector";
import SocialProof from "@/components/features/landing/SocialProof";
import { ProcessStepper } from "@/components/features/landing/process-stepper";
import Footer from "@/components/shared/Footer";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function MarketingHomePage() {
  return (
    <main>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <section className="section-hero h-screen">
            <HeroSection />
          </section>
          <section className="section-brand-selector">
            <BrandSelector />
          </section>
          <SocialProof />
          <ProcessStepper />
          <Footer />
        </div>
      </div>
    </main>
  );
}
