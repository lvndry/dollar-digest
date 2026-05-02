ALTER TABLE articles ADD COLUMN tags text;
ALTER TABLE articles ADD COLUMN regions text;
ALTER TABLE articles ADD COLUMN strategic_interpretation text;

ALTER TABLE "user" ADD COLUMN created_at integer;
ALTER TABLE "user" ADD COLUMN stripe_subscription_id text;
ALTER TABLE "user" ADD COLUMN stripe_subscription_status text;

UPDATE "user"
SET created_at = unixepoch() * 1000
WHERE created_at IS NULL;
