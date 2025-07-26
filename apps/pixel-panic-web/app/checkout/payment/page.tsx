"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { CheckoutStepper } from "@/components/features/checkout/CheckoutStepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PaymentPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  // Note: In a real app, customerInfo would be fetched from a session or previous step's state.
  // We'll use placeholder data for this example.
  const { items, total, serviceMode, timeSlot } = useCart();
  const customerInfo = { fullName: "Rakesh Sharma", phoneNumber: "9876543210" };

  const gst = total * 0.18;
  const finalTotal = total + gst;

  async function handlePayment() {
    setIsLoading(true);
    setError(null);

    const orderPayload = {
      items,
      customerInfo,
      serviceDetails: {
        serviceMode,
        timeSlot,
      },
    };

    try {
      const workerUrl =
        process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";
      const response = await fetch(`${workerUrl}/api/checkout/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = (await response.json()) as {
        message: string;
        data: { orderId: string };
      };

      if (!response.ok) {
        throw new Error(result.message || "Failed to create order.");
      }

      // --- Razorpay Integration Would Start Here ---
      // 1. Use result.data.orderId and result.data.amount to open Razorpay modal.
      // 2. On successful payment, Razorpay's callback would give you a paymentId.
      // 3. You'd call another backend endpoint to confirm the payment.

      // For now, we'll simulate success and redirect.
      console.log(
        "Payment successful (simulated). Order ID:",
        result.data.orderId
      );
      router.push(`/order/confirmation?orderId=${result.data.orderId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown payment error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-12 lg:py-16">
        <div className="container max-w-4xl">
          <div className="flex justify-center mb-16">
            <CheckoutStepper currentStep="pay" />
          </div>
          <h1 className="text-center font-display text-4xl font-bold text-pp-navy mb-10">
            Final Review & Payment
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Repair Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name} ({item.selectedGrade})
                      </span>
                      <span className="font-semibold">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    <span className="font-semibold">Customer:</span>{" "}
                    {customerInfo.fullName}
                  </p>
                  <p>
                    <span className="font-semibold">Mode:</span> {serviceMode}
                  </p>
                  {serviceMode === "Doorstep" && (
                    <p>
                      <span className="font-semibold">Slot:</span> {timeSlot}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Card */}
            <div className="relative">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Total Amount</CardTitle>
                  <CardDescription>
                    All prices are inclusive of taxes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-center font-display text-pp-navy">
                    ₹{finalTotal.toFixed(2)}
                  </p>
                  {error && (
                    <p className="text-red-500 text-sm text-center mt-4">
                      {error}
                    </p>
                  )}
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg"
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {isLoading
                      ? "Processing..."
                      : `Pay ₹${finalTotal.toFixed(2)} Securely`}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
