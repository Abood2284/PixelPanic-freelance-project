ALTER TABLE "addresses" RENAME COLUMN "pincode" TO "alternate_phone_number";--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "landmark" SET NOT NULL;