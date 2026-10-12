CREATE TABLE "news_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "news_reads" ADD CONSTRAINT "news_reads_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_reads" ADD CONSTRAINT "news_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "news_reads_news_id_user_id_unique" ON "news_reads" USING btree ("news_id","user_id");--> statement-breakpoint
CREATE INDEX "news_reads_user_id_read_at_idx" ON "news_reads" USING btree ("user_id","read_at");