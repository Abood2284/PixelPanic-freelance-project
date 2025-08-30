import { pgTable, unique, serial, varchar, timestamp, uniqueIndex, foreignKey, integer, numeric, text, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contactFormStatus = pgEnum("contact_form_status", ['pending', 'responded', 'closed'])
export const couponStatus = pgEnum("coupon_status", ['active', 'inactive', 'expired'])
export const couponType = pgEnum("coupon_type", ['percentage', 'fixed_amount', 'service_upgrade'])
export const orderStatus = pgEnum("order_status", ['pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'])
export const serviceMode = pgEnum("service_mode", ['doorstep', 'carry_in'])
export const technicianStatus = pgEnum("technician_status", ['active', 'on_leave', 'inactive'])
export const userRole = pgEnum("user_role", ['admin', 'customer', 'technician'])


export const issues = pgTable("issues", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 256 }).notNull(),
	description: varchar({ length: 512 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("issues_name_unique").on(table.name),
]);

export const modelIssues = pgTable("model_issues", {
	id: serial().primaryKey().notNull(),
	modelId: integer("model_id").notNull(),
	issueId: integer("issue_id").notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	aftermarketPrice: numeric("aftermarket_price", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("model_issue_unique_idx").using("btree", table.modelId.asc().nullsLast().op("int4_ops"), table.issueId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "model_issues_model_id_models_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [issues.id],
			name: "model_issues_issue_id_issues_id_fk"
		}).onDelete("cascade"),
]);

export const models = pgTable("models", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 256 }).notNull(),
	brandId: integer("brand_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	imageUrl: varchar("image_url", { length: 1024 }),
}, (table) => [
	uniqueIndex("brand_model_unique_idx").using("btree", table.brandId.asc().nullsLast().op("int4_ops"), table.name.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "models_brand_id_brands_id_fk"
		}).onDelete("cascade"),
]);

export const brands = pgTable("brands", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 256 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	logoUrl: varchar("logo_url", { length: 1024 }),
}, (table) => [
	unique("brands_name_unique").on(table.name),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	phoneNumber: text("phone_number").notNull(),
	role: userRole().default('customer').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	unique("user_phone_number_unique").on(table.phoneNumber),
]);

export const contactForms = pgTable("contact_forms", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 256 }).notNull(),
	lastName: varchar("last_name", { length: 256 }).notNull(),
	email: varchar({ length: 256 }).notNull(),
	phone: varchar({ length: 32 }).notNull(),
	subject: varchar({ length: 512 }).notNull(),
	message: text().notNull(),
	status: contactFormStatus().default('pending').notNull(),
	adminNotes: text("admin_notes"),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	respondedBy: text("responded_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.respondedBy],
			foreignColumns: [user.id],
			name: "contact_forms_responded_by_user_id_fk"
		}).onDelete("set null"),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	issueName: varchar("issue_name", { length: 256 }).notNull(),
	modelName: varchar("model_name", { length: 256 }).notNull(),
	grade: varchar({ length: 32 }).notNull(),
	priceAtTimeOfOrder: numeric("price_at_time_of_order", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	status: orderStatus().default('pending_payment').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	serviceMode: serviceMode("service_mode").notNull(),
	timeSlot: text("time_slot"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	technicianId: text("technician_id"),
	technicianNotes: text("technician_notes"),
	completionOtp: varchar("completion_otp", { length: 12 }),
	completionOtpExpiresAt: timestamp("completion_otp_expires_at", { mode: 'string' }),
	appliedCouponId: integer("applied_coupon_id"),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	orderNumber: varchar("order_number", { length: 20 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "orders_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.technicianId],
			foreignColumns: [user.id],
			name: "orders_technician_id_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.appliedCouponId],
			foreignColumns: [coupons.id],
			name: "orders_applied_coupon_id_coupons_id_fk"
		}).onDelete("set null"),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const addresses = pgTable("addresses", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	fullName: varchar("full_name", { length: 256 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
	email: varchar({ length: 256 }).notNull(),
alternatePhoneNumber: varchar("alternate_phone_number", { length: 32 }).default('').notNull(),
	flatAndStreet: varchar("flat_and_street", { length: 512 }).notNull(),
	landmark: varchar({ length: 256 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "addresses_order_id_orders_id_fk"
		}).onDelete("cascade"),
	unique("addresses_order_id_unique").on(table.orderId),
]);

export const technicianInvites = pgTable("technician_invites", {
	id: serial().primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
	name: varchar({ length: 256 }),
	token: varchar({ length: 128 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdByAdminId: text("created_by_admin_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdByAdminId],
			foreignColumns: [user.id],
			name: "technician_invites_created_by_admin_id_user_id_fk"
		}).onDelete("set null"),
	unique("technician_invites_token_unique").on(table.token),
]);

export const technicians = pgTable("technicians", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	status: technicianStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "technicians_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const coupons = pgTable("coupons", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 32 }).notNull(),
	name: varchar({ length: 256 }).notNull(),
	description: text(),
	type: couponType().notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	minimumOrderAmount: numeric("minimum_order_amount", { precision: 10, scale:  2 }).default('0'),
	maximumDiscount: numeric("maximum_discount", { precision: 10, scale:  2 }),
	totalUsageLimit: integer("total_usage_limit"),
	perUserUsageLimit: integer("per_user_usage_limit").default(1),
	validFrom: timestamp("valid_from", { mode: 'string' }).notNull(),
	validUntil: timestamp("valid_until", { mode: 'string' }).notNull(),
	status: couponStatus().default('active').notNull(),
	applicableServiceModes: text("applicable_service_modes").array(),
	applicableBrandIds: integer("applicable_brand_ids").array(),
	applicableModelIds: integer("applicable_model_ids").array(),
	createdByAdminId: text("created_by_admin_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdByAdminId],
			foreignColumns: [user.id],
			name: "coupons_created_by_admin_id_user_id_fk"
		}).onDelete("cascade"),
	unique("coupons_code_unique").on(table.code),
]);

export const contactMessages = pgTable("contact_messages", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 256 }).notNull(),
	email: varchar({ length: 256 }).notNull(),
	mobile: varchar({ length: 32 }).notNull(),
	message: text().notNull(),
	status: varchar({ length: 32 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const orderPhotos = pgTable("order_photos", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	url: varchar({ length: 1024 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_photos_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const couponUsage = pgTable("coupon_usage", {
	id: serial().primaryKey().notNull(),
	couponId: integer("coupon_id").notNull(),
	orderId: integer("order_id").notNull(),
	userId: text("user_id").notNull(),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).notNull(),
	orderAmountBeforeDiscount: numeric("order_amount_before_discount", { precision: 10, scale:  2 }).notNull(),
	orderAmountAfterDiscount: numeric("order_amount_after_discount", { precision: 10, scale:  2 }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.couponId],
			foreignColumns: [coupons.id],
			name: "coupon_usage_coupon_id_coupons_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "coupon_usage_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "coupon_usage_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
