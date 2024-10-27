import RecipesPage from "./recipes-page";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import {
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";

interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  is_pantry: boolean;
}

export interface RecipeWithIngredients {
  id: number;
  name: string;
  description: string;
  link: string;
  is_fast: boolean;
  is_suitable_for_fridge: boolean;
  ingredients: Ingredient[];
}

const IngredientsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  const result = await db
    .select({
      id: recipesTable.id,
      name: recipesTable.name,
      description: recipesTable.description,
      link: recipesTable.link,
      is_fast: recipesTable.is_fast,
      user_id: recipesTable.user_id,
      is_suitable_for_fridge: recipesTable.is_suitable_for_fridge,
      ingredientId: ingredientsTable.id,
      ingredientName: ingredientsTable.name,
      ingredientQuantity: recipeIngredientsTable.quantity,
      ingredientIsPantry: ingredientsTable.is_pantry,
    })
    .from(recipesTable)
    .leftJoin(
      recipeIngredientsTable,
      eq(recipesTable.id, recipeIngredientsTable.recipeId)
    )
    .leftJoin(
      ingredientsTable,
      eq(recipeIngredientsTable.ingredientId, ingredientsTable.id)
    )
    .where(eq(recipesTable.user_id, userId))
    .orderBy(desc(recipesTable.id));

  const uniqueRecipes = result
    .map((x) => ({
      name: x.name,
      id: x.id,
      description: x.description,
      link: x.link,
      is_fast: x.is_fast,
      is_suitable_for_fridge: x.is_suitable_for_fridge,
      user_id: x.user_id,
    }))
    .filter(
      (value, index, self) => self.findIndex((x) => x.id === value.id) === index
    );

  const recipesWithIngredients = uniqueRecipes.map((recipe) => {
    const ingredients = result
      .filter((r) => recipe.id === r.id && r.id)
      .map((x) => ({
        id: x.ingredientId!,
        name: x.ingredientName!,
        quantity: x.ingredientQuantity!,
        is_pantry: x.ingredientIsPantry!,
      }))
      .filter((x) => x.id !== null && x.name !== null)
      .sort((a, b) => (a.is_pantry === b.is_pantry ? 0 : a.is_pantry ? 1 : -1));

    return {
      ...recipe,
      ingredients,
    };
  });

  return <RecipesPage recipes={recipesWithIngredients} />;
};

export default IngredientsPage;
