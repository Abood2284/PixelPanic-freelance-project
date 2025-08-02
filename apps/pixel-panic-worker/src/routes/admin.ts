// apps/pixel-panic-worker/src/routes/admin.ts

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, eq, gte, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { Env, createDbPool } from "..";
import { brands, issues, models, modelIssues, orders } from "@repo/db/schema";
import { addPhoneModelSchema, updatePhoneModelSchema } from "@repo/validators";
import * as schema from "@repo/db/schema";
import { desc } from "drizzle-orm";

const adminRoutes = new Hono<{ Bindings: Env }>();

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

export default adminRoutes;
