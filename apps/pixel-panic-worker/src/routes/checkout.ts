// apps/pixel-panic-worker/src/routes/checkout.ts

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env, createDbPool } from "..";
import { verifyAuth } from "./auth"; // Import the auth middleware
import {
  orders,
  orderItems,
  addresses,
  coupons,
  couponUsage,
} from "@repo/db/schema"; // Import new schema tables
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  generateOrderNumber,
  getNextOrderSequence,
} from "../utils/order-utils";

const checkoutRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Normalize service mode from client (e.g., "Doorstep" | "CarryIn") to DB enum values
function normalizeServiceMode(input: unknown): "doorstep" | "carry_in" {
  const str = String(input || "")
    .trim()
    .toLowerCase();
  if (str === "doorstep") return "doorstep";
  if (str === "carryin" || str === "carry_in" || str === "carry-in")
    return "carry_in";
  // Default conservatively to doorstep to avoid enum errors; upstream validation should ensure correctness
  return "doorstep";
}

/**
 * POST /api/checkout/validate-coupon-public
 * Public endpoint to validate a coupon code without requiring authentication
 */
checkoutRoutes.post("/validate-coupon-public", async (c) => {
  const body = await c.req.json();
  const { code, orderAmount, serviceMode, brandIds, modelIds } = body;

  if (!code || !orderAmount) {
    throw new HTTPException(400, {
      message: "Coupon code and order amount are required",
    });
  }

  try {
    const db = c.req.db;
    const now = new Date();

    // Find the coupon
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase()),
    });

    if (!coupon) {
      return c.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (coupon.status !== "active") {
      return c.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    // Check validity period
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return c.json({
        valid: false,
        message: "This coupon has expired or is not yet valid",
      });
    }

    // Check minimum order amount
    const minAmount = Number(coupon.minimumOrderAmount);
    if (orderAmount < minAmount) {
      return c.json({
        valid: false,
        message: `Minimum order amount of ₹${minAmount.toLocaleString()} required`,
      });
    }

    // Check service mode restrictions
    if (
      coupon.applicableServiceModes &&
      coupon.applicableServiceModes.length > 0
    ) {
      if (!coupon.applicableServiceModes.includes(serviceMode)) {
        return c.json({
          valid: false,
          message: `This coupon is not valid for ${serviceMode} service`,
        });
      }
    }

    // Check brand restrictions
    if (coupon.applicableBrandIds && coupon.applicableBrandIds.length > 0) {
      if (
        !brandIds ||
        !brandIds.some((id: number) => coupon.applicableBrandIds!.includes(id))
      ) {
        return c.json({
          valid: false,
          message: "This coupon is not valid for the selected brand(s)",
        });
      }
    }

    // Check model restrictions
    if (coupon.applicableModelIds && coupon.applicableModelIds.length > 0) {
      if (
        !modelIds ||
        !modelIds.some((id: number) => coupon.applicableModelIds!.includes(id))
      ) {
        return c.json({
          valid: false,
          message: "This coupon is not valid for the selected model(s)",
        });
      }
    }

    // Check total usage limit
    if (coupon.totalUsageLimit) {
      const totalUsage = await db.query.couponUsage.findMany({
        where: eq(couponUsage.couponId, coupon.id),
      });

      if (totalUsage.length >= coupon.totalUsageLimit) {
        return c.json({
          valid: false,
          message: "This coupon has reached its usage limit",
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (orderAmount * Number(coupon.value)) / 100;

      // Apply maximum discount cap if set
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maximumDiscount)
        );
      }
    } else if (coupon.type === "fixed_amount") {
      discountAmount = Number(coupon.value);
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    return c.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value.toString(),
        maximumDiscount: coupon.maximumDiscount?.toString(),
      },
      discountAmount: discountAmount.toFixed(2),
      finalAmount: (orderAmount - discountAmount).toFixed(2),
      message: `You save ₹${discountAmount.toFixed(2)}!`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw new HTTPException(500, {
      message: "An error occurred while validating the coupon",
    });
  }
});

// Apply the authentication middleware to all other checkout routes.
// This ensures that only logged-in users can access these endpoints.
checkoutRoutes.use("/*", verifyAuth);

/**
 * POST /api/checkout/validate-coupon
 * Validates a coupon code and returns discount information
 */
checkoutRoutes.post("/validate-coupon", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { code, orderAmount, serviceMode, brandIds, modelIds } = body;
  const normalizedServiceMode = normalizeServiceMode(serviceMode);

  if (!code || !orderAmount) {
    throw new HTTPException(400, {
      message: "Coupon code and order amount are required",
    });
  }

  try {
    const db = c.req.db;
    const now = new Date();

    // Find the coupon
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase()),
    });

    if (!coupon) {
      return c.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (coupon.status !== "active") {
      return c.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    // Check validity period
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return c.json({
        valid: false,
        message: "This coupon has expired or is not yet valid",
      });
    }

    // Check minimum order amount
    const minAmount = Number(coupon.minimumOrderAmount);
    if (orderAmount < minAmount) {
      return c.json({
        valid: false,
        message: `Minimum order amount of ₹${minAmount.toLocaleString()} required`,
      });
    }

    // Check service mode restrictions
    if (
      coupon.applicableServiceModes &&
      coupon.applicableServiceModes.length > 0
    ) {
      if (!coupon.applicableServiceModes.includes(serviceMode)) {
        return c.json({
          valid: false,
          message: `This coupon is not valid for ${serviceMode} service`,
        });
      }
    }

    // Check brand restrictions
    if (coupon.applicableBrandIds && coupon.applicableBrandIds.length > 0) {
      if (
        !brandIds ||
        !brandIds.some((id: number) => coupon.applicableBrandIds!.includes(id))
      ) {
        return c.json({
          valid: false,
          message: "This coupon is not valid for the selected brand(s)",
        });
      }
    }

    // Check model restrictions
    if (coupon.applicableModelIds && coupon.applicableModelIds.length > 0) {
      if (
        !modelIds ||
        !modelIds.some((id: number) => coupon.applicableModelIds!.includes(id))
      ) {
        return c.json({
          valid: false,
          message: "This coupon is not valid for the selected model(s)",
        });
      }
    }

    // Check total usage limit
    if (coupon.totalUsageLimit) {
      const totalUsage = await db.query.couponUsage.findMany({
        where: eq(couponUsage.couponId, coupon.id),
      });

      if (totalUsage.length >= coupon.totalUsageLimit) {
        return c.json({
          valid: false,
          message: "This coupon has reached its usage limit",
        });
      }
    }

    // Check per-user usage limit
    const userUsage = await db.query.couponUsage.findMany({
      where: and(
        eq(couponUsage.couponId, coupon.id),
        eq(couponUsage.userId, userId)
      ),
    });

    if (userUsage.length >= (coupon.perUserUsageLimit || 1)) {
      return c.json({
        valid: false,
        message: `You have already used this coupon ${coupon.perUserUsageLimit || 1} time(s)`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (orderAmount * Number(coupon.value)) / 100;

      // Apply maximum discount cap if set
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maximumDiscount)
        );
      }
    } else if (coupon.type === "fixed_amount") {
      discountAmount = Number(coupon.value);
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    return c.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value.toString(),
        maximumDiscount: coupon.maximumDiscount?.toString(),
      },
      discountAmount: discountAmount.toFixed(2),
      finalAmount: (orderAmount - discountAmount).toFixed(2),
      message: `You save ₹${discountAmount.toFixed(2)}!`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw new HTTPException(500, {
      message: "An error occurred while validating the coupon",
    });
  }
});

// This is the new, powerful endpoint that creates a complete order.
checkoutRoutes.post("/create-order", async (c) => {
  const userId = c.get("userId"); // Get the authenticated user's ID from the middleware
  const body = await c.req.json();

  // Extract all the data sent from the frontend
  const { items, customerInfo, serviceDetails, total, appliedCoupon } = body;
  const normalizedServiceMode = normalizeServiceMode(
    serviceDetails?.serviceMode
  );

  // Basic validation
  if (!items || items.length === 0 || !customerInfo || !serviceDetails) {
    throw new HTTPException(400, {
      message: "Missing required order information.",
    });
  }

  // Enforce time slot selection for both service modes
  if (!serviceDetails?.timeSlot) {
    throw new HTTPException(400, {
      message: "A time slot is required for the selected service mode.",
    });
  }

  try {
    // Create a WebSocket pool for transactions
    const pool = createDbPool(c.env.DATABASE_URL);
    const db = drizzle(pool);

    // Use a database transaction to ensure all or nothing is written.
    // This prevents partial orders if one of the steps fails.
    const newOrder = await db.transaction(async (tx) => {
      // 1. Generate order number
      const sequenceNumber = await getNextOrderSequence(tx);
      const orderNumber = generateOrderNumber(sequenceNumber);

      // 2. Create the main order record
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: orderNumber,
          userId: userId,
          totalAmount: total.toString(), // Drizzle numeric type expects a string
          serviceMode: normalizedServiceMode, // 'doorstep' or 'carry_in'
          timeSlot: serviceDetails.timeSlot,
          status: "confirmed", // Set initial status
          appliedCouponId: appliedCoupon?.id || null,
          discountAmount: appliedCoupon?.discountAmount || "0",
        })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      if (!order) {
        // If order creation fails, abort the transaction
        throw new Error("Failed to create order record.");
      }

      // 2. Create the associated address record, linking it to the new order
      await tx.insert(addresses).values({
        orderId: order.id,
        fullName: customerInfo.fullName,
        phoneNumber: customerInfo.phoneNumber,
        email: customerInfo.email,
        alternatePhoneNumber: customerInfo.alternatePhoneNumber || "",
        flatAndStreet: customerInfo.flatAndStreet,
        landmark: customerInfo.landmark,
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

      // 4. Record coupon usage if a coupon was applied
      if (appliedCoupon?.id) {
        await tx.insert(couponUsage).values({
          couponId: appliedCoupon.id,
          orderId: order.id,
          userId: userId,
          discountAmount: appliedCoupon.discountAmount,
          orderAmountBeforeDiscount: (
            Number(total) + Number(appliedCoupon.discountAmount)
          ).toString(),
          orderAmountAfterDiscount: total.toString(),
        });
      }

      return order;
    });

    // Close the pool after transaction
    await pool.end();

    if (!newOrder) {
      throw new HTTPException(500, {
        message: "Failed to save order details.",
      });
    }

    // On success, return the new order ID and order number to the frontend
    return c.json({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    throw new HTTPException(500, {
      message: "An unexpected error occurred while creating your order.",
    });
  }
});

// Apply the authentication middleware to all other checkout routes.
// This ensures that only logged-in users can access these endpoints.
checkoutRoutes.use("/*", verifyAuth);

export default checkoutRoutes;

/*
Explanation of the New Backend Logic
Authentication: We apply the verifyAuth middleware to all /api/checkout/* routes. If a user is not logged in, they will get a 401 Unauthorized error and won't be able to proceed.

Single Endpoint: We now have a single /create-order endpoint that handles everything. The old /address endpoint is no longer needed.

Database Transaction (db.transaction): This is the most important part. It groups all our database operations (creating the order, the address, and the items) into a single unit. If any one of these steps fails, the entire transaction is automatically rolled back, preventing corrupt or incomplete data from being saved to your database.

Success: If all steps in the transaction succeed, the endpoint returns the unique ID of the newly created order. The frontend will use this ID to redirect to the confirmation page.
*/
