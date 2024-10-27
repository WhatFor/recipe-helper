import { drizzle } from "drizzle-orm/vercel-postgres";
import {
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";
import Header from "@/components/ui/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { desc, eq } from "drizzle-orm";
import NewRecipeModal from "./new-recipe-modal";
import RecipeCard from "./recipe-card";
import NewRecipeWithAiModal from "./new-recipe-with-ai-modal";
import { auth } from "@clerk/nextjs/server";

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
      .filter((x) => x.id !== null && x.name !== null);

    return {
      ...recipe,
      ingredients,
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <Header>Recipes</Header>
      <NewRecipeModal />
      <NewRecipeWithAiModal />
      <ScrollArea className="h-[600px] w-full rounded-xl border p-5">
        {recipesWithIngredients.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default IngredientsPage;
