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
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phoneNumber: text("phone_number"),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Stores third-party account information for users (e.g., their Google account).
 * Required by NextAuth's Drizzle adapter.
 * Connects directly to the `users` table via `userId`.
 */
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

/**
 * Stores active login sessions for users.
 * Required by NextAuth's Drizzle adapter.
 * Connects directly to the `users` table via `userId`.
 */
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ============================================================================
// PIXELPANIC APP TABLES
// ============================================================================

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
