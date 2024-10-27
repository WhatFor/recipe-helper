import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { blocksTable, recipesTable } from "@/db/schema";
import Landing from "@/components/landing";

const Home = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  const recipeCount = await db
    .select({
      count: count(),
    })
    .from(recipesTable)
    .where(eq(recipesTable.user_id, userId))
    .execute();

  const blockCount = await db
    .select({
      count: count(),
    })
    .from(blocksTable)
    .where(eq(blocksTable.user_id, userId))
    .execute();

  return (
    <main className="flex flex-col h-full items-center">
      <Landing
        recipeCount={recipeCount[0].count}
        blockCount={blockCount[0].count}
      />
    </main>
  );
};

export default Home;
