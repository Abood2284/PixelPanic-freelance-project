"use client";

import { cn } from "@/lib/utils";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrambleTextPlugin);
gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  {
    title: "Book a Repair",
    description:
      "Select your device, describe the issue, and get an instant, transparent quote. Book a time slot that works for you.",
  },
  {
    title: "Technician Arrives",
    description:
      "A certified PixelPanic technician arrives at your doorstep with genuine parts and all the tools needed for the job.",
  },
  {
    title: "Quick & Secure Fix",
    description:
      "Your device is repaired right in front of you in under 60 minutes. Your data is always secure and never accessed.",
  },
  {
    title: "Pay After Service",
    description:
      "Once you're fully satisfied with the repair, you can pay securely via UPI, card, or our BNPL options.",
  },
];

export function ProcessStepper() {
  // Create refs for each title
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    if (!titleRefs.current.length) return;
    // Animate each title with scrambleText when it enters viewport
    titleRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { scrambleText: { text: "", chars: "XO", speed: 0.3 } },
        {
          duration: 1.2,
          scrambleText: {
            text: processSteps[i].title,
            chars: "XO",
            revealDelay: 0.4,
            speed: 0.3,
            newClass: "text-orange-500",
          },
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        }
      );
    });
  }, []);

  return (
    <section className="w-full bg-slate-50 dark:bg-black py-20 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 dark:text-slate-100">
          Our Repair Process
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mt-4">
          Simple, Transparent, and Lightning Fast.
        </p>

        <div className="mt-16 md:mt-24 relative">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-300 dark:bg-neutral-800" />

          <div className="sticky top-1/2">
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2">
                <div className="h-4 w-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
              </div>
            </div>
          </div>

          <div className="space-y-64 md:space-y-120">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 md:gap-16"
              >
                <div
                  className={cn("text-right", index % 2 !== 0 && "md:order-3")}
                >
                  <h3
                    className="text-2xl font-semibold text-slate-800 dark:text-slate-200"
                    ref={(el) => {
                      titleRefs.current[index] = el;
                    }}
                  >
                    {step.title}
                  </h3>
                </div>

                <div className="w-px" />

                <div className={cn(index % 2 !== 0 && "md:text-right")}>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
