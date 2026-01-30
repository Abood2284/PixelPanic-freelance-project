// apps/pixel-panic-web/app/(marketing)/page.tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { HeroSection } from "@/components/features/landing/HeroSection";
import BrandSelector from "@/components/features/landing/BrandSelector";
import { ProcessStepper } from "@/components/features/landing/process-stepper";
import Footer from "@/components/shared/Footer";
import dynamic from "next/dynamic";
import { HeroSectionNew } from "@/components/features/landing/HeroSectionNew";
import { CredibilitySection } from "@/components/features/landing/CredibilitySection";
import HowItWorks from "@/components/features/landing/HowItWorks";

gsap.registerPlugin(ScrollTrigger);

const UGCScroller = dynamic(
  () => import("@/components/features/landing/UGCScroller"),
  { ssr: false }
);

export default function MarketingHomePage() {
  return (
    <main>
      <section className="section-hero h-screen">
        {/* <HeroSectionNew /> */}
        <HeroSection />
      </section>
      <section className="section-brand-selector">
        <BrandSelector />
      </section>
      <UGCScroller />
      <HowItWorks />
      {/* <ProcessStepper /> */}
      <CredibilitySection />
      <Footer />
    </main>
  );
}
