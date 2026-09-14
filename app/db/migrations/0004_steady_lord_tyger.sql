ALTER TABLE "slides" DROP CONSTRAINT "slides_fullName_unique";--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "image_L" varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE "slides" ADD COLUMN "image_P" varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE "slides" DROP COLUMN "fullName";--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_image_L_unique" UNIQUE("image_L");--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_image_P_unique" UNIQUE("image_P");