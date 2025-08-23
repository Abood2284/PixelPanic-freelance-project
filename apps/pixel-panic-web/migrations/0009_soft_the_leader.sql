CREATE TABLE "technician_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(32) NOT NULL,
	"name" varchar(256),
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_by_admin_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technician_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "technician_invites" ADD CONSTRAINT "technician_invites_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;