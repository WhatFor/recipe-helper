import { drizzle } from "drizzle-orm/vercel-postgres";
import { blockRecipesTable, blocksTable, recipesTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import BlocksPage from "./blocks-page";

// AI stuff can be slow
export const maxDuration = 90;

interface Recipe {
  id: number;
  name: string;
}

export interface BlockWithRecipes {
  id: number;
  name: string;
  user_id: string;
  recipes: Recipe[];
}

const Page = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to add an item to your cart");
  }

  const db = drizzle();

  const result = await db
    .select({
      id: blocksTable.id,
      name: blocksTable.name,
      user_id: blocksTable.user_id,
      recipeId: recipesTable.id,
      recipeName: recipesTable.name,
    })
    .from(blocksTable)
    .leftJoin(blockRecipesTable, eq(blocksTable.id, blockRecipesTable.blockId))
    .leftJoin(recipesTable, eq(recipesTable.id, blockRecipesTable.recipeId))
    .where(eq(blocksTable.user_id, userId))
    .orderBy(asc(blocksTable.name));

  const uniqueBlocks = result
    .map((x) => ({ name: x.name, id: x.id, user_id: x.user_id }))
    .filter(
      (value, index, self) => self.findIndex((x) => x.id === value.id) === index
    );

  const blocksWithRecipes = uniqueBlocks.map((block) => {
    const recipes = result
      .filter((x) => x.id === block.id && x.recipeId)
      .map((x) => ({ id: x.recipeId!, name: x.recipeName! }));

    return {
      ...block,
      recipes,
    };
  });

  return <BlocksPage blocks={blocksWithRecipes} />;
};

export default Page;
