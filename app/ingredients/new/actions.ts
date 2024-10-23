"use server";

import { ingredientsTable } from "@/db/schema";
import { FormResult } from "@/types/formResult";
import { auth } from "@clerk/nextjs/server";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
});

export async function create(
  prevState: FormResult | undefined,
  formData: FormData
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to add an item to your cart");
  }

  const values = {
    name: formData.get("ingredientName") as string,
  };

  const validate = formSchema.safeParse(values);

  if (!validate.success) {
    const errors = validate.error.errors.map((error) => ({
      fieldName: error.path.join("."),
      message: error.message,
    }));

    return { errors } as FormResult;
  }

  const db = drizzle();

  await db.insert(ingredientsTable).values(values);

  redirect("/ingredients");
}
