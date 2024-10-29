ALTER TABLE "block_shopping_list_items" RENAME COLUMN "item_str" TO "item_name";--> statement-breakpoint
ALTER TABLE "block_shopping_list_items" ADD COLUMN "item_amount" varchar(255) NOT NULL;