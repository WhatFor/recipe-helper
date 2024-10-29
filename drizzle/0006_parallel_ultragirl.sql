CREATE TABLE IF NOT EXISTS "block_shopping_list_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "block_shopping_list_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"blockId" integer NOT NULL,
	"item_str" varchar(255) NOT NULL,
	"user_id" varchar(32) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "block_shopping_list_items" ADD CONSTRAINT "block_shopping_list_items_blockId_blocks_id_fk" FOREIGN KEY ("blockId") REFERENCES "public"."blocks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
