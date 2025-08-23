ALTER TYPE "public"."user_role" ADD VALUE 'technician';--> statement-breakpoint
CREATE TABLE "order_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"url" varchar(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "technician_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "technician_notes" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completion_otp" varchar(12);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completion_otp_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_technician_id_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;