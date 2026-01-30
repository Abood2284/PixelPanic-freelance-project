"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

const steps = [
  {
    number: "01",
    title: "Book a Repair",
    description:
      "Schedule your repair with just a few clicks. Choose your preferred time slot.",
  },
  {
    number: "02",
    title: "Technician Arrives",
    description:
      "Our certified expert arrives at your doorstep, fully equipped and ready.",
  },
  {
    number: "03",
    title: "Quick & Secure Fix",
    description:
      "Professional repair using premium parts with real-time progress updates.",
  },
  {
    number: "04",
    title: "Pay After Service",
    description:
      "Only pay once you're completely satisfied with the quality of work.",
  },
];

const highlights: Array<{ label: string; value: string; icon: ReactNode }> = [
  {
    label: "Average arrival window",
    value: "< 90 mins",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#111827]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 1.5" />
      </svg>
    ),
  },
  {
    label: "Repairs completed on-site",
    value: "94%",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#111827]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 10v9h5v-6h4v6h5v-9" />
      </svg>
    ),
  },
  {
    label: "Customer satisfaction",
    value: "4.9 / 5",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[#111827]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.5 14.6 9l4.9.7-3.6 3.5.8 4.8L12 15.8 7.3 18l.8-4.8-3.6-3.5 4.9-.7L12 4.5Z" />
      </svg>
    ),
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
    y: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const numberVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
  },
};

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="section-how-it-works relative isolate overflow-hidden bg-white py-24 sm:py-28 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-x-[12%] -top-40 h-[420px] rounded-full bg-[#ec642f]/10 blur-3xl sm:inset-x-[20%]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-[8%] hidden h-72 w-72 rounded-full bg-[#ec642f]/8 blur-3xl lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="w-full lg:max-w-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ec642f]/30 bg-[#ec642f]/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#ec642f]">
            Repair Journey
          </span>
          <h2 className="mt-6 text-3xl font-bold text-[#0b0d0e] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.05]">
            Four moves from panic to pixel-perfect.
          </h2>
          <p className="mt-4 text-base text-[#111827] sm:text-lg">
            A clear, doorstep-first playbook that keeps you in the loop from
            booking to checkout—no surprises, only expert care.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-[#6b7280]">
            {highlights.map(({ label, value, icon }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#d1d5db] bg-white shadow-sm">
                  {icon}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-[#9ca3af]">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-[#4b5563]">
                    {value}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <motion.button
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[#ec642f] bg-[#0b0d0e] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-8 sm:py-4"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Repair
            <span className="text-[#ec642f]">→</span>
          </motion.button>
        </motion.div>

        <motion.ol
          className="relative flex-1 space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span
            className="absolute left-[1.85rem] top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-[#ec642f]/25 via-[#e2e8f0] to-transparent lg:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              variants={itemVariants}
              className="relative flex items-start gap-5"
            >
              <div className="flex flex-col items-center self-stretch">
                <motion.div
                  variants={numberVariants}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ec642f] bg-white text-base font-semibold text-[#ec642f] shadow-sm sm:h-16 sm:w-16 sm:text-lg"
                >
                  {step.number}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="mt-3 h-full w-px flex-1 bg-gradient-to-b from-[#ec642f]/30 via-[#e2e8f0] to-transparent" />
                )}
              </div>
              <div className="group relative flex-1 overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white px-6 py-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl md:px-8 md:py-8">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#ec642f]/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <h3 className="text-xl font-semibold text-[#0b0d0e] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[#111827]/80 sm:text-lg">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
