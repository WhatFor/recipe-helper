"use server";

import { blockRecipesTable, blocksTable, recipesTable } from "@/db/schema";
import { ActionResult, DataResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
