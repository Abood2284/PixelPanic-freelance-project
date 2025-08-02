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
  console.log("--- Running verifyAuth Middleware ---");
  const token = getCookie(c, "auth_token");
  if (!token) {
    console.error("[AUTH ERROR] Cookie 'auth_token' not found.");
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  console.log("[AUTH INFO] Found 'auth_token' cookie.");

  try {
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error(
        "[AUTH ERROR] JWT_SECRET is not set in environment variables."
      );
      throw new Error("JWT_SECRET is not configured.");
    }

    const decoded = await verify(token, jwtSecret, "HS256");

    if (!decoded || !decoded.sub) {
      console.error(
        "[AUTH ERROR] JWT payload is invalid or missing the 'sub' (subject) claim.",
        decoded
      );
      throw new HTTPException(401, {
        message: "Unauthorized: Invalid token payload.",
      });
    }

    console.log(
      "[AUTH SUCCESS] Token verified successfully for user:",
      decoded.sub
    );
    c.set("userId", decoded.sub);
    await next();
  } catch (error) {
    console.error("[AUTH ERROR] Token verification failed:", error);
    throw new HTTPException(401, { message: "Invalid token" });
  }
});

// --- NEW: Endpoint to get the current user's session ---
authRoutes.get("/me", verifyAuth, async (c) => {
  console.log("[/me HANDLER] Handler started.");
  const userId = c.get("userId");
  console.log("[/me HANDLER] Retrieved userId from context:", userId);

  if (!userId) {
    // This will tell us if the context variable is being lost
    console.error(
      "[/me HANDLER] CRITICAL: userId not found in Hono context after middleware success."
    );
    throw new HTTPException(500, { message: "Session context error." });
  }
  const user = await c.req.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, phoneNumber: true, role: true },
  });
  console.log("[/me HANDLER] Database query result for user:", user);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({ user });
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
  setCookie(c, "auth_token", token, {
    httpOnly: true,
    secure: c.env.NODE_ENV === "production",
    sameSite: "Lax",
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
  });
  return c.json({ message: "Logged out successfully" });
});

export default authRoutes;
