import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  integer,
  primaryKey,
  pgEnum,
  serial,
  varchar,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Defines the roles a user can have within the system.
 * - 'admin': Can access the admin dashboard.
 * - 'customer': A regular user who books repairs.
 */
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "customer",
  "technician",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const serviceModeEnum = pgEnum("service_mode", ["doorstep", "carry_in"]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "fixed_amount",
  "service_upgrade",
]);

export const couponStatusEnum = pgEnum("coupon_status", [
  "active",
  "inactive",
  "expired",
]);

// export const partGradeEnum = pgEnum("part_grade", ["oem", "aftermarket"]);

// ============================================================================
// CONTACT FORM ENUMS
// ============================================================================

export const contactFormStatusEnum = pgEnum("contact_form_status", [
  "pending",
  "responded",
  "closed",
]);

// ============================================================================
// AUTHENTICATION TABLES (for NextAuth)
// ============================================================================

/**
 * The core `users` table. Stores primary information for every user,
 * including their role which determines their access level.
 * Connects to `accounts` and `sessions` for auth, and will later connect to `orders`.
 */
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  // phoneNumber is now the primary identifier, it must be unique and not null.
  phoneNumber: text("phone_number").unique().notNull(),
  // email is now optional and can be collected later if needed.
  email: text("email").unique(),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// PIXELPANIC APP TABLES
// ============================================================================

/**
 * The central `orders` table. Each row represents a single customer booking.
 * It links to the user who placed the order and will have one-to-many relationships
 * with order items and a one-to-one relationship with an address.
 *
 * Explanation of the New Tables
 * orders: This is the master table for each transaction. It holds the core details like who placed the order (userId), the final price, the current status, and the chosen service mode.
 *
 * order_items: This table stores the specific repairs for an order. If a user orders a screen repair and a battery replacement, there will be two rows in this table, both linked to the same orderId. We store the names and price directly on the item to keep a historical record, even if you change the prices of your services later.
 *
 * addresses: This holds the customer's contact and address details for a specific order. The unique() constraint on orderId ensures that each order can only have one associated address.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).unique().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  technicianId: text("technician_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: orderStatusEnum("status").default("pending_payment").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  serviceMode: serviceModeEnum("service_mode").notNull(),
  timeSlot: text("time_slot"), // Nullable, only for 'doorstep'
  technicianNotes: text("technician_notes"),
  completionOtp: varchar("completion_otp", { length: 12 }),
  completionOtpExpiresAt: timestamp("completion_otp_expires_at"),
  appliedCouponId: integer("applied_coupon_id").references(() => coupons.id, {
    onDelete: "set null",
  }),
  discountAmount: numeric("discount_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * The `order_items` table. Each row represents a single line item
 * (e.g., a specific repair) within an order.
 * This creates a many-to-one relationship with the `orders` table.
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // Storing issue/model names directly for easier display, but linking IDs for integrity
  issueName: varchar("issue_name", { length: 256 }).notNull(),
  modelName: varchar("model_name", { length: 256 }).notNull(),
  grade: varchar("grade", { length: 32 }).notNull(), // "oem" or "aftermarket"
  priceAtTimeOfOrder: numeric("price_at_time_of_order", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

/**
 * The `addresses` table. Each row represents the customer and
 * service address information for a single order.
 * This creates a one-to-one relationship with the `orders` table.
 */
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  // unique() constraint ensures one address per order
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
    .unique(),
  fullName: varchar("full_name", { length: 256 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  alternatePhoneNumber: varchar("alternate_phone_number", { length: 32 })
    .notNull()
    .default(""),
  flatAndStreet: varchar("flat_and_street", { length: 512 }).notNull(),
  landmark: varchar("landmark", { length: 256 }).notNull(),
});

// ============================================================================
// CONTACT FORM TABLES
// ============================================================================

/**
 * Stores contact form submissions from users
 * This table captures inquiries, feedback, and general contact requests
 */
export const contactForms = pgTable("contact_forms", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  message: text("message").notNull(),
  status: contactFormStatusEnum("status").default("pending").notNull(),
  adminNotes: text("admin_notes"), // For internal notes and responses
  respondedAt: timestamp("responded_at"),
  respondedBy: text("responded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Photos captured for an order (e.g., job evidence). Stored as object storage URLs.
 */
export const orderPhotos = pgTable("order_photos", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 1024 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
/**
 * A master list of phone manufacturers we service (e.g., Apple, Samsung).
 * Connects one-to-many with the `models` table.
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 1024 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Stores specific phone models (e.g., iPhone 15 Pro, Galaxy S24).
 * Each model must belong to a `brand`.
 * Connects many-to-one with the `brands` table via `brandId`.
 * Connects one-to-many with the `modelIssues` table.
 */
export const models = pgTable(
  "models",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    brandId: integer("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    imageUrl: varchar("image_url", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    brandModelUnique: uniqueIndex("brand_model_unique_idx").on(
      table.brandId,
      table.name
    ),
  })
);

/**
 * A master list of all possible repair services we offer (e.g., 'Screen Replacement').
 * This is a lookup table for repair types.
 * Connects to `models` via the `modelIssues` junction table.
 */
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  description: varchar("description", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * The "Price Matrix". This is a junction table that connects a specific `model`
 * with a specific `issue` and defines the repair prices for that combination.
 * Connects `models` and `issues` in a many-to-many relationship.
 */
export const modelIssues = pgTable(
  "model_issues",
  {
    id: serial("id").primaryKey(),
    modelId: integer("model_id")
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
    aftermarketPrice: numeric("aftermarket_price", {
      precision: 10,
      scale: 2,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    modelIssueUnique: uniqueIndex("model_issue_unique_idx").on(
      table.modelId,
      table.issueId
    ),
  })
);

// ============================================================================
// TECHNICIAN TABLES
// ============================================================================

/**
 * Defines the status a technician can have within the system.
 */
export const technicianStatusEnum = pgEnum("technician_status", [
  "active",
  "on_leave",
  "inactive",
]);

/**
 * The technicians table. Links to users table and tracks technician status.
 */
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: technicianStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Invitation-based onboarding for vetted technicians.
 * Stores pending invitations with tokens for secure access.
 */
export const technicianInvites = pgTable("technician_invites", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
  name: varchar("name", { length: 256 }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdByAdminId: text("created_by_admin_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// CONTACT MESSAGES TABLE
// ============================================================================

/**
 * Stores contact messages from users who need other repair services
 */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  mobile: varchar("mobile", { length: 32 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(), // pending, responded, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// COUPON TABLES
// ============================================================================

/**
 * The main coupons table. Stores all coupon information including
 * discount type, value, usage limits, and validity periods.
 */
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  type: couponTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(), // percentage or fixed amount
  minimumOrderAmount: numeric("minimum_order_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  maximumDiscount: numeric("maximum_discount", { precision: 10, scale: 2 }), // cap for percentage discounts
  totalUsageLimit: integer("total_usage_limit"), // null = unlimited
  perUserUsageLimit: integer("per_user_usage_limit").default(1),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: couponStatusEnum("status").default("active").notNull(),
  applicableServiceModes: text("applicable_service_modes").array(), // ['doorstep', 'carry_in'] or null for all
  applicableBrandIds: integer("applicable_brand_ids").array(), // specific brands or null for all
  applicableModelIds: integer("applicable_model_ids").array(), // specific models or null for all
  createdByAdminId: text("created_by_admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Tracks coupon usage by users. Links coupons to orders
 * and tracks when and how much discount was applied.
 */
export const couponUsage = pgTable("coupon_usage", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id")
    .notNull()
    .references(() => coupons.id, { onDelete: "cascade" }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  discountAmount: numeric("discount_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  orderAmountBeforeDiscount: numeric("order_amount_before_discount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  orderAmountAfterDiscount: numeric("order_amount_after_discount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

// A user can have many orders and can be a technician.
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  technicians: many(technicians),
  coupons: many(coupons), // coupons created by admin
  couponUsage: many(couponUsage), // coupons used by user
  respondedContactForms: many(contactForms), // contact forms responded by admin
}));

// An order belongs to one user, has many items, and has one address.
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  technician: one(users, {
    fields: [orders.technicianId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  address: one(addresses, {
    fields: [orders.id],
    references: [addresses.orderId],
  }),
  photos: many(orderPhotos),
  couponUsage: many(couponUsage),
  appliedCoupon: one(coupons, {
    fields: [orders.appliedCouponId],
    references: [coupons.id],
  }),
}));

// An order item belongs to one order.
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

// An address belongs to one order.
export const addressesRelations = relations(addresses, ({ one }) => ({
  order: one(orders, {
    fields: [addresses.orderId],
    references: [orders.id],
  }),
}));

// Order photo belongs to one order.
export const orderPhotosRelations = relations(orderPhotos, ({ one }) => ({
  order: one(orders, {
    fields: [orderPhotos.orderId],
    references: [orders.id],
  }),
}));

// Technician belongs to one user.
export const techniciansRelations = relations(technicians, ({ one }) => ({
  user: one(users, {
    fields: [technicians.userId],
    references: [users.id],
  }),
}));

// Technician invite belongs to one admin user (who created it).
export const technicianInvitesRelations = relations(
  technicianInvites,
  ({ one }) => ({
    createdByAdmin: one(users, {
      fields: [technicianInvites.createdByAdminId],
      references: [users.id],
    }),
  })
);

// Coupon belongs to one admin user (who created it).
export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdByAdmin: one(users, {
    fields: [coupons.createdByAdminId],
    references: [users.id],
  }),
  usage: many(couponUsage),
}));

// Coupon usage belongs to one coupon, one order, and one user.
export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  order: one(orders, {
    fields: [couponUsage.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [couponUsage.userId],
    references: [users.id],
  }),
}));

// Contact form belongs to one user (who responded to it)
export const contactFormsRelations = relations(contactForms, ({ one }) => ({
  respondedByUser: one(users, {
    fields: [contactForms.respondedBy],
    references: [users.id],
  }),
}));
