// apps/pixel-panic-web/app/checkout/confirmation/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/server"; // Direct database access
import { orders, orderItems, addresses, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

import Footer from "@/components/shared/Footer";
import { OrderConfirmedAnimation } from "@/components/features/checkout/OrderConfirmedAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Clock, Phone } from "lucide-react";
import Link from "next/link";

// This is our new data-fetching Server Component
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId ? parseInt(params.orderId) : null;

  if (!orderId) {
    // If no orderId is provided, redirect to the home page.
    redirect("/");
  }

  // Fetch all order details from the database in one go.
  const orderDetails = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      user: true,
      orderItems: true,
      address: true,
    },
  });

  if (!orderDetails) {
    return <div>Order not found.</div>;
  }

  // Now, we render the page with the real, persistent data from the database.
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="container max-w-md mx-auto px-4 text-center">
          {/* Lottie Animation */}
          <OrderConfirmedAnimation />

          {/* Order Confirmed Message */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Order is Confirmed!
            </h1>
            <p className="text-lg text-gray-600">Thanks For Your Order</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Mode:</span>
                <span className="font-medium capitalize">
                  {orderDetails.serviceMode}
                </span>
              </div>
              {orderDetails.serviceMode === "doorstep" &&
                orderDetails.timeSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-medium">{orderDetails.timeSlot}</span>
                  </div>
                )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  ₹{Number(orderDetails.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">
              Thanks a bunch for choosing PixelPanic! It means a lot to us, just
              like you do!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
              asChild
            >
              <Link href="/orders">Continue to Order History</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg"
              asChild
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
