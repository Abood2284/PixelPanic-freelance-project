// apps/pixel-panic-worker/src/routes/orders.ts

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "..";
import { verifyAuth } from "./auth";
import { orders, orderItems, addresses } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";

const ordersRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Apply authentication middleware
ordersRoutes.use("/*", verifyAuth);

// Get all orders for the authenticated user
ordersRoutes.get("/", async (c) => {
  const userId = c.get("userId");

  try {
    const userOrders = await c.req.db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        orderItems: true,
        address: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return c.json({ orders: userOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new HTTPException(500, {
      message: "Failed to fetch orders",
    });
  }
});

export default ordersRoutes;
