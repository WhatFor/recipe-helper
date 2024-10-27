import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";

import { blocksTable, recipesTable } from "@/db/schema";
import Onboarding from "@/components/onboarding";

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
    <main className="flex flex-col items-center">
      <div className="max-w-3xl w-full bg-foreground/30">
        <div className="">
          <h1>Cuisino</h1>
        </div>
        <Onboarding
          recipeCount={recipeCount[0].count}
          blockCount={blockCount[0].count}
        />
      </div>
    </main>
  );
};

export default Home;
