ALTER TABLE "orders" DROP CONSTRAINT "orders_technician_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "technician_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "part_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "travel_costs" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "miscellaneous_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "miscellaneous_description" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completed_by" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_technician_id_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;