// apps/pixel-panic-worker/src/routes/auth.ts

import { Hono } from "hono";
import { sign } from "hono/jwt";
import { deleteCookie, setCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { Env } from "..";
import * as authService from "../services/auth-service";
import { users } from "@repo/db/schema";
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

const authRoutes = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// --- NEW: JWT Verification Middleware ---
export const verifyAuth = createMiddleware(async (c, next) => {
  const req = c.req;
  const url = new URL(req.url);
  const origin = req.header("origin") || "<no-origin>";
  const method = req.method;
  const path = url.pathname;
  console.log(`[AUTH] verifyAuth start`, { method, path, origin });

  const token = getCookie(c, "auth_token");
  if (!token) {
    const cookieHeader = req.header("cookie") || "<no-cookie-header>";
    console.error("[AUTH] Missing auth_token cookie", {
      method,
      path,
      origin,
      cookieHeaderLength: cookieHeader.length,
    });
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  console.log("[AUTH] Found auth_token cookie");

  try {
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not configured.");

    const decoded = await verify(token, jwtSecret, "HS256");

    if (!decoded || !decoded.sub)
      throw new HTTPException(401, {
        message: "Unauthorized: Invalid token payload.",
      });

    console.log("[AUTH] JWT verified", { userId: decoded.sub });
    c.set("userId", decoded.sub);
    await next();
  } catch (error) {
    console.error("[AUTH] Token verification failed", {
      method,
      path,
      origin,
      error: String(error),
    });
    throw new HTTPException(401, { message: "Invalid token" });
  }
});

// --- NEW: Endpoint to get the current user's session ---
authRoutes.get("/me", verifyAuth, async (c) => {
  const userId = c.get("userId");
  const url = new URL(c.req.url);
  const origin = c.req.header("origin");
  const cookieHeader = c.req.header("cookie");

  console.log("[AUTH] /me", {
    userId,
    path: url.pathname,
    origin,
    hasCookie: !!cookieHeader,
    cookieLength: cookieHeader?.length || 0,
  });

  if (!userId)
    throw new HTTPException(500, { message: "Session context error." });
  const user = await c.req.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, phoneNumber: true, role: true },
  });
  console.log("[AUTH] /me db result", { found: !!user });

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ user });
});

// Debug endpoint to check authentication status without requiring auth
authRoutes.get("/debug", async (c) => {
  const origin = c.req.header("origin");
  const cookieHeader = c.req.header("cookie");
  const token = getCookie(c, "auth_token");

  console.log("[AUTH] /debug", {
    origin,
    hasCookie: !!cookieHeader,
    cookieLength: cookieHeader?.length || 0,
    hasToken: !!token,
    tokenLength: token?.length || 0,
  });

  return c.json({
    origin,
    hasCookie: !!cookieHeader,
    cookieLength: cookieHeader?.length || 0,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to send OTP
authRoutes.post("/send-otp", async (c) => {
  const { phoneNumber } = await c.req.json();

  if (!phoneNumber) {
    throw new HTTPException(400, { message: "Phone number is required" });
  }

  const verificationId = await authService.sendOtp(
    phoneNumber,
    "91", // Assuming country code for India
    c.env.MESSAGE_CENTRAL_CUSTOMER_ID,
    c.env.MESSAGE_CENTRAL_PASSWORD
  );

  return c.json({ verificationId });
});

// Endpoint to verify OTP and log the user in
authRoutes.post("/verify-otp", async (c) => {
  const { phoneNumber, otpCode, verificationId } = await c.req.json();

  if (!phoneNumber || !otpCode || !verificationId) {
    throw new HTTPException(400, { message: "Missing required fields" });
  }

  const isVerified = await authService.validateOtp(
    verificationId,
    otpCode,
    phoneNumber,
    "91", // Assuming country code for India
    c.env.MESSAGE_CENTRAL_CUSTOMER_ID,
    c.env.MESSAGE_CENTRAL_PASSWORD
  );

  if (!isVerified) {
    throw new HTTPException(400, { message: "Invalid OTP. Please try again." });
  }

  // OTP is valid, now find or create the user
  let user = await c.req.db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  });

  if (!user) {
    const newUserResult = await c.req.db
      .insert(users)
      .values({ phoneNumber })
      .returning();
    user = newUserResult[0];
  }

  if (!user) {
    throw new HTTPException(500, { message: "Failed to create or find user" });
  }

  // Create a session JWT for the user
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  const token = await sign(payload, c.env.JWT_SECRET, "HS256");

  // Set the JWT in a secure, httpOnly cookie
  // In production, we use SameSite=None to allow cross-site cookie on workers.dev / custom domain
  // Ensure 'secure' is true with SameSite=None per browser requirements
  setCookie(c, "auth_token", token, {
    httpOnly: true,
    secure: true, // Always secure in production
    sameSite: "None", // Allow cross-site cookies for workers.dev
    path: "/",
    maxAge: 604800, // 7 days in seconds
  });

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  });
});

authRoutes.post("/logout", async (c) => {
  // Delete the secure session cookie
  deleteCookie(c, "auth_token", {
    path: "/",
    secure: true,
    sameSite: "None",
  });
  return c.json({ message: "Logged out successfully" });
});

export default authRoutes;
