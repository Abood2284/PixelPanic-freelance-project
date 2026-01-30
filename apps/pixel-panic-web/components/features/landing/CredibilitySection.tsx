// apps/pixel-panic-web/components/features/landing/CredibilitySection.tsx
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export function CredibilitySection() {
  return (
    <section
      id="credibility"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 lg:py-40 bg-[#f8f7f3]"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal
            containerClassName="text-center"
            textClassName="font-display leading-[0.85] text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight"
            enableBlur={false}
            rotationStart="top 88%"
            wordAnimationStart="top 86%"
            wordAnimationEnd="bottom 18%"
            stagger={0.08}
            staggerDesktop={0.05}
            wordAnimationEndDesktop="bottom 28%"
            enableColor
            colorStart="#b8b6b0"
            colorEnd="#0f0f0f"
          >
            {
              "Trust your devices with expert technicians who deliver professional repairs"
            }
          </ScrollReveal>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/device"
            className="group inline-flex items-center justify-center gap-4 bg-[#0b0d0e] hover:bg-[#111827] text-white rounded-full pl-8 pr-8 py-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 border-[#ec642f]"
          >
            <div className="font-semibold text-base md:text-lg flex items-center gap-2">
              Book a Repair
              <span className="transition-transform group-hover:translate-x-1 group-hover:text-[#ec642f]">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export interface CredibilitySectionProps {}
