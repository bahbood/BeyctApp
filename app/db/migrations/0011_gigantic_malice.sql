CREATE TYPE "public"."newsAgencyStatuses" AS ENUM('inactive', 'pending', 'active');--> statement-breakpoint
CREATE TYPE "public"."newsAgencySubscriptionPlans" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "news_agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"on_air" boolean DEFAULT false,
	"news_agency_name" varchar(50) NOT NULL,
	"news_agency_manager" varchar(150) NOT NULL,
	"news_agency_desc" varchar(200) NOT NULL,
	"news_agency_about" text,
	"news_agency_logo" varchar(255),
	"news_agency_header_banner" varchar(255),
	"news_agency_address" varchar(250),
	"news_agency_tell" varchar(11),
	"news_agency_mobile" varchar(11),
	"news_agency_email" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_outofaccess" boolean DEFAULT false,
	"news_agency_status" "newsAgencyStatuses" DEFAULT 'inactive' NOT NULL,
	"subscription_plan" "newsAgencySubscriptionPlans",
	"payment_receipt" varchar(255),
	"activation_requested_at" timestamp,
	"activated_at" timestamp,
	"expired_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "news_agencies_news_agency_name_unique" UNIQUE("news_agency_name"),
	CONSTRAINT "news_agencies_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "news_agency_mobile_format" CHECK ("news_agencies"."news_agency_mobile" ~ '^[0-9]{11}$'),
	CONSTRAINT "news_agency_tell_format" CHECK ("news_agencies"."news_agency_tell" ~ '^[0-9]{11}$'),
	CONSTRAINT "news_agency_email_format" CHECK ("news_agencies"."news_agency_email" IS NULL OR "news_agencies"."news_agency_email" ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
	CONSTRAINT "news_agency_active_requires_approval" CHECK ("news_agencies"."news_agency_status" <> 'active' OR "news_agencies"."activated_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_outofaccess" boolean DEFAULT false,
	"on_air" boolean DEFAULT false,
	"headline" varchar(200) NOT NULL,
	"sub_headline" varchar(200),
	"body" text NOT NULL,
	"news_category" varchar(50),
	"news_source" varchar(100),
	"reporter" varchar(150),
	"is_breaking" boolean DEFAULT false,
	"comments_enabled" boolean DEFAULT true NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"archive_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"news_agency_id" integer NOT NULL,
	CONSTRAINT "news_headline_not_empty" CHECK (length(trim("news"."headline")) > 0),
	CONSTRAINT "news_body_not_empty" CHECK (length(trim("news"."body")) > 0),
	CONSTRAINT "news_view_count_not_negative" CHECK ("news"."view_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "news_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_name" varchar(120) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"news_id" integer NOT NULL,
	CONSTRAINT "news_images_position_range" CHECK ("news_images"."position" >= 0 AND "news_images"."position" < 5)
);
--> statement-breakpoint
CREATE TABLE "news_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "news_agencies" ADD CONSTRAINT "news_agencies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_news_agency_id_news_agencies_id_fk" FOREIGN KEY ("news_agency_id") REFERENCES "public"."news_agencies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_images" ADD CONSTRAINT "news_images_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_likes" ADD CONSTRAINT "news_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "news_agency_id_published_at_idx" ON "news" USING btree ("news_agency_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_images_news_id_position_unique" ON "news_images" USING btree ("news_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "news_likes_news_id_user_id_unique" ON "news_likes" USING btree ("news_id","user_id");--> statement-breakpoint
CREATE INDEX "news_likes_news_id_idx" ON "news_likes" USING btree ("news_id");