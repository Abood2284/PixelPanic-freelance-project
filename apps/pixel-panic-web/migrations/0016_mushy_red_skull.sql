-- Add order_number column as nullable first
ALTER TABLE "orders" ADD COLUMN "order_number" varchar(20);

-- Populate existing orders with generated order numbers
-- This will generate order numbers like PP-2024-0001, PP-2024-0002, etc.
UPDATE "orders" 
SET "order_number" = CONCAT('PP-', EXTRACT(YEAR FROM "created_at")::text, '-', LPAD("id"::text, 4, '0'))
WHERE "order_number" IS NULL;

-- Make the column NOT NULL and add unique constraint
ALTER TABLE "orders" ALTER COLUMN "order_number" SET NOT NULL;
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");