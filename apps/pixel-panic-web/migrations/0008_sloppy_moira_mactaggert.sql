CREATE TYPE "public"."technician_application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."technician_status" AS ENUM('active', 'on_leave', 'inactive');--> statement-breakpoint
CREATE TABLE "technician_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(256) NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"email" varchar(256),
	"aadhaar_last4" varchar(4) NOT NULL,
	"aadhaar_doc_urls_csv" varchar(4096),
	"selfie_url" varchar(1024),
	"pincode" varchar(16) NOT NULL,
	"flat_and_street" varchar(512) NOT NULL,
	"landmark" varchar(256),
	"city" varchar(128),
	"state" varchar(128),
	"status" "technician_application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "technician_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;