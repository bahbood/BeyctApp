CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_name" varchar(120) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "product_images_position_range" CHECK ("product_images"."position" >= 0 AND "product_images"."position" < 3)
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "registered_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_product_id_position_unique" ON "product_images" USING btree ("product_id","position");