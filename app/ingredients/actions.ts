"use server";

import { ingredientsTable } from "@/db/schema";
import { ActionResult } from "@/types/action-result";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createIngredientSchema = z.object({
  name: z.string().min(1),
  is_pantry: z.boolean().optional(),
});

export async function createIngredient(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to add an item to your cart");
  }

  const values = {
    name: formData.get("ingredientName") as string,
    is_pantry: (formData.get("isPantry") === "on") as boolean,
    user_id: userId,
  };

  const validate = createIngredientSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as ActionResult;
  }

  const db = drizzle();

  await db.insert(ingredientsTable).values(values);

  revalidatePath("/ingredients");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Ingredient created",
      description: "The ingredient has been created successfully.",
    },
  };
}

export async function deleteIngredient(id: number): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to add an item to your cart");
  }

  const db = drizzle();

  await db
    .delete(ingredientsTable)
    .where(
      and(eq(ingredientsTable.id, id), eq(ingredientsTable.user_id, userId))
    );

  revalidatePath("/ingredients");

  return {
    state: "dirty",
    successful: true,
    timestamp: Date.now(),
    message: {
      title: "Ingredient deleted",
      description: "The ingredient has been deleted successfully.",
    },
  };
}
