"use client";

import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  currentStep: "info" | "service" | "pay";
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const steps = [
    { id: "info", name: "Info" },
    { id: "service", name: "Service Mode" },
    { id: "pay", name: "Pay" },
  ];
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn("relative", {
              "pr-8 sm:pr-20": stepIdx !== steps.length - 1,
            })}
          >
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div
                className={cn(
                  "h-0.5 w-full",
                  stepIdx < currentStepIndex ? "bg-pp-orange" : "bg-gray-200"
                )}
              />
            </div>
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full",
                stepIdx <= currentStepIndex ? "bg-pp-orange" : "bg-gray-200"
              )}
            >
              <span
                className={cn("text-white", {
                  "text-gray-500": stepIdx > currentStepIndex,
                })}
              >
                {stepIdx + 1}
              </span>
            </div>
            <span className="absolute top-10 w-max -translate-x-1/2 left-1/2 text-xs font-semibold">
              {step.name}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
