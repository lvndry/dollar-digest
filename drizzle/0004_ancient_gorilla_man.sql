DELETE FROM `articles` WHERE `source_url` IS NULL;--> statement-breakpoint
DROP INDEX "articles_source_url_digest_date_unique";--> statement-breakpoint
ALTER TABLE `articles` ALTER COLUMN "source_url" TO "source_url" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_source_url_digest_date_unique` ON `articles` (`source_url`,`digest_date`);