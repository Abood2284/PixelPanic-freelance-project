// apps/pixel-panic-web/app/checkout/service-mode/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { cn } from "@/lib/utils";

import { CheckoutStepper } from "@/components/features/checkout/CheckoutStepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/shared/Footer";

const timeSlots = ["9AM - 11AM", "11AM - 1PM", "2PM - 4PM", "4PM - 6PM"];

export default function ServiceModePage() {
  const {
    serviceMode,
    setServiceMode,
    doorstepTimeSlot,
    carryInTimeSlot,
    setTimeSlotForMode,
  } = useCart();
  const router = useRouter();

  // Set Doorstep as default service mode if none is selected
  React.useEffect(() => {
    if (!serviceMode) {
      setServiceMode("Doorstep");
    }
  }, [serviceMode, setServiceMode]);

  const handleModeSelect = (mode: "Doorstep" | "CarryIn") => {
    // Switch active mode; existing per-mode selection will be projected automatically
    setServiceMode(mode);
  };

  const handleTimeSlotSelectForMode = (
    mode: "Doorstep" | "CarryIn",
    slot: string
  ) => {
    if (serviceMode !== mode) {
      setServiceMode(mode);
    }
    setTimeSlotForMode(mode, slot);
  };

  const canProceed =
    (serviceMode === "Doorstep" && !!doorstepTimeSlot) ||
    (serviceMode === "CarryIn" && !!carryInTimeSlot);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 py-20 lg:py-32">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-20">
            <CheckoutStepper currentStep="service" />
          </div>
          <h1 className="text-center font-display text-4xl font-bold text-pp-navy mb-16">
            Choose Service Mode
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Doorstep Repair Card */}
            <Card
              className={cn(
                "cursor-pointer transition-all duration-300 ease-in-out",
                serviceMode === "Doorstep" &&
                  "border-2 border-pp-orange ring-2 ring-pp-orange/20"
              )}
              onClick={() => handleModeSelect("Doorstep")}
            >
              <CardHeader>
                <CardTitle>Doorstep Repair</CardTitle>
                <CardDescription>
                  Our certified technician will visit your place to fix your
                  device
                </CardDescription>
              </CardHeader>
              <CardContent className="animate-in slide-in-from-top-2 duration-300">
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4">Select a Time Slot</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={
                          doorstepTimeSlot === slot ? "default" : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card onClick from firing again
                          handleTimeSlotSelectForMode("Doorstep", slot);
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carry-in Store Card */}
            <Card
              className={cn(
                "cursor-pointer transition-all duration-300 ease-in-out",
                serviceMode === "CarryIn" &&
                  "border-2 border-pp-orange ring-2 ring-pp-orange/20"
              )}
              onClick={() => handleModeSelect("CarryIn")}
            >
              <CardHeader>
                <CardTitle>Pickup & Drop</CardTitle>
                <CardDescription>
                  Our certified technician will pickup the phone and drop it
                  back at your place as soon as it is fixed
                </CardDescription>
              </CardHeader>
              <CardContent className="animate-in slide-in-from-top-2 duration-300">
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4">
                    Select a Pickup Time Slot
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={
                          carryInTimeSlot === slot ? "default" : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeSlotSelectForMode("CarryIn", slot);
                        }}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-20 text-center">
            <Button
              size="lg"
              disabled={!canProceed}
              onClick={() => router.push("/checkout")}
            >
              Continue
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
