ALTER TABLE "block_recipes" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "user_id" SET NOT NULL;