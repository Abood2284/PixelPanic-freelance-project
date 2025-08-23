import { Pool, neonConfig, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@repo/db/schema";
import { cookies, headers } from "next/headers";

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

// Server-only fetch helper that forwards incoming cookies and headers to the API.
// Use relative "/api" paths so rewrites/proxy can keep auth cookies same-origin.
export async function apiFetch(input: string, init: RequestInit = {}) {
  const cookieHeader = (await cookies()).toString();
  const headerStore = await headers();

  // Normalize path
  const path = input.startsWith("/api")
    ? input
    : input.startsWith("http")
      ? input
      : `/api${input}`;

  // Resolve absolute URL for Node fetch — prefer same-origin so cookies are 1P
  let url = path;
  if (!path.startsWith("http")) {
    const proto =
      headerStore.get("x-forwarded-proto") ??
      (process.env.NODE_ENV === "development" ? "http" : "https");
    const host = headerStore.get("host") ?? "localhost:3000";
    url = `${proto}://${host}${path}`;
  }

  const forwardedHeaders = new Headers(init.headers);
  if (cookieHeader) forwardedHeaders.set("cookie", cookieHeader);
  const referer = headerStore.get("referer");
  const userAgent = headerStore.get("user-agent");
  if (referer) forwardedHeaders.set("referer", referer);
  if (userAgent) forwardedHeaders.set("user-agent", userAgent);

  const response = await fetch(url, {
    ...init,
    headers: forwardedHeaders,
    cache: init.cache,
    next: init.next as any,
  });

  return response;
}
