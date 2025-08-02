// apps/pixel-panic-web/app/checkout/page.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import Footer from "@/components/shared/Footer";
import { CheckoutStepper } from "@/components/features/checkout/CheckoutStepper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

import { addressSchema, type AddressFormValues } from "@repo/validators";

export default function CheckoutPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { items, total, serviceMode, timeSlot } = useCart();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      pincode: "",
      flatAndStreet: "",
      landmark: "",
    },
  });

  
  async function onSubmit(values: AddressFormValues) {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    // 1. Assemble the complete order payload
    const orderPayload = {
      items: items,
      total: total,
      customerInfo: values,
      serviceDetails: {
        serviceMode,
        timeSlot,
      },
    };

    try {
      // 2. Call our new, single endpoint to create the order
      const response = await fetch(
        `${API_BASE_URL}/api/checkout/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for sending the auth cookie
          body: JSON.stringify(orderPayload),
        }
      );

      const responseData = (await response.json()) as {
        message: string;
        orderId: string;
      };

      if (!response.ok) {
        throw new Error(
          responseData.message || "An error occurred while creating the order."
        );
      }

      // 3. On success, redirect to the confirmation page WITH the new orderId
      router.push(`/checkout/confirmation?orderId=${responseData.orderId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
        <div className="container mx-auto max-w-2xl">
          <div className="flex justify-center mb-8 sm:mb-16">
            <CheckoutStepper currentStep="info" />
          </div>
          <Card className="mx-auto">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Form fields remain the same */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rakesh Sharma"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number (OTP verified)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9876543210"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="400001"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="flatAndStreet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Flat/Street address"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nearby landmark"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Save Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Saving..." : "Confirm Booking"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
