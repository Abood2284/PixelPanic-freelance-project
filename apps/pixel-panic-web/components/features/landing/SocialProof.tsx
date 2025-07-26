"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVelocity from "@/components/react-bits/TextAnimations/ScrollVelocity/ScrollVelocity";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Amit S.",
    text: "Super fast repair! My iPhone was fixed in under an hour at my doorstep. Highly recommend PixelPanic!",
    location: "Bandra, Mumbai",
  },
  {
    name: "Priya R.",
    text: "Technician was polite and professional. Loved the transparent pricing and 6-month warranty.",
    location: "Andheri East, Mumbai",
  },
  {
    name: "Rahul K.",
    text: "Booked online, paid by UPI, and my Samsung screen was as good as new. 5 stars!",
    location: "Powai, Mumbai",
  },
  {
    name: "Sneha M.",
    text: "No more waiting at shops. PixelPanic came home and fixed my phone while I worked.",
    location: "Lower Parel, Mumbai",
  },
  {
    name: "Vikram D.",
    text: "Best repair experience ever. Genuine parts and super clean process.",
    location: "Juhu, Mumbai",
  },
];

function SocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 60%",
            toggleActions: "play none none reverse",
            scrub: false,
          },
        }
      );
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 bg-white">
      <div className="mb-10 flex flex-col items-center gap-2">
        <ScrollVelocity
          texts={["Customer Testimonials"]}
          className="text-5xl md:text-5xl font-bold font-nohemi text-black"
          velocity={100}
          numCopies={2}
        />
        <ScrollVelocity
          texts={["Customer Testimonials"]}
          className="text-5xl md:text-5xl font-bold font-nohemi text-black"
          velocity={-100}
          numCopies={2}
        />
      </div>
      <div className="relative mx-auto max-w-md min-h-[400px]">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) {
                cardRefs.current[i] = el;
              }
            }}
            className="sticky top-24 z-[1] w-full flex flex-col items-center justify-center"
            style={{ zIndex: 10 + i }}
          >
            <div className="w-full bg-black text-white rounded-2xl shadow-lg px-6 py-8 mb-4 font-yeager text-center border border-black/10">
              <p className="text-lg mb-3">“{t.text}”</p>
              <div className="text-sm text-white/70 font-medium">
                {t.name} <span className="mx-1">·</span> {t.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SocialProof;
