ALTER TABLE "block_recipes" ADD COLUMN "user_id" varchar(32);--> statement-breakpoint
UPDATE "block_recipes" SET "user_id" = 'user_2nqY75NVKLXX3AmQycUYS5BOB9d';

ALTER TABLE "blocks" ADD COLUMN "user_id" varchar(32);--> statement-breakpoint
UPDATE "blocks" SET "user_id" = 'user_2nqY75NVKLXX3AmQycUYS5BOB9d';

ALTER TABLE "ingredients" ADD COLUMN "user_id" varchar(32);--> statement-breakpoint
UPDATE "ingredients" SET "user_id" = 'user_2nqY75NVKLXX3AmQycUYS5BOB9d';

ALTER TABLE "recipe_ingredients" ADD COLUMN "user_id" varchar(32);--> statement-breakpoint
UPDATE "recipe_ingredients" SET "user_id" = 'user_2nqY75NVKLXX3AmQycUYS5BOB9d';

ALTER TABLE "recipes" ADD COLUMN "user_id" varchar(32);
UPDATE "recipes" SET "user_id" = 'user_2nqY75NVKLXX3AmQycUYS5BOB9d';