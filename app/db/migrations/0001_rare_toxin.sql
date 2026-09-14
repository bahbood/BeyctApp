ALTER TYPE "public"."userRoles" ADD VALUE 'storeAdmin' BEFORE 'public';--> statement-breakpoint
ALTER TABLE "userProfile" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "userProfile" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(40);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_isValid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile_number" varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile_number_isValid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "family" varchar(25);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mobile_number_unique" UNIQUE("mobile_number");