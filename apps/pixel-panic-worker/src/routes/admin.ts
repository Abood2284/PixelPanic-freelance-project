// apps/pixel-panic-worker/src/routes/admin.ts

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq, gte, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";

import { Env, createDbPool } from "..";
import {
  brands,
  issues,
  models,
  modelIssues,
  orders,
  users,
  technicians,
  technicianInvites,
  coupons,
  couponUsage,
  contactMessages,
} from "@repo/db/index";
import { addPhoneModelSchema, updatePhoneModelSchema } from "@repo/validators";
import * as schema from "@repo/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { verifyAuth } from "./auth";

const adminRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Ensure the requester is an admin
const requireAdmin = createMiddleware(async (c, next) => {
   const { method } = c.req;
  const path = new URL(c.req.url).pathname;
  const origin = c.req.header("origin") || "<no-origin>";
  if (c.env.NODE_ENV === "development") {
    console.log("[ADMIN] dev bypass", { method, path });
    c.set("userId", "dev-admin-user-id");
    await next();
    return;
  }

  const userId = c.get("userId");
  console.log("[ADMIN] requireAdmin start", { method, path, origin, userId });
  const user = await c.req.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });

  if (!user) {
    console.warn("[ADMIN] user not found", { userId });
    throw new HTTPException(403, { message: "Admin access required" });
  }
  if (user.role !== "admin") {
    console.warn("[ADMIN] role mismatch", { userId, role: user.role });
    throw new HTTPException(403, { message: "Admin access required" });
  }

  console.log("[ADMIN] access granted", { userId });
  await next();
});

/**
 * POST /api/admin/create-admin
 * Creates the initial admin user. This endpoint should be disabled in production.
 * Body: { phoneNumber: string, name?: string }
 */
adminRoutes.post("/create-admin", async (c) => {
  // Only allow in development mode
  if (c.env.NODE_ENV === "production") {
    throw new HTTPException(403, {
      message: "Admin creation is not allowed in production",
    });
  }

  const body = await c.req.json();
  const { phoneNumber, name } = body;

  if (!phoneNumber) {
    throw new HTTPException(400, {
      message: "Phone number is required",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await c.req.db.query.users.findFirst({
      where: eq(users.phoneNumber, phoneNumber),
    });

    if (existingUser) {
      // Update existing user to admin role
      await c.req.db
        .update(users)
        .set({
          role: "admin",
          name: name || existingUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      return c.json({
        message: `User ${phoneNumber} updated to admin role`,
        userId: existingUser.id,
      });
    }

    // Create new admin user
    const [newAdmin] = await c.req.db
      .insert(users)
      .values({
        phoneNumber,
        name: name || "Admin User",
        role: "admin",
      })
      .returning();

    return c.json(
      {
        message: `Admin user created successfully`,
        userId: newAdmin.id,
      },
      201
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw new HTTPException(500, {
      message: "Failed to create admin user",
    });
  }
});

/**
 * POST /api/admin/make-admin
 * Makes an existing user an admin by their user ID. Development only.
 * Body: { userId: string }
 */
adminRoutes.post("/make-admin", async (c) => {
  // Only allow in development mode
  if (c.env.NODE_ENV === "production") {
    throw new HTTPException(403, {
      message: "Admin creation is not allowed in production",
    });
  }

  const body = await c.req.json();
  const { userId } = body;

  if (!userId) {
    throw new HTTPException(400, {
      message: "User ID is required",
    });
  }

  try {
    // Check if user exists
    const existingUser = await c.req.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }

    // Update user to admin role
    await c.req.db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return c.json({
      message: `User ${existingUser.phoneNumber} updated to admin role`,
      userId: existingUser.id,
    });
  } catch (error) {
    console.error("Error updating user to admin:", error);
    throw new HTTPException(500, {
      message: "Failed to update user to admin",
    });
  }
});

// Apply authentication and admin role middleware to all other admin routes
adminRoutes.use("/*", verifyAuth, requireAdmin);

// Brand validation schema
const addBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters.")
    .max(100, "Brand name cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-&.]+$/,
      "Brand name can only contain letters, numbers, spaces, hyphens, ampersands, and periods."
    ),
  logoUrl: z.string().url().optional(),
});

/**
 * GET /api/admin/orders/:id
 * Fetches the complete details for a single order.
 */
adminRoutes.get("/orders/:id", async (c) => {
  const orderId = parseInt(c.req.param("id"), 10);
  if (isNaN(orderId)) {
    throw new HTTPException(400, { message: "Invalid order ID" });
  }

  try {
    // Use a relational query to get the order and all its related data in one go.
    const orderData = await c.req.db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: {
        user: true,
        address: true,
        orderItems: true,
      },
    });

    if (!orderData) {
      throw new HTTPException(404, { message: "Order not found" });
    }

    return c.json(orderData);
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    throw new HTTPException(500, {
      message: "Could not retrieve order details.",
    });
  }
});

/**
 * GET /api/admin/orders
 * Fetches all orders for the main orders page.
 * NOTE: For a production app with many orders, this should be paginated.
 */
adminRoutes.get("/orders", async (c) => {
  try {
    const allOrders = await c.req.db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        user: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });
    return c.json(allOrders);
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve orders.",
    });
  }
});

/**
 * GET /api/admin/dashboard
 * Fetches summary statistics and recent orders for the admin dashboard.
 */
adminRoutes.get("/dashboard", async (c) => {
  try {
    const db = c.req.db;

    // --- 1. Fetch Summary Statistics ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const statsQuery = await db
      .select({
        monthlyRevenue:
          sql`SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} ELSE 0 END)`.as(
            "monthly_revenue"
          ),
        completedJobs:
          sql`COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)`.as(
            "completed_jobs"
          ),
        pendingOrders:
          sql`COUNT(CASE WHEN ${orders.status} IN ('confirmed', 'in_progress') THEN 1 END)`.as(
            "pending_orders"
          ),
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo));

    const summary = {
      monthlyRevenue: Number(statsQuery[0]?.monthlyRevenue) || 0,
      completedJobs: Number(statsQuery[0]?.completedJobs) || 0,
      pendingOrders: Number(statsQuery[0]?.pendingOrders) || 0,
      // NOTE: Average repair time is a complex metric not yet tracked in the DB.
      // We will return a static value as a placeholder.
      averageRepairTimeMinutes: 85,
    };

    // --- 2. Fetch Recent Orders ---
    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 10,
      with: {
        user: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    return c.json({ summary, recentOrders });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve dashboard data.",
    });
  }
});

/**
 * GET /api/admin/form-data
 * Fetches the initial data (all brands and all issues) required to populate the admin form.
 * This is a read-only operation and can safely use the default HTTP driver via c.req.db.
 */
adminRoutes.get("/form-data", async (c) => {
  try {
    const allBrands = await c.req.db.select().from(brands).orderBy(brands.name);
    const allIssues = await c.req.db.select().from(issues).orderBy(issues.name);

    return c.json({ brands: allBrands, issues: allIssues });
  } catch (error) {
    console.error("Failed to fetch admin form data:", error);
    throw new HTTPException(500, { message: "Could not retrieve form data." });
  }
});

/**
 * POST /api/admin/add-model
 * Receives form data to create a new phone model and its associated repair issues and prices.
 * This is a transactional write operation and MUST use the WebSocket pool driver.
 */
adminRoutes.post("/add-model", async (c) => {
  const body = await c.req.json();
  const validation = addPhoneModelSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      {
        message: "Invalid form data.",
        errors: validation.error.flatten().fieldErrors,
      },
      400
    );
  }

  // As per serverless best practices, create a new pool for each request.
  const pool = createDbPool(c.env.DATABASE_URL);

  try {
    const { brandId, modelName, selectedIssues } = validation.data;

    // Instantiate Drizzle with the transactional pool
    const db = drizzle(pool, { schema: { ...schema } });

    const existingModel = await db.query.models.findFirst({
      where: and(eq(models.brandId, brandId), eq(models.name, modelName)),
    });

    if (existingModel) {
      return c.json(
        { message: `The model "${modelName}" already exists for this brand.` },
        409 // Conflict
      );
    }

    // Drizzle's transaction function handles BEGIN, COMMIT, and ROLLBACK automatically.
    await db.transaction(async (tx) => {
      const [newModel] = await tx
        .insert(models)
        .values({ brandId, name: modelName })
        .returning();

      if (!newModel) {
        // This throw will trigger the transaction to rollback.
        throw new Error("Failed to create the new model row.");
      }

      const modelIssuesData = selectedIssues.map((issue) => ({
        modelId: newModel.id,
        issueId: issue.issueId,
        priceOriginal: issue.priceOriginal?.toString() || null,
        priceAftermarketTier1: issue.priceAftermarketTier1?.toString() || null,
      }));

      await tx.insert(modelIssues).values(modelIssuesData);
    });

    return c.json(
      { message: `Successfully added model: ${modelName}` },
      201 // Created
    );
  } catch (error) {
    console.error("Error adding new phone model:", error);
    // The transaction will have been rolled back by Drizzle or the explicit catch.
    throw new HTTPException(500, {
      message: "An internal error occurred while saving the model.",
    });
  } finally {
    // CRITICAL STEP: Always end the pool to close the WebSocket connection.
    await pool.end();
  }
});

/**
 * GET /api/admin/models/:id
 * Fetches a single model and its associated services and prices.
 */
adminRoutes.get("/models/:id", async (c) => {
  const modelId = parseInt(c.req.param("id"), 10);
  if (isNaN(modelId)) {
    throw new HTTPException(400, { message: "Invalid model ID" });
  }

  try {
    // Use a relational query to get the model and all its related issues in one go.
    const modelData = await c.req.db.query.models.findFirst({
      where: eq(models.id, modelId),
      with: {
        modelIssues: true, // Fetch the priced issues for this model
      },
    });

    if (!modelData) {
      throw new HTTPException(404, { message: "Model not found" });
    }

    return c.json(modelData);
  } catch (error) {
    console.error("Failed to fetch model data:", error);
    throw new HTTPException(500, { message: "Could not retrieve model data." });
  }
});

/**
 * PATCH /api/admin/models/:id
 * Updates an existing model's services and prices in a transaction.
 */
adminRoutes.patch("/models/:id", async (c) => {
  const modelId = parseInt(c.req.param("id"), 10);
  if (isNaN(modelId)) {
    throw new HTTPException(400, { message: "Invalid model ID" });
  }

  const body = await c.req.json();
  const validation = updatePhoneModelSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      { message: "Invalid data", errors: validation.error.flatten() },
      400
    );
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    const { modelName, selectedIssues } = validation.data;

    await db.transaction(async (tx) => {
      // 1. Update the model's name if it was provided
      if (modelName) {
        await tx
          .update(models)
          .set({ name: modelName })
          .where(eq(models.id, modelId));
      }

      // 2. Delete all existing services for this model to ensure a clean slate.
      await tx.delete(modelIssues).where(eq(modelIssues.modelId, modelId));

      // 3. Insert the new set of services and prices.
      if (selectedIssues && selectedIssues.length > 0) {
        const newModelIssuesData = selectedIssues.map((issue) => ({
          modelId: modelId,
          issueId: issue.issueId,
          priceOriginal: issue.priceOriginal?.toString() || null,
          priceAftermarketTier1:
            issue.priceAftermarketTier1?.toString() || null,
        }));
        await tx.insert(modelIssues).values(newModelIssuesData);
      }
    });

    return c.json({ message: "Model updated successfully" }, 200);
  } catch (error) {
    console.error("Error updating phone model:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while updating the model.",
    });
  } finally {
    await pool.end();
  }
});

/**
 * POST /api/admin/generate-upload-url
 * Creates a one-time upload URL for Cloudflare Images.
 */
adminRoutes.post("/generate-upload-url", async (c) => {
  // These secrets must be set in your wrangler.toml or Cloudflare dashboard
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = c.env.CLOUDFLARE_IMAGES_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new HTTPException(500, {
      message: "Cloudflare credentials are not configured.",
    });
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data = (await response.json()) as {
      success: boolean;
      errors: { message: string }[];
      result: { uploadURL: string; id: string };
    };

    if (!data.success) {
      throw new Error(
        data.errors[0]?.message || "Failed to generate upload URL."
      );
    }

    // The response from Cloudflare contains the uploadURL and a public-facing imageId
    return c.json({
      uploadURL: data.result.uploadURL,
      imageId: data.result.id,
    });
  } catch (error) {
    console.error("Cloudflare API error:", error);
    throw new HTTPException(500, { message: "Could not generate upload URL." });
  }
});

/**
 * POST /api/admin/upload-brand-logo
 * Uploads a brand logo to Cloudinary and returns the URL
 */
adminRoutes.post("/upload-brand-logo", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new HTTPException(400, { message: "No file provided" });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new HTTPException(400, { message: "File must be an image" });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new HTTPException(400, {
      message: "File size must be less than 5MB",
    });
  }

  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${c.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const uploadFormData = new FormData();
    uploadFormData.append("file", dataURI);
    uploadFormData.append("upload_preset", c.env.CLOUDINARY_UPLOAD_PRESET);
    uploadFormData.append("folder", "pixel-panic-brands-icon");

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload error:", errorText);
      throw new HTTPException(500, {
        message: "Failed to upload image to Cloudinary",
      });
    }

    const result = (await response.json()) as {
      secure_url: string;
      public_id: string;
    };

    return c.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new HTTPException(500, { message: "Failed to upload image" });
  }
});

/**
 * POST /api/admin/update-brand-logo
 * Updates the logo URL for a specific brand
 */
adminRoutes.post("/update-brand-logo", async (c) => {
  const { brandId, logoUrl } = await c.req.json();

  if (!brandId || !logoUrl) {
    throw new HTTPException(400, {
      message: "Brand ID and logo URL are required",
    });
  }

  try {
    const pool = createDbPool(c.env.DATABASE_URL);
    const db = drizzle(pool, { schema });

    await db.update(brands).set({ logoUrl }).where(eq(brands.id, brandId));

    await pool.end();

    return c.json({ message: "Brand logo updated successfully" });
  } catch (error) {
    console.error("Error updating brand logo:", error);
    throw new HTTPException(500, { message: "Failed to update brand logo" });
  }
});

/**
 * POST /api/admin/add-brand
 * Creates a new brand with optional logo URL
 */
adminRoutes.post("/add-brand", async (c) => {
  const body = await c.req.json();
  const validation = addBrandSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      {
        message: "Invalid form data.",
        errors: validation.error.flatten().fieldErrors,
      },
      400
    );
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    const { name, logoUrl } = validation.data;

    // Check if brand already exists
    const existingBrand = await db.query.brands.findFirst({
      where: eq(brands.name, name),
    });

    if (existingBrand) {
      return c.json(
        { message: `The brand "${name}" already exists.` },
        409 // Conflict
      );
    }

    // Create the new brand
    const [newBrand] = await db
      .insert(brands)
      .values({ name, logoUrl })
      .returning();

    if (!newBrand) {
      throw new Error("Failed to create the new brand row.");
    }

    return c.json(
      { message: `Successfully added brand: ${name}` },
      201 // Created
    );
  } catch (error) {
    console.error("Error adding new brand:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while saving the brand.",
    });
  } finally {
    await pool.end();
  }
});

// ============================================================================
// CONTACT MESSAGES ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/contact-messages
 * Fetches all contact messages for the admin dashboard.
 */
adminRoutes.get("/contact-messages", async (c) => {
  try {
    const allMessages = await c.req.db.query.contactMessages.findMany({
      orderBy: [desc(contactMessages.createdAt)],
    });

    // Calculate statistics
    const totalMessages = allMessages.length;
    const pendingMessages = allMessages.filter(
      (m) => m.status === "pending"
    ).length;
    const respondedMessages = allMessages.filter(
      (m) => m.status === "responded"
    ).length;

    const stats = {
      totalMessages,
      pendingMessages,
      respondedMessages,
      responseRate:
        totalMessages > 0
          ? ((respondedMessages / totalMessages) * 100).toFixed(1)
          : "0",
    };

    return c.json({ messages: allMessages, stats });
  } catch (error) {
    console.error("Failed to fetch contact messages:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve contact messages.",
    });
  }
});

/**
 * PATCH /api/admin/contact-messages/:id
 * Updates the status of a contact message (e.g., mark as responded).
 */
adminRoutes.patch("/contact-messages/:id", async (c) => {
  const messageId = parseInt(c.req.param("id"), 10);
  if (isNaN(messageId)) {
    throw new HTTPException(400, { message: "Invalid message ID" });
  }

  const body = await c.req.json();
  const { status } = body;

  if (!status || !["pending", "responded", "closed"].includes(status)) {
    throw new HTTPException(400, {
      message: "Status must be one of: pending, responded, closed",
    });
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    await db
      .update(contactMessages)
      .set({ status, updatedAt: new Date() })
      .where(eq(contactMessages.id, messageId));

    return c.json({ message: "Contact message status updated successfully" });
  } catch (error) {
    console.error("Error updating contact message:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while updating the message.",
    });
  } finally {
    await pool.end();
  }
});

export default adminRoutes;

// List technicians for assignment
adminRoutes.get("/technicians", async (c) => {
  const list = await c.req.db.query.users.findMany({
    where: (u, { eq }) => eq(u.role, "technician"),
    columns: { id: true, name: true, phoneNumber: true },
  });
  return c.json(list);
});

// NOTE: Legacy technician applications endpoints removed. We now use invitation-based onboarding.

// Technician invites CRUD
adminRoutes.get("/technician-invites", async (c) => {
  const list = await c.req.db.select().from(technicianInvites);
  return c.json(list);
});

adminRoutes.post("/technician-invites", async (c) => {
  const { phoneNumber, name } = (await c.req.json()) as {
    phoneNumber?: string;
    name?: string;
  };
  if (!phoneNumber)
    throw new HTTPException(400, { message: "phoneNumber required" });
  const token = crypto.randomUUID().replace(/-/g, "");
  // Set invite expiry to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const [row] = await c.req.db
    .insert(technicianInvites)
    .values({ phoneNumber, name: name ?? null, token, expiresAt })
    .returning();
  return c.json({ ok: true, invite: row });
});

adminRoutes.post("/technician-invites/:id/revoke", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id))
    throw new HTTPException(400, { message: "Invalid id" });
  await c.req.db
    .update(technicianInvites)
    .set({ expiresAt: new Date() })
    .where(eq(technicianInvites.id, id));
  return c.json({ ok: true });
});

// ============================================================================
// Technicians / Assignment (Admin)
// ============================================================================

/**
 * POST /api/admin/assign-order
 * Assigns an order to a technician and generates a completion OTP.
 * Body: { orderId: number, technicianId: string }
 */
adminRoutes.post("/assign-order", async (c) => {
  const body = await c.req.json();
  const orderId = Number(body?.orderId);
  const technicianId = String(body?.technicianId || "");

  if (!Number.isInteger(orderId) || !technicianId) {
    throw new HTTPException(400, {
      message: "orderId (number) and technicianId (string) are required",
    });
  }

  // Ensure technician exists and has the correct role
  const technician = await c.req.db.query.users.findFirst({
    where: and(eq(users.id, technicianId), eq(users.role, "technician")),
    columns: { id: true },
  });

  if (!technician) {
    throw new HTTPException(404, {
      message: "Technician not found or invalid role",
    });
  }

  // Ensure order exists
  const order = await c.req.db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: { id: true, status: true },
  });

  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  // Generate a 6-digit OTP and set expiry to 8 hours from now
  const otp = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  await c.req.db
    .update(orders)
    .set({
      technicianId,
      // Do not force status; admin can confirm elsewhere. Keep current status.
      completionOtp: otp,
      completionOtpExpiresAt: expiresAt,
    })
    .where(eq(orders.id, orderId));

  // In MVP: Return OTP so admin can communicate to customer via existing channels.
  // Future: Send via WhatsApp/SMS to customer automatically.
  return c.json({
    ok: true,
    orderId,
    technicianId,
    completionOtp: otp,
    expiresAt,
  });
});

// ============================================================================
// COUPON MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/coupons
 * Fetches all coupons with usage statistics for the admin dashboard.
 */
adminRoutes.get("/coupons", async (c) => {
  try {
    const db = c.req.db;

    // Fetch all coupons with usage statistics
    const allCoupons = await db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)],
      with: {
        createdByAdmin: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
        usage: true,
      },
    });

    // Calculate usage statistics for each coupon
    const couponsWithStats = allCoupons.map((coupon) => {
      const totalUsageCount = coupon.usage.length;
      const totalDiscountGiven = coupon.usage.reduce(
        (sum, usage) => sum + Number(usage.discountAmount),
        0
      );

      return {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value.toString(),
        minimumOrderAmount: coupon.minimumOrderAmount?.toString() || "0",
        maximumDiscount: coupon.maximumDiscount?.toString() || null,
        totalUsageLimit: coupon.totalUsageLimit,
        perUserUsageLimit: coupon.perUserUsageLimit,
        validFrom: coupon.validFrom.toISOString(),
        validUntil: coupon.validUntil.toISOString(),
        status: coupon.status,
        applicableServiceModes: coupon.applicableServiceModes,
        applicableBrandIds: coupon.applicableBrandIds,
        applicableModelIds: coupon.applicableModelIds,
        totalUsageCount,
        totalDiscountGiven: totalDiscountGiven.toFixed(2),
        createdAt: coupon.createdAt.toISOString(),
        createdByAdmin: coupon.createdByAdmin,
      };
    });

    // Calculate overall statistics
    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter(
      (c) => c.status === "active"
    ).length;
    const totalUsage = allCoupons.reduce((sum, c) => sum + c.usage.length, 0);
    const totalDiscountGiven = allCoupons.reduce(
      (sum, c) =>
        sum + c.usage.reduce((uSum, u) => uSum + Number(u.discountAmount), 0),
      0
    );

    // Find most used coupon
    const mostUsedCoupon = allCoupons.reduce(
      (mostUsed, coupon) => {
        const usageCount = coupon.usage.length;
        const totalDiscount = coupon.usage.reduce(
          (sum, usage) => sum + Number(usage.discountAmount),
          0
        );

        if (usageCount > mostUsed.usageCount) {
          return {
            code: coupon.code,
            usageCount,
            totalDiscount: totalDiscount.toFixed(2),
          };
        }
        return mostUsed;
      },
      { code: "", usageCount: 0, totalDiscount: "0" }
    );

    const stats = {
      totalCoupons,
      activeCoupons,
      totalUsage,
      totalDiscountGiven: totalDiscountGiven.toFixed(2),
      averageDiscountPerOrder:
        totalUsage > 0 ? (totalDiscountGiven / totalUsage).toFixed(2) : "0",
      mostUsedCoupon: mostUsedCoupon.usageCount > 0 ? mostUsedCoupon : null,
    };

    return c.json({ coupons: couponsWithStats, stats });
  } catch (error) {
    console.error("Failed to fetch coupons data:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve coupons data.",
    });
  }
});

/**
 * POST /api/admin/coupons
 * Creates a new coupon.
 */
adminRoutes.post("/coupons", async (c) => {
  const body = await c.req.json();

  // Basic validation
  if (!body.code || !body.name || !body.type || !body.value) {
    throw new HTTPException(400, {
      message: "Missing required fields: code, name, type, value",
    });
  }

  // Validate coupon code format
  if (!/^[A-Z0-9]+$/.test(body.code)) {
    throw new HTTPException(400, {
      message: "Coupon code must contain only uppercase letters and numbers",
    });
  }

  // Validate dates
  const validFrom = new Date(body.validFrom);
  const validUntil = new Date(body.validUntil);

  if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
    throw new HTTPException(400, {
      message: "Invalid date format for validFrom or validUntil",
    });
  }

  if (validUntil <= validFrom) {
    throw new HTTPException(400, {
      message: "Valid until date must be after valid from date",
    });
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    // Check if coupon code already exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, body.code),
    });

    if (existingCoupon) {
      return c.json(
        { message: `Coupon code "${body.code}" already exists.` },
        409 // Conflict
      );
    }

    // Get the admin user ID from the auth context
    let adminId = c.get("userId");

    // In development mode, ensure we have a valid admin user
    if (c.env.NODE_ENV === "development" && adminId === "dev-admin-user-id") {
      // Check if dev admin user exists, create if not
      let devAdmin = await db.query.users.findFirst({
        where: eq(users.phoneNumber, "+919876543210"),
      });

      if (!devAdmin) {
        const [newDevAdmin] = await db
          .insert(users)
          .values({
            phoneNumber: "+919876543210",
            name: "Development Admin",
            role: "admin",
          })
          .returning();
        devAdmin = newDevAdmin;
      }

      adminId = devAdmin.id;
    }

    // Create the new coupon
    const [newCoupon] = await db
      .insert(coupons)
      .values({
        code: body.code,
        name: body.name,
        description: body.description || null,
        type: body.type,
        value: body.value.toString(),
        minimumOrderAmount: (body.minimumOrderAmount || 0).toString(),
        maximumDiscount: body.maximumDiscount?.toString() || null,
        totalUsageLimit: body.totalUsageLimit || null,
        perUserUsageLimit: body.perUserUsageLimit || 1,
        validFrom,
        validUntil,
        status: "active",
        applicableServiceModes: body.applicableServiceModes || null,
        applicableBrandIds: body.applicableBrandIds || null,
        applicableModelIds: body.applicableModelIds || null,
        createdByAdminId: adminId,
      })
      .returning();

    if (!newCoupon) {
      throw new Error("Failed to create the new coupon row.");
    }

    return c.json(
      { message: `Successfully created coupon: ${body.code}` },
      201 // Created
    );
  } catch (error) {
    console.error("Error creating new coupon:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while creating the coupon.",
    });
  } finally {
    await pool.end();
  }
});

/**
 * GET /api/admin/coupons/:id
 * Fetches a single coupon with detailed usage history.
 */
adminRoutes.get("/coupons/:id", async (c) => {
  const couponId = parseInt(c.req.param("id"), 10);
  if (isNaN(couponId)) {
    throw new HTTPException(400, { message: "Invalid coupon ID" });
  }

  try {
    const couponData = await c.req.db.query.coupons.findFirst({
      where: eq(coupons.id, couponId),
      with: {
        createdByAdmin: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
        usage: {
          with: {
            user: {
              columns: {
                name: true,
                phoneNumber: true,
              },
            },
            order: {
              columns: {
                status: true,
                serviceMode: true,
              },
            },
          },
        },
      },
    });

    if (!couponData) {
      throw new HTTPException(404, { message: "Coupon not found" });
    }

    // Transform the data to match the expected format
    const totalUsageCount = couponData.usage.length;
    const totalDiscountGiven = couponData.usage.reduce(
      (sum, usage) => sum + Number(usage.discountAmount),
      0
    );

    const couponDetail = {
      id: couponData.id,
      code: couponData.code,
      name: couponData.name,
      description: couponData.description,
      type: couponData.type,
      value: couponData.value.toString(),
      minimumOrderAmount: couponData.minimumOrderAmount?.toString() || "0",
      maximumDiscount: couponData.maximumDiscount?.toString() || null,
      totalUsageLimit: couponData.totalUsageLimit,
      perUserUsageLimit: couponData.perUserUsageLimit,
      validFrom: couponData.validFrom.toISOString(),
      validUntil: couponData.validUntil.toISOString(),
      status: couponData.status,
      applicableServiceModes: couponData.applicableServiceModes,
      applicableBrandIds: couponData.applicableBrandIds,
      applicableModelIds: couponData.applicableModelIds,
      totalUsageCount,
      totalDiscountGiven: totalDiscountGiven.toFixed(2),
      createdAt: couponData.createdAt.toISOString(),
      createdByAdmin: couponData.createdByAdmin,
      usageHistory: couponData.usage.map((usage) => ({
        id: usage.id,
        orderId: usage.orderId,
        userId: usage.userId,
        discountAmount: usage.discountAmount.toString(),
        orderAmountBeforeDiscount: usage.orderAmountBeforeDiscount.toString(),
        orderAmountAfterDiscount: usage.orderAmountAfterDiscount.toString(),
        usedAt: usage.usedAt.toISOString(),
        user: usage.user,
        order: usage.order,
      })),
    };

    return c.json(couponDetail);
  } catch (error) {
    console.error("Failed to fetch coupon details:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve coupon details.",
    });
  }
});

/**
 * PATCH /api/admin/coupons/:id
 * Updates an existing coupon.
 */
adminRoutes.patch("/coupons/:id", async (c) => {
  const couponId = parseInt(c.req.param("id"), 10);
  if (isNaN(couponId)) {
    throw new HTTPException(400, { message: "Invalid coupon ID" });
  }

  const body = await c.req.json();

  // Check if coupon exists
  const existingCoupon = await c.req.db.query.coupons.findFirst({
    where: eq(coupons.id, couponId),
  });

  if (!existingCoupon) {
    throw new HTTPException(404, { message: "Coupon not found" });
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    const updateData: any = {};

    // Update fields if provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = body.value.toString();
    if (body.minimumOrderAmount !== undefined)
      updateData.minimumOrderAmount = body.minimumOrderAmount.toString();
    if (body.maximumDiscount !== undefined)
      updateData.maximumDiscount = body.maximumDiscount?.toString() || null;
    if (body.totalUsageLimit !== undefined)
      updateData.totalUsageLimit = body.totalUsageLimit;
    if (body.perUserUsageLimit !== undefined)
      updateData.perUserUsageLimit = body.perUserUsageLimit;
    if (body.validFrom !== undefined)
      updateData.validFrom = new Date(body.validFrom);
    if (body.validUntil !== undefined)
      updateData.validUntil = new Date(body.validUntil);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.applicableServiceModes !== undefined)
      updateData.applicableServiceModes = body.applicableServiceModes;
    if (body.applicableBrandIds !== undefined)
      updateData.applicableBrandIds = body.applicableBrandIds;
    if (body.applicableModelIds !== undefined)
      updateData.applicableModelIds = body.applicableModelIds;

    updateData.updatedAt = new Date();

    await db.update(coupons).set(updateData).where(eq(coupons.id, couponId));

    return c.json({ message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while updating the coupon.",
    });
  } finally {
    await pool.end();
  }
});

/**
 * DELETE /api/admin/coupons/:id
 * Deactivates a coupon (soft delete by setting status to inactive).
 */
adminRoutes.delete("/coupons/:id", async (c) => {
  const couponId = parseInt(c.req.param("id"), 10);
  if (isNaN(couponId)) {
    throw new HTTPException(400, { message: "Invalid coupon ID" });
  }

  const pool = createDbPool(c.env.DATABASE_URL);
  const db = drizzle(pool, { schema });

  try {
    await db
      .update(coupons)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(coupons.id, couponId));

    return c.json({ message: "Coupon deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating coupon:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while deactivating the coupon.",
    });
  } finally {
    await pool.end();
  }
});
