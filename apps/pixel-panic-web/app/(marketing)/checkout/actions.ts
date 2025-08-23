"use server";

import { apiFetch } from "@/server";
import { addressSchema, type AddressFormValues } from "@repo/validators";
import { redirect } from "next/navigation";

export interface CheckoutFormData {
  customerInfo: AddressFormValues;
  items: any[];
  total: number;
  serviceMode: string;
  timeSlot?: string;
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
    const appliedCouponJson = formData.get("appliedCoupon") as string;

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
      const errorData = (await response.json()) as { message?: string };
      throw new Error(
        errorData.message || "An error occurred while creating the order."
      );
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
