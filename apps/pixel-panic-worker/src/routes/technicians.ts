import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Env } from "..";
import { verifyAuth } from "./auth";
import {
  addresses,
  orderItems,
  orderPhotos,
  orders,
  users,
  technicianInvites,
} from "@repo/db/index";

const techniciansRoutes = new Hono<{
  Bindings: Env;
  Variables: { userId: string };
}>();

// Ensure the requester is a technician
const requireTechnician = createMiddleware(async (c, next) => {
  const userId = c.get("userId");
  const user = await c.req.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, role: true },
  });

  if (!user || user.role !== "technician") {
    throw new HTTPException(403, { message: "Technician access required" });
  }

  await next();
});

// GET /api/technicians/me/gigs?status=active|history
techniciansRoutes.get("/me/gigs", verifyAuth, requireTechnician, async (c) => {
  const userId = c.get("userId");
  const status = (c.req.query("status") || "active").toLowerCase();

  const activeStatuses = ["confirmed", "in_progress"] as const;
  const historyStatuses = ["completed", "cancelled"] as const;

  const targetStatuses =
    status === "history" ? historyStatuses : activeStatuses;

  const data = await c.req.db.query.orders.findMany({
    where: and(
      eq(orders.technicianId, userId),
      inArray(
        orders.status,
        targetStatuses as unknown as (typeof orders.$inferSelect.status)[]
      )
    ),
    orderBy: [asc(orders.timeSlot), asc(orders.createdAt)],
    columns: {
      id: true,
      status: true,
      timeSlot: true,
      serviceMode: true,
      createdAt: true,
      updatedAt: true,
      totalAmount: true,
    },
    with: {
      address: {
        columns: {
          fullName: true,
          phoneNumber: true,
          flatAndStreet: true,
          landmark: true,
          pincode: true,
        },
      },
      orderItems: {
        columns: { issueName: true, modelName: true, grade: true },
      },
    },
  });

  return c.json({ gigs: data });
});

// GET /api/technicians/gigs/:id
techniciansRoutes.get("/gigs/:id", verifyAuth, requireTechnician, async (c) => {
  const userId = c.get("userId");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    throw new HTTPException(400, { message: "Invalid gig id" });
  }

  const gig = await c.req.db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.technicianId, userId)),
    with: {
      address: true,
      orderItems: true,
      photos: true,
    },
  });

  if (!gig) {
    throw new HTTPException(404, { message: "Gig not found" });
  }

  return c.json({ gig });
});

// POST /api/technicians/gigs/:id/status { to: "in_progress" }
techniciansRoutes.post(
  "/gigs/:id/status",
  verifyAuth,
  requireTechnician,
  async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    const { to } = (await c.req.json()) as { to?: string };

    if (!Number.isInteger(id) || to !== "in_progress") {
      throw new HTTPException(400, { message: "Invalid request" });
    }

    const current = await c.req.db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.technicianId, userId)),
      columns: { id: true, status: true },
    });

    if (!current) {
      throw new HTTPException(404, { message: "Gig not found" });
    }

    if (current.status !== "confirmed") {
      throw new HTTPException(409, { message: "Gig not in a startable state" });
    }

    await c.req.db
      .update(orders)
      .set({ status: "in_progress" })
      .where(and(eq(orders.id, id), eq(orders.technicianId, userId)));

    return c.json({ ok: true });
  }
);

// POST /api/technicians/gigs/:id/complete { otp, notes, photos: string[] }
techniciansRoutes.post(
  "/gigs/:id/complete",
  verifyAuth,
  requireTechnician,
  async (c) => {
    const userId = c.get("userId");
    const id = Number(c.req.param("id"));
    const body = (await c.req.json()) as {
      otp?: string;
      notes?: string;
      photos?: string[];
    };

    if (!Number.isInteger(id) || !body.otp) {
      throw new HTTPException(400, { message: "OTP is required" });
    }

    const current = await c.req.db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.technicianId, userId)),
      columns: {
        id: true,
        status: true,
        completionOtp: true,
        completionOtpExpiresAt: true,
      },
    });

    if (!current) {
      throw new HTTPException(404, { message: "Gig not found" });
    }

    if (current.status !== "in_progress") {
      throw new HTTPException(409, { message: "Gig not in progress" });
    }

    if (!current.completionOtp || current.completionOtp !== body.otp) {
      throw new HTTPException(400, { message: "Invalid OTP" });
    }

    if (
      current.completionOtpExpiresAt &&
      new Date(current.completionOtpExpiresAt).getTime() < Date.now()
    ) {
      throw new HTTPException(400, { message: "OTP expired" });
    }

    // Update order status and notes
    await c.req.db
      .update(orders)
      .set({ status: "completed", technicianNotes: body.notes ?? null })
      .where(and(eq(orders.id, id), eq(orders.technicianId, userId)));

    // Persist photos if provided
    if (Array.isArray(body.photos) && body.photos.length > 0) {
      const values = body.photos
        .filter((u) => typeof u === "string" && u.trim().length > 0)
        .map((u) => ({ orderId: id, url: u }));
      if (values.length > 0) {
        await c.req.db.insert(orderPhotos).values(values);
      }
    }

    return c.json({ ok: true });
  }
);

export default techniciansRoutes;

// Public: upload a single file to Cloudinary and return its URL
techniciansRoutes.post("/upload", async (c) => {
  const cloudName = c.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = c.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new HTTPException(500, { message: "Upload not configured" });
  }

  const formData = await c.req.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "pixel-panic/technicians");
  if (!file || !(file instanceof File)) {
    throw new HTTPException(400, { message: "Missing file" });
  }

  // Convert to base64 data URI for Cloudinary
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataURI = `data:${file.type};base64,${base64}`;

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const uploadForm = new FormData();
  uploadForm.append("file", dataURI);
  uploadForm.append("upload_preset", uploadPreset);
  uploadForm.append("folder", folder);

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: uploadForm,
  });
  if (!response.ok) {
    const text = await response.text();
    console.error("Cloudinary upload error:", text);
    throw new HTTPException(500, { message: "Failed to upload file" });
  }

  const result = (await response.json()) as { secure_url: string };
  return c.json({ url: result.secure_url });
});

// Invitation: validate token
techniciansRoutes.get("/invites/:token", async (c) => {
  const token = c.req.param("token");
  const invite = await c.req.db
    .select()
    .from(technicianInvites)
    .where(eq(technicianInvites.token, token))
    .limit(1);
  const row = invite[0];
  if (!row) throw new HTTPException(404, { message: "Invalid invite" });
  if (row.usedAt)
    throw new HTTPException(410, { message: "Invite already used" });
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    throw new HTTPException(410, { message: "Invite expired" });
  }
  return c.json({
    ok: true,
    invite: { phoneNumber: row.phoneNumber, name: row.name },
  });
});

// Invitation: complete onboarding after OTP on the web side
techniciansRoutes.post("/invites/:token/complete", async (c) => {
  const token = c.req.param("token");
  const { phoneNumber, name } = (await c.req.json()) as {
    phoneNumber: string;
    name?: string;
  };
  const inviteRows = await c.req.db
    .select()
    .from(technicianInvites)
    .where(eq(technicianInvites.token, token))
    .limit(1);
  const invite = inviteRows[0];
  if (!invite) throw new HTTPException(404, { message: "Invalid invite" });
  if (invite.usedAt)
    throw new HTTPException(410, { message: "Invite already used" });
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new HTTPException(410, { message: "Invite expired" });
  }
  if (invite.phoneNumber !== phoneNumber) {
    throw new HTTPException(400, { message: "Phone does not match invite" });
  }
  // Upsert user as technician
  const userRows = await c.req.db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber))
    .limit(1);
  let user = userRows[0];
  if (!user) {
    const [created] = await c.req.db
      .insert(users)
      .values({
        phoneNumber,
        name: name ?? invite.name ?? null,
        role: "technician",
      })
      .returning();
    user = created;
  } else if (user.role !== "technician") {
    await c.req.db
      .update(users)
      .set({ role: "technician" })
      .where(eq(users.id, user.id));
  }
  // Mark invite used
  await c.req.db
    .update(technicianInvites)
    .set({ usedAt: new Date() })
    .where(eq(technicianInvites.id, invite.id));

  return c.json({ ok: true, userId: user!.id });
});
