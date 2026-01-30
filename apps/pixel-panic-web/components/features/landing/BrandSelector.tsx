// apps/pixel-panic-web/components/features/landing/BrandSelector.tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { motion } from "framer-motion";
import { BrandGrid } from "./BrandGrid";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Brand interface
interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  createdAt: string;
}

// Selective brands to show by default (fallback if API fails)
const SELECTIVE_BRANDS: Brand[] = [
  {
    id: 1,
    name: "Apple",
    logoUrl:
      "https://res.cloudinary.com/dzck9qets/image/upload/v1755535983/apple-logo-main_vu5ghq.png",
    createdAt: "",
  },
  {
    id: 2,
    name: "Samsung",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 3,
    name: "OnePlus",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 4,
    name: "Google",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 5,
    name: "Oppo",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 6,
    name: "Vivo",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 7,
    name: "Xiaomi",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 8,
    name: "Realme",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 9,
    name: "Poco",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 10,
    name: "iQOO", // Fixed case to match database
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 11,
    name: "Honor",
    logoUrl: null,
    createdAt: "",
  },
  {
    id: 12,
    name: "Nothing",
    logoUrl: null,
    createdAt: "",
  },
];

export default function BrandSelector() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Add a small delay to ensure component is fully mounted
      setTimeout(() => {
        // Simple entrance animations that run immediately
        const tl = gsap.timeline();

        // Header animation
        tl.fromTo(
          "#brand-header",
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          }
        );
      }, 100); // 100ms delay
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="brand-selector"
      ref={sectionRef}
      className="relative w-full h-screen flex flex-col justify-center items-center px-6 sm:px-8 py-12 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gray-100 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-50 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-200 rounded-full blur-3xl animate-pulse" />
        {/* Additional floating elements for more depth */}
        <div
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-gray-100 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gray-50 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Header */}
      <motion.div
        id="brand-header"
        className="relative z-10 text-center mb-4 opacity-0"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className={`text-3xl lg:text-5xl font-bold text-black mb-2`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <span className="text-gray-600"> Select Your </span>
          Brand
        </motion.h2>
        <motion.p
          className="text-gray-500 text-sm lg:text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Can't find your brand? Try using the search bar.
        </motion.p>
      </motion.div>

      {/* Brand Grid */}
      <div className="relative z-10 w-full max-w-6xl flex-1">
        <BrandGrid
          brands={SELECTIVE_BRANDS}
          searchPlaceholder="Search your device brand..."
        />
      </div>
    </section>
  );
}
