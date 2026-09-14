CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_outofaccess" boolean DEFAULT false,
	"on_air" boolean DEFAULT false,
	"archive_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_name" varchar(50) NOT NULL,
	"product_shortdesc" varchar(100),
	"product_desc" text,
	"inventory" integer DEFAULT 0,
	"price" numeric(12, 2) NOT NULL,
	"off_percent" numeric(5, 2) DEFAULT '0',
	"final_price" numeric(12, 2) GENERATED ALWAYS AS (ROUND("price" - ("price" * "off_percent" / 100),2)) STORED,
	"store_id" integer NOT NULL,
	CONSTRAINT "off_percent_range" CHECK ("products"."off_percent" >= 0 AND "products"."off_percent" < 100)
);
--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_name_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."userRoles";--> statement-breakpoint
CREATE TYPE "public"."userRoles" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."userRoles";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."userRoles" USING "role"::"public"."userRoles";--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "on_air" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_name" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_desc" varchar(500);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_about" varchar;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_manager" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_address" varchar(250);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_tell" varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_mobile" varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_shaba_number" varchar(22);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "is_outofaccess" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "expired_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_isvalid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile_number_isvalid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "store_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "store_pin" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "news_agency_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "news_agency_pin" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "serviceman_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "serviceman_pin" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_isValid";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "mobile_number_isValid";--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_store_name_unique" UNIQUE("store_name");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "store_mobile_format" CHECK ("stores"."store_mobile" ~ '^[0-9]{11}$');--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "store_tell_format" CHECK ("stores"."store_tell" ~ '^[0-9]{11}$');--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "store_shaba_number_format" CHECK ("stores"."store_shaba_number" ~ '^[0-9]{22}$');