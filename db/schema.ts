import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const ingredientsTable = pgTable("ingredients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  is_pantry: boolean().notNull(),
});

export const recipesTable = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }).notNull(),
  link: varchar({ length: 1000 }).notNull(),
  is_fast: boolean().notNull(),
  is_suitable_for_fridge: boolean().notNull(),
});

export const recipeIngredientsTable = pgTable("recipe_ingredients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  recipeId: integer()
    .notNull()
    .references(() => recipesTable.id),
  ingredientId: integer()
    .notNull()
    .references(() => ingredientsTable.id),
  quantity: varchar({ length: 100 }).notNull(),
});

export const blocksTable = pgTable("blocks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});

export const blockRecipesTable = pgTable("block_recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  blockId: integer()
    .notNull()
    .references(() => blocksTable.id),
  recipeId: integer()
    .notNull()
    .references(() => recipesTable.id),
});
