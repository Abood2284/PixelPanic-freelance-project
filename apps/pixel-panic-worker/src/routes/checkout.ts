// src/routes/checkout.ts
import { Hono } from "hono";
import { Env } from "..";
import { addressSchema } from "@repo/validators";
const checkoutRoutes = new Hono<{ Bindings: Env }>();

// This replaces the Server Action.
// It handles the submission of the customer information form.
checkoutRoutes.post("/address", async (c) => {
  try {
    const body = await c.req.json();

    // Validate the incoming data against the Zod schema
    const validationResult = addressSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          status: 400,
          message: "Invalid form data.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        400
      );
    }

    const validatedData = validationResult.data;

    // --- Database Interaction would happen here ---
    // Example:
    // await c.req.db.insert(schema.Addresses).values({ ...validatedData, userId: '...' });
    console.log("Address data received and validated:", validatedData);

    return c.json({
      status: 200,
      message: `Address for ${validatedData.fullName} received successfully.`,
    });
  } catch (error) {
    console.error("Error processing checkout address:", error);
    return c.json({ status: 500, message: "Internal Server Error" }, 500);
  }
});

checkoutRoutes.post("/create-order", async (c) => {
  try {
    const { items, customerInfo, serviceDetails } = await c.req.json();

    // In a real application, you would perform final validation here
    // against the database (e.g., check item prices, availability).
    if (!items || items.length === 0 || !customerInfo || !serviceDetails) {
      return c.json({ status: 400, message: "Missing order details." }, 400);
    }

    // 1. Calculate final total on the backend as the source of truth
    const subtotal = items.reduce(
      (sum: number, item: { price: number }) => sum + item.price,
      0
    );
    const gst = subtotal * 0.18; // 18% GST
    const finalTotal = subtotal + gst;

    const orderData = {
      ...customerInfo,
      ...serviceDetails,
      items,
      total: finalTotal,
    };

    // 2. Save the final order to the database with a "PendingPayment" status
    // const newOrder = await c.req.db.insert(schema.Orders).values(orderData).returning();
    const orderId = `PP-${Date.now()}`; // Simulate creating an order ID

    console.log("Final order created with ID:", orderId, "Data:", orderData);

    // 3. Return the order ID and amount to the client to initiate payment
    return c.json({
      status: 200,
      message: "Order created successfully. Please proceed to payment.",
      data: {
        orderId: orderId,
        amount: finalTotal,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ status: 500, message: "Internal Server Error" }, 500);
  }
});

// Test route for initial setup verification
checkoutRoutes.post("/test", async (c) => {
  return c.json({
    status: 200,
    data: {
      message: "Hello World",
    },
  });
});

export default checkoutRoutes;
