// apps/pixel-panic-web/components/features/checkout/CheckoutStepper.tsx
"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CheckoutStepperProps {
  currentStep: "info" | "service";
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    {
      id: "service",
      name: "Select Service",
      icon: ShoppingBagIcon,
      description: "Choose your repair",
    },
    {
      id: "info",
      name: "Your Information",
      icon: UserIcon,
      description: "Contact details",
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const Icon = step.icon;
            const isCompleted = stepIdx < currentStepIndex;
            const isCurrent = stepIdx === currentStepIndex;
            const isUpcoming = stepIdx > currentStepIndex;

            return (
              <li key={step.name} className="flex-1 group">
                <div className="flex flex-col items-center relative">
                  {/* Progress Line */}
                  {stepIdx < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                      <div className="h-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out",
                            mounted && isCompleted ? "w-full" : "w-0"
                          )}
                          style={{
                            transitionDelay: mounted ? "200ms" : "0ms",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step Circle */}
                  <div className="relative z-10 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out transform",
                        "border-4 shadow-lg",
                        {
                          // Completed step
                          "bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 scale-110":
                            mounted && isCompleted,
                          // Current step
                          "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 scale-110 animate-pulse":
                            mounted && isCurrent,
                          // Upcoming step
                          "bg-white border-slate-300 hover:border-slate-400":
                            isUpcoming,
                          // Default/unmounted state
                          "bg-white border-slate-300": !mounted,
                        }
                      )}
                      style={{
                        transitionDelay: mounted ? `${stepIdx * 150}ms` : "0ms",
                      }}
                    >
                      {mounted && isCompleted ? (
                        <CheckIcon className="w-6 h-6 text-white animate-bounce" />
                      ) : (
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-colors duration-300",
                            {
                              "text-white": isCurrent,
                              "text-slate-400": isUpcoming || !mounted,
                            }
                          )}
                        />
                      )}
                    </div>

                    {/* Glow effect for current step */}
                    {mounted && isCurrent && (
                      <div className="absolute inset-0 w-12 h-12 rounded-full bg-blue-400 opacity-30 animate-ping" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="text-center space-y-1">
                    <h3
                      className={cn(
                        "text-sm font-semibold transition-colors duration-300",
                        {
                          "text-green-700": mounted && isCompleted,
                          "text-blue-700": mounted && isCurrent,
                          "text-slate-600": isUpcoming,
                          "text-slate-400": !mounted,
                        }
                      )}
                    >
                      {step.name}
                    </h3>
                    <p
                      className={cn("text-xs transition-colors duration-300", {
                        "text-green-600": mounted && isCompleted,
                        "text-blue-600": mounted && isCurrent,
                        "text-slate-500": isUpcoming,
                        "text-slate-400": !mounted,
                      })}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
