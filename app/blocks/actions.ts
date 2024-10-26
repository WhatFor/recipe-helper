"use server";

import {
  blockRecipesTable,
  blocksTable,
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";
import { ActionResult, DataResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { z } from "zod";
import { AiPrompt } from "./ai";

const openai = new OpenAI();

const upsertBlockSchema = z.object({
  name: z.string().min(1).max(255),
});

export async function createBlock(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const values = {
    name: formData.get("blockName") as string,
  };

  const validate = upsertBlockSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as ActionResult;
  }

  const db = drizzle();

  await db.insert(blocksTable).values(values);

  revalidatePath("/blocks");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Block created",
      description: "The block has been created successfully.",
    },
  };
}

export interface AiBlocksResult {
  blocks: {
    name: string;
    recipes: { name: string }[];
    similarity: number;
    common_ingredients: string[];
  }[];
  unused: string[];
}

export async function createBlocksWithAi(): Promise<
  DataResult<AiBlocksResult>
> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  try {
    const db = drizzle();

    const recipes = await db
      .select({
        id: recipesTable.id,
        name: recipesTable.name,
        ingredientId: ingredientsTable.id,
        ingredientName: ingredientsTable.name,
      })
      .from(recipesTable)
      .leftJoin(
        recipeIngredientsTable,
        eq(recipesTable.id, recipeIngredientsTable.recipeId)
      )
      .leftJoin(
        ingredientsTable,
        eq(recipeIngredientsTable.ingredientId, ingredientsTable.id)
      );

    const uniqueRecipes = recipes
      .map((x) => ({
        id: x.id,
        name: x.name,
      }))
      .filter(
        (value, index, self) =>
          self.findIndex((x) => x.id === value.id) === index
      );

    const recipesWithIngredients = uniqueRecipes.map((recipe) => {
      const ingredients = recipes
        .filter((r) => recipe.id === r.id && r.id)
        .map((x) => ({
          id: x.ingredientId!,
          name: x.ingredientName!,
        }))
        .filter((x) => x.id !== null && x.name !== null);

      return {
        ...recipe,
        ingredients,
      };
    });

    const stringRecipies = recipesWithIngredients.map(
      (x) => `${x.name}: (${x.ingredients.map((y) => y.name).join(", ")})`
    );

    const userContent =
      "The recipes you are to process are:\r\n- " +
      stringRecipies.join("\r\n- ");

    console.log("Generating blocks. User content:", userContent);

    const { data } = await openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AiPrompt },
          {
            role: "user",
            content: userContent,
          },
        ],
      })
      .withResponse();

    console.log("Generating blocks result:", data.choices[0].message.content);

    const resultString = data.choices[0].message.content;
    const resultObj = JSON.parse(resultString!);

    // Check if we got our error back
    if (resultObj.error) {
      const err = resultObj.error?.message;
      const code = resultObj.error?.code;

      console.log("Failed to generate blocks. Err: ", err);

      if (code === "0001") {
        return {
          state: "dirty",
          successful: false,
          timestamp: Date.now(),
          errors: [],
          message: {
            title: "Recipe import failed",
            description:
              "The AI was unable to generate blocks, because it couldn't create enough groups. Do you have enough recipes?",
          },
        };
      }
    }

    const resultAiObj = resultObj as AiBlocksResult;

    return {
      state: "dirty",
      successful: true,
      message: {
        title: "Blocks created",
        description: "The blocks have been created successfully.",
      },
      timestamp: Date.now(),
      data: resultAiObj,
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
              "The AI was unable to generate blocks, because you have too many recipes. Please delete some recipes and try again.",
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
        title: "AI failed",
        description: "The AI was unable to process your recipes. Try again!",
      },
    };
  }
}

export async function updateBlock(
  id: number,
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const values = {
    name: formData.get("blockName") as string,
  };

  const validate = upsertBlockSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as ActionResult;
  }

  const db = drizzle();

  await db.update(blocksTable).set(values).where(eq(blocksTable.id, id));

  revalidatePath("/blocks");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Block updated",
      description: "The block has been updated successfully.",
    },
  };
}

export async function deleteBlock(id: number): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db.delete(blocksTable).where(eq(blocksTable.id, id));

  revalidatePath("/blocks");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Block deleted",
      description: "The block has been deleted successfully.",
    },
  };
}

export type FindRecipeResult = {
  id: number;
  name: string;
};

export async function findRecipe(
  name: string,
  blockId: number
): Promise<DataResult<FindRecipeResult[]>> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  if (!name) {
    return {
      state: "init",
      successful: true,
      timestamp: Date.now(),
      data: [],
    };
  }

  const db = drizzle();

  const existingRecipes = await db
    .select({
      id: blockRecipesTable.recipeId,
    })
    .from(blockRecipesTable)
    .where(eq(blockRecipesTable.blockId, blockId));

  const result = await db
    .select({
      id: recipesTable.id,
      name: recipesTable.name,
    })
    .from(recipesTable)
    .where(ilike(recipesTable.name, "%" + name + "%"));

  const filtered = result.filter(
    (x) => !existingRecipes.some((y) => y.id === x.id)
  );

  return {
    state: "init",
    successful: true,
    timestamp: Date.now(),
    data: filtered,
  };
}

export async function addRecipeToBlock(
  blockId: number,
  recipeId: number
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db.insert(blockRecipesTable).values({
    blockId,
    recipeId,
  });

  revalidatePath("/blocks");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Recipe added",
      description: "The recipe has been added to the block successfully.",
    },
  };
}

export async function removeRecipeFromBlock(
  blockId: number,
  recipeId: number
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  await db
    .delete(blockRecipesTable)
    .where(
      and(
        eq(blockRecipesTable.blockId, blockId),
        eq(blockRecipesTable.recipeId, recipeId)
      )
    );

  revalidatePath("/blocks");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Recipe removed",
      description: "The recipe has been removed from the block successfully.",
    },
  };
}
