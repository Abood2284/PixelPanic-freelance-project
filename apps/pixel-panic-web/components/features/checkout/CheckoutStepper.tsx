"use client";

import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  currentStep: "info" | "service";
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const steps = [
    { id: "service", name: "Service" },
    { id: "info", name: "Info" },
  ];
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn("relative", {
              "pr-16 sm:pr-32": stepIdx !== steps.length - 1,
            })}
          >
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div
                className={cn(
                  "h-0.5 w-full",
                  stepIdx < currentStepIndex ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            </div>
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full",
                stepIdx <= currentStepIndex ? "bg-orange-500" : "bg-gray-200"
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
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center">
              <span className="text-xs font-semibold whitespace-nowrap">
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
