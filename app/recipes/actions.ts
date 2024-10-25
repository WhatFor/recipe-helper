"use server";

import {
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";
import { ActionResult, DataResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const upsertRecipeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  link: z.string().min(1).max(1000),
  is_fast: z.boolean(),
  is_suitable_for_fridge: z.boolean(),
});

export async function createRecipe(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const values = {
    name: formData.get("recipeName") as string,
    description: formData.get("recipeDescription") as string,
    link: formData.get("recipeLink") as string,
    is_fast: (formData.get("isFast") === "on") as boolean,
    is_suitable_for_fridge: (formData.get("isSuitableForFridge") ===
      "on") as boolean,
  };

  const validate = upsertRecipeSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as ActionResult;
  }

  const db = drizzle();

  await db.insert(recipesTable).values(values);

  revalidatePath("/recipes");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Recipe created",
      description: "The recipe has been created successfully.",
    },
  };
}

export async function updateRecipe(
  id: number,
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const values = {
    name: formData.get("recipeName") as string,
    description: formData.get("recipeDescription") as string,
    link: formData.get("recipeLink") as string,
    is_fast: (formData.get("isFast") === "on") as boolean,
    is_suitable_for_fridge: (formData.get("isSuitableForFridge") ===
      "on") as boolean,
  };

  const validate = upsertRecipeSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as ActionResult;
  }

  const db = drizzle();

  await db.update(recipesTable).set(values).where(eq(recipesTable.id, id));

  revalidatePath("/recipes");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Recipe updated",
      description: "The recipe has been updated successfully.",
    },
  };
}

export async function deleteRecipe(id: number): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db.delete(recipesTable).where(eq(recipesTable.id, id));

  revalidatePath("/recipes");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Recipe deleted",
      description: "The recipe has been deleted successfully.",
    },
  };
}

export type FindIngredientsResult = {
  id: number;
  name: string;
};

export async function findIngredients(
  name: string,
  recipeId: number
): Promise<DataResult<FindIngredientsResult[]>> {
  if (!name) {
    return {
      state: "init",
      successful: true,
      timestamp: Date.now(),
      data: [],
    };
  }

  const db = drizzle();

  const existingIngredients = await db
    .select({
      id: recipeIngredientsTable.ingredientId,
    })
    .from(recipeIngredientsTable)
    .where(eq(recipeIngredientsTable.recipeId, recipeId));

  const result = await db
    .select({
      id: ingredientsTable.id,
      name: ingredientsTable.name,
    })
    .from(ingredientsTable)
    .where(ilike(ingredientsTable.name, "%" + name + "%"));

  const filtered = result.filter(
    (x) => !existingIngredients.some((y) => y.id === x.id)
  );

  return {
    state: "init",
    successful: true,
    timestamp: Date.now(),
    data: filtered,
  };
}

export async function addIngredientToRecipe(
  recipeId: number,
  ingredientId: number
): Promise<ActionResult> {
  const db = drizzle();

  await db.insert(recipeIngredientsTable).values({
    recipeId: recipeId,
    ingredientId: ingredientId,
    quantity: "0",
  });

  revalidatePath("/recipes");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Ingredient added",
      description: "The ingredient has been added to the recipe successfully.",
    },
  };
}

export async function removeIngredientFromRecipe(
  recipeId: number,
  ingredientId: number
): Promise<ActionResult> {
  const db = drizzle();

  await db
    .delete(recipeIngredientsTable)
    .where(
      and(
        eq(recipeIngredientsTable.recipeId, recipeId),
        eq(recipeIngredientsTable.ingredientId, ingredientId)
      )
    );

  revalidatePath("/recipes");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Ingredient removed",
      description:
        "The ingredient has been removed from the recipe successfully.",
    },
  };
}
