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
export const userRoleEnum = pgEnum("user_role", ["admin", "customer"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const serviceModeEnum = pgEnum("service_mode", ["doorstep", "carry_in"]);

// export const partGradeEnum = pgEnum("part_grade", ["oem", "aftermarket"]);

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
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").default("pending_payment").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  serviceMode: serviceModeEnum("service_mode").notNull(),
  timeSlot: text("time_slot"), // Nullable, only for 'doorstep'
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
  email: varchar("email", { length: 256 }),
  pincode: varchar("pincode", { length: 16 }).notNull(),
  flatAndStreet: varchar("flat_and_street", { length: 512 }).notNull(),
  landmark: varchar("landmark", { length: 256 }),
});
/**
 * A master list of phone manufacturers we service (e.g., Apple, Samsung).
 * Connects one-to-many with the `models` table.
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
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
    priceOriginal: numeric("price_original", { precision: 10, scale: 2 }),
    priceAftermarketTier1: numeric("price_aftermarket_tier1", {
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
// RELATIONS
// ============================================================================

// A user can have many orders.
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// An order belongs to one user, has many items, and has one address.
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  address: one(addresses, {
    fields: [orders.id],
    references: [addresses.orderId],
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
