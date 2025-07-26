CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "issues_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "model_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"issue_id" integer NOT NULL,
	"price_original" numeric(10, 2),
	"price_aftermarket_tier1" numeric(10, 2),
	"price_aftermarket_tier2" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"brand_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model_issues" ADD CONSTRAINT "model_issues_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_issues" ADD CONSTRAINT "model_issues_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "model_issue_unique_idx" ON "model_issues" USING btree ("model_id","issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_model_unique_idx" ON "models" USING btree ("brand_id","name");