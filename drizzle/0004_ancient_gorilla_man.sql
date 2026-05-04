DELETE FROM `articles` WHERE `source_url` IS NULL;--> statement-breakpoint
DROP INDEX "articles_source_url_digest_date_unique";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`sources` text,
	`category` text NOT NULL,
	`subcategory` text,
	`bias` text,
	`published_at` text NOT NULL,
	`reading_time_minutes` integer,
	`importance_score` real,
	`image_url` text,
	`tags` text,
	`regions` text,
	`primary_region` text,
	`strategic_interpretation` text,
	`digest_date` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_articles` (
	`id`,
	`title`,
	`summary`,
	`source`,
	`source_url`,
	`sources`,
	`category`,
	`subcategory`,
	`bias`,
	`published_at`,
	`reading_time_minutes`,
	`importance_score`,
	`image_url`,
	`tags`,
	`regions`,
	`primary_region`,
	`strategic_interpretation`,
	`digest_date`,
	`created_at`
)
SELECT
	`id`,
	`title`,
	`summary`,
	`source`,
	`source_url`,
	`sources`,
	`category`,
	`subcategory`,
	`bias`,
	`published_at`,
	`reading_time_minutes`,
	`importance_score`,
	`image_url`,
	`tags`,
	`regions`,
	`primary_region`,
	`strategic_interpretation`,
	`digest_date`,
	`created_at`
FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_source_url_digest_date_unique` ON `articles` (`source_url`,`digest_date`);