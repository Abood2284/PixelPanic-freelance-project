import { relations } from "drizzle-orm/relations";
import { models, modelIssues, issues, brands, user, contactForms, orders, orderItems, coupons, addresses, technicianInvites, technicians, orderPhotos, couponUsage } from "./schema";

export const modelIssuesRelations = relations(modelIssues, ({one}) => ({
	model: one(models, {
		fields: [modelIssues.modelId],
		references: [models.id]
	}),
	issue: one(issues, {
		fields: [modelIssues.issueId],
		references: [issues.id]
	}),
}));

export const modelsRelations = relations(models, ({one, many}) => ({
	modelIssues: many(modelIssues),
	brand: one(brands, {
		fields: [models.brandId],
		references: [brands.id]
	}),
}));

export const issuesRelations = relations(issues, ({many}) => ({
	modelIssues: many(modelIssues),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	models: many(models),
}));

export const contactFormsRelations = relations(contactForms, ({one}) => ({
	user: one(user, {
		fields: [contactForms.respondedBy],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	contactForms: many(contactForms),
	orders_userId: many(orders, {
		relationName: "orders_userId_user_id"
	}),
	orders_technicianId: many(orders, {
		relationName: "orders_technicianId_user_id"
	}),
	technicianInvites: many(technicianInvites),
	technicians: many(technicians),
	coupons: many(coupons),
	couponUsages: many(couponUsage),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user_userId: one(user, {
		fields: [orders.userId],
		references: [user.id],
		relationName: "orders_userId_user_id"
	}),
	user_technicianId: one(user, {
		fields: [orders.technicianId],
		references: [user.id],
		relationName: "orders_technicianId_user_id"
	}),
	coupon: one(coupons, {
		fields: [orders.appliedCouponId],
		references: [coupons.id]
	}),
	addresses: many(addresses),
	orderPhotos: many(orderPhotos),
	couponUsages: many(couponUsage),
}));

export const couponsRelations = relations(coupons, ({one, many}) => ({
	orders: many(orders),
	user: one(user, {
		fields: [coupons.createdByAdminId],
		references: [user.id]
	}),
	couponUsages: many(couponUsage),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	order: one(orders, {
		fields: [addresses.orderId],
		references: [orders.id]
	}),
}));

export const technicianInvitesRelations = relations(technicianInvites, ({one}) => ({
	user: one(user, {
		fields: [technicianInvites.createdByAdminId],
		references: [user.id]
	}),
}));

export const techniciansRelations = relations(technicians, ({one}) => ({
	user: one(user, {
		fields: [technicians.userId],
		references: [user.id]
	}),
}));

export const orderPhotosRelations = relations(orderPhotos, ({one}) => ({
	order: one(orders, {
		fields: [orderPhotos.orderId],
		references: [orders.id]
	}),
}));

export const couponUsageRelations = relations(couponUsage, ({one}) => ({
	coupon: one(coupons, {
		fields: [couponUsage.couponId],
		references: [coupons.id]
	}),
	order: one(orders, {
		fields: [couponUsage.orderId],
		references: [orders.id]
	}),
	user: one(user, {
		fields: [couponUsage.userId],
		references: [user.id]
	}),
}));