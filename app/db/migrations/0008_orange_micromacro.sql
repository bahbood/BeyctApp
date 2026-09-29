CREATE TYPE "public"."storeStatuses" AS ENUM('inactive', 'pending', 'active');--> statement-breakpoint
CREATE TYPE "public"."storeSubscriptionPlans" AS ENUM('monthly', 'yearly');--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_about" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_logo" varchar(255);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_header_banner" varchar(255);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_status" "storeStatuses" DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "subscription_plan" "storeSubscriptionPlans";--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "payment_receipt" varchar(255);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "activation_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "activated_at" timestamp;