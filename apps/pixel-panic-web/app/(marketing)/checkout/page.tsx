// apps/pixel-panic-web/app/checkout/page.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import { AlertCircle, Loader2, MapPin } from "lucide-react";

import { addressSchema, type AddressFormValues } from "@repo/validators";
import { useAuth } from "@/hooks/use-auth";
import { createOrderAction, type CheckoutFormData } from "./actions";

export default function CheckoutPage() {
  const [isLocating, setIsLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const router = useRouter();
  const {
    items,
    total,
    discountedTotal,
    serviceMode,
    timeSlot,
    appliedCoupon,
  } = useCart();
  const { user } = useAuth();

  // Use useTransition for form handling
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if no items in cart or no service mode selected
  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/");
      return;
    }

    if (!serviceMode) {
      router.push("/checkout/service-mode");
      return;
    }
  }, [items.length, serviceMode, router]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      alternatePhoneNumber: "",
      flatAndStreet: "",
      landmark: "",
    },
  });

  // Update form when user data is loaded
  React.useEffect(() => {
    if (user?.phoneNumber) {
      form.setValue("phoneNumber", user.phoneNumber);
    }
  }, [user, form]);

  async function handleUseCurrentLocation() {
    if (isLocating || isPending) return;
    setLocationError(null);
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            // Nominatim requires an identifiable referer; browser supplies it automatically
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reverse geocode location");
      const data = (await res.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };

      const formatted =
        data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      form.setValue("flatAndStreet", formatted, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Optionally set a landmark if available and empty
      const potentialLandmark =
        data.address?.neighbourhood ||
        data.address?.suburb ||
        data.address?.city ||
        data.address?.state;
      const currentLandmark = form.getValues("landmark");
      if (!currentLandmark && potentialLandmark) {
        form.setValue("landmark", potentialLandmark, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to fetch current location";
      setLocationError(msg);
    } finally {
      setIsLocating(false);
    }
  }

  // Create a custom action that includes cart data
  const handleFormAction = async (values: AddressFormValues) => {
    // Create FormData with form values and cart data
    const formData = new FormData();

    // Add customer info from form values
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Ensure phoneNumber is always included from user data (since it's disabled)
    if (user?.phoneNumber && !values.phoneNumber) {
      formData.set("phoneNumber", user.phoneNumber);
    }

    // Add cart data
    formData.append("items", JSON.stringify(items));
    formData.append("total", discountedTotal.toString());
    formData.append("serviceMode", serviceMode || "");
    if (timeSlot) {
      formData.append("timeSlot", timeSlot);
    }
    if (appliedCoupon) {
      formData.append(
        "appliedCoupon",
        JSON.stringify({
          id: appliedCoupon.couponId,
          discountAmount: appliedCoupon.discount.toString(),
        })
      );
    }

    // Call the original action and handle the result
    const result = await createOrderAction({ error: null }, formData);

    // Check if it's an error response
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    // Check if it's a success response
    if ("success" in result && result.success && result.orderId) {
      router.push(`/checkout/confirmation?orderId=${result.orderId}`);
    }
  };

  // Show loading while redirecting
  if (items.length === 0 || !serviceMode) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <main className="flex-1 py-8 px-4 sm:py-12 lg:py-16">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pp-orange mx-auto mb-4"></div>
              <p className="text-pp-slate">Redirecting...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
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
                  onSubmit={form.handleSubmit((values) => {
                    startTransition(() => {
                      handleFormAction(values);
                    });
                  })}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Form fields remain the same */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rakesh Sharma"
                            {...field}
                            disabled={isPending}
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
                        <FormLabel>
                          Mobile Number (Verified){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9876543210"
                            {...field}
                            disabled={true}
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alternatePhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9876543210"
                            {...field}
                            disabled={isPending}
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
                        <FormLabel>
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            disabled={isPending}
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
                        <div className="flex items-center justify-between gap-2">
                          <FormLabel>
                            Full Address <span className="text-red-500">*</span>
                          </FormLabel>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleUseCurrentLocation}
                            disabled={isPending || isLocating}
                          >
                            {isLocating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Locating...
                              </>
                            ) : (
                              <>
                                <MapPin className="mr-2 h-4 w-4" />
                                Use current location
                              </>
                            )}
                          </Button>
                        </div>
                        {locationError && (
                          <p className="mt-1 text-sm text-red-600">
                            {locationError}
                          </p>
                        )}
                        <FormControl>
                          <Input
                            placeholder="Flat/Street address"
                            {...field}
                            disabled={isPending || isLocating}
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
                        <FormLabel>Landmark</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nearby landmark"
                            {...field}
                            disabled={isPending}
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

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isPending ? "Saving..." : "Confirm Booking"}
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
