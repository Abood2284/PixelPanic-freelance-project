// apps/pixel-panic-web/app/(marketing)/page.tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { HeroSection } from "@/components/features/landing/HeroSection";
import BrandSelector from "@/components/features/landing/BrandSelector";
import { ProcessStepper } from "@/components/features/landing/process-stepper";
import Footer from "@/components/shared/Footer";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger);

const UGCScroller = dynamic(
  () => import("@/components/features/landing/UGCScroller"),
  { ssr: false }
);

// Reuse your existing assets (works even if /public/videos exists only in prod)
const TESTIMONIAL_VIDEOS = [
  {
    src: "/videos/pixel-panic-video-1.mp4",
    poster: "/images/testimonial-3.png",
  },
  {
    src: "/videos/pixel-panic-video-2.mp4",
    poster: "/images/testimonial-1.png",
  },
  {
    src: "/videos/pixel-panic-video-3.mp4",
    poster: "/images/testimonial-2.png",
  },
];

export default function MarketingHomePage() {
  return (
    <main>
      <section className="section-hero h-screen">
        <HeroSection />
      </section>
      <section className="section-brand-selector">
        <BrandSelector />
      </section>
      <UGCScroller />
      <ProcessStepper />
      <Footer />
    </main>
  );
}
