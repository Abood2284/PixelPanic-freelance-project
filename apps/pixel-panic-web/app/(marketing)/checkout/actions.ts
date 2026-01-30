// apps/pixel-panic-web/app/(marketing)/checkout/actions.ts
"use server";

import { apiFetch } from "@/server";
import { addressSchema, type AddressFormValues } from "@repo/validators";

export interface CheckoutFormData {
  customerInfo: AddressFormValues;
  items: any[];
  total: number;
  serviceMode: string;
  timeSlot?: string;
  serviceDate?: string;
  serviceTime?: string;
  appliedCoupon?: {
    id: string;
    discountAmount: string;
  } | null;
}

export async function createOrderAction(
  prevState: { error: string | null },
  formData: FormData
): Promise<
  | { error: string | null }
  | { success: true; orderId: string; orderNumber: string }
> {
  try {
    // Extract form data
    const customerInfo = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string, // Required field
      email: formData.get("email") as string,
      alternatePhoneNumber:
        (formData.get("alternatePhoneNumber") as string) || "", // Optional field
      flatAndStreet: formData.get("flatAndStreet") as string,
      landmark: formData.get("landmark") as string,
    };

    // Validate the customer info
    const validatedCustomerInfo = addressSchema.parse(customerInfo);

    // Get cart data from form data (we'll need to pass this from the client)
    const itemsJson = formData.get("items") as string;
    const total = Number(formData.get("total"));
    const serviceMode = formData.get("serviceMode") as string;
    const timeSlot = formData.get("timeSlot") as string;
    const serviceDate = formData.get("serviceDate") as string;
    const serviceTime = formData.get("serviceTime") as string;
    const appliedCouponJson = formData.get("appliedCoupon") as string;

    if (!serviceDate || !serviceTime) {
      throw new Error("Please select a service date and time.");
    }

    const items = JSON.parse(itemsJson);
    const appliedCoupon = appliedCouponJson
      ? JSON.parse(appliedCouponJson)
      : null;

    // Assemble the complete order payload
    const orderPayload = {
      items,
      total,
      customerInfo: validatedCustomerInfo,
      serviceDetails: {
        serviceMode,
        timeSlot,
        serviceDate,
        serviceTime,
      },
      appliedCoupon,
    };

    // Use apiFetch to make server-to-server call with preserved auth cookies
    const response = await apiFetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = "An error occurred while creating the order.";
      try {
        const errorData = JSON.parse(errorText) as { message?: string };
        if (errorData.message) message = errorData.message;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    const responseData = (await response.json()) as {
      orderId: string;
      orderNumber: string;
    };

    // Return success response instead of redirecting
    return {
      success: true,
      orderId: responseData.orderId,
      orderNumber: responseData.orderNumber,
    };
  } catch (error) {
    // Return error for useActionState to handle
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
