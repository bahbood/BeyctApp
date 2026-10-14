CREATE TABLE IF NOT EXISTS "payment_receipts" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" varchar(255) NOT NULL,
  "entity_type" varchar(32) NOT NULL,
  "entity_id" integer NOT NULL,
  "content_type" varchar(100) NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_receipts_filename_uidx" ON "payment_receipts" USING btree ("filename");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_receipts_entity_idx" ON "payment_receipts" USING btree ("entity_type","entity_id");
