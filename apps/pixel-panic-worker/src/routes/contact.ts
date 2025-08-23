// apps/pixel-panic-worker/src/routes/contact.ts

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "..";
import { contactMessages } from "@repo/db/schema";
import { z } from "zod";

const contactRoutes = new Hono<{
  Bindings: Env;
}>();

// Validation schema for contact message
const contactMessageSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(256, "Name cannot exceed 256 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email cannot exceed 256 characters"),
  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number cannot exceed 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

/**
 * POST /api/contact/submit
 * Submits a contact message from a user
 */
contactRoutes.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    const validation = contactMessageSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          success: false,
          message: "Invalid form data",
          errors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { name, email, mobile, message } = validation.data;

    // Store the contact message in the database
    const [newMessage] = await c.req.db
      .insert(contactMessages)
      .values({
        name,
        email,
        mobile,
        message,
        status: "pending",
      })
      .returning();

    if (!newMessage) {
      throw new HTTPException(500, {
        message: "Failed to save contact message",
      });
    }

    return c.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      id: newMessage.id,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    throw new HTTPException(500, {
      message: "An error occurred while submitting your message",
    });
  }
});

export default contactRoutes;
