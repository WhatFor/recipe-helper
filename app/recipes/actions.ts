"use server";

import {
  blockRecipesTable,
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";
import { ActionResult, DataResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import OpenAI from "openai";
import { AiPrompt } from "./ai";

const openai = new OpenAI();

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
    user_id: userId,
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

const importAiRecipeSchema = z.object({
  link: z.string().min(1).max(1000),
});

export interface AiRecipeResult {
  name: string;
  description: string;
  is_fast: boolean;
  link: string;
  is_suitable_for_fridge: boolean;
  ingredients: { name: string; quantity: string; is_pantry: boolean }[];
}

export async function importRecipeUsingAi(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<DataResult<AiRecipeResult>> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const values = {
    link: formData.get("recipeLink") as string,
  };

  const validate = importAiRecipeSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as DataResult<AiRecipeResult>;
  }

  const db = drizzle();

  const existingRecipeLink = await db
    .select({ link: recipesTable.link })
    .from(recipesTable)
    .where(
      and(eq(recipesTable.link, values.link), eq(recipesTable.user_id, userId))
    );

  if (existingRecipeLink.length > 0) {
    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Recipe import failed",
        description: "The recipe has already been imported.",
      },
    };
  }

  try {
    const html = await fetch(values.link).then((response) => response.text());

    const tryFindBody = html.match(/<body[^>]*>[\s\S]*<\/body>/i);
    const body = tryFindBody ? tryFindBody[0] : html;

    const tryFindMain = body.match(/<main[^>]*>[\s\S]*<\/main>/i);
    const main = tryFindMain ? tryFindMain[0] : body;

    const { data } = await openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AiPrompt },
          {
            role: "user",
            content: "The HTML you are to analyse is: " + main + '"',
          },
        ],
      })
      .withResponse();

    const resultString = data.choices[0].message.content;
    const resultJson = JSON.parse(resultString!) as AiRecipeResult;
    resultJson.link = values.link;

    // Try to dedupe any duplicates
    resultJson.ingredients = resultJson.ingredients.reduce(
      (acc, current) =>
        acc.find((x) => x.name === current.name) ? acc : [...acc, current],
      [] as AiRecipeResult["ingredients"]
    );

    return {
      state: "dirty",
      successful: true,
      timestamp: Date.now(),
      data: resultJson,
      message: {
        title: "Recipe imported",
        description: "Hey, look! The AI has loaded the recipe for you.",
      },
    };
  } catch (error) {
    console.log(error);

    try {
      // @ts-expect-error Yolo
      const code = error.error.code;

      if (code === "context_length_exceeded") {
        return {
          state: "dirty",
          successful: false,
          timestamp: Date.now(),
          errors: [],
          message: {
            title: "Recipe import failed",
            description:
              "The AI was unable to load the recipe. The HTML was too long. Try another website!",
          },
        };
      }
    } catch {}

    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Recipe import failed",
        description: "The AI was unable to load the recipe. Try again!",
      },
    };
  }
}

export async function completeAiRecipeImport(
  data: AiRecipeResult
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  try {
    const db = drizzle();

    const insertedData = await db
      .insert(recipesTable)
      .values({
        name: data.name,
        description: data.description,
        link: data.link,
        is_fast: data.is_fast,
        is_suitable_for_fridge: data.is_suitable_for_fridge,
        user_id: userId,
      })
      .returning({ recipeId: recipesTable.id });

    const recipeId = insertedData[0].recipeId;

    console.log("saving ingredients", data.ingredients);

    const insertedIngredients = await db
      .insert(ingredientsTable)
      .values(
        data.ingredients.map((x) => ({
          name: x.name,
          is_pantry: x.is_pantry,
          user_id: userId,
        }))
      )
      .returning({
        ingredientId: ingredientsTable.id,
        name: ingredientsTable.name,
      });

    console.log("insertedIngredients", insertedIngredients);

    await db.insert(recipeIngredientsTable).values(
      data.ingredients.map((x) => ({
        recipeId: recipeId,
        ingredientId: insertedIngredients.find((y) => y.name === x.name)!
          .ingredientId,
        quantity: x.quantity,
        user_id: userId,
      }))
    );

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
  } catch {
    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Recipe creation failed",
        description: "The recipe could not be created. Try again!",
      },
    };
  }
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

  await db
    .update(recipesTable)
    .set(values)
    .where(and(eq(recipesTable.id, id), eq(recipesTable.user_id, userId)));

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

  await db
    .delete(recipeIngredientsTable)
    .where(
      and(
        eq(recipeIngredientsTable.recipeId, id),
        eq(recipeIngredientsTable.user_id, userId)
      )
    );

  // Drizzle doesn't do delete with joins. https://github.com/drizzle-team/drizzle-orm/issues/2304
  // the sql template string escapes variables, not a sql injection risk.
  await db.execute(sql`DELETE FROM ${ingredientsTable}
  USING ${recipeIngredientsTable}
  WHERE ${ingredientsTable.id} = ${recipeIngredientsTable.ingredientId}
    AND ${recipeIngredientsTable.recipeId} = ${id}
    AND ${ingredientsTable.user_id} = ${userId}
  RETURNING *`);

  await db
    .delete(blockRecipesTable)
    .where(
      and(
        eq(blockRecipesTable.recipeId, id),
        eq(blockRecipesTable.user_id, userId)
      )
    );

  await db
    .delete(recipesTable)
    .where(and(eq(recipesTable.id, id), eq(recipesTable.user_id, userId)));

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

  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  const existingIngredients = await db
    .select({
      id: recipeIngredientsTable.ingredientId,
    })
    .from(recipeIngredientsTable)
    .where(
      and(
        eq(recipeIngredientsTable.recipeId, recipeId),
        eq(recipeIngredientsTable.user_id, userId)
      )
    );

  const result = await db
    .select({
      id: ingredientsTable.id,
      name: ingredientsTable.name,
    })
    .from(ingredientsTable)
    .where(
      and(
        ilike(ingredientsTable.name, "%" + name + "%"),
        eq(ingredientsTable.user_id, userId)
      )
    );

  const filtered = result
    .filter((x) => !existingIngredients.some((y) => y.id === x.id))
    .slice(0, 10);

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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db.insert(recipeIngredientsTable).values({
    recipeId: recipeId,
    ingredientId: ingredientId,
    quantity: "0",
    user_id: userId,
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
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db
    .delete(recipeIngredientsTable)
    .where(
      and(
        eq(recipeIngredientsTable.recipeId, recipeId),
        and(
          eq(recipeIngredientsTable.ingredientId, ingredientId),
          eq(recipeIngredientsTable.user_id, userId)
        )
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
