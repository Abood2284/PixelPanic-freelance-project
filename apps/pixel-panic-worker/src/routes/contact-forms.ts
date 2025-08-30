// apps/pixel-panic-worker/src/routes/contact-forms.ts

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "..";
import { verifyAuth } from "./auth";
import { contactForms } from "@repo/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { z } from "zod";

const contactFormsRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Validation schema for contact form submission
const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(256, "First name cannot exceed 256 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(256, "Last name cannot exceed 256 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email cannot exceed 256 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(512, "Subject cannot exceed 512 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters"),
});

/**
 * POST /api/contact-forms/submit
 * Public endpoint to submit a contact form
 */
contactFormsRoutes.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received form data:", body);
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        "Validation errors:",
        validation.error.flatten().fieldErrors
      );
      return c.json(
        {
          success: false,
          message: "Invalid form data",
          errors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { firstName, lastName, email, phone, subject, message } =
      validation.data;

    // Store the contact form submission in the database
    const [newContactForm] = await c.req.db
      .insert(contactForms)
      .values({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        status: "pending",
      })
      .returning();

    if (!newContactForm) {
      throw new HTTPException(500, {
        message: "Failed to save contact form",
      });
    }

    return c.json({
      success: true,
      message:
        "Thank you for your message! We'll get back to you within 24 hours.",
      id: newContactForm.id,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw new HTTPException(500, {
      message: "An error occurred while submitting your message",
    });
  }
});

// Apply authentication middleware for admin routes
contactFormsRoutes.use("/admin/*", verifyAuth);

/**
 * GET /api/contact-forms/admin/list
 * Admin endpoint to fetch all contact form submissions
 */
contactFormsRoutes.get("/admin/list", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");
    const search = c.req.query("search");

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [];

    if (status && status !== "all") {
      whereConditions.push(eq(contactForms.status, status as any));
    }

    if (search) {
      whereConditions.push(
        // Search in name, email, subject, and message
        // Note: This is a simple search, you might want to use full-text search for production
        eq(contactForms.firstName, search)
      );
    }

    // Fetch contact forms with pagination
    const allContactForms = await c.req.db.query.contactForms.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(contactForms.createdAt)],
      limit,
      offset,
      with: {
        respondedByUser: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await c.req.db
      .select({ count: contactForms.id })
      .from(contactForms)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Calculate statistics
    const stats = await c.req.db
      .select({
        total: contactForms.id,
        pending: contactForms.status,
        responded: contactForms.status,
        closed: contactForms.status,
      })
      .from(contactForms);

    const totalForms = stats.length;
    const pendingForms = stats.filter((s) => s.pending === "pending").length;
    const respondedForms = stats.filter(
      (s) => s.responded === "responded"
    ).length;
    const closedForms = stats.filter((s) => s.closed === "closed").length;

    return c.json({
      contactForms: allContactForms,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
      stats: {
        total: totalForms,
        pending: pendingForms,
        responded: respondedForms,
        closed: closedForms,
        responseRate:
          totalForms > 0
            ? ((respondedForms / totalForms) * 100).toFixed(1)
            : "0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch contact forms:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve contact forms.",
    });
  }
});

/**
 * GET /api/contact-forms/admin/:id
 * Admin endpoint to fetch a single contact form submission
 */
contactFormsRoutes.get("/admin/:id", async (c) => {
  const formId = parseInt(c.req.param("id"), 10);
  if (isNaN(formId)) {
    throw new HTTPException(400, { message: "Invalid contact form ID" });
  }

  try {
    const contactForm = await c.req.db.query.contactForms.findFirst({
      where: eq(contactForms.id, formId),
      with: {
        respondedByUser: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!contactForm) {
      throw new HTTPException(404, { message: "Contact form not found" });
    }

    return c.json(contactForm);
  } catch (error) {
    console.error("Failed to fetch contact form:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve contact form details.",
    });
  }
});

/**
 * PATCH /api/contact-forms/admin/:id
 * Admin endpoint to update contact form status and add notes
 */
contactFormsRoutes.patch("/admin/:id", async (c) => {
  const formId = parseInt(c.req.param("id"), 10);
  if (isNaN(formId)) {
    throw new HTTPException(400, { message: "Invalid contact form ID" });
  }

  const body = await c.req.json();
  const { status, adminNotes } = body;

  if (!status || !["pending", "responded", "closed"].includes(status)) {
    throw new HTTPException(400, {
      message: "Status must be one of: pending, responded, closed",
    });
  }

  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (status === "responded") {
      updateData.respondedAt = new Date();
      updateData.respondedBy = c.get("userId");
    }

    await c.req.db
      .update(contactForms)
      .set(updateData)
      .where(eq(contactForms.id, formId));

    return c.json({
      message: "Contact form updated successfully",
      status,
    });
  } catch (error) {
    console.error("Error updating contact form:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while updating the contact form.",
    });
  }
});

/**
 * DELETE /api/contact-forms/admin/:id
 * Admin endpoint to delete a contact form (soft delete by setting status to closed)
 */
contactFormsRoutes.delete("/admin/:id", async (c) => {
  const formId = parseInt(c.req.param("id"), 10);
  if (isNaN(formId)) {
    throw new HTTPException(400, { message: "Invalid contact form ID" });
  }

  try {
    await c.req.db
      .update(contactForms)
      .set({
        status: "closed",
        updatedAt: new Date(),
        respondedAt: new Date(),
        respondedBy: c.get("userId"),
      })
      .where(eq(contactForms.id, formId));

    return c.json({ message: "Contact form closed successfully" });
  } catch (error) {
    console.error("Error closing contact form:", error);
    throw new HTTPException(500, {
      message: "An internal error occurred while closing the contact form.",
    });
  }
});

/**
 * GET /api/contact-forms/admin/dashboard
 * Admin endpoint to get contact form dashboard statistics
 */
contactFormsRoutes.get("/admin/dashboard", async (c) => {
  try {
    const db = c.req.db;

    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentForms = await db.query.contactForms.findMany({
      where: gte(contactForms.createdAt, thirtyDaysAgo),
      orderBy: [desc(contactForms.createdAt)],
      limit: 10,
    });

    // Calculate overall statistics
    const allForms = await db.query.contactForms.findMany();

    const totalForms = allForms.length;
    const pendingForms = allForms.filter((f) => f.status === "pending").length;
    const respondedForms = allForms.filter(
      (f) => f.status === "responded"
    ).length;
    const closedForms = allForms.filter((f) => f.status === "closed").length;

    // Calculate average response time (for responded forms)
    const respondedFormsWithTime = allForms.filter(
      (f) => f.status === "responded" && f.respondedAt && f.createdAt
    );

    let averageResponseTime = 0;
    if (respondedFormsWithTime.length > 0) {
      const totalResponseTime = respondedFormsWithTime.reduce((sum, form) => {
        const responseTime =
          new Date(form.respondedAt!).getTime() -
          new Date(form.createdAt).getTime();
        return sum + responseTime;
      }, 0);
      averageResponseTime = totalResponseTime / respondedFormsWithTime.length;
    }

    return c.json({
      recentForms,
      stats: {
        total: totalForms,
        pending: pendingForms,
        responded: respondedForms,
        closed: closedForms,
        responseRate:
          totalForms > 0
            ? ((respondedForms / totalForms) * 100).toFixed(1)
            : "0",
        averageResponseTimeHours: (
          averageResponseTime /
          (1000 * 60 * 60)
        ).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Failed to fetch contact form dashboard data:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve dashboard data.",
    });
  }
});

export default contactFormsRoutes;
