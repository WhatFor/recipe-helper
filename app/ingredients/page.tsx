import { drizzle } from "drizzle-orm/vercel-postgres";
import { eq } from "drizzle-orm";
import { ingredientsTable } from "@/db/schema";
import Header from "@/components/ui/header";
import NewIngredientModal from "./new-ingredient-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { desc } from "drizzle-orm";
import IngredientCard from "./ingredient-card";
import { auth } from "@clerk/nextjs/server";

const IngredientsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to do that.");
  }

  const db = drizzle();

  const result = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.user_id, userId))
    .orderBy(desc(ingredientsTable.id));

  return (
    <div className="flex flex-col gap-y-8">
      <Header>Ingredients</Header>
      <NewIngredientModal />
      <ScrollArea className="h-[600px] w-full rounded-xl border p-5">
        {result.map((ingredient) => (
          <IngredientCard key={ingredient.id} ingredient={ingredient} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default IngredientsPage;
