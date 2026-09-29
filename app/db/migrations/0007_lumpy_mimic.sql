CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"subject" varchar(100),
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_sender_not_receiver" CHECK ("messages"."sender_id" <> "messages"."receiver_id"),
	CONSTRAINT "messages_body_not_empty" CHECK (length(trim("messages"."body")) > 0)
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "mobile_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_name" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_desc" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_desc" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_tell" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "store_mobile" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;