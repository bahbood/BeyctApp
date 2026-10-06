DROP INDEX "news_likes_news_id_idx";--> statement-breakpoint
CREATE INDEX "news_agencies_news_agency_status_idx" ON "news_agencies" USING btree ("news_agency_status");--> statement-breakpoint
CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");