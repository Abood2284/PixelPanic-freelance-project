"use client";

import { cn } from "@/lib/utils";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import Image from "next/image";

gsap.registerPlugin(ScrambleTextPlugin);
gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  {
    title: "Book a\nRepair",
    titleLines: ["Book a", "Repair"],
    description:
      "Schedule your repair with just a few clicks. Choose your preferred time slot.",
    image: "/images/book-and-repair.png",
    number: "01",
    color: "from-blue-500 to-purple-600",
    iconBg: "bg-blue-500",
  },
  {
    title: "Technician\nArrives",
    titleLines: ["Technician", "Arrives"],
    description:
      "Our certified expert arrives at your doorstep, fully equipped and ready.",
    image: "/images/Technician-repair.png",
    number: "02",
    color: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-500",
  },
  {
    title: "Quick & Secure\nFix",
    titleLines: ["Quick & Secure", "Fix"],
    description:
      "Professional repair using premium parts with real-time progress updates.",
    image: "/images/Quick-secure-fix.png",
    number: "03",
    color: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-500",
  },
  {
    title: "Pay After\nService",
    titleLines: ["Pay After", "Service"],
    description:
      "Only pay once you're completely satisfied with the quality of work.",
    image: "/images/pay-after-service.png",
    number: "04",
    color: "from-rose-500 to-orange-600",
    iconBg: "bg-rose-500",
  },
];

export function ProcessStepper() {
  const titleLineRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Animate the progress line
    if (progressLineRef.current) {
      gsap.fromTo(
        progressLineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 2,
          ease: "power2.out",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: progressLineRef.current,
            start: "top 90%",
            once: true,
          },
        }
      );
    }

    // Animate step numbers
    numberRefs.current.forEach((numberEl, index) => {
      if (!numberEl) return;
      gsap.fromTo(
        numberEl,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: numberEl,
            start: "top 85%",
            once: true,
          },
          delay: index * 0.1,
        }
      );
    });

    // Animate cards
    cardRefs.current.forEach((cardEl, index) => {
      if (!cardEl) return;
      gsap.fromTo(
        cardEl,
        {
          opacity: 0,
          y: 60,
          rotateX: -15,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardEl,
            start: "top 80%",
            once: true,
          },
          delay: index * 0.2,
        }
      );
    });

    // Animate title scramble text
    titleLineRefs.current.forEach((lines, stepIndex) => {
      lines.forEach((line, lineIndex) => {
        if (!line) return;
        gsap.fromTo(
          line,
          { scrambleText: { text: "", chars: "XO#$%&*", speed: 0.4 } },
          {
            duration: 1.5,
            scrambleText: {
              text: processSteps[stepIndex].titleLines[lineIndex],
              chars: "XO#$%&*",
              revealDelay: 0.3 + lineIndex * 0.2,
              speed: 0.4,
            },
            scrollTrigger: {
              trigger: line,
              start: "top 75%",
              once: true,
            },
            delay: stepIndex * 0.1,
          }
        );
      });
    });

    // Animate images with more dynamic effects
    imageRefs.current.forEach((imageEl, index) => {
      if (!imageEl) return;
      gsap.fromTo(
        imageEl,
        {
          opacity: 0,
          scale: 0.8,
          rotateY: index % 2 === 0 ? -15 : 15,
        },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageEl,
            start: "top 80%",
            once: true,
          },
          delay: 0.3,
        }
      );
    });
  }, []);

  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-24 h-24 bg-purple-200 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/3 w-28 h-28 bg-pink-200 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10 px-4 sm:px-0">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent leading-tight">
            Our Repair Process
          </h2>
          <p className="text-lg text-slate-600 mt-6 max-w-2xl mx-auto">
            Experience a seamless, transparent repair journey designed around
            your convenience and peace of mind.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Animated Progress Line */}
          <div className="absolute left-8 sm:left-12 md:left-16 top-0 h-full w-1 bg-gradient-to-b from-blue-200 to-rose-200 rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              className="w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 via-pink-500 to-rose-500 rounded-full transform origin-top"
            />
          </div>

          <div className="space-y-16 md:space-y-20 lg:space-y-24">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Step Number */}
                <div className="absolute left-8 sm:left-12 md:left-16 -translate-x-1/2 z-20">
                  <div
                    ref={(el) => {
                      numberRefs.current[index] = el;
                    }}
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-lg",
                      step.iconBg
                    )}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content Card */}
                <div
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="grid grid-cols-[1fr_auto] gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center pl-16 sm:pl-20 md:pl-24"
                >
                  {/* Text Content - Always on the left */}
                  <div className="text-left space-y-3 md:space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">
                        {step.titleLines.map((line, lineIndex) => (
                          <span
                            key={lineIndex}
                            className="block bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                            ref={(el) => {
                              if (!titleLineRefs.current[index]) {
                                titleLineRefs.current[index] = [];
                              }
                              titleLineRefs.current[index][lineIndex] = el;
                            }}
                          >
                            {line}
                          </span>
                        ))}
                      </h3>
                      <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-sm md:max-w-md lg:max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Image - Always on the right */}
                  <div className="flex justify-end">
                    <div
                      ref={(el) => {
                        imageRefs.current[index] = el;
                      }}
                      className="relative"
                    >
                      <div
                        className={cn(
                          "relative w-24 h-20 sm:w-32 sm:h-28 md:w-48 md:h-40 lg:w-64 lg:h-52 xl:w-80 xl:h-64 rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl bg-gradient-to-br",
                          step.color
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 bg-black/30" />
                        <div className="relative w-full h-full p-2 sm:p-3 md:p-4 lg:p-6">
                          <Image
                            src={step.image}
                            alt={step.title}
                            fill
                            className="object-contain drop-shadow-lg"
                            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 192px, (max-width: 1280px) 256px, 320px"
                            priority={index === 0}
                          />
                        </div>
                      </div>

                      {/* Decorative elements */}
                      <div
                        className={cn(
                          "absolute -top-1 -right-1 sm:-top-2 sm:-right-2 md:-top-3 md:-right-3 lg:-top-4 lg:-right-4 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full opacity-60 animate-bounce",
                          step.iconBg
                        )}
                      />
                      <div
                        className={cn(
                          "absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 md:-bottom-3 md:-left-3 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full opacity-40 animate-pulse",
                          step.iconBg
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
