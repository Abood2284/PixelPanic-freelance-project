import { Pool, neonConfig, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@repo/db/schema";

// Configure WebSocket constructor for serverless environment
// This is required for Cloudflare Workers and other serverless environments
if (typeof globalThis.WebSocket === "undefined") {
  // For environments without built-in WebSocket support
  // You might need to install and import a WebSocket polyfill
  console.warn("WebSocket not available in global scope");
}

// Export a function to create a new pool for each request
export function createDbPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
}

// Keep the HTTP driver for backward compatibility (if needed elsewhere)
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, logger: false, schema: schema });
