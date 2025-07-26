"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { cn } from "@/lib/utils";

import { Header } from "@/components/shared/Header";
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
  const { serviceMode, setServiceMode, timeSlot, setTimeSlot } = useCart();
  const router = useRouter();

  const handleModeSelect = (mode: "Doorstep" | "CarryIn") => {
    setServiceMode(mode);
  };

  const handleTimeSlotSelect = (slot: string) => {
    setTimeSlot(slot);
  };

  const canProceed =
    serviceMode &&
    (serviceMode === "CarryIn" || (serviceMode === "Doorstep" && timeSlot));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-12 lg:py-16">
        <div className="container max-w-4xl">
          <div className="flex justify-center mb-16">
            <CheckoutStepper currentStep="service" />
          </div>
          <h1 className="text-center font-display text-4xl font-bold text-pp-navy mb-10">
            Choose Service Mode
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Doorstep Repair Card */}
            <Card
              className={cn(
                "cursor-pointer transition-all",
                serviceMode === "Doorstep" &&
                  "border-2 border-pp-orange ring-2 ring-pp-orange/20"
              )}
              onClick={() => handleModeSelect("Doorstep")}
            >
              <CardHeader>
                <CardTitle>Doorstep Repair</CardTitle>
                <CardDescription>
                  Our certified technician visits your home or office.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceMode === "Doorstep" && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Select a Time Slot</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={timeSlot === slot ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card onClick from firing again
                            handleTimeSlotSelect(slot);
                          }}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carry-in Store Card */}
            <Card
              className={cn(
                "cursor-pointer transition-all",
                serviceMode === "CarryIn" &&
                  "border-2 border-pp-orange ring-2 ring-pp-orange/20"
              )}
              onClick={() => handleModeSelect("CarryIn")}
            >
              <CardHeader>
                <CardTitle>Carry-in Store</CardTitle>
                <CardDescription>
                  Drop your device at the nearest PixelPanic Hub for a ₹200
                  discount.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              disabled={!canProceed}
              onClick={() => router.push("/checkout/payment")}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
