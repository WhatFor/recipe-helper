import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const ingredientsTable = pgTable("ingredients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});
