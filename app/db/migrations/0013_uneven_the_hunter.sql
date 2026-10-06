CREATE TYPE "public"."serviceStatuses" AS ENUM('inactive', 'pending', 'active');--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"on_air" boolean DEFAULT false,
	"title" varchar(100) NOT NULL,
	"short_desc" varchar(200) NOT NULL,
	"contact1" varchar(11) NOT NULL,
	"contact2" varchar(11),
	"office_address" varchar(250) NOT NULL,
	"banner" varchar(255),
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_outofaccess" boolean DEFAULT false,
	"service_status" "serviceStatuses" DEFAULT 'inactive' NOT NULL,
	"payment_receipt" varchar(255),
	"activation_requested_at" timestamp,
	"activated_at" timestamp,
	"expired_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "service_contact1_format" CHECK ("services"."contact1" ~ '^[0-9]{11}$'),
	CONSTRAINT "service_contact2_format" CHECK ("services"."contact2" IS NULL OR "services"."contact2" ~ '^[0-9]{11}$'),
	CONSTRAINT "service_active_requires_approval" CHECK ("services"."service_status" <> 'active' OR "services"."activated_at" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "services_user_title_unique" ON "services" USING btree ("user_id","title");--> statement-breakpoint
CREATE INDEX "services_service_status_idx" ON "services" USING btree ("service_status");