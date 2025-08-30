CREATE TYPE "public"."contact_form_status" AS ENUM('pending', 'responded', 'closed');--> statement-breakpoint
CREATE TABLE "contact_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"subject" varchar(512) NOT NULL,
	"message" text NOT NULL,
	"status" "contact_form_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"responded_at" timestamp,
	"responded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_responded_by_user_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;