CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."service_mode" AS ENUM('doorstep', 'carry_in');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"full_name" varchar(256) NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"email" varchar(256),
	"pincode" varchar(16) NOT NULL,
	"flat_and_street" varchar(512) NOT NULL,
	"landmark" varchar(256),
	CONSTRAINT "addresses_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"issue_name" varchar(256) NOT NULL,
	"model_name" varchar(256) NOT NULL,
	"grade" varchar(32) NOT NULL,
	"price_at_time_of_order" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"service_mode" "service_mode" NOT NULL,
	"time_slot" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;