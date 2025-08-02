// apps/pixel-panic-web/app/checkout/confirmation/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/server"; // Direct database access
import { orders, orderItems, addresses, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

import Footer from "@/components/shared/Footer";
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 py-6 sm:py-8 lg:py-12">
        <div className="container max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-pp-navy mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              Your repair appointment for order #{orderDetails.id} has been
              successfully scheduled.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Service Details Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-pp-orange mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base">
                      Service Mode
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize">
                      {orderDetails.serviceMode}
                    </p>
                  </div>
                </div>
                {orderDetails.serviceMode === "doorstep" &&
                  orderDetails.timeSlot && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-pp-orange mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                          Appointment Time
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {orderDetails.timeSlot}
                        </p>
                      </div>
                    </div>
                  )}
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-pp-orange mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base">
                      Contact
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {orderDetails.address.fullName} -{" "}
                      {orderDetails.address.phoneNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Repair Items Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  Repair Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {orderDetails.orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-b-0 gap-1 sm:gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {item.issueName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Grade: {item.grade}
                      </p>
                    </div>
                    <p className="font-semibold text-sm sm:text-base text-right sm:text-left">
                      ₹{Number(item.priceAtTimeOfOrder).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                  <p className="font-bold text-base sm:text-lg">Total Paid</p>
                  <p className="font-bold text-base sm:text-lg">
                    ₹{Number(orderDetails.totalAmount).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center pt-4 sm:pt-6">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
