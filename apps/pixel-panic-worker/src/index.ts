// apps/pixel-panic-worker/src/index.ts
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from "@repo/db/schema";
import { NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { ExecutionContext, Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import checkoutRoutes from "./routes/checkout";
import adminRoutes from "./routes/admin";
import modelsRoutes from "./routes/models";
import brandsRoutes from "./routes/brands";
import servicesRoutes from "./routes/services";
import authRoutes from "./routes/auth";

export interface Env {
  NODE_ENV: string;
  DATABASE_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  MESSAGE_CENTRAL_CUSTOMER_ID: string;
  MESSAGE_CENTRAL_PASSWORD: string;
  JWT_SECRET: string;
}

// Export a function to create a new pool for each request
// This is used for transactional operations that require WebSocket driver
export function createDbPool(connectionString: string) {
  return new Pool({
    connectionString,
  });
}

// Extend HonoRequest to include database instance
declare module "hono" {
  interface HonoRequest {
    db: NeonHttpDatabase<typeof schema>;
  }
}

// Create Hono app instance with typed environment
const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// Error handling middleware
const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    console.error("Unhandled error:", error);

    return c.json(
      {
        status: 500,
        message: "Internal Server Error",
        error: c.env.NODE_ENV === "development" ? error : undefined,
      },
      500
    );
  }
});

export const injectDB = createMiddleware(async (c, next) => {
  if (c.req.method === "OPTIONS") {
    await next();
    return;
  }

  try {
    console.log(`Connecting to database...${c.env.DATABASE_URL}`);
    const sql = neon(c.env.DATABASE_URL);
    c.req.db = drizzle({ client: sql, schema });
    await next();
  } catch (error) {
    console.error("Database connection error:", error);
    throw new HTTPException(503, { message: "Database connection failed" });
  }
});

// Enhanced CORS configuration with hardcoded origins

const configureCORS = () => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.1.5:3000",
    "https://pixel-panic-web.pixelpanic53.workers.dev",
    "https://pixel-panic-worker.pixelpanic53.workers.dev",
  ];

  return cors({
    origin: (origin) => {
      // Allow if the origin is in the list of allowed origins
      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      // Default to the first origin in the list if the origin is null or not specified
      if (!origin) {
        return allowedOrigins[0];
      }

      // Block requests if the origin does not match any of the allowed origins
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 600,
  });
};

// Apply CORS middleware
app.use("*", async (c, next) => {
  console.log(`[DEBUG] Applying CORS middleware for: ${c.req.url}`);
  const corsMiddleware = configureCORS();
  return corsMiddleware(c, next);
});

// Apply error handling middleware globally
app.use("/*", errorHandler);

// Apply database injection middleware globally
app.use("/api/*", injectDB);

// Routes
app.route("/api/checkout", checkoutRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/models", modelsRoutes);
app.route("/api/brands", brandsRoutes);
app.route("/api/services", servicesRoutes);
app.route("/api/auth", authRoutes);

app.get("/", async (c) => {
  return c.json({ status: 200, message: "Healthy All System Working" });
});

export default app;
