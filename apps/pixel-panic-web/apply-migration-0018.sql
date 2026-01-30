-- Apply migration 0018_high_venus.sql manually
-- This adds cost tracking fields and makes technician_id NOT NULL

-- First, handle existing orders without technicians (if any)
-- You may need to assign technicians to existing orders before running this
-- UPDATE orders SET technician_id = (SELECT id FROM "user" WHERE role = 'technician' LIMIT 1) WHERE technician_id IS NULL;

-- Drop and recreate the foreign key constraint
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_technician_id_user_id_fk";

-- Make technician_id NOT NULL (this will fail if there are NULL values)
-- Comment out the next line if you have orders without technicians
ALTER TABLE "orders" ALTER COLUMN "technician_id" SET NOT NULL;

-- Add new cost tracking columns (using IF NOT EXISTS pattern)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'part_price') THEN
        ALTER TABLE "orders" ADD COLUMN "part_price" numeric(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'travel_costs') THEN
        ALTER TABLE "orders" ADD COLUMN "travel_costs" numeric(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'miscellaneous_cost') THEN
        ALTER TABLE "orders" ADD COLUMN "miscellaneous_cost" numeric(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'miscellaneous_description') THEN
        ALTER TABLE "orders" ADD COLUMN "miscellaneous_description" text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_at') THEN
        ALTER TABLE "orders" ADD COLUMN "completed_at" timestamp;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_by') THEN
        ALTER TABLE "orders" ADD COLUMN "completed_by" text;
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_completed_by_user_id_fk'
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_completed_by_user_id_fk" 
        FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_technician_id_user_id_fk'
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_technician_id_user_id_fk" 
        FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
    END IF;
END $$;
