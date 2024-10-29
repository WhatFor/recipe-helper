"use server";

import {
  blockRecipesTable,
  blockShoppingListItemsTable,
  blocksTable,
  ingredientsTable,
  recipeIngredientsTable,
  recipesTable,
} from "@/db/schema";
import { ActionResult, DataResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { z } from "zod";
import { CreateBlocksAiPrompt, CreateShoppingListAiPrompt } from "./ai";

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
    user_id: userId,
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
    recipes: { id: number; name: string }[];
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
      )
      .where(
        and(
          eq(ingredientsTable.is_pantry, false),
          eq(recipesTable.user_id, userId)
        )
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
      (x) =>
        `${x.name} [${x.id}]: (${x.ingredients.map((y) => y.name).join(", ")})`
    );

    const userContent =
      "The recipes you are to process are:\r\n- " +
      stringRecipies.join("\r\n- ");

    console.log("Generating blocks. User content:", userContent);

    const { data } = await openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CreateBlocksAiPrompt },
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

export async function completeAiBlocksImport(
  data: AiBlocksResult
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  try {
    const db = drizzle();

    const inserted = await db
      .insert(blocksTable)
      .values(
        data.blocks.map((x) => ({
          name: x.name,
          user_id: userId,
        }))
      )
      .returning({ blockId: blocksTable.id, name: blocksTable.name });

    console.log("Created blocks: ", inserted);

    const flattenedRecipes = data.blocks.flatMap((block) =>
      block.recipes.map((recipe) => ({
        recipeId: recipe.id,
        blockId: inserted.find((ins) => ins.name === block.name)!.blockId,
      }))
    );

    console.log("Saving recipes to blocks: ", flattenedRecipes);

    await db.insert(blockRecipesTable).values(
      flattenedRecipes.map((x) => ({
        blockId: x.blockId,
        recipeId: x.recipeId,
        user_id: userId,
      }))
    );

    revalidatePath("/blocks");

    return {
      state: "dirty",
      successful: true,
      timestamp: Date.now(),
      message: {
        title: "Plans created",
        description: "The plans has been created successfully.",
      },
    };
  } catch {
    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Creation failed",
        description: "The plans could not be created. Try again!",
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

  await db
    .update(blocksTable)
    .set(values)
    .where(and(eq(blocksTable.id, id), eq(blocksTable.user_id, userId)));

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

  await db
    .delete(blockRecipesTable)
    .where(
      and(
        eq(blockRecipesTable.blockId, id),
        eq(blockRecipesTable.user_id, userId)
      )
    );

  await db
    .delete(blockShoppingListItemsTable)
    .where(
      and(
        eq(blockShoppingListItemsTable.blockId, id),
        eq(blockShoppingListItemsTable.user_id, userId)
      )
    );

  await db
    .delete(blocksTable)
    .where(and(eq(blocksTable.id, id), eq(blocksTable.user_id, userId)));

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
    .where(
      and(
        eq(blockRecipesTable.blockId, blockId),
        eq(blockRecipesTable.user_id, userId)
      )
    );

  const result = await db
    .select({
      id: recipesTable.id,
      name: recipesTable.name,
    })
    .from(recipesTable)
    .where(
      and(
        ilike(recipesTable.name, "%" + name + "%"),
        eq(recipesTable.user_id, userId)
      )
    );

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
    user_id: userId,
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
        and(
          eq(blockRecipesTable.recipeId, recipeId),
          eq(blockRecipesTable.user_id, userId)
        )
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

export interface ShoppingListItem {
  name: string;
  amount: string;
}

export interface ShoppingListResult {
  exists: boolean;
  list?: ShoppingListItem[];
}

export async function getShoppingList(
  blockId: number
): Promise<DataResult<ShoppingListResult>> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  try {
    const db = drizzle();

    const items = await db
      .select({
        name: blockShoppingListItemsTable.item_name,
        amount: blockShoppingListItemsTable.item_amount,
      })
      .from(blockShoppingListItemsTable)
      .where(
        and(
          eq(blockShoppingListItemsTable.blockId, blockId),
          eq(blockShoppingListItemsTable.user_id, userId)
        )
      );

    // No shopping list exists
    if (items.length === 0) {
      return {
        state: "init",
        successful: true,
        timestamp: Date.now(),
        data: {
          exists: false,
        },
      };
    }

    return {
      state: "init",
      successful: true,
      timestamp: Date.now(),
      data: {
        exists: true,
        list: items,
      },
    };
  } catch {
    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Loading failed",
        description: "Loading the shopping list failed. Please try again!",
      },
    };
  }
}

export async function generateBlockShoppingList(
  blockId: number
): Promise<DataResult<ShoppingListResult>> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  try {
    const db = drizzle();

    const items = await db
      .select({
        name: ingredientsTable.name,
        amount: recipeIngredientsTable.quantity,
      })
      .from(ingredientsTable)
      .innerJoin(
        recipeIngredientsTable,
        eq(recipeIngredientsTable.ingredientId, ingredientsTable.id)
      )
      .innerJoin(
        blockRecipesTable,
        eq(blockRecipesTable.recipeId, recipeIngredientsTable.recipeId)
      )
      .where(
        and(
          eq(blockRecipesTable.user_id, userId),
          eq(blockRecipesTable.blockId, blockId)
        )
      )
      .orderBy(asc(ingredientsTable.name));

    const stringItems = items.map((item) => `${item.name}: ${item.amount}`);

    const userContent =
      "The items you are to process are:\r\n- " + stringItems.join("\r\n- ");

    console.log("Generating shopping list. User content:", userContent);

    const { data } = await openai.chat.completions
      .create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: CreateShoppingListAiPrompt },
          {
            role: "user",
            content: userContent,
          },
        ],
      })
      .withResponse();

    console.log("Shopping list result:", data.choices[0].message.content);

    const resultString = data.choices[0].message.content;
    const resultObj = JSON.parse(resultString!) as ShoppingListItem[];

    await db.insert(blockShoppingListItemsTable).values(
      resultObj.map((x) => ({
        blockId,
        item_name: x.name,
        item_amount: x.amount,
        user_id: userId,
      }))
    );

    return {
      state: "dirty",
      successful: true,
      message: {
        title: "Shopping list created",
        description: "Your shopping list has been created successfully.",
      },
      timestamp: Date.now(),
      data: {
        exists: true,
        list: resultObj,
      },
    };
  } catch {
    return {
      state: "dirty",
      successful: false,
      timestamp: Date.now(),
      errors: [],
      message: {
        title: "Generation failed",
        description: "Generating the shopping list failed. Please try again!",
      },
    };
  }
}
