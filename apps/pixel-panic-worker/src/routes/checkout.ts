// apps/pixel-panic-worker/src/routes/checkout.ts

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env, createDbPool } from "..";
import { verifyAuth } from "./auth"; // Import the auth middleware
import { orders, orderItems, addresses } from "@repo/db/schema"; // Import new schema tables
import { drizzle } from "drizzle-orm/neon-serverless";

const checkoutRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Apply the authentication middleware to all checkout routes.
// This ensures that only logged-in users can access these endpoints.
checkoutRoutes.use("/*", verifyAuth);

// This is the new, powerful endpoint that creates a complete order.
checkoutRoutes.post("/create-order", async (c) => {
  const userId = c.get("userId"); // Get the authenticated user's ID from the middleware
  const body = await c.req.json();

  // Extract all the data sent from the frontend
  const { items, customerInfo, serviceDetails, total } = body;

  // Basic validation
  if (!items || items.length === 0 || !customerInfo || !serviceDetails) {
    throw new HTTPException(400, {
      message: "Missing required order information.",
    });
  }

  try {
    // Create a WebSocket pool for transactions
    const pool = createDbPool(c.env.DATABASE_URL);
    const db = drizzle(pool);

    // Use a database transaction to ensure all or nothing is written.
    // This prevents partial orders if one of the steps fails.
    const newOrder = await db.transaction(async (tx) => {
      // 1. Create the main order record
      const [order] = await tx
        .insert(orders)
        .values({
          userId: userId,
          totalAmount: total.toString(), // Drizzle numeric type expects a string
          serviceMode: serviceDetails.serviceMode.toLowerCase(), // 'doorstep' or 'carry_in'
          timeSlot: serviceDetails.timeSlot,
          status: "confirmed", // Set initial status
        })
        .returning({ id: orders.id });

      if (!order) {
        // If order creation fails, abort the transaction
        throw new Error("Failed to create order record.");
      }

      // 2. Create the associated address record, linking it to the new order
      await tx.insert(addresses).values({
        orderId: order.id,
        ...customerInfo,
      });

      // 3. Create the order items, linking each to the new order
      const orderItemsData = items.map((item: any) => ({
        orderId: order.id,
        issueName: item.name,
        modelName: `${item.brand} ${item.model}`, // Assuming brand/model are passed in items
        grade: item.selectedGrade,
        priceAtTimeOfOrder: item.price.toString(),
      }));

      await tx.insert(orderItems).values(orderItemsData);

      return order;
    });

    // Close the pool after transaction
    await pool.end();

    if (!newOrder) {
      throw new HTTPException(500, {
        message: "Failed to save order details.",
      });
    }

    // On success, return the new order ID to the frontend
    return c.json({ orderId: newOrder.id });
  } catch (error) {
    console.error("Error creating order:", error);
    throw new HTTPException(500, {
      message: "An unexpected error occurred while creating your order.",
    });
  }
});

export default checkoutRoutes;

/*
Explanation of the New Backend Logic
Authentication: We apply the verifyAuth middleware to all /api/checkout/* routes. If a user is not logged in, they will get a 401 Unauthorized error and won't be able to proceed.

Single Endpoint: We now have a single /create-order endpoint that handles everything. The old /address endpoint is no longer needed.

Database Transaction (db.transaction): This is the most important part. It groups all our database operations (creating the order, the address, and the items) into a single unit. If any one of these steps fails, the entire transaction is automatically rolled back, preventing corrupt or incomplete data from being saved to your database.

Success: If all steps in the transaction succeed, the endpoint returns the unique ID of the newly created order. The frontend will use this ID to redirect to the confirmation page.
*/
